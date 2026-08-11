import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

/**
 * SUBSCRIPTION MIDDLEWARE
 *
 * auth.middleware'dan KEYIN ishlaydi (req.user mavjud bo'lishi kerak).
 *
 * Tekshirish tartibi:
 * 1. "active" va subscriptionExpiresAt > hozir → ruxsat
 * 2. "trial"  va trialEndsAt > hozir             → ruxsat
 * 3. Boshqa barcha holatlar                       → 402 SUBSCRIPTION_REQUIRED
 *    (agar "active" lekin muddati o'tgan bo'lsa — DB da "expired" ga yangilab qo'yamiz)
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

    // Doim DB dan yangi ma'lumot olamiz (token ichidagi eski bo'lishi mumkin)
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
      res.status(401).json({ success: false, message: 'Foydalanuvchi topilmadi' });
      return;
    }

    // Admin uchun har doim ruxsat
    if (user.isAdmin) {
      next();
      return;
    }

    const now = new Date();

    // ── 1. Faol obuna ──────────────────────────────────────────────────────
    if (
      user.subscriptionStatus === 'active' &&
      user.subscriptionExpiresAt &&
      user.subscriptionExpiresAt > now
    ) {
      next();
      return;
    }

    // ── 2. Faol trial ──────────────────────────────────────────────────────
    if (user.subscriptionStatus === 'trial' && user.trialEndsAt > now) {
      next();
      return;
    }

    // ── 3. Muddati o'tgan "active" → DB da "expired" ga yangilash ─────────
    if (user.subscriptionStatus === 'active') {
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
