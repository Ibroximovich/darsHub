import type { Group } from './groups.types';

export interface Student {
  id: string;
  userId: string;
  firstName: string;
  lastName: string;
  phone: string;
  parentName?: string | null;
  parentPhone: string;
  createdAt: string;
  updatedAt: string;
}

export interface GroupStudentItem extends Student {
  groupStudentId: string;
  status: 'active' | 'stopped';
  joinedAt: string;
  stoppedAt?: string | null;
}

export interface StudentGroupLink {
  id: string;
  groupId: string;
  studentId: string;
  status: 'active' | 'stopped';
  joinedAt: string;
  stoppedAt?: string | null;
  group: Group;
}

export interface StudentProfile extends Student {
  groupLinks: StudentGroupLink[];
}

export interface AddStudentExistingPayload {
  studentId: string;
}

export interface AddStudentNewPayload {
  firstName: string;
  lastName: string;
  phone: string;
  parentName?: string | null;
  parentPhone: string;
}

export type AddStudentToGroupPayload = AddStudentExistingPayload | AddStudentNewPayload;

export interface UpdateStudentInput {
  firstName?: string;
  lastName?: string;
  phone?: string;
  parentName?: string | null;
  parentPhone?: string;
}
