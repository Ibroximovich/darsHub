export type LessonStatus = 'held' | 'cancelled';

export interface Lesson {
  id: string;
  groupId: string;
  date: string;
  status: LessonStatus;
  createdAt: string;
}

export interface AttendanceRecord {
  groupStudentId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  phone: string;
  present: boolean | null;
}

export interface SaveAttendancePayload {
  records: Array<{
    groupStudentId: string;
    present: boolean | null;
  }>;
}

export interface LessonDateItem {
  id: string;
  date: string;
}

export interface AttendanceSummaryItem {
  groupStudentId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  totalLessons: number;
  present: number;
  absent: number;
  attendanceMap?: Record<string, boolean>;
  cycleCompleted?: boolean;
}

export interface AttendanceSummaryResponse {
  lessons: LessonDateItem[];
  students: AttendanceSummaryItem[];
}
