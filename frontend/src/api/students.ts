import api from '../services/api';
import type {
  Student,
  GroupStudentItem,
  StudentProfile,
  AddStudentToGroupPayload,
  UpdateStudentInput,
} from '../types/students.types';

export const studentsApi = {
  // GET /api/students/search?phone=xxx
  searchStudents: async (phone?: string): Promise<Student[]> => {
    const response = await api.get('/students/search', {
      params: { phone },
    });
    return response.data.students || [];
  },

  // GET /api/students/search (Barcha o'quvchilarni olish)
  getAllStudents: async (): Promise<Student[]> => {
    const response = await api.get('/students/search');
    return response.data.students || [];
  },

  // GET /api/groups/:groupId/students
  getGroupStudents: async (groupId: string): Promise<GroupStudentItem[]> => {
    const response = await api.get(`/groups/${groupId}/students`);
    return response.data.students || [];
  },

  // POST /api/groups/:groupId/students
  addStudentToGroup: async (
    groupId: string,
    data: AddStudentToGroupPayload
  ): Promise<any> => {
    const response = await api.post(`/groups/${groupId}/students`, data);
    return response.data.student;
  },

  // GET /api/students/:id
  getStudentById: async (id: string): Promise<StudentProfile> => {
    const response = await api.get(`/students/${id}`);
    return response.data.student;
  },

  // PUT /api/students/:id
  updateStudent: async (
    id: string,
    data: UpdateStudentInput
  ): Promise<Student> => {
    const response = await api.put(`/students/${id}`, data);
    return response.data.student;
  },

  // DELETE /api/groups/:groupId/students/:studentId
  removeStudentFromGroup: async (
    groupId: string,
    studentId: string
  ): Promise<void> => {
    await api.delete(`/groups/${groupId}/students/${studentId}`);
  },
};
