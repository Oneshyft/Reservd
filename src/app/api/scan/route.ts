import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RedditScraper } from '@/scrapers/reddit';
import { TwitterScraper } from '@/scrapers/twitter';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tier } = body; // HIGH, MEDIUM, LOW

  const results: { platform: string; newLeads: number; errors: string[] }[] = [];

  // Reddit scanning
  try {
    const reddit = new RedditScraper();
    const redditResult = await reddit.scan(tier || 'HIGH');
    results.push({ platform: 'Reddit', ...redditResult });
  } catch (error) {
    results.push({ platform: 'Reddit', newLeads: 0, errors: [(error as Error).message] });
  }

  // Twitter scanning (if configured)
  if (process.env.TWITTER_BEARER_TOKEN) {
    try {
      const twitter = new TwitterScraper();
      const twitterResult = await twitter.scan(tier || 'HIGH');
      results.push({ platform: 'Twitter', ...twitterResult });
    } catch (error) {
      results.push({ platform: 'Twitter', newLeads: 0, errors: [(error as Error).message] });
    }
  }

  const totalNew = results.reduce((sum, r) => sum + r.newLeads, 0);

  // Check for high-score leads and create notification data
  const hotLeads = await prisma.lead.findMany({
    where: {
      score: { gte: 8 },
      status: 'NEW',
      createdAt: { gte: new Date(Date.now() - 1000 * 60 * 30) },
    },
    orderBy: { score: 'desc' },
    take: 5,
  });

  return NextResponse.json({ results, totalNew, hotLeads });
}
