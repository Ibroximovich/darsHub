import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

/**
 * SUBSCRIPTION MIDDLEWARE
 *
 * auth.middleware'dan KEYIN ishlaydi (req.user mavjud bo'lishi kerak).
 *
 * Muhim: Admin (isAdmin === true) bo'lgan foydalanuvchi DB dan tekshirilib,
 * har qanday obuna tekshiruvisiz darhol o'tkazib yuboriladi (next()).
 */
export async function requireSubscription(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.user?.id) {
      res.status(401).json({ success: false, message: 'Avtorizatsiyadan o\'tilmagan' });
      return;
    }

    // Database'dan HAQIQIY User yozuvini Prisma orqali qidirib olamiz
    const dbUser = await prisma.user.findUnique({
      where: { id: req.user.id },
      select: {
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionExpiresAt: true,
        isAdmin: true,
      },
    });

    if (!dbUser) {
      res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi' });
      return;
    }

    // Admin bo'lsa — obuna tekshiruvisiz darhol o'tkazish
    if (dbUser.isAdmin === true) {
      return next();
    }

    const now = new Date();

    // ── 1. Faol obuna ──────────────────────────────────────────────────────
    if (
      dbUser.subscriptionStatus === 'active' &&
      dbUser.subscriptionExpiresAt &&
      dbUser.subscriptionExpiresAt > now
    ) {
      return next();
    }

    // ── 2. Faol trial ──────────────────────────────────────────────────────
    if (dbUser.subscriptionStatus === 'trial' && dbUser.trialEndsAt > now) {
      return next();
    }

    // ── 3. Muddati o'tgan "active" → DB da "expired" ga yangilash ─────────
    if (dbUser.subscriptionStatus === 'active') {
      await prisma.user.update({
        where: { id: req.user.id },
        data: { subscriptionStatus: 'expired' },
      });
    }

    // ── 4. Kirish rad etildi ───────────────────────────────────────────────
    res.status(402).json({
      success: false,
      message: 'Obuna muddati tugagan. Davom etish uchun obunani yangilang.',
      code: 'SUBSCRIPTION_REQUIRED',
    });
  } catch (error) {
    next(error);
  }
}
