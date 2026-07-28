import { Request, Response, NextFunction } from 'express';
import {
  addStudentToGroupSchema,
  updateStudentSchema,
} from '../validators/students.validator';
import {
  searchStudents,
  addStudentToGroup,
  getGroupStudents,
  getStudentById,
  updateStudent,
  removeStudentFromGroup,
} from '../services/students.service';
import { AppError } from '../middleware/error-handler';

/**
 * GET /api/students/search?phone=xxx
 * Telefon raqami bo'yicha o'quvchilarni qidirish
 */
export async function searchStudentsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Avtorizatsiyadan o\'tilmagan', 401);
    }

    const phone = req.query.phone as string | undefined;
    const students = await searchStudents(userId, phone);

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/groups/:groupId/students
 * Guruhga o'quvchi qo'shish (Yangi yoki Mavjud)
 */
export async function addStudentToGroupController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Avtorizatsiyadan o\'tilmagan', 401);
    }

    const { groupId } = req.params;
    const data = addStudentToGroupSchema.parse(req.body);
    const student = await addStudentToGroup(groupId as string, userId, data);

    res.status(201).json({
      success: true,
      student,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/groups/:groupId/students
 * Guruhdagi faol o'quvchilar ro'yxati
 */
export async function getGroupStudentsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Avtorizatsiyadan o\'tilmagan', 401);
    }

    const { groupId } = req.params;
    const students = await getGroupStudents(groupId as string, userId);

    res.status(200).json({
      success: true,
      students,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/students/:id
 * O'quvchi to'liq profili
 */
export async function getStudentByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Avtorizatsiyadan o\'tilmagan', 401);
    }

    const { id } = req.params;
    const student = await getStudentById(id as string, userId);

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/students/:id
 * O'quvchi shaxsiy ma'lumotlarini tahrirlash
 */
export async function updateStudentController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Avtorizatsiyadan o\'tilmagan', 401);
    }

    const { id } = req.params;
    const data = updateStudentSchema.parse(req.body);
    const student = await updateStudent(id as string, userId, data);

    res.status(200).json({
      success: true,
      student,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/groups/:groupId/students/:studentId
 * O'quvchini guruhdan chiqarish (status: "stopped")
 */
export async function removeStudentFromGroupController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Avtorizatsiyadan o\'tilmagan', 401);
    }

    const { groupId, studentId } = req.params;
    const result = await removeStudentFromGroup(
      groupId as string,
      studentId as string,
      userId
    );

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
