import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';

// ─── Helper: Joriy davr (period) ni hisoblash ──────────────────────────────

/**
 * Monthly guruhlar uchun — joriy kalendar oyi "YYYY-MM" formatida
 */
function getCurrentMonthlyPeriod(): string {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  return `${year}-${month}`;
}

/**
 * Lesson-based guruhlar uchun — o'quvchining joriy sikl raqamini hisoblash.
 * O'quvchi qo'shilganidan beri nechta "held" dars bo'lganini sanab,
 * lessonsPerCycle'ga bo'lib, joriy sikl raqamini aniqlaydi.
 *
 * Masalan: lessonsPerCycle=12, o'quvchi 25 ta held darsga qatnashgan
 * → sikl 1 = darslar 1-12, sikl 2 = darslar 13-24, hozir sikl 3 da
 *
 * Eslatma: biz umumiy held darslar sonini olamiz (guruh bo'yicha, o'quvchi
 * qo'shilgan sanadan beri), chunki davomat belgilanmagan bo'lishi ham mumkin.
 */
async function getCurrentLessonBasedPeriod(
  groupId: string,
  groupStudentJoinedAt: Date,
  lessonsPerCycle: number
): Promise<string> {
  const heldLessonsCount = await prisma.lesson.count({
    where: {
      groupId,
      status: 'held',
      date: { gte: groupStudentJoinedAt },
    },
  });

  // Agar hech dars bo'lmagan bo'lsa ham, birinchi sikl hisoblanadi
  const cycleNumber = Math.floor(heldLessonsCount / lessonsPerCycle) + 1;
  return `cycle-${cycleNumber}`;
}

// ─── 1. GET /api/groups/:groupId/payments ────────────────────────────────────

/**
 * Guruhning tanlangan davr uchun to'lov holati.
 * - monthly: period query yoki joriy oy
 * - lesson_based: har bir o'quvchining individual joriy sikli
 * Payment yozuvi mavjud bo'lmasa — lazy creation (amount = guruh.price)
 */
export async function getGroupPayments(
  userId: string,
  groupId: string,
  periodQuery?: string
) {
  // 1. Guruhni topish va egalik tekshirish
  const group = await prisma.group.findFirst({
    where: { id: groupId, userId },
  });

  if (!group) {
    throw new AppError('Guruh topilmadi', 404);
  }

  // 2. Faol o'quvchilarni olish
  const groupStudents = await prisma.groupStudent.findMany({
    where: {
      groupId,
      status: 'active',
    },
    include: {
      student: true,
    },
  });

  if (groupStudents.length === 0) {
    return [];
  }

  // 3. Har bir o'quvchi uchun davr va Payment ni aniqlash/yaratish
  const results = [];

  for (const gs of groupStudents) {
    let period: string;

    if (group.paymentType === 'monthly') {
      // Monthly uchun — query'dan yoki joriy oy
      period = periodQuery && /^\d{4}-\d{2}$/.test(periodQuery)
        ? periodQuery
        : getCurrentMonthlyPeriod();
    } else {
      // Lesson-based uchun — har doim individual joriy sikl
      const lessonsPerCycle = group.lessonsPerCycle || 12;
      period = await getCurrentLessonBasedPeriod(
        groupId,
        gs.joinedAt,
        lessonsPerCycle
      );
    }

    // 4. Lazy creation — agar payment yozuvi mavjud bo'lmasa, yaratish
    let payment = await prisma.payment.findUnique({
      where: {
        groupStudentId_period: {
          groupStudentId: gs.id,
          period,
        },
      },
    });

    if (!payment) {
      payment = await prisma.payment.create({
        data: {
          groupStudentId: gs.id,
          period,
          amount: group.price,
          status: 'unpaid',
        },
      });
    }

    results.push({
      paymentId: payment.id,
      groupStudentId: gs.id,
      studentId: gs.student.id,
      firstName: gs.student.firstName,
      lastName: gs.student.lastName,
      phone: gs.student.phone,
      period: payment.period,
      amount: payment.amount,
      status: payment.status,
      paidAt: payment.paidAt,
    });
  }

  return results;
}

// ─── 2. PATCH /api/payments/:id ──────────────────────────────────────────────

/**
 * To'lov holatini almashtirish.
 * Egalik tekshiruvi: Payment → GroupStudent → Group → userId
 */
export async function updatePaymentStatus(
  userId: string,
  paymentId: string,
  status: 'paid' | 'unpaid'
) {
  // 1. Paymentni topish va egalik tekshirish (zanjir: Payment → GroupStudent → Group)
  const payment = await prisma.payment.findUnique({
    where: { id: paymentId },
    include: {
      groupStudent: {
        include: {
          group: true,
        },
      },
    },
  });

  if (!payment || payment.groupStudent.group.userId !== userId) {
    throw new AppError("To'lov topilmadi", 404);
  }

  // 2. Status yangilash
  const updatedPayment = await prisma.payment.update({
    where: { id: paymentId },
    data: {
      status,
      paidAt: status === 'paid' ? new Date() : null,
    },
  });

  return updatedPayment;
}

// ─── 3. GET /api/payments/summary ────────────────────────────────────────────

/**
 * Umumiy statistika — barcha guruhlar bo'yicha joriy davrning to'lov holati.
 * - monthly guruhlar: period query yoki joriy oy bo'yicha
 * - lesson_based guruhlar: har doim individual joriy sikl bo'yicha
 * Lazy creation ham ishlaydi (yangi period'lar avtomatik yaratiladi).
 */
export async function getPaymentsSummary(
  userId: string,
  periodQuery?: string
) {
  // 1. Foydalanuvchining barcha guruhlarini olish
  const groups = await prisma.group.findMany({
    where: { userId },
    include: {
      studentLinks: {
        where: { status: 'active' },
        include: {
          student: true,
        },
      },
    },
  });

  if (groups.length === 0) {
    return {
      totalExpected: 0,
      totalPaid: 0,
      totalUnpaid: 0,
      paidStudents: [],
      unpaidStudents: [],
    };
  }

  let totalExpected = 0;
  let totalPaid = 0;
  let totalUnpaid = 0;
  const paidStudents: Array<{
    firstName: string;
    lastName: string;
    groupName: string;
    amount: number;
    paidAt: Date | null;
  }> = [];
  const unpaidStudents: Array<{
    firstName: string;
    lastName: string;
    groupName: string;
    amount: number;
    phone: string;
  }> = [];

  for (const group of groups) {
    for (const gs of group.studentLinks) {
      let period: string;

      if (group.paymentType === 'monthly') {
        period = periodQuery && /^\d{4}-\d{2}$/.test(periodQuery)
          ? periodQuery
          : getCurrentMonthlyPeriod();
      } else {
        const lessonsPerCycle = group.lessonsPerCycle || 12;
        period = await getCurrentLessonBasedPeriod(
          group.id,
          gs.joinedAt,
          lessonsPerCycle
        );
      }

      // Lazy creation
      let payment = await prisma.payment.findUnique({
        where: {
          groupStudentId_period: {
            groupStudentId: gs.id,
            period,
          },
        },
      });

      if (!payment) {
        payment = await prisma.payment.create({
          data: {
            groupStudentId: gs.id,
            period,
            amount: group.price,
            status: 'unpaid',
          },
        });
      }

      totalExpected += payment.amount;

      if (payment.status === 'paid') {
        totalPaid += payment.amount;
        paidStudents.push({
          firstName: gs.student.firstName,
          lastName: gs.student.lastName,
          groupName: group.name,
          amount: payment.amount,
          paidAt: payment.paidAt,
        });
      } else {
        totalUnpaid += payment.amount;
        unpaidStudents.push({
          firstName: gs.student.firstName,
          lastName: gs.student.lastName,
          groupName: group.name,
          amount: payment.amount,
          phone: gs.student.phone,
        });
      }
    }
  }

  return {
    totalExpected,
    totalPaid,
    totalUnpaid,
    paidStudents,
    unpaidStudents,
  };
}
