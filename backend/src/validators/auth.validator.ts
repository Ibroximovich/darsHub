import { z } from 'zod';

/**
 * Register — ro'yxatdan o'tish uchun validatsiya schema'si
 */
export const registerSchema = z.object({
  fullName: z
    .string({ error: 'Ism majburiy' })
    .min(2, 'Ism kamida 2 ta belgidan iborat bo\'lishi kerak')
    .trim(),

  email: z
    .string({ error: 'Email majburiy' })
    .email('Email formati noto\'g\'ri')
    .toLowerCase()
    .trim(),

  phone: z
    .string({ error: 'Telefon raqam majburiy' })
    .regex(
      /^\+998\d{9}$/,
      'Telefon raqam O\'zbekiston formatida bo\'lishi kerak: +998XXXXXXXXX'
    ),

  password: z
    .string({ error: 'Parol majburiy' })
    .min(6, 'Parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
});

/**
 * Verify Email — email tasdiqlash uchun validatsiya
 */
export const verifyEmailSchema = z.object({
  email: z
    .string({ error: 'Email majburiy' })
    .email('Email formati noto\'g\'ri')
    .toLowerCase()
    .trim(),

  code: z
    .string({ error: 'Tasdiqlash kodi majburiy' })
    .length(6, 'Tasdiqlash kodi 6 xonali bo\'lishi kerak'),
});

/**
 * Resend Code — kodni qayta yuborish uchun validatsiya
 */
export const resendCodeSchema = z.object({
  email: z
    .string({ error: 'Email majburiy' })
    .email('Email formati noto\'g\'ri')
    .toLowerCase()
    .trim(),
});

/**
 * Login — tizimga kirish uchun validatsiya
 */
export const loginSchema = z.object({
  email: z
    .string({ error: 'Email majburiy' })
    .email('Email formati noto\'g\'ri')
    .toLowerCase()
    .trim(),

  password: z
    .string({ error: 'Parol majburiy' })
    .min(1, 'Parol kiritilishi shart'),
});

/**
 * Forgot Password — parolni unutganda email kiritish
 */
export const forgotPasswordSchema = z.object({
  email: z
    .string({ error: 'Email majburiy' })
    .email('Email formati noto\'g\'ri')
    .toLowerCase()
    .trim(),
});

/**
 * Reset Password — yangi parol va kodni kiritish
 */
export const resetPasswordSchema = z.object({
  email: z
    .string({ error: 'Email majburiy' })
    .email('Email formati noto\'g\'ri')
    .toLowerCase()
    .trim(),

  code: z
    .string({ error: 'Tasdiqlash kodi majburiy' })
    .length(6, 'Tasdiqlash kodi 6 xonali bo\'lishi kerak'),

  newPassword: z
    .string({ error: 'Yangi parol majburiy' })
    .min(6, 'Yangi parol kamida 6 ta belgidan iborat bo\'lishi kerak'),
});

// Type inference uchun export
export type RegisterInput = z.infer<typeof registerSchema>;
export type VerifyEmailInput = z.infer<typeof verifyEmailSchema>;
export type ResendCodeInput = z.infer<typeof resendCodeSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type ForgotPasswordInput = z.infer<typeof forgotPasswordSchema>;
export type ResetPasswordInput = z.infer<typeof resetPasswordSchema>;
