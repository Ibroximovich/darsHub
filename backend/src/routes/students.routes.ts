import { Router } from 'express';
import { authMiddleware } from '../middleware/auth.middleware.js';
import {
  createStudent,
  getStudents,
  getStudentById,
  updateStudent,
  deleteStudent,
  addStudentToGroup,
  removeStudentFromGroup,
} from '../controllers/students.controller.js';

const router = Router();

/**
 * @swagger
 * /api/students:
 *   post:
 *     summary: Yangi talaba yaratish
 *     tags: [Students]
 *     security:
 *       - BearerAuth: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [full_name]
 *             properties:
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               parent_name:
 *                 type: string
 *               parent_phone:
 *                 type: string
 *     responses:
 *       201:
 *         description: Talaba yaratildi
 *       400:
 *         description: full_name majburiy
 *       401:
 *         description: Token yo'q yoki yaroqsiz
 */
router.post('/', authMiddleware, createStudent);

/**
 * @swagger
 * /api/students:
 *   get:
 *     summary: Login qilgan teacherning barcha talabalarini olish
 *     tags: [Students]
 *     security:
 *       - BearerAuth: []
 *     responses:
 *       200:
 *         description: Talabalar ro'yxati
 *       401:
 *         description: Token yo'q yoki yaroqsiz
 */
router.get('/', authMiddleware, getStudents);

/**
 * @swagger
 * /api/students/{id}:
 *   get:
 *     summary: Bitta talaba ma'lumotini olish
 *     tags: [Students]
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
 *         description: Talaba ma'lumotlari
 *       404:
 *         description: Talaba topilmadi
 *       401:
 *         description: Token yo'q yoki yaroqsiz
 */
router.get('/:id', authMiddleware, getStudentById);

/**
 * @swagger
 * /api/students/{id}:
 *   put:
 *     summary: Talaba ma'lumotlarini yangilash
 *     tags: [Students]
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
 *               full_name:
 *                 type: string
 *               phone:
 *                 type: string
 *               parent_name:
 *                 type: string
 *               parent_phone:
 *                 type: string
 *     responses:
 *       200:
 *         description: Talaba yangilandi
 *       404:
 *         description: Talaba topilmadi
 *       401:
 *         description: Token yo'q yoki yaroqsiz
 */
router.put('/:id', authMiddleware, updateStudent);

/**
 * @swagger
 * /api/students/{id}:
 *   delete:
 *     summary: Talabani o'chirish
 *     tags: [Students]
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
 *         description: Talaba o'chirildi
 *       404:
 *         description: Talaba topilmadi
 *       401:
 *         description: Token yo'q yoki yaroqsiz
 */
router.delete('/:id', authMiddleware, deleteStudent);

/**
 * @swagger
 * /api/students/{id}/groups/{groupId}:
 *   post:
 *     summary: Talabani guruhga qo'shish
 *     tags: [Students]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       201:
 *         description: Talaba guruhga qo'shildi
 *       404:
 *         description: Talaba yoki guruh topilmadi
 *       409:
 *         description: Talaba allaqachon guruhga qo'shilgan
 *       401:
 *         description: Token yo'q yoki yaroqsiz
 */
router.post('/:id/groups/:groupId', authMiddleware, addStudentToGroup);

/**
 * @swagger
 * /api/students/{id}/groups/{groupId}:
 *   delete:
 *     summary: Talabani guruhdan chiqarish
 *     tags: [Students]
 *     security:
 *       - BearerAuth: []
 *     parameters:
 *       - in: path
 *         name: id
 *         required: true
 *         schema:
 *           type: integer
 *       - in: path
 *         name: groupId
 *         required: true
 *         schema:
 *           type: integer
 *     responses:
 *       200:
 *         description: Talaba guruhdan chiqarildi
 *       404:
 *         description: Talaba yoki guruh topilmadi
 *       401:
 *         description: Token yo'q yoki yaroqsiz
 */
router.delete('/:id/groups/:groupId', authMiddleware, removeStudentFromGroup);

export default router;
