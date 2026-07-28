import { Request, Response, NextFunction } from 'express';
import jwt from 'jsonwebtoken';
import { AppError } from './error-handler';
import { prisma } from '../lib/prisma';

// Express Request interfeysini global kengaytiramiz
declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
      };
    }
  }
}

export interface JwtPayload {
  userId: string;
  email: string;
  tokenVersion?: number;
}

/**
 * AUTH MIDDLEWARE — Himoyalangan route'lar uchun token tekshirish middleware'i
 *
 * 1. Authorization header'dan "Bearer <token>" formatida tokenni olish
 * 2. Tokenni JWT_SECRET va tokenVersion bilan tekshirish
 * 3. To'g'ri bo'lsa req.user ga foydalanuvchi id va email'ini saqlash va next() chaqirish
 * 4. Noto'g'ri/yo'q bo'lsa — 401 xato: "Avtorizatsiyadan o'tilmagan"
 */
export async function authMiddleware(
  req: Request,
  _res: Response,
  next: NextFunction
): Promise<void> {
  const authHeader = req.headers.authorization;

  if (!authHeader || !authHeader.startsWith('Bearer ')) {
    return next(new AppError('Avtorizatsiyadan o\'tilmagan', 401));
  }

  const token = authHeader.split(' ')[1];

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET as string
    ) as JwtPayload;

    if (decoded.tokenVersion !== undefined) {
      const user = await prisma.user.findUnique({
        where: { id: decoded.userId },
        select: { tokenVersion: true },
      });

      if (!user || user.tokenVersion !== decoded.tokenVersion) {
        return next(new AppError('Avtorizatsiyadan o\'tilmagan (Session bekor qilingan)', 401));
      }
    }

    req.user = {
      id: decoded.userId,
      email: decoded.email,
    };

    next();
  } catch (error) {
    return next(new AppError('Avtorizatsiyadan o\'tilmagan', 401));
  }
}
