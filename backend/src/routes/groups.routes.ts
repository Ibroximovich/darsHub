import { Router } from 'express';
import {
  createGroupController,
  getGroupsController,
  getGroupByIdController,
  updateGroupController,
  deleteGroupController,
} from '../controllers/groups.controller';
import {
  addStudentToGroupController,
  getGroupStudentsController,
  removeStudentFromGroupController,
} from '../controllers/students.controller';
import { authMiddleware } from '../middleware/auth.middleware';

const router = Router();

// Barcha guruh route'lari authMiddleware orqali himoyalangan
router.use(authMiddleware);

// POST /api/groups — Yangi guruh yaratish
router.post('/', createGroupController);

// GET /api/groups — Foydalanuvchining barcha guruhlari ro'yxati
router.get('/', getGroupsController);

// GET /api/groups/:id — Bitta guruh haqida to'liq ma'lumot
router.get('/:id', getGroupByIdController);

// PUT /api/groups/:id — Guruhni tahrirlash
router.put('/:id', updateGroupController);

// DELETE /api/groups/:id — Guruhni o'chirish
router.delete('/:id', deleteGroupController);

// ─── Group-Student relation routes ──────────────────────────────────────────

// POST /api/groups/:groupId/students — Guruhga o'quvchi qo'shish
router.post('/:groupId/students', addStudentToGroupController);

// GET /api/groups/:groupId/students — Guruhdagi faol o'quvchilar ro'yxati
router.get('/:groupId/students', getGroupStudentsController);

// DELETE /api/groups/:groupId/students/:studentId — O'quvchini guruhdan chiqarish (stopped status)
router.delete('/:groupId/students/:studentId', removeStudentFromGroupController);

export default router;
