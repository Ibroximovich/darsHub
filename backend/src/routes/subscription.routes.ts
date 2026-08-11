import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { getSubscriptionStatus } from '../controllers/subscription.controller';

const router = Router();

/**
 * GET /api/subscription/status
 *
 * Faqat auth.middleware bilan himoyalangan (subscription.middleware YO'Q —
 * bu endpoint obuna tugagan foydalanuvchilarga ham ishlashi kerak).
 *
 * Javob: { status, trialEndsAt, subscriptionExpiresAt, daysLeft }
 */
router.get('/status', authMiddleware, getSubscriptionStatus);

export default router;
