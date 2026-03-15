import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const template = await prisma.outreachTemplate.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(template);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await prisma.outreachTemplate.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
