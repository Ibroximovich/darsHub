import api from '../services/api';
import type { AdminUser, AdminPaginatedResponse } from '../types/admin.types';

export const adminSubscriptionApi = {
  // GET /api/admin/users?search=xxx
  getUsers: async (search: string = ''): Promise<AdminPaginatedResponse<AdminUser>> => {
    const response = await api.get('/admin/users', {
      params: { search, limit: 100 },
    });
    return response.data;
  },

  // POST /api/admin/users/:userId/activate  { months }
  activateUser: async (userId: string, months: number): Promise<void> => {
    await api.post(`/admin/users/${userId}/activate`, { months });
  },

  // POST /api/admin/users/:userId/deactivate
  deactivateUser: async (userId: string): Promise<void> => {
    await api.post(`/admin/users/${userId}/deactivate`);
  },

  // PATCH /api/admin/users/:userId/trial
  updateUserTrial: async (userId: string, trialEndsAt: string): Promise<void> => {
    await api.patch(`/admin/users/${userId}/trial`, { trialEndsAt });
  },
};
