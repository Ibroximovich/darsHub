import { Router } from 'express';
import {
  searchStudentsController,
  getStudentByIdController,
  updateStudentController,
} from '../controllers/students.controller';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireSubscription } from '../middleware/subscription.middleware';

const router = Router();

// Barcha student route'lari authMiddleware va requireSubscription orqali himoyalangan
router.use(authMiddleware);
router.use(requireSubscription);

// GET /api/students/search?phone=xxx — Telefon raqami bo'yicha qidirish
router.get('/search', searchStudentsController);

// GET /api/students/:id — O'quvchi to'liq profili
router.get('/:id', getStudentByIdController);

// PUT /api/students/:id — O'quvchi shaxsiy ma'lumotlarini tahrirlash
router.put('/:id', updateStudentController);

export default router;
