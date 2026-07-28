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

export interface AttendanceSummaryItem {
  groupStudentId: string;
  studentId: string;
  firstName: string;
  lastName: string;
  totalLessons: number;
  present: number;
  absent: number;
  cycleCompleted?: boolean;
}
