import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const key = searchParams.get('key');

  if (key) {
    const setting = await prisma.settings.findUnique({ where: { key } });
    return NextResponse.json(setting || { key, value: '' });
  }

  const settings = await prisma.settings.findMany();
  return NextResponse.json(settings);
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { key, value } = body;

  const setting = await prisma.settings.upsert({
    where: { key },
    update: { value },
    create: { key, value },
  });

  return NextResponse.json(setting);
}
