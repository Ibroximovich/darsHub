import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware';
import { requireAdmin } from '../middleware/admin.middleware';
import {
  getAdminStats,
  getAdminUsers,
  deleteAdminUser,
  getAdminGroups,
  deleteAdminGroup,
  getAdminStudents,
  deleteAdminStudent,
  getAdminPayments,
  activateSubscription,
  deactivateSubscription,
} from '../controllers/admin.controller';

const router = Router();

// Barcha admin route'lar authMiddleware va requireAdmin bilan himoyalangan
router.use(authMiddleware);
router.use(requireAdmin);

// GET /api/admin/stats — Umumiy statistika
router.get('/stats', getAdminStats);

// GET & DELETE /api/admin/users — Foydalanuvchilar
router.get('/users', getAdminUsers);
router.delete('/users/:id', deleteAdminUser);

// GET & DELETE /api/admin/groups — Guruhlar
router.get('/groups', getAdminGroups);
router.delete('/groups/:id', deleteAdminGroup);

// GET & DELETE /api/admin/students — O'quvchilar
router.get('/students', getAdminStudents);
router.delete('/students/:id', deleteAdminStudent);

// GET /api/admin/payments — To'lovlar
router.get('/payments', getAdminPayments);

// ─── Obuna boshqaruvi ─────────────────────────────────────────────────────────
// POST /api/admin/users/:userId/activate   — Obunani faollashtirish (body: { months })
router.post('/users/:userId/activate', activateSubscription);

// POST /api/admin/users/:userId/deactivate — Obunani bekor qilish
router.post('/users/:userId/deactivate', deactivateSubscription);

export default router;

