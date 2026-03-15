import { NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const now = new Date();
  const todayStart = new Date(now.getFullYear(), now.getMonth(), now.getDate());
  const weekStart = new Date(todayStart);
  weekStart.setDate(weekStart.getDate() - 7);

  const [todayLeads, weekLeads, allLeads, convertedCount, contactedCount] = await Promise.all([
    prisma.lead.count({ where: { createdAt: { gte: todayStart } } }),
    prisma.lead.count({ where: { createdAt: { gte: weekStart } } }),
    prisma.lead.findMany({ select: { score: true, source: true, createdAt: true } }),
    prisma.lead.count({ where: { status: 'CONVERTED' } }),
    prisma.lead.count({ where: { status: { in: ['COMMENTED', 'DMED', 'CONVERTED'] } } }),
  ]);

  const weekLeadsList = allLeads.filter(l => l.createdAt >= weekStart);

  // Breakdown by tier
  const hot = weekLeadsList.filter(l => l.score >= 8).length;
  const warm = weekLeadsList.filter(l => l.score >= 5 && l.score < 8).length;
  const cold = weekLeadsList.filter(l => l.score < 5).length;

  // Conversion rate
  const conversionRate = contactedCount > 0 ? Math.round((convertedCount / contactedCount) * 100) : 0;

  // Most active subreddit this week
  const sourceCounts: Record<string, number> = {};
  weekLeadsList.forEach(l => {
    sourceCounts[l.source] = (sourceCounts[l.source] || 0) + 1;
  });
  const mostActiveSubreddit = Object.entries(sourceCounts)
    .sort(([, a], [, b]) => b - a)[0]?.[0] || 'N/A';

  return NextResponse.json({
    todayLeads,
    weekLeads,
    hot,
    warm,
    cold,
    conversionRate,
    mostActiveSubreddit,
  });
}
