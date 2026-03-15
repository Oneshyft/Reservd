import { NextResponse } from 'next/server';

// In development, you can hit this endpoint to start the scheduler
// In production, the scheduler should be started via instrumentation.ts or a custom server

let schedulerStarted = false;

export async function POST() {
  if (schedulerStarted) {
    return NextResponse.json({ message: 'Scheduler already running' });
  }

  try {
    const { startScheduler } = await import('@/lib/scheduler');
    startScheduler();
    schedulerStarted = true;
    return NextResponse.json({ message: 'Scheduler started successfully' });
  } catch (error) {
    return NextResponse.json({ error: (error as Error).message }, { status: 500 });
  }
}

export async function GET() {
  return NextResponse.json({ running: schedulerStarted });
}
