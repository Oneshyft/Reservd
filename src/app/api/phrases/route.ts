import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const phrases = await prisma.triggerPhrase.findMany({
    orderBy: [{ tier: 'asc' }, { text: 'asc' }],
  });
  return NextResponse.json(phrases);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const phrase = await prisma.triggerPhrase.create({ data: body });
  return NextResponse.json(phrase);
}
