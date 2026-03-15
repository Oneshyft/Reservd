// Scheduler module using node-cron
// This runs as part of the Next.js server process
// Import this in a custom server or API route instrumentation

import cron from 'node-cron';
import nodemailer from 'nodemailer';

const BASE_URL = process.env.NEXTAUTH_URL || 'http://localhost:3000';

async function runScan(tier: string) {
  try {
    console.log(`[Scheduler] Running ${tier} intent scan at ${new Date().toISOString()}`);
    const res = await fetch(`${BASE_URL}/api/scan`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ tier }),
    });
    const data = await res.json();
    console.log(`[Scheduler] ${tier} scan complete: ${data.totalNew} new leads`);

    // Send email alert for hot leads if configured
    if (process.env.ALERT_EMAIL && data.hotLeads?.length > 0) {
      await sendHotLeadAlert(data.hotLeads);
    }
  } catch (error) {
    console.error(`[Scheduler] ${tier} scan failed:`, error);
  }
}

async function sendHotLeadAlert(hotLeads: Array<{ author: string; source: string; score: number; content: string }>) {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER) return;

  const transporter = nodemailer.createTransport({
    host: process.env.SMTP_HOST,
    port: parseInt(process.env.SMTP_PORT || '587'),
    secure: false,
    auth: {
      user: process.env.SMTP_USER,
      pass: process.env.SMTP_PASS,
    },
  });

  const leadList = hotLeads.map(l =>
    `- [Score ${l.score}] ${l.source} by ${l.author}: "${l.content.slice(0, 100)}..."`
  ).join('\n');

  await transporter.sendMail({
    from: process.env.SMTP_USER,
    to: process.env.ALERT_EMAIL,
    subject: `[SuiteSpotter] ${hotLeads.length} new Hot Lead(s) detected!`,
    text: `SuiteSpotter detected ${hotLeads.length} new hot lead(s):\n\n${leadList}\n\nView them at ${BASE_URL}`,
  });
}

async function sendDailyDigest() {
  if (!process.env.SMTP_HOST || !process.env.SMTP_USER || !process.env.ALERT_EMAIL) {
    console.log('[Scheduler] Daily digest skipped: SMTP not configured');
    return;
  }

  try {
    const statsRes = await fetch(`${BASE_URL}/api/stats`);
    const stats = await statsRes.json();

    const leadsRes = await fetch(`${BASE_URL}/api/leads?sort=score&minScore=5`);
    const leads = await leadsRes.json();
    const topLeads = leads.slice(0, 5);

    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST,
      port: parseInt(process.env.SMTP_PORT || '587'),
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    const leadList = topLeads.map((l: { score: number; source: string; author: string; content: string }) =>
      `- [Score ${l.score}] ${l.source} by ${l.author}: "${l.content.slice(0, 100)}..."`
    ).join('\n');

    await transporter.sendMail({
      from: process.env.SMTP_USER,
      to: process.env.ALERT_EMAIL,
      subject: `[SuiteSpotter] Daily Digest - ${stats.todayLeads} new leads today`,
      text: `SuiteSpotter Daily Digest\n\nNew leads today: ${stats.todayLeads}\nNew leads this week: ${stats.weekLeads}\nHot: ${stats.hot} | Warm: ${stats.warm} | Cold: ${stats.cold}\nConversion rate: ${stats.conversionRate}%\nMost active: ${stats.mostActiveSubreddit}\n\nTop 5 Leads:\n${leadList}\n\nView dashboard: ${BASE_URL}`,
    });

    console.log('[Scheduler] Daily digest sent');
  } catch (error) {
    console.error('[Scheduler] Daily digest failed:', error);
  }
}

export function startScheduler() {
  console.log('[Scheduler] Starting cron jobs...');

  // Every 20 minutes: HIGH intent scan on PRIMARY subreddits
  cron.schedule('*/20 * * * *', () => runScan('HIGH'));

  // Every 2 hours: MEDIUM intent scan on SECONDARY subreddits
  cron.schedule('0 */2 * * *', () => runScan('MEDIUM'));

  // Every 6 hours: LOW intent scan
  cron.schedule('0 */6 * * *', () => runScan('LOW'));

  // Daily at 8am: digest email
  cron.schedule('0 8 * * *', () => sendDailyDigest());

  console.log('[Scheduler] Cron jobs scheduled:');
  console.log('  - HIGH intent: every 20 minutes');
  console.log('  - MEDIUM intent: every 2 hours');
  console.log('  - LOW intent: every 6 hours');
  console.log('  - Daily digest: 8:00 AM');
}
