import { NextRequest, NextResponse } from 'next/server';
import { prisma } from '@/lib/prisma';

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { leadId, templateId, method, notes } = body;

  const event = await prisma.outreachEvent.create({
    data: { leadId, templateId, method, notes: notes || '' },
  });

  // Update lead status
  const newStatus = method === 'DM' ? 'DMED' : 'COMMENTED';
  await prisma.lead.update({
    where: { id: leadId },
    data: { status: newStatus },
  });

  // Increment template usage count
  if (templateId) {
    await prisma.outreachTemplate.update({
      where: { id: templateId },
      data: { usageCount: { increment: 1 } },
    });
  }

  return NextResponse.json(event);
}

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const leadId = searchParams.get('leadId');

  const where = leadId ? { leadId } : {};
  const events = await prisma.outreachEvent.findMany({
    where,
    include: { template: true, lead: true },
    orderBy: { timestamp: 'desc' },
  });

  return NextResponse.json(events);
}
