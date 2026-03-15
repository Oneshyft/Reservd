import { NextRequest, NextResponse } from 'next/server';

// This endpoint provides info about the scheduling system
// Actual cron jobs run via the scheduler module on the server side
export async function GET() {
  return NextResponse.json({
    schedules: [
      {
        name: 'High Intent Scan',
        interval: 'Every 20 minutes',
        cron: '*/20 * * * *',
        description: 'Scans PRIMARY subreddits with HIGH INTENT phrases',
      },
      {
        name: 'Medium Intent Scan',
        interval: 'Every 2 hours',
        cron: '0 */2 * * *',
        description: 'Scans SECONDARY subreddits with MEDIUM INTENT phrases',
      },
      {
        name: 'Low Intent Scan',
        interval: 'Every 6 hours',
        cron: '0 */6 * * *',
        description: 'LOW INTENT scan across all sources',
      },
      {
        name: 'Daily Digest',
        interval: 'Daily at 8am',
        cron: '0 8 * * *',
        description: 'Email digest with new leads, top scores, and conversion summary',
      },
    ],
    note: 'Cron jobs are started automatically when the server runs. Configure SMTP credentials in .env for email digests.',
  });
}

export async function POST(request: NextRequest) {
  const body = await request.json();
  const { action } = body;

  if (action === 'trigger') {
    // Manually trigger a scan
    const scanRes = await fetch(new URL('/api/scan', request.url).toString(), {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier: body.tier || 'HIGH' }),
    });
    return NextResponse.json(await scanRes.json());
  }

  return NextResponse.json({ error: 'Unknown action' }, { status: 400 });
}
