import { Router } from 'express';
import { register, login, forgotPassword, resetPassword, verifyCode } from '../controllers/auth.controller.js';

const router = Router();

/**
 * @swagger
 * /api/auth/register:
 *   post:
 *     summary: Yangi foydalanuvchi ro'yxatdan o'tishi
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/RegisterRequest'
 *           examples:
 *             valid:
 *               summary: To'g'ri ro'yxatdan o'tish
 *               value:
 *                 full_name: "Sarvar Azamov"
 *                 email: "sarvar@gmail.com"
 *                 password: "12345678"
 *     responses:
 *       201:
 *         description: Foydalanuvchi muvaffaqiyatli ro'yxatdan o'tdi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzYXJ2YXJAZ21haWwuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MjQ5MDY5OTcsImV4cCI6MTcyNTUxMTc5N30.Hd4E..."
 *               user:
 *                 id: 1
 *                 full_name: "Sarvar Azamov"
 *                 email: "sarvar@gmail.com"
 *                 role: "student"
 *       400:
 *         description: Xato so'rov (email allaqachon ro'yxatdan o'tgan, parol qisqa, email formati noto'g'ri)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             examples:
 *               emailExists:
 *                 value:
 *                   success: false
 *                   message: "Bu email allaqachon ro'yxatdan o'tgan"
 *               shortPassword:
 *                 value:
 *                   success: false
 *                   message: "Parol minimum 8 ta belgi bo'lishi kerak"
 *               invalidEmail:
 *                 value:
 *                   success: false
 *                   message: "Email formati noto'g'ri"
 *       500:
 *         description: Server xatosi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/register', register);

/**
 * @swagger
 * /api/auth/login:
 *   post:
 *     summary: Foydalanuvchi kirishi
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             $ref: '#/components/schemas/LoginRequest'
 *           example:
 *             email: "sarvar@gmail.com"
 *             password: "12345678"
 *     responses:
 *       200:
 *         description: Muvaffaqiyatli login qilindi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/SuccessResponse'
 *             example:
 *               success: true
 *               token: "eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6MSwiZW1haWwiOiJzYXJ2YXJAZ21haWwuY29tIiwicm9sZSI6InN0dWRlbnQiLCJpYXQiOjE3MjQ5MDY5OTcsImV4cCI6MTcyNTUxMTc5N30.Hd4E..."
 *               user:
 *                 id: 1
 *                 full_name: "Sarvar Azamov"
 *                 email: "sarvar@gmail.com"
 *                 role: "student"
 *       401:
 *         description: Autentifikatsiya xatosi (email yoki parol noto'g'ri)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Email yoki parol noto'g'ri"
 *       400:
 *         description: Xato so'rov (email yoki parol kiritilmagan)
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 *             example:
 *               success: false
 *               message: "Email va parol kerak"
 *       500:
 *         description: Server xatosi
 *         content:
 *           application/json:
 *             schema:
 *               $ref: '#/components/schemas/ErrorResponse'
 */
router.post('/login', login);

/**
 * @swagger
 * /api/auth/forgot-password:
 *   post:
 *     summary: Parolni tiklash - email kod yuborish
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email]
 *             properties:
 *               email:
 *                 type: string
 *                 example: sarvar@gmail.com
 *     responses:
 *       200:
 *         description: Agar email ro'yxatdan o'tgan bo'lsa, tasdiqlash kodi yuborildi
 *       400:
 *         description: Email kerak
 *       500:
 *         description: Server xatosi
 */
router.post('/forgot-password', forgotPassword);

/**
 * @swagger
 * /api/auth/reset-password:
 *   post:
 *     summary: Parolni yangilash - kodni tasdiqlash
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code, new_password]
 *             properties:
 *               email:
 *                 type: string
 *                 example: sarvar@gmail.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *               new_password:
 *                 type: string
 *                 example: "newPassword123"
 *     responses:
 *       200:
 *         description: Parol muvaffaqiyatli yangilandi
 *       400:
 *         description: Kod noto'g'ri yoki muddati o'tgan
 *       500:
 *         description: Server xatosi
 */
router.post('/reset-password', resetPassword);

/**
 * @swagger
 * /api/auth/verify-code:
 *   post:
 *     summary: Tasdiqlash kodini tekshirish
 *     description: Foydalanuvchi kiritgan kodni tekshiradi, lekin parolni o'zgartirmaydi
 *     tags:
 *       - Authentication
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, code]
 *             properties:
 *               email:
 *                 type: string
 *                 example: sarvar@gmail.com
 *               code:
 *                 type: string
 *                 example: "123456"
 *     responses:
 *       200:
 *         description: Kod to'g'ri
 *       400:
 *         description: Kod noto'g'ri yoki muddati o'tgan
 *       500:
 *         description: Server xatosi
 */
router.post('/verify-code', verifyCode);

export default router;

