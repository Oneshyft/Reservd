import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const phrase = await prisma.triggerPhrase.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(phrase);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await prisma.triggerPhrase.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
