import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';

/**
 * GET /api/subscription/status
 *
 * Foydalanuvchining obuna holati va qolgan kunlarini qaytaradi.
 * Obuna tugagan bo'lsa ham ishlaydi (subscription.middleware ishlatilmaydi).
 */
export async function getSubscriptionStatus(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.id) {
      throw new AppError('Avtorizatsiyadan o\'tilmagan', 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionExpiresAt: true,
        isAdmin: true,
      },
    });

    if (!user) {
      throw new AppError('Foydalanuvchi topilmadi', 404);
    }

    const now = new Date();
    let daysLeft = 0;

    if (user.subscriptionStatus === 'trial') {
      const msLeft = user.trialEndsAt.getTime() - now.getTime();
      daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    } else if (user.subscriptionStatus === 'active' && user.subscriptionExpiresAt) {
      const msLeft = user.subscriptionExpiresAt.getTime() - now.getTime();
      daysLeft = Math.max(0, Math.ceil(msLeft / (1000 * 60 * 60 * 24)));
    }

    res.status(200).json({
      success: true,
      data: {
        status: user.subscriptionStatus,
        trialEndsAt: user.trialEndsAt,
        subscriptionExpiresAt: user.subscriptionExpiresAt,
        daysLeft,
        isAdmin: user.isAdmin,
      },
    });
  } catch (error) {
    next(error);
  }
}
