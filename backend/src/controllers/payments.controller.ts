import { Request, Response, NextFunction } from 'express';
import { updatePaymentStatusSchema } from '../validators/payments.validator';
import {
  getGroupPayments,
  updatePaymentStatus,
  getPaymentsSummary,
} from '../services/payments.service';
import { AppError } from '../middleware/error-handler';

/**
 * GET /api/groups/:groupId/payments?period=xxx
 * Guruhning shu davr uchun to'lov holati (lazy creation bilan)
 */
export async function getGroupPaymentsController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Avtorizatsiyadan o'tilmagan", 401);

    const groupId = req.params.groupId as string;
    const period = req.query.period as string | undefined;

    const payments = await getGroupPayments(userId, groupId, period);

    res.status(200).json({
      success: true,
      payments,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * PATCH /api/payments/:id
 * To'lov holatini almashtirish ("paid" ↔ "unpaid")
 */
export async function updatePaymentStatusController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Avtorizatsiyadan o'tilmagan", 401);

    const paymentId = req.params.id as string;
    const { status } = updatePaymentStatusSchema.parse(req.body);

    const payment = await updatePaymentStatus(userId, paymentId, status);

    res.status(200).json({
      success: true,
      message: status === 'paid' ? "To'lov belgilandi" : "To'lov bekor qilindi",
      payment,
    });
  } catch (error) {
    next(error);
  }
}

/**
 * GET /api/payments/summary?period=YYYY-MM
 * Umumiy to'lov statistikasi (barcha guruhlar bo'yicha)
 */
export async function getPaymentsSummaryController(
  req: Request,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    const userId = req.user?.id;
    if (!userId) throw new AppError("Avtorizatsiyadan o'tilmagan", 401);

    const period = req.query.period as string | undefined;
    const summary = await getPaymentsSummary(userId, period);

    res.status(200).json({
      success: true,
      summary,
    });
  } catch (error) {
    next(error);
  }
}
