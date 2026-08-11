import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';

/**
 * SUBSCRIPTION MIDDLEWARE
 *
 * auth.middleware'dan KEYIN ishlaydi (req.user mavjud bo'lishi kerak).
 *
 * Muhim: Admin (isAdmin === true) foydalanuvchilar har qanday obuna tekshiruvidan
 * BUTUNLAY ozod qilinadi va ularga hech qachon 402 qaytarilmaydi.
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

    // ── 0. Boshida DARHOL adminlikni tekshiramiz (req.user bo'yicha) ─────────
    if (req.user.isAdmin === true) {
      next();
      return;
    }

    // DB dan obuna holati va adminlik ma'lumotini olamiz
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

    // ── DB bo'yicha ham admin bo'lsa — darhol o'tkazamiz ──────────────────────
    if (user.isAdmin === true) {
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
