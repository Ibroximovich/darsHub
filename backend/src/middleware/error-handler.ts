import { Request, Response, NextFunction } from 'express';

/**
 * Custom AppError klassi — HTTP status kodi bilan xato yaratish uchun
 */
export class AppError extends Error {
  public statusCode: number;

  constructor(message: string, statusCode: number) {
    super(message);
    this.statusCode = statusCode;
    Object.setPrototypeOf(this, AppError.prototype);
  }
}

/**
 * Markazlashtirilgan xatolarni qayta ishlash middleware'i.
 * Barcha xatolar shu yerdan o'tadi va yagona formatda qaytariladi.
 */
export const errorHandler = (
  err: Error,
  _req: Request,
  res: Response,
  _next: NextFunction
): void => {
  // AppError yoki statusCode mavjud bo'lgan xatolar
  if (err instanceof AppError || typeof (err as any).statusCode === 'number') {
    const statusCode = (err as any).statusCode || 400;
    res.status(statusCode).json({
      success: false,
      message: err.message,
    });
    return;
  }

  // Zod validatsiya xatolari
  if (err.name === 'ZodError' || (err as any).issues || (err as any).errors) {
    const zodErr = err as any;
    const issuesList = zodErr.issues || zodErr.errors || [];
    const messages =
      Array.isArray(issuesList) && issuesList.length > 0
        ? issuesList.map((e: any) => e.message || e.code).join(', ')
        : err.message || 'Validatsiya xatoligi';

    res.status(400).json({
      success: false,
      message: messages,
    });
    return;
  }

  // Kutilmagan xatolar
  console.error('❌ Kutilmagan xato:', err);
  res.status(500).json({
    success: false,
    message: 'Serverda ichki xatolik yuz berdi',
  });
};
