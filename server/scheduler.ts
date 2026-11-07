import { runAllSourcesCollection } from './collector/engine';
import { logSystemEvent } from './db';

let timer: NodeJS.Timeout | null = null;
let isRunning = false;
let lastRunTime: Date | null = null;
let lastRunStats: any = null;

export function getSchedulerStatus() {
  const intervalMinutes = parseInt(process.env.NEWS_POLL_INTERVAL_MINUTES || '30', 10);
  return {
    isActive: timer !== null,
    isRunning,
    intervalMinutes,
    lastRunTime,
    lastRunStats
  };
}

export async function triggerManualCollection() {
  if (isRunning) {
    return { status: 'busy', message: 'عملیات جمع‌آوری در حال حاضر در پس‌زمینه در حال اجراست.' };
  }

  isRunning = true;
  try {
    const stats = await runAllSourcesCollection();
    lastRunTime = new Date();
    lastRunStats = stats;
    return { status: 'completed', stats };
  } finally {
    isRunning = false;
  }
}

export function startScheduler() {
  if (timer) return;

  const intervalMinutes = Math.max(2, parseInt(process.env.NEWS_POLL_INTERVAL_MINUTES || '10', 10));
  const ms = intervalMinutes * 60 * 1000;

  console.log(`[Scheduler] Starting background media collector (every ${intervalMinutes} minutes)...`);
  logSystemEvent('info', 'SCHEDULER_STARTED', `زمان‌بند مانیتورینگ رسانه‌ها با بازه ${intervalMinutes} دقیقه فعال شد.`);

  // Run initial poll after 15 seconds to let the server start up smoothly
  setTimeout(() => {
    triggerManualCollection().catch(err => console.error('[Initial sync error]', err));
  }, 15000);

  timer = setInterval(async () => {
    if (isRunning) return;
    try {
      await triggerManualCollection();
    } catch (err) {
      console.error('[Scheduler periodic collection error]', err);
    }
  }, ms);
}

export function stopScheduler() {
  if (timer) {
    clearInterval(timer);
    timer = null;
    logSystemEvent('info', 'SCHEDULER_STOPPED', 'زمان‌بند مانیتورینگ رسانه‌ها متوقف شد.');
  }
}
