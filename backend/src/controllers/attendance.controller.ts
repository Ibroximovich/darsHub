import { Request, Response, NextFunction } from 'express';
import {
  markTodayLessonSchema,
  saveAttendanceSchema,
} from '../validators/attendance.validator';
import {
  markTodayLesson,
  getTodayLesson,
  saveAttendance,
  getLessonAttendance,
  getAttendanceSummary,
} from '../services/attendance.service';
import { AppError } from '../middleware/error-handler';

/**
 * POST /api/groups/:groupId/lessons/today
 * Bugungi darsni "held" yoki "cancelled" deb belgilash
 */
export async function markTodayLessonController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Avtorizatsiyadan o'tilmagan", 401);

    const groupId = req.params.groupId as string;
    const { status } = markTodayLessonSchema.parse(req.body);

    const lesson = await markTodayLesson(userId, groupId, status);

    res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/groups/:groupId/lessons/today
 * Bugungi dars holatini olish
 */
export async function getTodayLessonController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Avtorizatsiyadan o'tilmagan", 401);

    const groupId = req.params.groupId as string;
    const lesson = await getTodayLesson(userId, groupId);

    res.status(200).json({
      success: true,
      lesson,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * POST /api/lessons/:lessonId/attendance
 * Dars uchun bulk davomat saqlash
 */
export async function saveAttendanceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Avtorizatsiyadan o'tilmagan", 401);

    const lessonId = req.params.lessonId as string;
    const { records } = saveAttendanceSchema.parse(req.body);

    const attendances = await saveAttendance(userId, lessonId, records);

    res.status(200).json({
      success: true,
      message: "Davomat saqlandi",
      attendances,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/lessons/:lessonId/attendance
 * Darsning davomat ro'yxatini olish
 */
export async function getLessonAttendanceController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Avtorizatsiyadan o'tilmagan", 401);

    const lessonId = req.params.lessonId as string;
    const attendance = await getLessonAttendance(userId, lessonId);

    res.status(200).json({
      success: true,
      attendance,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/groups/:groupId/attendance/summary
 * Oylik / davr hisobotini olish
 */
export async function getAttendanceSummaryController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Avtorizatsiyadan o'tilmagan", 401);

    const groupId = req.params.groupId as string;
    const month = req.query.month as string | undefined;

    const summary = await getAttendanceSummary(userId, groupId, month);

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    next(error);
  }
}
