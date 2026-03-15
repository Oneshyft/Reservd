import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';
import { scoreLead, detectTeam } from '@/lib/scoring';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { platform, source, author, content, url, notes } = body;

  // Find matching phrases
  const phrases = await prisma.triggerPhrase.findMany({ where: { isActive: true } });
  const lowerContent = content.toLowerCase();
  const matchedPhrases = phrases
    .filter(p => lowerContent.includes(p.text.toLowerCase()))
    .map(p => p.text);

  const score = scoreLead(content, source || platform, matchedPhrases);
  const team = detectTeam(content);

  const lead = await prisma.lead.create({
    data: {
      platform: platform || 'FACEBOOK',
      source: source || 'Manual Entry',
      author: author || 'Unknown',
      content,
      url: url || '',
      postTimestamp: new Date(),
      matchedPhrases: JSON.stringify(matchedPhrases),
      score,
      status: 'NEW',
      team,
      notes: notes || '',
    },
  });

  return NextResponse.json(lead);
}
