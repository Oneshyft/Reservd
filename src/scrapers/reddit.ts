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
  private rateLimitDelay = 1500;
  private baseUrl = 'https://www.reddit.com';
  private useOldReddit = false;

  private async searchSubreddit(subreddit: string, query: string, limit = 25): Promise<RedditPost[]> {
    const base = this.useOldReddit ? 'https://old.reddit.com' : this.baseUrl;
    const url = `${base}/r/${subreddit}/search.json?q=${encodeURIComponent(query)}&sort=new&limit=${limit}&restrict_sr=on`;

    console.log(`[Reddit] GET ${url}`);

    const response = await fetch(url, {
      headers: { 'User-Agent': this.userAgent },
    });

    console.log(`[Reddit] r/${subreddit} q="${query}" → ${response.status} ${response.statusText}`);

    // If blocked or rate-limited, try old.reddit.com as fallback
    if ((response.status === 429 || response.status === 403) && !this.useOldReddit) {
      console.log(`[Reddit] Got ${response.status} from www.reddit.com — switching to old.reddit.com`);
      this.useOldReddit = true;
      return this.searchSubreddit(subreddit, query, limit);
    }

    if (response.status === 429) {
      throw new Error(`Rate limited on r/${subreddit} (even old.reddit.com)`);
    }
    if (!response.ok) {
      const body = await response.text().catch(() => '');
      console.log(`[Reddit] Error body (first 500 chars): ${body.slice(0, 500)}`);
      throw new Error(`Failed to fetch r/${subreddit}: ${response.status}`);
    }

    const data = await response.json();
    const posts: RedditPost[] = (data.data?.children || []).map((child: { data: RedditPost }) => child.data);
    console.log(`[Reddit] r/${subreddit} q="${query}" → ${posts.length} posts returned`);

    return posts;
  }

  private async delay(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }

  async scan(tier: string): Promise<{ newLeads: number; errors: string[] }> {
    const errors: string[] = [];
    let newLeads = 0;

    const phrases = await prisma.triggerPhrase.findMany({
      where: { isActive: true, tier: tier === 'HIGH' ? 'HIGH' : tier === 'MEDIUM' ? { in: ['HIGH', 'MEDIUM'] } : undefined },
    });

    const subreddits = tier === 'HIGH' ? PRIMARY_SUBREDDITS : SECONDARY_SUBREDDITS;

    console.log(`[Reddit] Starting scan tier=${tier}`);
    console.log(`[Reddit] Subreddits (${subreddits.length}): ${subreddits.join(', ')}`);
    console.log(`[Reddit] Phrases (${phrases.length}): ${phrases.map(p => p.text).join(' | ')}`);
    console.log(`[Reddit] Total requests to make: ${subreddits.length * phrases.length}`);

    const seenPostIds = new Set<string>();
    let totalPostsFetched = 0;
    let skippedDuplicate = 0;
    let skippedNoMatch = 0;
    let skippedExisting = 0;
    let requestCount = 0;

    for (const subreddit of subreddits) {
      for (const phrase of phrases) {
        try {
          requestCount++;
          console.log(`[Reddit] Request ${requestCount}/${subreddits.length * phrases.length}: r/${subreddit} q="${phrase.text}"`);
          await this.delay(this.rateLimitDelay);
          const posts = await this.searchSubreddit(subreddit, phrase.text);
          totalPostsFetched += posts.length;

          for (const post of posts) {
            if (seenPostIds.has(post.id)) {
              skippedDuplicate++;
              continue;
            }
            seenPostIds.add(post.id);

            const fullText = `${post.title} ${post.selftext}`.toLowerCase();

            const matchedPhrases = phrases
              .filter(p => fullText.includes(p.text.toLowerCase()))
              .map(p => p.text);

            if (matchedPhrases.length === 0) {
              skippedNoMatch++;
              console.log(`[Reddit] SKIP no phrase match: "${post.title.slice(0, 80)}"`);
              continue;
            }

            const existing = await prisma.lead.findFirst({
              where: { url: `https://reddit.com${post.permalink}` },
            });
            if (existing) {
              skippedExisting++;
              console.log(`[Reddit] SKIP already in DB: "${post.title.slice(0, 80)}"`);
              continue;
            }

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
            console.log(`[Reddit] NEW LEAD (score=${score}): "${post.title.slice(0, 80)}" matched=[${matchedPhrases.join(', ')}]`);
          }
        } catch (error) {
          const msg = `r/${subreddit} "${phrase.text}": ${(error as Error).message}`;
          console.log(`[Reddit] ERROR: ${msg}`);
          errors.push(msg);
        }
      }
    }

    console.log(`[Reddit] === Scan Complete ===`);
    console.log(`[Reddit] Requests made: ${requestCount}`);
    console.log(`[Reddit] Total posts fetched: ${totalPostsFetched}`);
    console.log(`[Reddit] Unique posts seen: ${seenPostIds.size}`);
    console.log(`[Reddit] Skipped (duplicate in scan): ${skippedDuplicate}`);
    console.log(`[Reddit] Skipped (no phrase match): ${skippedNoMatch}`);
    console.log(`[Reddit] Skipped (already in DB): ${skippedExisting}`);
    console.log(`[Reddit] New leads created: ${newLeads}`);
    console.log(`[Reddit] Errors: ${errors.length}`);
    if (this.useOldReddit) {
      console.log(`[Reddit] NOTE: Fell back to old.reddit.com due to 429/403`);
    }

    return { newLeads, errors };
  }
}
