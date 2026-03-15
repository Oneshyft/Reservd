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
  private userAgent = 'SuiteSpotter/1.0';
  private rateLimitDelay = 1500; // 1.5 seconds between requests to be polite

  private async searchSubreddit(subreddit: string, query: string, limit = 25): Promise<RedditPost[]> {
    const url = `https://www.reddit.com/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=new&limit=${limit}&restrict_sr=on`;

    const response = await fetch(url, {
      headers: { 'User-Agent': this.userAgent },
    });

    if (response.status === 429) {
      throw new Error(`Rate limited on r/${subreddit}`);
    }
    if (!response.ok) {
      throw new Error(`Failed to fetch r/${subreddit}: ${response.status}`);
    }

    const data = await response.json();
    return (data.data?.children || []).map((child: { data: RedditPost }) => child.data);
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

    // Track seen post IDs this scan to avoid processing duplicates across phrase searches
    const seenPostIds = new Set<string>();

    for (const subreddit of subreddits) {
      for (const phrase of phrases) {
        try {
          await this.delay(this.rateLimitDelay);
          const posts = await this.searchSubreddit(subreddit, phrase.text);

          for (const post of posts) {
            // Skip if already seen this scan
            if (seenPostIds.has(post.id)) continue;
            seenPostIds.add(post.id);

            const fullText = `${post.title} ${post.selftext}`.toLowerCase();

            // Collect all matching phrases for this post (not just the one we searched for)
            const matchedPhrases = phrases
              .filter(p => fullText.includes(p.text.toLowerCase()))
              .map(p => p.text);

            if (matchedPhrases.length === 0) continue;

            // Deduplicate against existing leads in the database
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
          errors.push(`r/${subreddit} "${phrase.text}": ${(error as Error).message}`);
        }
      }
    }

    return { newLeads, errors };
  }
}
