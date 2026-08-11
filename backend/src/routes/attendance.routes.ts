import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireSubscription } from '../middleware/subscription.middleware';
import {
  markTodayLessonController,
  getTodayLessonController,
  saveAttendanceController,
  getLessonAttendanceController,
  getAttendanceSummaryController,
} from '../controllers/attendance.controller';

const router = Router();

// Barcha davomat va darslar route'lari authMiddleware va requireSubscription orqali himoyalangan
router.use(authMiddleware);
router.use(requireSubscription);

/**
 * 1. POST /api/groups/:groupId/lessons/today — Bugungi darsni belgilash ("held" | "cancelled")
 */
router.post('/groups/:groupId/lessons/today', markTodayLessonController);

/**
 * 2. GET /api/groups/:groupId/lessons/today — Bugungi dars holatini olish
 */
router.get('/groups/:groupId/lessons/today', getTodayLessonController);

/**
 * 3. GET /api/groups/:groupId/attendance/summary — Oylik/davr hisoboti
 */
router.get('/groups/:groupId/attendance/summary', getAttendanceSummaryController);

/**
 * 4. POST /api/lessons/:lessonId/attendance — Davomatni saqlash (bulk)
 */
router.post('/lessons/:lessonId/attendance', saveAttendanceController);

/**
 * 5. GET /api/lessons/:lessonId/attendance — Darsning davomat ro'yxatini olish
 */
router.get('/lessons/:lessonId/attendance', getLessonAttendanceController);

export default router;
