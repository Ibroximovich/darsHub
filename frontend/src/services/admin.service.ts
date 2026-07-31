import api from './api';
import type {
  AdminStats,
  AdminUser,
  AdminGroup,
  AdminStudent,
  AdminPayment,
  AdminPaginatedResponse,
} from '../types/admin.types';
import type { ApiResponse } from '../types/auth.types';

export const adminService = {
  // GET /api/admin/stats
  getStats: async (): Promise<ApiResponse<AdminStats>> => {
    const response = await api.get('/admin/stats');
    return response.data;
  },

  // GET /api/admin/users
  getUsers: async (
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<AdminPaginatedResponse<AdminUser>> => {
    const response = await api.get('/admin/users', {
      params: { page, limit, search },
    });
    return response.data;
  },

  // DELETE /api/admin/users/:id
  deleteUser: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/admin/users/${id}`);
    return response.data;
  },

  // GET /api/admin/groups
  getGroups: async (
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<AdminPaginatedResponse<AdminGroup>> => {
    const response = await api.get('/admin/groups', {
      params: { page, limit, search },
    });
    return response.data;
  },

  // DELETE /api/admin/groups/:id
  deleteGroup: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/admin/groups/${id}`);
    return response.data;
  },

  // GET /api/admin/students
  getStudents: async (
    page: number = 1,
    limit: number = 10,
    search: string = ''
  ): Promise<AdminPaginatedResponse<AdminStudent>> => {
    const response = await api.get('/admin/students', {
      params: { page, limit, search },
    });
    return response.data;
  },

  // DELETE /api/admin/students/:id
  deleteStudent: async (id: string): Promise<ApiResponse> => {
    const response = await api.delete(`/admin/students/${id}`);
    return response.data;
  },

  // GET /api/admin/payments
  getPayments: async (
    page: number = 1,
    limit: number = 10,
    search: string = '',
    status: string = ''
  ): Promise<AdminPaginatedResponse<AdminPayment>> => {
    const response = await api.get('/admin/payments', {
      params: { page, limit, search, status },
    });
    return response.data;
  },
};
