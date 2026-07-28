import api from '../services/api';
import type { Group, CreateGroupInput, UpdateGroupInput } from '../types/groups.types';

export const groupsApi = {
  // GET /api/groups — Foydalanuvchining barcha guruhlarini olish
  getGroups: async (): Promise<Group[]> => {
    const response = await api.get('/groups');
    return response.data.groups || [];
  },

  // GET /api/groups/:id — Bitta guruh tafsilotlarini olish
  getGroupById: async (id: string): Promise<Group> => {
    const response = await api.get(`/groups/${id}`);
    return response.data.group;
  },

  // POST /api/groups — Yangi guruh yaratish
  createGroup: async (data: CreateGroupInput): Promise<Group> => {
    const response = await api.post('/groups', data);
    return response.data.group;
  },

  // PUT /api/groups/:id — Guruhni tahrirlash
  updateGroup: async (id: string, data: UpdateGroupInput): Promise<Group> => {
    const response = await api.put(`/groups/${id}`, data);
    return response.data.group;
  },

  // DELETE /api/groups/:id — Guruhni o'chirish
  deleteGroup: async (id: string): Promise<void> => {
    await api.delete(`/groups/${id}`);
  },
};
