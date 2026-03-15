import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const platform = searchParams.get('platform');
  const tier = searchParams.get('tier');
  const minScore = searchParams.get('minScore');
  const team = searchParams.get('team');
  const status = searchParams.get('status');
  const dateFrom = searchParams.get('dateFrom');
  const dateTo = searchParams.get('dateTo');
  const sort = searchParams.get('sort') || 'score';

  const where: Record<string, unknown> = {};

  if (platform && platform !== 'All') {
    where.platform = platform.toUpperCase();
  }
  if (team && team !== 'Any') {
    if (team === 'Both') {
      where.team = { in: ['LIONS', 'RED_WINGS', 'BOTH'] };
    } else {
      where.team = team.toUpperCase();
    }
  }
  if (status && status !== 'All') {
    where.status = status;
  }
  if (minScore) {
    where.score = { gte: parseInt(minScore) };
  }
  if (dateFrom) {
    where.createdAt = { ...(where.createdAt as object || {}), gte: new Date(dateFrom) };
  }
  if (dateTo) {
    where.createdAt = { ...(where.createdAt as object || {}), lte: new Date(dateTo) };
  }

  // Filter by phrase tier if specified
  if (tier && tier !== 'All') {
    const phrases = await prisma.triggerPhrase.findMany({
      where: { tier: tier.toUpperCase() },
      select: { text: true },
    });
    const phraseTexts = phrases.map(p => p.text.toLowerCase());
    // We'll filter in-memory since matchedPhrases is JSON string
    const allLeads = await prisma.lead.findMany({
      where,
      include: { outreachEvents: true },
      orderBy: sort === 'newest' ? { createdAt: 'desc' } : sort === 'oldest' ? { createdAt: 'asc' } : { score: 'desc' },
    });
    const filtered = allLeads.filter(lead => {
      const matched: string[] = JSON.parse(lead.matchedPhrases);
      return matched.some(m => phraseTexts.includes(m.toLowerCase()));
    });
    return NextResponse.json(filtered);
  }

  const leads = await prisma.lead.findMany({
    where,
    include: { outreachEvents: true },
    orderBy: sort === 'newest' ? { createdAt: 'desc' } : sort === 'oldest' ? { createdAt: 'asc' } : { score: 'desc' },
  });

  return NextResponse.json(leads);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const lead = await prisma.lead.create({ data: body });
  return NextResponse.json(lead);
}
