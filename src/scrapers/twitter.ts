import { prisma } from '@/lib/prisma';
import { scoreLead, detectTeam } from '@/lib/scoring';

interface Tweet {
  id: string;
  text: string;
  author_id: string;
  created_at: string;
}

interface TwitterUser {
  id: string;
  username: string;
}

export class TwitterScraper {
  private bearerToken: string;
  private rateLimitDelay = 2000;

  constructor() {
    this.bearerToken = process.env.TWITTER_BEARER_TOKEN || '';
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  private async searchTweets(query: string, maxResults = 10): Promise<{ tweets: Tweet[]; users: TwitterUser[] }> {
    if (!this.bearerToken) {
      throw new Error('Twitter Bearer Token not configured');
    }

    const response = await fetch(
      `https://api.twitter.com/2/tweets/search/recent?query=${encodeURIComponent(query)}&max_results=${maxResults}&tweet.fields=created_at,author_id&expansions=author_id`,
      {
        headers: {
          'Authorization': `Bearer ${this.bearerToken}`,
        },
      }
    );

    if (response.status === 429) {
      throw new Error('Twitter API rate limited');
    }
    if (!response.ok) {
      throw new Error(`Twitter API error: ${response.status}`);
    }

    const data = await response.json();
    return {
      tweets: data.data || [],
      users: data.includes?.users || [],
    };
  }

  async scan(tier: string): Promise<{ newLeads: number; errors: string[] }> {
    const errors: string[] = [];
    let newLeads = 0;

    const phrases = await prisma.triggerPhrase.findMany({
      where: { isActive: true, tier: tier === 'HIGH' ? 'HIGH' : tier === 'MEDIUM' ? { in: ['HIGH', 'MEDIUM'] } : undefined },
    });

    // Build search queries in batches (Twitter has query length limits)
    const detroitPhrases = phrases.filter(p =>
      p.text.toLowerCase().includes('detroit') ||
      p.text.toLowerCase().includes('lions') ||
      p.text.toLowerCase().includes('red wings') ||
      p.text.toLowerCase().includes('ford field') ||
      p.text.toLowerCase().includes('lca')
    );

    for (const phrase of detroitPhrases.slice(0, 10)) {
      try {
        await this.delay(this.rateLimitDelay);
        const { tweets, users } = await this.searchTweets(phrase.text);

        for (const tweet of tweets) {
          const user = users.find(u => u.id === tweet.author_id);
          const tweetUrl = `https://twitter.com/${user?.username || 'i'}/status/${tweet.id}`;

          const existing = await prisma.lead.findFirst({ where: { url: tweetUrl } });
          if (existing) continue;

          const matchedPhrases = phrases
            .filter(p => tweet.text.toLowerCase().includes(p.text.toLowerCase()))
            .map(p => p.text);

          if (matchedPhrases.length === 0) continue;

          const score = scoreLead(tweet.text, 'Twitter', matchedPhrases);
          const team = detectTeam(tweet.text);

          await prisma.lead.create({
            data: {
              platform: 'TWITTER',
              source: 'Twitter Search',
              author: user ? `@${user.username}` : `@user_${tweet.author_id}`,
              content: tweet.text,
              url: tweetUrl,
              postTimestamp: new Date(tweet.created_at),
              matchedPhrases: JSON.stringify(matchedPhrases),
              score,
              status: 'NEW',
              team,
            },
          });
          newLeads++;
        }
      } catch (error) {
        errors.push(`Twitter search "${phrase.text}": ${(error as Error).message}`);
      }
    }

    return { newLeads, errors };
  }
}
