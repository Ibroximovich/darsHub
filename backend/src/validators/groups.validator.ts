import { z } from 'zod';

/**
 * Hafta kunlari uchun ruxsat etilgan qiymatlar
 */
const validDays = [
  'monday',
  'tuesday',
  'wednesday',
  'thursday',
  'friday',
  'saturday',
  'sunday',
] as const;

/**
 * To'lov turi: oylik yoki darsga asoslangan
 */
const paymentTypes = ['monthly', 'lesson_based'] as const;

/**
 * POST /api/groups — Yangi guruh yaratish uchun validatsiya schema'si
 */
export const createGroupSchema = z
  .object({
    name: z
      .string({ error: 'Guruh nomi majburiy' })
      .min(2, 'Guruh nomi kamida 2 ta belgidan iborat bo\'lishi kerak')
      .trim(),

    days: z
      .array(z.enum(validDays, { error: 'Noto\'g\'ri kun qiymati' }))
      .min(1, 'Kamida 1 ta kun tanlangan bo\'lishi kerak'),

    time: z
      .string({ error: 'Vaqt majburiy' })
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Vaqt "HH:MM" formatida bo\'lishi kerak'),

    price: z
      .number({ error: 'Narx majburiy va raqam bo\'lishi kerak' })
      .int('Narx butun son bo\'lishi kerak')
      .positive('Narx 0 dan katta bo\'lishi kerak'),

    paymentType: z.enum(paymentTypes, {
      error: 'To\'lov turi faqat "monthly" yoki "lesson_based" bo\'lishi kerak',
    }),

    lessonsPerCycle: z
      .number()
      .int('Darslar soni butun son bo\'lishi kerak')
      .positive('Darslar soni 0 dan katta bo\'lishi kerak')
      .optional(),
  })
  .superRefine(
    (
      data: {
        paymentType: 'monthly' | 'lesson_based';
        lessonsPerCycle?: number;
      },
      ctx: z.RefinementCtx
    ) => {
      if (data.paymentType === 'lesson_based' && !data.lessonsPerCycle) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'paymentType "lesson_based" bo\'lganda lessonsPerCycle majburiy',
          path: ['lessonsPerCycle'],
        });
      }
      // Agar paymentType "monthly" bo'lsa va lessonsPerCycle berilgan bo'lsa — e'tiborga olinmaydi
      // (controller/service'da lessonsPerCycle ni null ga o'zgartiramiz)
    }
  );

/**
 * PUT /api/groups/:id — Guruhni tahrirlash uchun validatsiya schema'si
 * Barcha maydonlar ixtiyoriy
 */
export const updateGroupSchema = z
  .object({
    name: z
      .string()
      .min(2, 'Guruh nomi kamida 2 ta belgidan iborat bo\'lishi kerak')
      .trim()
      .optional(),

    days: z
      .array(z.enum(validDays, { error: 'Noto\'g\'ri kun qiymati' }))
      .min(1, 'Kamida 1 ta kun tanlangan bo\'lishi kerak')
      .optional(),

    time: z
      .string()
      .regex(/^([01]\d|2[0-3]):([0-5]\d)$/, 'Vaqt "HH:MM" formatida bo\'lishi kerak')
      .optional(),

    price: z
      .number()
      .int('Narx butun son bo\'lishi kerak')
      .positive('Narx 0 dan katta bo\'lishi kerak')
      .optional(),

    paymentType: z
      .enum(paymentTypes, {
        error: 'To\'lov turi faqat "monthly" yoki "lesson_based" bo\'lishi kerak',
      })
      .optional(),

    lessonsPerCycle: z
      .number()
      .int('Darslar soni butun son bo\'lishi kerak')
      .positive('Darslar soni 0 dan katta bo\'lishi kerak')
      .nullable()
      .optional(),
  })
  .superRefine(
    (
      data: {
        paymentType?: 'monthly' | 'lesson_based';
        lessonsPerCycle?: number | null;
      },
      ctx: z.RefinementCtx
    ) => {
      // Agar paymentType "lesson_based" ga o'zgartirilsa, lessonsPerCycle ham berilishi kerak
      if (
        data.paymentType === 'lesson_based' &&
        data.lessonsPerCycle === undefined
      ) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message:
            'paymentType "lesson_based" bo\'lganda lessonsPerCycle ham berilishi kerak',
          path: ['lessonsPerCycle'],
        });
      }
    }
  );

// Type inference uchun export
export type CreateGroupInput = z.infer<typeof createGroupSchema>;
export type UpdateGroupInput = z.infer<typeof updateGroupSchema>;
