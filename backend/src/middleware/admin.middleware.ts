import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';
import { prisma } from '../lib/prisma';

/**
 * REQUIRE ADMIN MIDDLEWARE — Faqat admin foydalanuvchilar kirishi uchun middleware
 *
 * req.user.id orqali DB dan user ni oladi va isAdmin === true ekanligini tekshiradi.
 * Admin bo'lmasa — 403 xato: "Ruxsat yo'q"
 */
export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.id) {
      return next(new AppError('Avtorizatsiyadan o\'tilmagan', 401));
    }

    const user = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: { isAdmin: true },
    });

    if (!user?.isAdmin) {
      return next(new AppError('Ruxsat yo\'q. Faqat adminlar uchun.', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
}

