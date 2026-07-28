import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';

/**
 * Yordamchi funksiya — bugungi sanani (vaqtsiz, 00:00:00) hosil qilish
 */
function getTodayDate(): Date {
  const now = new Date();
  const year = now.getFullYear();
  const month = String(now.getMonth() + 1).padStart(2, '0');
  const day = String(now.getDate()).padStart(2, '0');
  return new Date(`${year}-${month}-${day}`);
}

/**
 * 1. POST /api/groups/:groupId/lessons/today
 * Bugungi dars holatini belgilash ("held" | "cancelled")
 */
export async function markTodayLesson(
  userId: string,
  groupId: string,
  status: 'held' | 'cancelled'
) {
  const group = await prisma.group.findFirst({
    where: { id: groupId, userId },
  });

  if (!group) {
    throw new AppError('Guruh topilmadi', 404);
  }

  const today = getTodayDate();

  const lesson = await prisma.lesson.upsert({
    where: {
      groupId_date: {
        groupId,
        date: today,
      },
    },
    update: {
      status,
    },
    create: {
      groupId,
      date: today,
      status,
    },
  });

  return lesson;
}

/**
 * 2. GET /api/groups/:groupId/lessons/today
 * Bugungi dars holatini olish
 */
export async function getTodayLesson(userId: string, groupId: string) {
  const group = await prisma.group.findFirst({
    where: { id: groupId, userId },
  });

  if (!group) {
    throw new AppError('Guruh topilmadi', 404);
  }

  const today = getTodayDate();

  const lesson = await prisma.lesson.findUnique({
    where: {
      groupId_date: {
        groupId,
        date: today,
      },
    },
  });

  return lesson;
}

/**
 * 3. POST /api/lessons/:lessonId/attendance
 * Bulk davomatni saqlash
 */
export async function saveAttendance(
  userId: string,
  lessonId: string,
  records: Array<{ groupStudentId: string; present: boolean | null }>
) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      group: true,
    },
  });

  if (!lesson || lesson.group.userId !== userId) {
    throw new AppError('Dars topilmadi', 404);
  }

  if (lesson.status === 'cancelled') {
    throw new AppError('Bekor qilingan darsga davomat belgilanmaydi', 400);
  }

  const results = await prisma.$transaction(
    records.map((rec) => {
      if (rec.present === null) {
        return prisma.attendance.deleteMany({
          where: {
            lessonId,
            groupStudentId: rec.groupStudentId,
          },
        });
      }
      return prisma.attendance.upsert({
        where: {
          lessonId_groupStudentId: {
            lessonId,
            groupStudentId: rec.groupStudentId,
          },
        },
        update: {
          present: rec.present,
          markedAt: new Date(),
        },
        create: {
          lessonId,
          groupStudentId: rec.groupStudentId,
          present: rec.present,
        },
      });
    })
  );

  return results;
}

/**
 * 4. GET /api/lessons/:lessonId/attendance
 * Darsning davomat ro'yxatini olish
 */
export async function getLessonAttendance(userId: string, lessonId: string) {
  const lesson = await prisma.lesson.findUnique({
    where: { id: lessonId },
    include: {
      group: true,
    },
  });

  if (!lesson || lesson.group.userId !== userId) {
    throw new AppError('Dars topilmadi', 404);
  }

  const groupStudents = await prisma.groupStudent.findMany({
    where: {
      groupId: lesson.groupId,
      status: 'active',
    },
    include: {
      student: true,
    },
  });

  const attendances = await prisma.attendance.findMany({
    where: { lessonId },
  });

  const attendanceMap = new Map<string, boolean>();
  attendances.forEach((att) => {
    attendanceMap.set(att.groupStudentId, att.present);
  });

  return groupStudents.map((gs) => ({
    groupStudentId: gs.id,
    studentId: gs.student.id,
    firstName: gs.student.firstName,
    lastName: gs.student.lastName,
    phone: gs.student.phone,
    present: attendanceMap.has(gs.id) ? attendanceMap.get(gs.id)! : null,
  }));
}

/**
 * 5. GET /api/groups/:groupId/attendance/summary
 * Oylik / davr hisobotini olish (?month=YYYY-MM)
 */
export async function getAttendanceSummary(
  userId: string,
  groupId: string,
  monthParam?: string
) {
  const group = await prisma.group.findFirst({
    where: { id: groupId, userId },
  });

  if (!group) {
    throw new AppError('Guruh topilmadi', 404);
  }

  let year: number;
  let month: number;

  if (monthParam && /^\d{4}-\d{2}$/.test(monthParam)) {
    const parts = monthParam.split('-');
    year = parseInt(parts[0], 10);
    month = parseInt(parts[1], 10);
  } else {
    const now = new Date();
    year = now.getFullYear();
    month = now.getMonth() + 1;
  }

  const startDate = new Date(year, month - 1, 1);
  const endDate = new Date(year, month, 0, 23, 59, 59, 999);

  const heldLessons = await prisma.lesson.findMany({
    where: {
      groupId,
      status: 'held',
      date: {
        gte: startDate,
        lte: endDate,
      },
    },
    select: { id: true },
  });

  const heldLessonIds = heldLessons.map((l) => l.id);
  const totalLessons = heldLessons.length;

  const groupStudents = await prisma.groupStudent.findMany({
    where: {
      groupId,
      status: 'active',
    },
    include: {
      student: true,
    },
  });

  const attendances = await prisma.attendance.findMany({
    where: {
      lessonId: { in: heldLessonIds },
    },
  });

  return groupStudents.map((gs) => {
    const studentAttendances = attendances.filter(
      (att) => att.groupStudentId === gs.id
    );
    const presentCount = studentAttendances.filter((att) => att.present === true).length;
    const absentCount = studentAttendances.filter((att) => att.present === false).length;

    let cycleCompleted: boolean | undefined = undefined;
    if (group.paymentType === 'lesson_based' && group.lessonsPerCycle) {
      cycleCompleted = totalLessons >= group.lessonsPerCycle;
    }

    return {
      groupStudentId: gs.id,
      studentId: gs.student.id,
      firstName: gs.student.firstName,
      lastName: gs.student.lastName,
      totalLessons,
      present: presentCount,
      absent: absentCount,
      ...(cycleCompleted !== undefined ? { cycleCompleted } : {}),
    };
  });
}
