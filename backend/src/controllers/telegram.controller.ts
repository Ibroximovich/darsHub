import { Request, Response, NextFunction } from 'express';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';

const botUsername = process.env.TELEGRAM_BOT_USERNAME || 'DarsHubNotifyBot';

/**
 * GET /api/telegram/connect-link
 * Foydalanuvchi uchun Telegram bot ulash havolasini qaytaradi
 */
export async function getConnectLink(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;

    const link = `https://t.me/${botUsername}?start=${userId}`;

    res.json({
      success: true,
      link,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/telegram/status
 * Foydalanuvchining Telegram boti bilan ulanganligini tekshiradi
 */
export async function getStatus(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { telegramChatId: true },
    });

    if (!user) {
      return next(new AppError('Foydalanuvchi topilmadi', 404));
    }

    res.json({
      success: true,
      connected: Boolean(user.telegramChatId),
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/telegram/disconnect
 * Foydalanuvchining Telegram bot ulanishini uzadi
 */
export async function disconnectTelegram(req: Request, res: Response, next: NextFunction): Promise<void> {
  try {
    const userId = req.user!.id;

    await prisma.user.update({
      where: { id: userId },
      data: { telegramChatId: null },
    });

    res.json({
      success: true,
      message: 'Telegram ulanishi uzildi',
    });
  } catch (error) {
    next(error);
  }
}
