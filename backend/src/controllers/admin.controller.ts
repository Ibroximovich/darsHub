import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import { Prisma } from '@prisma/client';

/**
 * GET /api/admin/stats
 * Tizimdagi umumiy statistika
 */
export async function getAdminStats(
  _req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const totalUsers = await prisma.user.count();
    const activeGroups = await prisma.group.count();
    const totalStudents = await prisma.student.count();

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    // Shu oygi to'langan to'lovlar summasi
    const currentMonthPayments = await prisma.payment.aggregate({
      where: {
        status: 'paid',
        paidAt: {
          gte: startOfMonth,
        },
      },
      _sum: {
        amount: true,
      },
    });

    // Jami to'langan to'lovlar summasi
    const totalPaidPayments = await prisma.payment.aggregate({
      where: {
        status: 'paid',
      },
      _sum: {
        amount: true,
      },
    });

    res.status(200).json({
      success: true,
      data: {
        totalUsers,
        activeGroups,
        totalStudents,
        currentMonthRevenue: currentMonthPayments._sum.amount || 0,
        totalRevenue: totalPaidPayments._sum.amount || 0,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/users
 * Barcha foydalanuvchilar ro'yxati (paginatsiya, qidiruv bilan)
 */
export async function getAdminUsers(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const limit = Math.max(1, parseInt(String(req.query.limit)) || 10);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const where: Prisma.UserWhereInput = {};
    if (search) {
      where.OR = [
        { fullName: { contains: search, mode: 'insensitive' } },
        { email: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
      ];
    }

    const total = await prisma.user.count({ where });
    const totalPages = Math.ceil(total / limit) || 1;

    const users = await prisma.user.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        role: true,
        isVerified: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionExpiresAt: true,
        isAdmin: true,
        createdAt: true,
        _count: {
          select: {
            groups: true,
            students: true,
          },
        },
      },
    });

    const now = new Date();
    const formattedUsers = users.map((u) => {
      let computedStatus = u.subscriptionStatus;
      if (u.subscriptionStatus === 'trial' && u.trialEndsAt && u.trialEndsAt <= now) {
        computedStatus = 'expired';
      } else if (
        u.subscriptionStatus === 'active' &&
        u.subscriptionExpiresAt &&
        u.subscriptionExpiresAt <= now
      ) {
        computedStatus = 'expired';
      }
      return {
        ...u,
        subscriptionStatus: computedStatus,
      };
    });

    res.status(200).json({
      success: true,
      data: formattedUsers,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/users/:id
 * Foydalanuvchini o'chirish (cascade)
 */
export async function deleteAdminUser(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;

    if (req.user?.id === id) {
      throw new AppError('O\'z akkauntingizni o\'chira olmaysiz', 400);
    }

    const user = await prisma.user.findUnique({ where: { id } });
    if (!user) {
      throw new AppError('Foydalanuvchi topilmadi', 404);
    }

    await prisma.user.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Foydalanuvchi va unga tegishli barcha ma\'lumotlar muvaffaqiyatli o\'chirildi',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/groups
 * Barcha guruhlar ro'yxati (egasi bilan birga)
 */
export async function getAdminGroups(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const limit = Math.max(1, parseInt(String(req.query.limit)) || 10);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const where: Prisma.GroupWhereInput = {};
    if (search) {
      where.OR = [
        { name: { contains: search, mode: 'insensitive' } },
        { user: { is: { fullName: { contains: search, mode: 'insensitive' } } } },
        { user: { is: { email: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const total = await prisma.group.count({ where });
    const totalPages = Math.ceil(total / limit) || 1;

    const groups = await prisma.group.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
            phone: true,
          },
        },
        _count: {
          select: {
            studentLinks: true,
            lessons: true,
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: groups,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/groups/:id
 * Guruhni o'chirish
 */
export async function deleteAdminGroup(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;

    const group = await prisma.group.findUnique({ where: { id } });
    if (!group) {
      throw new AppError('Guruh topilmadi', 404);
    }

    await prisma.group.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'Guruh muvaffaqiyatli o\'chirildi',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/students
 * Barcha o'quvchilar ro'yxati
 */
export async function getAdminStudents(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const limit = Math.max(1, parseInt(String(req.query.limit)) || 10);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';

    const where: Prisma.StudentWhereInput = {};
    if (search) {
      where.OR = [
        { firstName: { contains: search, mode: 'insensitive' } },
        { lastName: { contains: search, mode: 'insensitive' } },
        { phone: { contains: search, mode: 'insensitive' } },
        { parentName: { contains: search, mode: 'insensitive' } },
        { parentPhone: { contains: search, mode: 'insensitive' } },
        { user: { is: { fullName: { contains: search, mode: 'insensitive' } } } },
      ];
    }

    const total = await prisma.student.count({ where });
    const totalPages = Math.ceil(total / limit) || 1;

    const students = await prisma.student.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        user: {
          select: {
            id: true,
            fullName: true,
            email: true,
          },
        },
        groupLinks: {
          include: {
            group: {
              select: {
                id: true,
                name: true,
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: students,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/admin/students/:id
 * O'quvchini o'chirish
 */
export async function deleteAdminStudent(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const id = req.params.id as string;

    const student = await prisma.student.findUnique({ where: { id } });
    if (!student) {
      throw new AppError('O\'quvchi topilmadi', 404);
    }

    await prisma.student.delete({ where: { id } });

    res.status(200).json({
      success: true,
      message: 'O\'quvchi muvaffaqiyatli o\'chirildi',
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/admin/payments
 * Barcha to'lovlar ro'yxati (paid/unpaid filter bilan)
 */
export async function getAdminPayments(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const page = Math.max(1, parseInt(String(req.query.page)) || 1);
    const limit = Math.max(1, parseInt(String(req.query.limit)) || 10);
    const search = typeof req.query.search === 'string' ? req.query.search.trim() : '';
    const status = typeof req.query.status === 'string' ? req.query.status.trim() : '';

    const where: Prisma.PaymentWhereInput = {};

    if (status && (status === 'paid' || status === 'unpaid')) {
      where.status = status;
    }

    if (search) {
      where.OR = [
        { period: { contains: search, mode: 'insensitive' } },
        { groupStudent: { is: { student: { is: { firstName: { contains: search, mode: 'insensitive' } } } } } },
        { groupStudent: { is: { student: { is: { lastName: { contains: search, mode: 'insensitive' } } } } } },
        { groupStudent: { is: { group: { is: { name: { contains: search, mode: 'insensitive' } } } } } },
        { groupStudent: { is: { group: { is: { user: { is: { fullName: { contains: search, mode: 'insensitive' } } } } } } } },
      ];
    }

    const total = await prisma.payment.count({ where });
    const totalPages = Math.ceil(total / limit) || 1;

    const payments = await prisma.payment.findMany({
      where,
      skip: (page - 1) * limit,
      take: limit,
      orderBy: { createdAt: 'desc' },
      include: {
        groupStudent: {
          include: {
            student: {
              select: {
                id: true,
                firstName: true,
                lastName: true,
                phone: true,
              },
            },
            group: {
              select: {
                id: true,
                name: true,
                user: {
                  select: {
                    id: true,
                    fullName: true,
                    email: true,
                  },
                },
              },
            },
          },
        },
      },
    });

    res.status(200).json({
      success: true,
      data: payments,
      pagination: {
        total,
        page,
        limit,
        totalPages,
      },
    });
  } catch (error) {
    next(error);
  }
}
/**
 * POST /api/admin/users/:userId/activate
 * Foydalanuvchi obunasini qo'lda faollashtirish
 * Body: { months: number }
 */
export async function activateSubscription(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = typeof req.params.userId === 'string' ? req.params.userId : String(req.params.userId || '');
    const months = Number(req.body.months);

    if (!months || months < 1) {
      throw new AppError('months kamida 1 bo\'lishi kerak', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Foydalanuvchi topilmadi', 404);
    }

    // Hali muddati o'tmagan active obuna bo'lsa — ustiga qo'shamiz
    const now = new Date();
    const baseDate =
      user.subscriptionStatus === 'active' &&
      user.subscriptionExpiresAt &&
      user.subscriptionExpiresAt > now
        ? user.subscriptionExpiresAt
        : now;

    const subscriptionExpiresAt = new Date(
      baseDate.getTime() + months * 30 * 24 * 60 * 60 * 1000
    );

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'active',
        subscriptionExpiresAt,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionExpiresAt: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: `Obuna ${months} oyga faollashtirildi`,
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/admin/users/:userId/deactivate
 * Foydalanuvchi obunasini qo'lda bekor qilish
 */
export async function deactivateSubscription(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = typeof req.params.userId === 'string' ? req.params.userId : String(req.params.userId || '');

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Foydalanuvchi topilmadi', 404);
    }

    const now = new Date();

    const updated = await prisma.user.update({
      where: { id: userId },
      data: {
        subscriptionStatus: 'expired',
        subscriptionExpiresAt: now,
        trialEndsAt: now,
      },
      select: {
        id: true,
        fullName: true,
        email: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        trialEndsAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Obuna bekor qilindi',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/admin/users/:userId/trial
 * Sanani qo'lda tahrirlash (Sana kelajakka o'zgarsa status avtomatik o'zgaradi)
 * Body: { trialEndsAt: string } // ISO format
 */
export async function updateUserTrial(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = typeof req.params.userId === 'string' ? req.params.userId : String(req.params.userId || '');
    const { trialEndsAt } = req.body;

    if (!trialEndsAt || isNaN(Date.parse(trialEndsAt))) {
      throw new AppError('trialEndsAt to\'g\'ri ISO sana formatida bo\'lishi kerak', 400);
    }

    const user = await prisma.user.findUnique({ where: { id: userId } });
    if (!user) {
      throw new AppError('Foydalanuvchi topilmadi', 404);
    }

    const newDate = new Date(trialEndsAt);
    const now = new Date();

    // Mantiq: Sanani kelajakka sursak — status avtomatik "active" (Faol) bo'ladi
    // Sanani o'tgan kunga sursak — status "expired" (Tugagan) bo'ladi
    const isFuture = newDate > now;
    const dataToUpdate: Prisma.UserUpdateInput = {
      subscriptionStatus: isFuture ? 'active' : 'expired',
      subscriptionExpiresAt: isFuture ? newDate : now,
      trialEndsAt: newDate,
    };

    const updated = await prisma.user.update({
      where: { id: userId },
      data: dataToUpdate,
      select: {
        id: true,
        fullName: true,
        email: true,
        subscriptionStatus: true,
        subscriptionExpiresAt: true,
        trialEndsAt: true,
      },
    });

    res.status(200).json({
      success: true,
      message: 'Sana muvaffaqiyatli yangilandi',
      data: updated,
    });
  } catch (error) {
    next(error);
  }
}

