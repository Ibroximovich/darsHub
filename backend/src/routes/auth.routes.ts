import { Router } from 'express';
import {
  register,
  verifyEmailController,
  resendCode,
  login,
  refresh,
  logout,
  getMe,
  forgotPasswordController,
  resetPasswordController,
  resendResetCodeController,
} from '../controllers/auth.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/register — Ro'yxatdan o'tish
router.post('/register', register);

// POST /api/auth/verify-email — Email tasdiqlash
router.post('/verify-email', verifyEmailController);

// POST /api/auth/resend-code — Kodni qayta yuborish
router.post('/resend-code', resendCode);

// POST /api/auth/login — Tizimga kirish
router.post('/login', login);

// POST /api/auth/refresh — Access tokenni yangilash
router.post('/refresh', refresh);

// POST /api/auth/logout — Tizimdan chiqish
router.post('/logout', logout);

// GET /api/auth/me — Joriy foydalanuvchi ma'lumotlari (Protected route)
router.get('/me', authMiddleware, getMe);

// POST /api/auth/forgot-password — Parolni unutganda OTP kod yuborish
router.post('/forgot-password', forgotPasswordController);

// POST /api/auth/reset-password — Parolni yangilash
router.post('/reset-password', resetPasswordController);

// POST /api/auth/resend-reset-code — Parolni tiklash kodini qayta yuborish
router.post('/resend-reset-code', resendResetCodeController);

export default router;
