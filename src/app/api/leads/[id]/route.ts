import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function GET(request: NextRequest, { params }: { params: { id: string } }) {
  const lead = await prisma.lead.findUnique({
    where: { id: params.id },
    include: { outreachEvents: { include: { template: true }, orderBy: { timestamp: 'desc' } } },
  });
  if (!lead) return NextResponse.json({ error: 'Lead not found' }, { status: 404 });
  return NextResponse.json(lead);
}

export async function PATCH(request: NextRequest, { params }: { params: { id: string } }) {
  const body = await request.json();
  const lead = await prisma.lead.update({
    where: { id: params.id },
    data: body,
  });
  return NextResponse.json(lead);
}

export async function DELETE(request: NextRequest, { params }: { params: { id: string } }) {
  await prisma.lead.delete({ where: { id: params.id } });
  return NextResponse.json({ success: true });
}
