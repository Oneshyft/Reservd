import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET() {
  const templates = await prisma.outreachTemplate.findMany({
    orderBy: { name: 'asc' },
    include: { _count: { select: { outreachEvents: true } } },
  });
  return NextResponse.json(templates);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const template = await prisma.outreachTemplate.create({ data: body });
  return NextResponse.json(template);
}
