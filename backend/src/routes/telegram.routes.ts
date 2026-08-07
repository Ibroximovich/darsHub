import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import {
  getConnectLink,
  getStatus,
  disconnectTelegram,
} from '../controllers/telegram.controller';

const router = Router();

// Barcha Telegram route'lari himoyalangan
router.use(authMiddleware);

// GET /api/telegram/connect-link — Botga ulash havolasini olish
router.get('/connect-link', getConnectLink);

// GET /api/telegram/status — Ulanish holatini tekshirish
router.get('/status', getStatus);

// DELETE /api/telegram/disconnect — Ulanishni uzish
router.delete('/disconnect', disconnectTelegram);

export default router;
