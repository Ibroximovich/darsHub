import { prisma } from '../lib/prisma';
import { sendTelegramMessage } from '../services/telegram-bot.service';

/**
 * TO'LOV ESLATMASI CRON JOB
 *
 * Har kuni soat 09:00 da ishga tushadi.
 * 1. "monthly" guruhlar uchun: Oy oxiriga aynan 3 kun qolgan bo'lsa, to'lamaganlar ro'yxatini yuboradi.
 * 2. "lesson_based" guruhlar uchun: 12 ta (yoki lessonsPerCycle) dars to'lganda to'lov qilmaganlar ro'yxatini yuboradi.
 */
export async function runPaymentReminderJob(force = false): Promise<void> {
  console.log('[PaymentReminder] Job ishga tushdi (force=' + force + '):', new Date().toISOString());

  try {
    const now = new Date();

    // ─── 1. OYLIK (MONTHLY) GURUHLAR ESLATMASI ─────────────────────────────
    const lastDayOfMonth = new Date(now.getFullYear(), now.getMonth() + 1, 0).getDate();
    const daysUntilMonthEnd = lastDayOfMonth - now.getDate();
    const currentMonthlyPeriod = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`;

    const users = await prisma.user.findMany({
      where: {
        telegramChatId: { not: null },
      },
      include: {
        groups: {
          include: {
            studentLinks: {
              where: { status: 'active' },
              include: {
                student: true,
                payments: true,
              },
            },
          },
        },
      },
    });

    for (const user of users) {
      try {
        const unpaidList: { studentName: string; groupName: string; amount: number; note?: string }[] = [];

        // ─── A) Monthly guruhlar (oy tugashiga 3 kun qolganda yoki force=true) ─────
        if (daysUntilMonthEnd === 3 || force) {
          const alreadySentMonthly = force ? null : await prisma.notificationLog.findUnique({
            where: {
              userId_type_refId: {
                userId: user.id,
                type: 'payment_reminder',
                refId: currentMonthlyPeriod,
              },
            },
          });

          if (!alreadySentMonthly) {
            const monthlyGroups = user.groups.filter(g => g.paymentType === 'monthly');
            for (const group of monthlyGroups) {
              for (const link of group.studentLinks) {
                const payment = link.payments.find(p => p.period === currentMonthlyPeriod && p.status === 'unpaid');
                if (payment) {
                  unpaidList.push({
                    studentName: `${link.student.firstName} ${link.student.lastName}`,
                    groupName: group.name,
                    amount: payment.amount,
                    note: "oylik to'lov",
                  });
                }
              }
            }

            if (unpaidList.length > 0) {
              try {
                await prisma.notificationLog.create({
                  data: {
                    userId: user.id,
                    type: 'payment_reminder',
                    refId: currentMonthlyPeriod,
                  },
                });
              } catch {}
            }
          }
        }

        // ─── B) Lesson-based guruhlar (darslar soni 12 ta / cycle to'lganda) ─
        const lessonBasedGroups = user.groups.filter(g => g.paymentType === 'lesson_based');

        for (const group of lessonBasedGroups) {
          const lessonsPerCycle = group.lessonsPerCycle || 12;

          for (const link of group.studentLinks) {
            // O'quvchi qo'shilganidan beri guruhdagi "held" darslar soni
            const heldLessonsCount = await prisma.lesson.count({
              where: {
                groupId: group.id,
                status: 'held',
                date: { gte: link.joinedAt },
              },
            });

            // Sikl raqami (masalan 12 dars bo'lsa sikl 1 yakunlandi, 13 darsda sikl 2)
            const cycleNumber = Math.floor(heldLessonsCount / lessonsPerCycle) + (heldLessonsCount % lessonsPerCycle === 0 && heldLessonsCount > 0 ? 0 : 1);
            const cyclePeriod = `cycle-${cycleNumber}`;

            // Eslatma refId: groupId + linkId + cyclePeriod
            const refId = `lb-${link.id}-${cyclePeriod}`;

            const alreadySentCycle = force ? null : await prisma.notificationLog.findUnique({
              where: {
                userId_type_refId: {
                  userId: user.id,
                  type: 'payment_reminder',
                  refId,
                },
              },
            });

            if (!alreadySentCycle) {
              // Sikl uchun to'lov statusini tekshirish
              const payment = link.payments.find(p => p.period === cyclePeriod);
              const isUnpaid = !payment || payment.status === 'unpaid';

              if (isUnpaid && (force || (heldLessonsCount > 0 && heldLessonsCount % lessonsPerCycle === 0))) {
                unpaidList.push({
                  studentName: `${link.student.firstName} ${link.student.lastName}`,
                  groupName: group.name,
                  amount: payment ? payment.amount : group.price,
                  note: `${lessonsPerCycle} ta dars (sikl ${cycleNumber})`,
                });

                try {
                  await prisma.notificationLog.create({
                    data: {
                      userId: user.id,
                      type: 'payment_reminder',
                      refId,
                    },
                  });
                } catch {}
              }
            }
          }
        }

        // Xabar yuborish
        if (unpaidList.length > 0) {
          const totalAmount = unpaidList.reduce((sum, item) => sum + item.amount, 0);
          const listText = unpaidList
            .map((item) => `• ${item.studentName} _(${item.groupName}${item.note ? ` — ${item.note}` : ''})_ — ${item.amount.toLocaleString('uz-UZ')} so'm`)
            .join('\n');

          const message =
            `💰 *To'lov eslatmasi*\n\n` +
            `Quyidagi o'quvchilar uchun to'lov vaqti keldi / hali to'lov qilinmagan:\n\n` +
            `${listText}\n\n` +
            `📊 *Jami:* ${totalAmount.toLocaleString('uz-UZ')} so'm`;

          await sendTelegramMessage(user.telegramChatId!, message);
          console.log(`[PaymentReminder] ✅ ${user.email} ga xabar yuborildi (${unpaidList.length} ta o'quvchi).`);
        }
      } catch (userError) {
        console.error(`[PaymentReminder] ${user.email} uchun xato:`, userError);
      }
    }

    console.log('[PaymentReminder] ✅ Job muvaffaqiyatli tugadi.');
  } catch (error) {
    console.error('[PaymentReminder] Job da kritik xato:', error);
  }
}
