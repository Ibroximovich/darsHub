import { Request, Response, NextFunction } from 'express';
import { createGroupSchema, updateGroupSchema } from '../validators/groups.validator';
import {
  createGroup,
  getGroupsByUserId,
  getGroupById,
  updateGroup,
  deleteGroup,
} from '../services/groups.service';
import { AppError } from '../middleware/error-handler';

/**
 * POST /api/groups
 * Yangi guruh yaratish
 */
export async function createGroupController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Avtorizatsiyadan o\'tilmagan', 401);
    }

    const data = createGroupSchema.parse(req.body);
    const group = await createGroup(userId, data);

    res.status(201).json({
      success: true,
      group,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/groups
 * Foydalanuvchining barcha guruhlarini olish
 */
export async function getGroupsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Avtorizatsiyadan o\'tilmagan', 401);
    }

    const groups = await getGroupsByUserId(userId);

    res.status(200).json({
      success: true,
      groups,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/groups/:id
 * Bitta guruh haqida to'liq ma'lumot
 */
export async function getGroupByIdController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Avtorizatsiyadan o\'tilmagan', 401);
    }

    const group = await getGroupById(req.params.id as string, userId);

    res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PUT /api/groups/:id
 * Guruhni tahrirlash
 */
export async function updateGroupController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Avtorizatsiyadan o\'tilmagan', 401);
    }

    const data = updateGroupSchema.parse(req.body);
    const group = await updateGroup(req.params.id as string, userId, data);

    res.status(200).json({
      success: true,
      group,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * DELETE /api/groups/:id
 * Guruhni o'chirish
 */
export async function deleteGroupController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) {
      throw new AppError('Avtorizatsiyadan o\'tilmagan', 401);
    }

    const result = await deleteGroup(req.params.id as string, userId);

    res.status(200).json({
      success: true,
      ...result,
    });
  } catch (error) {
    next(error);
  }
}
