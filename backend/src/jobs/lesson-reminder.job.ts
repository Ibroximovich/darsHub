import { prisma } from '../lib/prisma';
import { sendTelegramMessage } from '../services/telegram-bot.service';

// Kun nomlari (Group.days massividagi qiymatlar bilan mos kelishi kerak)
const DAY_NAMES = ['sunday', 'monday', 'tuesday', 'wednesday', 'thursday', 'friday', 'saturday'];

/**
 * DARS ESLATMASI CRON JOB
 *
 * Har 5 daqiqada ishga tushadi.
 * Bugungi dars kuni bo'lgan va dars boshlanishiga 25-35 daqiqa qolgan guruhlar uchun
 * repetitorga Telegram orqali eslatma xabar yuboradi.
 */
export async function runLessonReminderJob(): Promise<void> {
  try {
    const now = new Date(new Date().getTime() + (5 * 60 * 60 * 1000));
    const todayName = DAY_NAMES[now.getUTCDay()];
    const todayDateStr = now.toISOString().split('T')[0]; // "YYYY-MM-DD"

    // Telegramga ulangan va bugungi dars kuni bo'lgan guruhlarni olish
    const users = await prisma.user.findMany({
      where: {
        telegramChatId: { not: null },
      },
      include: {
        groups: {
          where: {
            days: { has: todayName },
          },
        },
      },
    });

    for (const user of users) {
      for (const group of user.groups) {
        try {
          // Guruhning dars vaqtini parse qilish (masalan "15:00")
          const [hoursStr, minutesStr] = group.time.split(':');
          const lessonHour = parseInt(hoursStr, 10);
          const lessonMinute = parseInt(minutesStr, 10);

          if (isNaN(lessonHour) || isNaN(lessonMinute)) continue;

          // Dars vaqtini bugungi sana bilan birlashtirish
          const lessonTime = new Date(now);
          lessonTime.setUTCHours(lessonHour, lessonMinute, 0, 0);

          // Dars boshlanishigacha qolgan vaqt (daqiqa)
          const minutesUntilLesson = (lessonTime.getTime() - now.getTime()) / (1000 * 60);

          // 15-35 daqiqa oralig'ida bo'lsa va hali yuborilmagan bo'lsa eslatma yuboramiz
          // (NotificationLog allaqachon yuborilganini tekshirgani uchun 1 martadan ortiq yuborilmaydi)
          if (minutesUntilLesson < 15 || minutesUntilLesson > 35) continue;

          const refId = `${group.id}-${todayDateStr}`;

          // Allaqachon yuborilganmi?
          const alreadySent = await prisma.notificationLog.findUnique({
            where: {
              userId_type_refId: {
                userId: user.id,
                type: 'lesson_reminder',
                refId,
              },
            },
          });

          if (alreadySent) continue;

          // Xabar matnini yaratish
          const message =
            `⏰ *Dars eslatmasi*\n\n` +
            `*'${group.name}'* guruhida darsingiz *30 daqiqadan keyin*, soat *${group.time}* da boshlanadi.\n\n` +
            `Darsga tayyor bo'ling! 📚`;

          await sendTelegramMessage(user.telegramChatId!, message);

          // Log yozish
          await prisma.notificationLog.create({
            data: {
              userId: user.id,
              type: 'lesson_reminder',
              refId,
            },
          });

          console.log(`[LessonReminder] ✅ ${user.email} → '${group.name}' guruhi uchun eslatma yuborildi (${group.time}).`);
        } catch (groupError) {
          console.error(`[LessonReminder] '${group.name}' guruhi uchun xato:`, groupError);
        }
      }
    }
  } catch (error) {
    console.error('[LessonReminder] Job da kritik xato:', error);
  }
}
