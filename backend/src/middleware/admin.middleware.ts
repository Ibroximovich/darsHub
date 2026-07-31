import { Request, Response, NextFunction } from 'express';
import { AppError } from './error-handler';
import { prisma } from '../lib/prisma';

/**
 * REQUIRE ADMIN MIDDLEWARE — Faqat admin foydalanuvchilar kirishi uchun middleware
 * 
 * 1. req.user mavjudligini tekshirish
 * 2. req.user.role === 'admin' ekanligini tekshirish (yoki DB dan role ni tekshirish)
 * 3. Admin bo'lmasa — 403 xato: "Ruxsat berilmagan. Faqat adminlar uchun."
 */
export async function requireAdmin(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user || !req.user.id) {
      return next(new AppError('Avtorizatsiyadan o\'tilmagan', 401));
    }

    let role = req.user.role;

    if (!role) {
      const user = await prisma.user.findUnique({
        where: { id: req.user.id },
        select: { role: true },
      });
      role = user?.role;
    }

    if (role !== 'admin') {
      return next(new AppError('Ruxsat berilmagan. Faqat adminlar uchun.', 403));
    }

    next();
  } catch (error) {
    next(error);
  }
}
