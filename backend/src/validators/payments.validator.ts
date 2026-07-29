import { z } from 'zod';

/**
 * PATCH /api/payments/:id — To'lov holatini almashtirish schema'si
 */
export const updatePaymentStatusSchema = z.object({
  status: z.enum(['paid', 'unpaid']),
});

export type UpdatePaymentStatusInput = z.infer<typeof updatePaymentStatusSchema>;
