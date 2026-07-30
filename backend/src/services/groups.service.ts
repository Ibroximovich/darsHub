import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import type { CreateGroupInput, UpdateGroupInput } from '../validators/groups.validator';

// ─── Guruhlar (Groups) servis funksiyalari ───────────────────────────────────

/**
 * CREATE GROUP — Yangi guruh yaratish
 * paymentType "monthly" bo'lsa lessonsPerCycle ni null ga o'rnatamiz
 */
export async function createGroup(userId: string, data: CreateGroupInput) {
  const group = await prisma.group.create({
    data: {
      userId,
      name: data.name,
      days: data.days,
      time: data.time,
      price: data.price,
      paymentType: data.paymentType,
      // Agar paymentType "monthly" bo'lsa, lessonsPerCycle e'tiborga olinmaydi
      lessonsPerCycle: data.paymentType === 'lesson_based' ? data.lessonsPerCycle! : null,
    },
  });

  return group;
}

/**
 * GET ALL GROUPS — Foydalanuvchining barcha guruhlarini olish
 * Har bir guruhga studentsCount: 0 qo'shiladi (hozircha studentlar modeli yo'q)
 */
export async function getGroupsByUserId(userId: string) {
  const groups = await prisma.group.findMany({
    where: { userId },
    include: {
      _count: {
        select: {
          studentLinks: {
            where: { status: 'active' },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return groups.map((group: any) => {
    const { _count, ...groupData } = group;
    return {
      ...groupData,
      studentsCount: _count.studentLinks,
    };
  });
}

/**
 * GET GROUP BY ID — Bitta guruhni id bo'yicha olish (egalik tekshiruvi bilan)
 * - Agar guruh topilmasa — 404
 * - Agar guruh boshqa foydalanuvchiga tegishli bo'lsa — 403
 */
export async function getGroupById(groupId: string, userId: string) {
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new AppError('Guruh topilmadi', 404);
  }

  if (group.userId !== userId) {
    throw new AppError('Bu guruhga ruxsatingiz yo\'q', 403);
  }

  return group;
}

/**
 * UPDATE GROUP — Guruhni tahrirlash (egalik tekshiruvi bilan)
 * Faqat berilgan maydonlarni yangilaydi
 */
export async function updateGroup(groupId: string, userId: string, data: UpdateGroupInput) {
  // Avval egalikni tekshiramiz
  const existingGroup = await getGroupById(groupId, userId);

  // Agar paymentType "monthly" ga o'zgartirilsa, lessonsPerCycle ni null ga o'rnatamiz
  const updateData: any = { ...data };

  if (data.paymentType === 'monthly') {
    updateData.lessonsPerCycle = null;
  } else if (data.paymentType === undefined && existingGroup.paymentType === 'monthly') {
    // Agar paymentType o'zgartirilmayapti va hozir "monthly" bo'lsa, lessonsPerCycle ni ham e'tiborga olmaymiz
    delete updateData.lessonsPerCycle;
  }

  const updatedGroup = await prisma.group.update({
    where: { id: groupId },
    data: updateData,
  });

  return updatedGroup;
}

/**
 * DELETE GROUP — Guruhni o'chirish (egalik tekshiruvi bilan)
 * Agar guruhda faol o'quvchilar bo'lsa — o'chirishni taqiqlash
 */
export async function deleteGroup(groupId: string, userId: string) {
  // Avval egalikni tekshiramiz
  await getGroupById(groupId, userId);

  // Guruhda faol o'quvchilar bor-yo'qligini tekshiramiz
  const activeStudentsCount = await prisma.groupStudent.count({
    where: {
      groupId,
      status: 'active',
    },
  });

  if (activeStudentsCount > 0) {
    throw new AppError(
      `Guruhda ${activeStudentsCount} ta faol o'quvchi bor. Guruhni o'chirishdan avval barcha o'quvchilarni guruhdan chiqaring.`,
      400
    );
  }

  await prisma.group.delete({
    where: { id: groupId },
  });

  return { message: 'Guruh o\'chirildi' };
}
