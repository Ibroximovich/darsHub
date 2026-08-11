import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireSubscription } from '../middleware/subscription.middleware';
import {
  getGroupPaymentsController,
  updatePaymentStatusController,
  getPaymentsSummaryController,
} from '../controllers/payments.controller';

const router = Router();

// Barcha to'lov route'lari authMiddleware va requireSubscription orqali himoyalangan
router.use(authMiddleware);
router.use(requireSubscription);

/**
 * GET /api/payments/summary — Umumiy to'lov statistikasi (barcha guruhlar bo'yicha)
 * Query: ?period=2026-07 (ixtiyoriy, monthly guruhlar uchun filtrlash)
 *
 * MUHIM: Bu route /api/payments/:id dan OLDIN turishi kerak,
 * chunki Express "summary" ni :id parametri sifatida olishi mumkin
 */
router.get('/payments/summary', getPaymentsSummaryController);

/**
 * PATCH /api/payments/:id — To'lov holatini almashtirish
 * Body: { status: "paid" | "unpaid" }
 */
router.patch('/payments/:id', updatePaymentStatusController);

/**
 * GET /api/groups/:groupId/payments — Guruhning davr uchun to'lov holati
 * Query: ?period=2026-07 (ixtiyoriy)
 */
router.get('/groups/:groupId/payments', getGroupPaymentsController);

export default router;
