import { z } from 'zod';

/**
 * Bugungi dars holatini belgilash schema'si
 */
export const markTodayLessonSchema = z.object({
  status: z.enum(['held', 'cancelled']),
});

/**
 * Bulk davomat saqlash schema'si (present boolean yoki null bo'lishi mumkin)
 */
export const saveAttendanceSchema = z.object({
  records: z
    .array(
      z.object({
        groupStudentId: z.string().min(1, 'groupStudentId majburiy'),
        present: z.boolean().nullable(),
      })
    )
    .min(1, 'Kamida bitta davomat yozuvi kiritilishi kerak'),
});

export type MarkTodayLessonInput = z.infer<typeof markTodayLessonSchema>;
export type SaveAttendanceInput = z.infer<typeof saveAttendanceSchema>;
