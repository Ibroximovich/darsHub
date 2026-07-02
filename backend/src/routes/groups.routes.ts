import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  createGroup,
  getGroups,
  getGroupById,
  updateGroup,
  deleteGroup,
} from '../controllers/groups.controller.js';

const router = Router();

/**
 * @swagger
 * /api/groups:
 *   post:
 *     summary: Yangi guruh yaratish
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [name, subject]
 *             properties:
 *               name:
 *                 type: string
 *               subject:
 *                 type: string
 *               schedule:
 *                 type: string
 *     responses:
 *       201:
 *         description: Guruh yaratildi
 *       400:
 *         description: Maydonlar to'liq emas
 *       401:
 *         description: Token yo'q yoki yaroqsiz
 */
router.post('/', authMiddleware, createGroup);

/**
 * @swagger
 * /api/groups:
 *   get:
 *     summary: Login qilgan teacherning barcha guruhlari
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Guruhlar ro'yxati
 *       401:
 *         description: Token yo'q yoki yaroqsiz
 */
router.get('/', authMiddleware, getGroups);

/**
 * @swagger
 * /api/groups/{id}:
 *   get:
 *     summary: Bitta guruhni olish
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Guruh ma'lumotlari
 *       404:
 *         description: Guruh topilmadi
 *       401:
 *         description: Token yo'q yoki yaroqsiz
 */
router.get('/:id', authMiddleware, getGroupById);

/**
 * @swagger
 * /api/groups/{id}:
 *   patch:
 *     summary: Guruh ma'lumotlarini qisman yangilash
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               subject:
 *                 type: string
 *               schedule:
 *                 type: string
 *     responses:
 *       200:
 *         description: Guruh yangilandi
 *       404:
 *         description: Guruh topilmadi
 *       401:
 *         description: Token yo'q yoki yaroqsiz
 */
router.patch('/:id', authMiddleware, updateGroup);

/**
 * @swagger
 * /api/groups/{id}:
 *   put:
 *     summary: Guruh ma'lumotlarini yangilash
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               name:
 *                 type: string
 *               subject:
 *                 type: string
 *               schedule:
 *                 type: string
 *     responses:
 *       200:
 *         description: Guruh yangilandi
 *       404:
 *         description: Guruh topilmadi
 *       401:
 *         description: Token yo'q yoki yaroqsiz
 */
router.put('/:id', authMiddleware, updateGroup);

/**
 * @swagger
 * /api/groups/{id}:
 *   delete:
 *     summary: Guruhni o'chirish
 *     tags: [Groups]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Guruh o'chirildi
 *       404:
 *         description: Guruh topilmadi
 *       401:
 *         description: Token yo'q yoki yaroqsiz
 */
router.delete('/:id', authMiddleware, deleteGroup);

export default router;
