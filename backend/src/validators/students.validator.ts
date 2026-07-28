import { z } from 'zod';

const phoneRegex = /^\+998\d{9}$/;

/**
 * POST /api/groups/:groupId/students — Guruhga o'quvchi qo'shish uchun validatsiya schema'si
 * Body variant A (yangi o'quvchi): { firstName, lastName, phone, parentName?, parentPhone }
 * Body variant B (mavjud o'quvchi): { studentId }
 */
export const addStudentToGroupSchema = z
  .object({
    studentId: z
      .string()
      .uuid('studentId noto\'g\'ri UUID formatida')
      .optional(),

    firstName: z
      .string()
      .min(1, 'Ism kiritilishi kerak')
      .trim()
      .optional(),

    lastName: z
      .string()
      .min(1, 'Familiya kiritilishi kerak')
      .trim()
      .optional(),

    phone: z
      .string()
      .optional(),

    parentName: z
      .string()
      .trim()
      .nullable()
      .optional(),

    parentPhone: z
      .string()
      .optional(),
  })
  .superRefine((data, ctx) => {
    // Agar studentId berilgan bo'lsa, mavjud o'quvchi biriktiriladi
    if (data.studentId) {
      return;
    }

    // Yangi o'quvchi yaratish bo'lsa majburiy maydonlar tekshiriladi
    if (!data.firstName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ism majburiy',
        path: ['firstName'],
      });
    }

    if (!data.lastName) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Familiya majburiy',
        path: ['lastName'],
      });
    }

    if (!data.phone || !phoneRegex.test(data.phone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak',
        path: ['phone'],
      });
    }

    if (!data.parentPhone || !phoneRegex.test(data.parentPhone)) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: 'Ota-ona telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak',
        path: ['parentPhone'],
      });
    }
  });

/**
 * PUT /api/students/:id — O'quvchi shaxsiy ma'lumotlarini tahrirlash schema'si
 * Barcha maydonlar ixtiyoriy
 */
export const updateStudentSchema = z.object({
  firstName: z
    .string()
    .min(1, 'Ism bo\'sh bo\'lishi mumkin emas')
    .trim()
    .optional(),

  lastName: z
    .string()
    .min(1, 'Familiya bo\'sh bo\'lishi mumkin emas')
    .trim()
    .optional(),

  phone: z
    .string()
    .regex(phoneRegex, 'Telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak')
    .optional(),

  parentName: z
    .string()
    .trim()
    .nullable()
    .optional(),

  parentPhone: z
    .string()
    .regex(phoneRegex, 'Ota-ona telefon raqami +998XXXXXXXXX formatida bo\'lishi kerak')
    .optional(),
});

// Type definitions
export type AddStudentToGroupInput = z.infer<typeof addStudentToGroupSchema>;
export type UpdateStudentInput = z.infer<typeof updateStudentSchema>;
