import cron from 'node-cron';
import { runPaymentReminderJob } from './payment-reminder.job';
import { runLessonReminderJob } from './lesson-reminder.job';

/**
 * Barcha cron job'larni ishga tushiruvchi funksiya
 */
export function initCronJobs(): void {
  // ─── To'lov eslatmasi: har kuni soat 09:00 da ──────────────────────────────
  cron.schedule('0 9 * * *', async () => {
    console.log('[Cron] To\'lov eslatmasi job boshlanmoqda...');
    await runPaymentReminderJob();
  }, {
    timezone: 'Asia/Tashkent', // O'zbekiston vaqti
  });

  // ─── Dars eslatmasi: har 5 daqiqada ─────────────────────────────────────────
  cron.schedule('*/5 * * * *', async () => {
    await runLessonReminderJob();
  }, {
    timezone: 'Asia/Tashkent',
  });

  console.log('[Cron] ✅ Barcha cron job\'lar ishga tushdi.');
  console.log('[Cron]  • To\'lov eslatmasi: Har kuni soat 09:00 (Asia/Tashkent)');
  console.log('[Cron]  • Dars eslatmasi: Har 5 daqiqada');
}
