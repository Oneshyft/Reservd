import { prisma } from '@/lib/prisma';
import { scoreLead, detectTeam } from '@/lib/scoring';
import { PRIMARY_SUBREDDITS, SECONDARY_SUBREDDITS } from '@/lib/constants';

interface RedditPost {
  id: string;
  title: string;
  selftext: string;
  author: string;
  permalink: string;
  subreddit: string;
  created_utc: number;
  num_comments: number;
}

export class RedditScraper {
  private clientId: string;
  private clientSecret: string;
  private username: string;
  private password: string;
  private userAgent: string;
  private accessToken: string | null = null;
  private rateLimitDelay = 1000; // 1 second between requests

  constructor() {
    this.clientId = process.env.REDDIT_CLIENT_ID || '';
    this.clientSecret = process.env.REDDIT_CLIENT_SECRET || '';
    this.username = process.env.REDDIT_USERNAME || '';
    this.password = process.env.REDDIT_PASSWORD || '';
    this.userAgent = process.env.REDDIT_USER_AGENT || 'SuiteSpotter/1.0';
  }

  private async authenticate(): Promise<void> {
    if (!this.clientId || !this.clientSecret) {
      throw new Error('Reddit API credentials not configured. Set REDDIT_CLIENT_ID and REDDIT_CLIENT_SECRET in .env');
    }

    const auth = Buffer.from(`${this.clientId}:${this.clientSecret}`).toString('base64');
    const response = await fetch('https://www.reddit.com/api/v1/access_token', {
      method: 'POST',
      headers: {
        'Authorization': `Basic ${auth}`,
        'Content-Type': 'application/x-www-form-urlencoded',
        'User-Agent': this.userAgent,
      },
      body: `grant_type=password&username=${encodeURIComponent(this.username)}&password=${encodeURIComponent(this.password)}`,
    });

    if (!response.ok) {
      throw new Error(`Reddit auth failed: ${response.status}`);
    }

    const data = await response.json();
    this.accessToken = data.access_token;
  }

  private async fetchSubreddit(subreddit: string, limit = 25): Promise<RedditPost[]> {
    if (!this.accessToken) await this.authenticate();

    const response = await fetch(
      `https://oauth.reddit.com/r/${subreddit}/new.json?limit=${limit}`,
      {
        headers: {
          'Authorization': `Bearer ${this.accessToken}`,
          'User-Agent': this.userAgent,
        },
      }
    );

    if (response.status === 429) {
      throw new Error(`Rate limited on r/${subreddit}`);
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch r/${subreddit}: ${response.status}`);
    }

    const data = await response.json();
    return data.data.children.map((child: { data: RedditPost }) => child.data);
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scan(tier: string): Promise<{ newLeads: number; errors: string[] }> {
    const errors: string[] = [];
    let newLeads = 0;

    // Get active phrases for the tier
    const phrases = await prisma.triggerPhrase.findMany({
      where: { isActive: true, tier: tier === 'HIGH' ? 'HIGH' : tier === 'MEDIUM' ? { in: ['HIGH', 'MEDIUM'] } : undefined },
    });

    const subreddits = tier === 'HIGH' ? PRIMARY_SUBREDDITS : SECONDARY_SUBREDDITS;

    for (const subreddit of subreddits) {
      try {
        await this.delay(this.rateLimitDelay);
        const posts = await this.fetchSubreddit(subreddit);

        for (const post of posts) {
          const fullText = `${post.title} ${post.selftext}`.toLowerCase();

          // Check for phrase matches
          const matchedPhrases = phrases
            .filter(p => fullText.includes(p.text.toLowerCase()))
            .map(p => p.text);

          if (matchedPhrases.length === 0) continue;

          // Check if we already have this post
          const existing = await prisma.lead.findFirst({
            where: { url: `https://reddit.com${post.permalink}` },
          });
          if (existing) continue;

          const content = post.selftext
            ? `${post.title}\n\n${post.selftext}`
            : post.title;
          const score = scoreLead(content, `r/${post.subreddit}`, matchedPhrases, post.num_comments);
          const team = detectTeam(content);

          await prisma.lead.create({
            data: {
              platform: 'REDDIT',
              source: `r/${post.subreddit}`,
              author: post.author,
              content,
              url: `https://reddit.com${post.permalink}`,
              postTimestamp: new Date(post.created_utc * 1000),
              matchedPhrases: JSON.stringify(matchedPhrases),
              score,
              status: 'NEW',
              team,
            },
          });
          newLeads++;
        }
      } catch (error) {
        errors.push(`r/${subreddit}: ${(error as Error).message}`);
      }
    }

    return { newLeads, errors };
  }
}
