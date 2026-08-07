import { prisma } from '../lib/prisma';
import { sendTelegramMessage } from '../services/telegram-bot.service';

/**
 * TO'LOV ESLATMASI CRON JOB
 *
 * Har kuni soat 09:00 da ishga tushadi.
 * Oy tugashiga aynan 3 kun qolgan bo'lsa, "monthly" to'lov turidagi guruhlarda
 * to'lamagan o'quvchilar ro'yxatini repetitorlarga Telegram orqali yuboradi.
 */
export async function runPaymentReminderJob(): Promise<void> {
  console.log('[PaymentReminder] Job ishga tushdi:', new Date().toISOString());

  try {
    const now = new Date();

    // Oy oxirini hisoblash: keyingi oyning 1-kuni minus 1 kun
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysUntilMonthEnd = lastDayOfMonth - now.getDate();

    // Faqat oy oxirigacha aynan 3 kun qolgan bo'lsa davom etamiz
    if (daysUntilMonthEnd !== 3) {
      console.log(`[PaymentReminder] Bugun ${daysUntilMonthEnd} kun qolgan. Eslatma yuborilmaydi.`);
      return;
    }

    // Joriy davr ("YYYY-MM")
    const period = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    console.log(`[PaymentReminder] Oy oxirigacha 3 kun qoldi. Davr: ${period}`);

    // Barcha foydalanuvchilarni va ularning "monthly" guruhlarini olish
    const users = await prisma.user.findMany({
      where: {
        telegramChatId: { not: null },
      },
      include: {
        groups: {
          where: { paymentType: 'monthly' },
          include: {
            studentLinks: {
              where: { status: 'active' },
              include: {
                student: true,
                payments: {
                  where: { period, status: 'unpaid' },
                },
              },
            },
          },
        },
      },
    });

    for (const user of users) {
      try {
        // Bu foydalanuvchi uchun allaqachon xabar yuborilganmi?
        const alreadySent = await prisma.notificationLog.findUnique({
          where: {
            userId_type_refId: {
              userId: user.id,
              type: 'payment_reminder',
              refId: period,
            },
          },
        });

        if (alreadySent) {
          console.log(`[PaymentReminder] ${user.email} uchun ${period} davri uchun allaqachon yuborilgan.`);
          continue;
        }

        // To'lamagan o'quvchilarni yig'ish
        const unpaidList: { studentName: string; groupName: string; amount: number }[] = [];

        for (const group of user.groups) {
          for (const link of group.studentLinks) {
            if (link.payments.length > 0) {
              // unpaid payment mavjud
              unpaidList.push({
                studentName: `${link.student.firstName} ${link.student.lastName}`,
                groupName: group.name,
                amount: link.payments[0].amount,
              });
            }
          }
        }

        if (unpaidList.length === 0) {
          console.log(`[PaymentReminder] ${user.email} uchun to'lanmagan o'quvchi yo'q.`);
          continue;
        }

        // Xabar matni yaratish
        const totalAmount = unpaidList.reduce((sum, item) => sum + item.amount, 0);
        const listText = unpaidList
          .map((item) => `• ${item.studentName} _(${item.groupName})_ — ${item.amount.toLocaleString('uz-UZ')} so'm`)
          .join('\n');

        const message =
          `💰 *To'lov eslatmasi*\n\n` +
          `Ushbu oy tugashiga *3 kun* qoldi. Quyidagi o'quvchilar hali to'lov qilmagan:\n\n` +
          `${listText}\n\n` +
          `📊 *Jami:* ${totalAmount.toLocaleString('uz-UZ')} so'm`;

        // Xabar yuborish
        await sendTelegramMessage(user.telegramChatId!, message);

        // Log yozish (takrorlanmaslik uchun)
        await prisma.notificationLog.create({
          data: {
            userId: user.id,
            type: 'payment_reminder',
            refId: period,
          },
        });

        console.log(`[PaymentReminder] ✅ ${user.email} ga xabar yuborildi (${unpaidList.length} ta o'quvchi).`);
      } catch (userError) {
        console.error(`[PaymentReminder] ${user.email} uchun xato:`, userError);
        // Keyingi foydalanuvchiga o'tish — butun jarayon to'xtamasin
      }
    }

    console.log('[PaymentReminder] ✅ Job muvaffaqiyatli tugadi.');
  } catch (error) {
    console.error('[PaymentReminder] Job da kritik xato:', error);
  }
}
