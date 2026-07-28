import { prisma } from '../lib/prisma';
import { AppError } from '../middleware/error-handler';
import type { AddStudentToGroupInput, UpdateStudentInput } from '../validators/students.validator';
import type { GroupStudent, Student } from '@prisma/client';

type GroupStudentWithStudent = GroupStudent & {
  student: Student;
};

/**
 * 3. SEARCH STUDENTS — Mavjud o'quvchini telefon raqami bo'yicha qidirish
 * req.user.id'ga tegishli studentlar orasidan qidiradi
 */
export async function searchStudents(userId: string, phone?: string) {
  const students = await prisma.student.findMany({
    where: {
      userId,
      ...(phone ? { phone: { contains: phone } } : {}),
    },
    include: {
      groupLinks: {
        include: {
          group: {
            select: {
              id: true,
              name: true,
            },
          },
        },
      },
    },
    orderBy: { createdAt: 'desc' },
  });

  return students;
}

/**
 * 4. ADD STUDENT TO GROUP — Guruhga o'quvchi qo'shish (Yangi yoki Mavjud)
 */
export async function addStudentToGroup(
  groupId: string,
  userId: string,
  data: AddStudentToGroupInput
) {
  // 1. Avval guruh mavjudligi va egalikni tekshiramiz
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new AppError('Guruh topilmadi', 404);
  }

  if (group.userId !== userId) {
    throw new AppError('Bu guruhga ruxsatingiz yo\'q', 403);
  }

  let student;

  // 2. Student topish yoki yaratish
  if (data.studentId) {
    // Body Variant B: Mavjud studentni biriktirish
    const existingStudent = await prisma.student.findUnique({
      where: { id: data.studentId },
    });

    if (!existingStudent) {
      throw new AppError('O\'quvchi topilmadi', 404);
    }

    if (existingStudent.userId !== userId) {
      throw new AppError('Bu o\'quvchiga ruxsatingiz yo\'q', 403);
    }

    student = existingStudent;
  } else {
    // Body Variant A: Yangi student yaratish
    student = await prisma.student.create({
      data: {
        userId,
        firstName: data.firstName!,
        lastName: data.lastName!,
        phone: data.phone!,
        parentName: data.parentName || null,
        parentPhone: data.parentPhone!,
      },
    });
  }

  // 3. GroupStudent bog'lanishini tekshirish
  const existingLink = await prisma.groupStudent.findUnique({
    where: {
      groupId_studentId: {
        groupId,
        studentId: student.id,
      },
    },
  });

  let groupStudent;

  if (existingLink) {
    if (existingLink.status === 'active') {
      throw new AppError('Bu o\'quvchi allaqachon shu guruhda', 409);
    }

    // Agar avval chiqarib yuborilgan bo'lsa (stopped), qayta faollashtiramiz (active)
    groupStudent = await prisma.groupStudent.update({
      where: { id: existingLink.id },
      data: {
        status: 'active',
        joinedAt: new Date(),
        stoppedAt: null,
      },
    });
  } else {
    // Yangi biriktirish yaratamiz
    groupStudent = await prisma.groupStudent.create({
      data: {
        groupId,
        studentId: student.id,
        status: 'active',
      },
    });
  }

  return {
    ...student,
    groupStudent,
  };
}

/**
 * 5. GET GROUP STUDENTS — Guruhdagi faol o'quvchilar ro'yxati
 */
export async function getGroupStudents(groupId: string, userId: string) {
  // Egalik tekshiruvi
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new AppError('Guruh topilmadi', 404);
  }

  if (group.userId !== userId) {
    throw new AppError('Bu guruhga ruxsatingiz yo\'q', 403);
  }

  const links: GroupStudentWithStudent[] = await prisma.groupStudent.findMany({
    where: {
      groupId,
      status: 'active',
    },
    include: {
      student: true,
    },
    orderBy: { joinedAt: 'desc' },
  });

  return links.map((link: GroupStudentWithStudent) => ({
    groupStudentId: link.id,
    status: link.status,
    joinedAt: link.joinedAt,
    stoppedAt: link.stoppedAt,
    ...link.student,
  }));
}

/**
 * 6. GET STUDENT BY ID — O'quvchi to'liq profili (barcha guruh bog'lanishlari bilan)
 */
export async function getStudentById(studentId: string, userId: string) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
    include: {
      groupLinks: {
        include: {
          group: {
            select: {
              id: true,
              name: true,
              days: true,
              time: true,
              price: true,
              paymentType: true,
            },
          },
        },
        orderBy: { joinedAt: 'desc' },
      },
    },
  });

  if (!student) {
    throw new AppError('O\'quvchi topilmadi', 404);
  }

  if (student.userId !== userId) {
    throw new AppError('Bu o\'quvchi ma\'lumotlariga ruxsatingiz yo\'q', 403);
  }

  return student;
}

/**
 * 7. UPDATE STUDENT — O'quvchi shaxsiy ma'lumotlarini tahrirlash
 */
export async function updateStudent(
  studentId: string,
  userId: string,
  data: UpdateStudentInput
) {
  const student = await prisma.student.findUnique({
    where: { id: studentId },
  });

  if (!student) {
    throw new AppError('O\'quvchi topilmadi', 404);
  }

  if (student.userId !== userId) {
    throw new AppError('Bu o\'quvchiga ruxsatingiz yo\'q', 403);
  }

  const updatedStudent = await prisma.student.update({
    where: { id: studentId },
    data,
  });

  return updatedStudent;
}

/**
 * 8. REMOVE STUDENT FROM GROUP — O'quvchini guruhdan chiqarish (status: "stopped")
 */
export async function removeStudentFromGroup(
  groupId: string,
  studentId: string,
  userId: string
) {
  // Egalik tekshiruvi
  const group = await prisma.group.findUnique({
    where: { id: groupId },
  });

  if (!group) {
    throw new AppError('Guruh topilmadi', 404);
  }

  if (group.userId !== userId) {
    throw new AppError('Bu guruhga ruxsatingiz yo\'q', 403);
  }

  const groupStudent = await prisma.groupStudent.findUnique({
    where: {
      groupId_studentId: {
        groupId,
        studentId,
      },
    },
  });

  if (!groupStudent) {
    throw new AppError('O\'quvchi ushbu guruhga biriktirilmagan', 404);
  }

  if (groupStudent.status === 'stopped') {
    throw new AppError('O\'quvchi allaqachon guruhdan chiqarilgan', 400);
  }

  await prisma.groupStudent.update({
    where: { id: groupStudent.id },
    data: {
      status: 'stopped',
      stoppedAt: new Date(),
    },
  });

  return { message: 'O\'quvchi guruhdan chiqarildi' };
}
