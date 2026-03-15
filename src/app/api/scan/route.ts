import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { RedditScraper } from '@/scrapers/reddit';
import { TwitterScraper } from '@/scrapers/twitter';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { tier } = body; // HIGH, MEDIUM, LOW

  console.log(`[Scan] Starting scan with tier=${tier || 'HIGH'}`);
  const startTime = Date.now();

  const results: { platform: string; newLeads: number; errors: string[] }[] = [];

  // Reddit scanning
  try {
    const redditStart = Date.now();
    console.log(`[Scan] Starting Reddit scan...`);
    const reddit = new RedditScraper();
    const redditResult = await reddit.scan(tier || 'HIGH');
    console.log(`[Scan] Reddit scan complete in ${((Date.now() - redditStart) / 1000).toFixed(1)}s — ${redditResult.newLeads} new leads, ${redditResult.errors.length} errors`);
    if (redditResult.errors.length > 0) {
      console.log(`[Scan] Reddit errors: ${redditResult.errors.join(' | ')}`);
    }
    results.push({ platform: 'Reddit', ...redditResult });
  } catch (error) {
    console.log(`[Scan] Reddit scan FAILED: ${(error as Error).message}`);
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

  const hotLeads = await prisma.lead.findMany({
    where: {
      score: { gte: 8 },
      status: 'NEW',
      createdAt: { gte: new Date(Date.now() - 1000 * 60 * 30) },
    },
    orderBy: { score: 'desc' },
    take: 5,
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`[Scan] Complete in ${elapsed}s — ${totalNew} total new leads`);

  return NextResponse.json({ results, totalNew, hotLeads });
}
