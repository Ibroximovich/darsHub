import { Request, Response, NextFunction } from 'express';
import {
  registerSchema,
  verifyEmailSchema,
  resendCodeSchema,
  loginSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
  updateProfileSchema,
} from '../validators/auth.validator';
import {
  registerUser,
  verifyEmail,
  resendVerificationCode,
  loginUser,
  refreshTokenService,
  forgotPassword,
  resetPassword,
  resendResetCode,
  updateProfile,
} from '../services/auth.service';
import { AppError } from '../middleware/error-handler';
import { prisma } from '../lib/prisma';

/**
 * POST /api/auth/register
 * Yangi foydalanuvchini ro'yxatdan o'tkazish
 */
export async function register(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = registerSchema.parse(req.body);
    const result = await registerUser(data);

    console.log('Register result:', result);

    res.status(201).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/verify-email
 * Email tasdiqlash kodi orqali
 */
export async function verifyEmailController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = verifyEmailSchema.parse(req.body);
    const result = await verifyEmail(data);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 kun
      path: '/',
    });

    res.status(200).json({
      success: true,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/resend-code
 * Tasdiqlash kodini qayta yuborish
 */
export async function resendCode(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const { email } = resendCodeSchema.parse(req.body);
    const result = await resendVerificationCode(email);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/login
 * Tizimga kirish
 */
export async function login(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = loginSchema.parse(req.body);
    const result = await loginUser(data);

    res.cookie('refreshToken', result.refreshToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 kun
      path: '/',
    });

    res.status(200).json({
      success: true,
      accessToken: result.accessToken,
      user: result.user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/refresh
 * Cookie'dagi refresh token orqali yangi access token olish
 */
export async function refresh(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new AppError("Refresh token topilmadi", 401);
    }

    const result = await refreshTokenService(refreshToken);

    res.status(200).json({
      success: true,
      accessToken: result.accessToken,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/logout
 * Tizimdan chiqish (refresh token cookie'sini o'chirish)
 */
export async function logout(
  _req: Request,
  res: Response
): Promise<void> {
  res.clearCookie('refreshToken', {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
    path: '/',
  });

  res.status(200).json({
    success: true,
    message: 'Chiqildi',
  });
}

/**
 * GET /api/auth/me
 * Joriy autentifikatsiyalangan foydalanuvchi ma'lumotlarini olish (Protected route)
 */
export async function getMe(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Avtorizatsiyadan o'tilmagan", 401);
    }

    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: {
        id: true,
        fullName: true,
        email: true,
        phone: true,
        isVerified: true,
        role: true,
        isAdmin: true,
        subscriptionStatus: true,
        trialEndsAt: true,
        subscriptionExpiresAt: true,
        createdAt: true,
      },
    });

    res.status(200).json({
      success: true,
      user,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/forgot-password
 * Parolni unutganda OTP kod yuborish
 */
export async function forgotPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const result = await forgotPassword(data);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/reset-password
 * Parolni yangi kod va yangi parol bilan almashtirish
 */
export async function resetPasswordController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = resetPasswordSchema.parse(req.body);
    const result = await resetPassword(data);

    // Parol o'zgarganda cookie'dagi refresh tokenni o'chirish
    res.clearCookie('refreshToken', {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: process.env.NODE_ENV === 'production' ? 'none' : 'lax',
      path: '/',
    });

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/auth/resend-reset-code
 * Parolni tiklash kodini qayta yuborish
 */
export async function resendResetCodeController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const data = forgotPasswordSchema.parse(req.body);
    const result = await resendResetCode(data.email);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/auth/profile
 * Foydalanuvchi ism-sharifi va telefon raqamini tahrirlash (Protected route)
 */
export async function updateProfileController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError("Avtorizatsiyadan o'tilmagan", 401);
    }
    const data = updateProfileSchema.parse(req.body);
    const user = await updateProfile(userId, data);
    res.status(200).json({
      success: true,
      message: "Profil ma'lumotlari yangilandi",
      user,
    });
  } catch (error) {
    next(error);
  }
}

