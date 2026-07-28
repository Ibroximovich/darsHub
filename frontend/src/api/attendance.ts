import api from '../services/api';
import type {
  Lesson,
  LessonStatus,
  AttendanceRecord,
  AttendanceSummaryItem,
} from '../types/attendance.types';

export const attendanceApi = {
  // POST /api/groups/:groupId/lessons/today — Bugungi darsni belgilash ("held" | "cancelled")
  markTodayLesson: async (
    groupId: string,
    status: LessonStatus
  ): Promise<Lesson> => {
    const response = await api.post(`/groups/${groupId}/lessons/today`, {
      status,
    });
    return response.data.lesson;
  },

  // GET /api/groups/:groupId/lessons/today — Bugungi dars holatini olish
  getTodayLesson: async (groupId: string): Promise<Lesson | null> => {
    const response = await api.get(`/groups/${groupId}/lessons/today`);
    return response.data.lesson;
  },

  // POST /api/lessons/:lessonId/attendance — Bulk davomat saqlash
  saveAttendance: async (
    lessonId: string,
    records: Array<{ groupStudentId: string; present: boolean | null }>
  ): Promise<any> => {
    const response = await api.post(`/lessons/${lessonId}/attendance`, {
      records,
    });
    return response.data.attendances;
  },

  // GET /api/lessons/:lessonId/attendance — Darsning davomat ro'yxatini olish
  getLessonAttendance: async (
    lessonId: string
  ): Promise<AttendanceRecord[]> => {
    const response = await api.get(`/lessons/${lessonId}/attendance`);
    return response.data.attendance || [];
  },

  // GET /api/groups/:groupId/attendance/summary?month=YYYY-MM — Oylik hisobot
  getAttendanceSummary: async (
    groupId: string,
    month?: string
  ): Promise<AttendanceSummaryItem[]> => {
    const response = await api.get(`/groups/${groupId}/attendance/summary`, {
      params: { month },
    });
    return response.data.summary || [];
  },
};
