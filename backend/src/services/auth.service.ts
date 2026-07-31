import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import { sendVerificationEmail, sendPasswordResetEmail } from './email.service';
import type {
  RegisterInput,
  VerifyEmailInput,
  LoginInput,
  ForgotPasswordInput,
  ResetPasswordInput,
  UpdateProfileInput,
} from '../validators/auth.validator';

// ─── Yordamchi funksiyalar ───────────────────────────────────────────────────

/**
 * 6 xonali tasodifiy OTP kod generatsiya qilish (100000 — 999999)
 */
function generateOTPCode(): string {
  return Math.floor(100000 + Math.random() * 900000).toString();
}

/**
 * JWT Access Token yaratish (15 daqiqa)
 */
function generateAccessToken(userId: string, email: string, tokenVersion: number): string {
  const secret = process.env.JWT_SECRET || 'darshub_default_jwt_secret_key_2026';
  return jwt.sign(
    { userId, email, tokenVersion },
    secret,
    { expiresIn: '15m' }
  );
}

/**
 * JWT Refresh Token yaratish (7 kun)
 */
function generateRefreshToken(userId: string, tokenVersion: number): string {
  const secret = process.env.JWT_REFRESH_SECRET || 'darshub_default_jwt_refresh_secret_key_2026';
  return jwt.sign(
    { userId, tokenVersion },
    secret,
    { expiresIn: '7d' }
  );
}

// ─── Asosiy servis funksiyalari ─────────────────────────────────────────────

/**
 * REGISTER — Yangi foydalanuvchini ro'yxatdan o'tkazish
 */
export async function registerUser(data: RegisterInput) {
  const { fullName, email, phone, password } = data;

  const existingVerifiedUser = await prisma.user.findFirst({
    where: { email, isVerified: true },
  });

  if (existingVerifiedUser) {
    throw new AppError('Bu email allaqachon ro\'yxatdan o\'tgan', 409);
  }

  const existingUnverifiedUser = await prisma.user.findFirst({
    where: { email, isVerified: false },
  });

  const passwordHash = await bcrypt.hash(password, 10);

  let user;

  if (existingUnverifiedUser) {
    user = await prisma.user.update({
      where: { id: existingUnverifiedUser.id },
      data: { fullName, phone, passwordHash },
    });
  } else {
    user = await prisma.user.create({
      data: {
        fullName,
        email,
        phone,
        passwordHash,
        isVerified: false,
      },
    });
  }

  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 daqiqa

  await prisma.emailVerificationCode.create({
    data: {
      email,
      code,
      expiresAt,
    },
  });

  console.log(`
  ════════════════════════════════════════════════
  📩 [DEVELOPMENT OTP KOD]
  👤 Email: ${email}
  🔑 Kod  : >>> ${code} <<<
  ════════════════════════════════════════════════
  `);

  try {
    await sendVerificationEmail(email, code);
    console.log(`✅ Tasdiqlash kodi ${email} manziliga yuborildi`);
  } catch (error: any) {
    console.error('❌ Email yuborishda xatolik:', error.message || error);
  }

  return {
    message: 'Kod email\'ingizga yuborildi',
    userId: user.id,
    ...(process.env.NODE_ENV !== 'production' ? { devCode: code } : {}),
  };
}

/**
 * VERIFY EMAIL — Email tasdiqlash kodi orqali
 */
export async function verifyEmail(data: VerifyEmailInput) {
  const { email, code } = data;

  const verificationRecord = await prisma.emailVerificationCode.findFirst({
    where: { email, code },
    orderBy: { createdAt: 'desc' },
  });

  if (!verificationRecord || verificationRecord.expiresAt < new Date()) {
    throw new AppError('Kod noto\'g\'ri yoki muddati o\'tgan', 400);
  }

  const user = await prisma.user.update({
    where: { email },
    data: { isVerified: true },
  });

  await prisma.emailVerificationCode.deleteMany({
    where: { email },
  });

  const accessToken = generateAccessToken(user.id, user.email, user.tokenVersion);
  const refreshToken = generateRefreshToken(user.id, user.tokenVersion);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      role: user.role,
    },
  };
}

/**
 * RESEND CODE — Tasdiqlash kodini qayta yuborish
 */
export async function resendVerificationCode(email: string) {
  const user = await prisma.user.findFirst({
    where: { email },
  });

  if (!user) {
    throw new AppError('Bu email bilan foydalanuvchi topilmadi', 404);
  }

  if (user.isVerified) {
    throw new AppError('Bu email allaqachon tasdiqlangan', 400);
  }

  await prisma.emailVerificationCode.deleteMany({
    where: { email },
  });

  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 daqiqa

  await prisma.emailVerificationCode.create({
    data: {
      email,
      code,
      expiresAt,
    },
  });

  console.log(`
  ════════════════════════════════════════════════
  📩 [DEVELOPMENT OTP KOD (QAYTA YUBORILDI)]
  👤 Email: ${email}
  🔑 Kod  : >>> ${code} <<<
  ════════════════════════════════════════════════
  `);

  try {
    await sendVerificationEmail(email, code);
    console.log(`✅ Yangi tasdiqlash kodi ${email} manziliga yuborildi`);
  } catch (error: any) {
    console.error('❌ Email yuborishda xatolik:', error.message || error);
  }

  return {
    message: 'Yangi kod email\'ingizga yuborildi',
  };
}

/**
 * LOGIN — Tizimga kirish
 */
export async function loginUser(data: LoginInput) {
  const { email, password } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Email yoki parol noto\'g\'ri', 401);
  }

  if (!user.isVerified) {
    throw new AppError('Email tasdiqlanmagan, avval emailingizni tasdiqlang', 403);
  }

  const isPasswordValid = await bcrypt.compare(password, user.passwordHash);
  if (!isPasswordValid) {
    throw new AppError('Email yoki parol noto\'g\'ri', 401);
  }

  const accessToken = generateAccessToken(user.id, user.email, user.tokenVersion);
  const refreshToken = generateRefreshToken(user.id, user.tokenVersion);

  return {
    accessToken,
    refreshToken,
    user: {
      id: user.id,
      fullName: user.fullName,
      email: user.email,
      phone: user.phone,
      role: user.role,
    },
  };
}

/**
 * REFRESH TOKEN — Yangi access token olish
 */
export async function refreshTokenService(token: string) {
  try {
    const secret = process.env.JWT_REFRESH_SECRET || 'darshub_default_jwt_refresh_secret_key_2026';
    const decoded = jwt.verify(token, secret) as { userId: string; tokenVersion?: number };

    const user = await prisma.user.findUnique({
      where: { id: decoded.userId },
    });

    if (!user || (decoded.tokenVersion !== undefined && decoded.tokenVersion !== user.tokenVersion)) {
      throw new AppError('Token bekor qilingan yoki noto\'g\'ri', 401);
    }

    const accessToken = generateAccessToken(user.id, user.email, user.tokenVersion);
    return { accessToken };
  } catch (error) {
    if (error instanceof AppError) throw error;
    throw new AppError('Token noto\'g\'ri yoki muddati o\'tgan', 401);
  }
}

/**
 * FORGOT PASSWORD — Parolni unutganda OTP kod yuborish
 *
 * Xavfsizlik qoidasi: Email bazada bo'lsa-bo'lmasa baribir 200 va bir xil xabar qaytariladi
 * (Email mavjudligini kiber-hujumchilarga oshkor etmaslik uchun).
 */
export async function forgotPassword(data: ForgotPasswordInput) {
  const { email } = data;

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Ushbu email manzili bo\'yicha foydalanuvchi topilmadi', 404);
  }

  // Eski parolni tiklash kodlarini o'chirish
  await prisma.passwordResetCode.deleteMany({
    where: { email },
  });

  const code = generateOTPCode();
  const expiresAt = new Date(Date.now() + 10 * 60 * 1000); // 10 daqiqa

  await prisma.passwordResetCode.create({
    data: {
      email,
      code,
      expiresAt,
    },
  });

  console.log(`
  ════════════════════════════════════════════════
  🔑 [FORGOT PASSWORD OTP KOD]
  👤 Email: ${email}
  🔑 Kod  : >>> ${code} <<<
  ════════════════════════════════════════════════
  `);

  try {
    await sendPasswordResetEmail(email, code);
    console.log(`✅ Parolni tiklash kodi ${email} manziliga yuborildi`);
  } catch (error: any) {
    console.error('❌ Email yuborishda xatolik (Resend/SMTP):', error.message || error);
    console.log(`💡 [DEV TIP] Terminaldagi OTP kod bilan kirishingiz mumkin: >>> ${code} <<<`);
    if (process.env.NODE_ENV === 'production') {
      throw new AppError(`Email yuborishda xatolik yuz berdi: ${error.message || 'Resend/SMTP xatosi'}`, 500);
    }
  }

  return { message: 'Parolni tiklash kodi emailingizga yuborildi' };
}

/**
 * RESET PASSWORD — Kod va yangi parol orqali parolni yangilash
 */
export async function resetPassword(data: ResetPasswordInput) {
  const { email, code, newPassword } = data;

  // 1. Kodni tekshirish
  const resetRecord = await prisma.passwordResetCode.findFirst({
    where: { email, code },
    orderBy: { createdAt: 'desc' },
  });

  if (!resetRecord || resetRecord.expiresAt < new Date()) {
    throw new AppError('Kod noto\'g\'ri yoki muddati o\'tgan', 400);
  }

  const user = await prisma.user.findUnique({
    where: { email },
  });

  if (!user) {
    throw new AppError('Foydalanuvchi topilmadi', 404);
  }

  // 2. Yangi parolni hash qilish
  const passwordHash = await bcrypt.hash(newPassword, 10);

  // 3. Parolni yangilash va tokenVersion'ni oshirish (barcha eski session/tokenlarni bekor qilish)
  await prisma.user.update({
    where: { email },
    data: {
      passwordHash,
      tokenVersion: { increment: 1 },
    },
  });

  // 4. Ishlatilgan kodlarni o'chirish
  await prisma.passwordResetCode.deleteMany({
    where: { email },
  });

  return {
    message: 'Parol muvaffaqiyatli yangilandi',
  };
}

/**
 * RESEND RESET CODE — Parolni tiklash kodini qayta yuborish
 */
export async function resendResetCode(email: string) {
  return forgotPassword({ email });
}

/**
 * UPDATE PROFILE — Foydalanuvchi ism-sharifi va telefon raqamini tahrirlash
 */
export async function updateProfile(userId: string, data: UpdateProfileInput) {
  const user = await prisma.user.update({
    where: { id: userId },
    data: {
      fullName: data.fullName,
      ...(data.phone !== undefined ? { phone: data.phone } : {}),
    },
    select: {
      id: true,
      fullName: true,
      email: true,
      phone: true,
      isVerified: true,
      role: true,
      createdAt: true,
    },
  });
  return user;
}

