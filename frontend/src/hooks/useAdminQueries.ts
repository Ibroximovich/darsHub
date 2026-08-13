import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { adminService } from '../services/admin.service';
import { adminSubscriptionApi } from '../api/admin';
import toast from 'react-hot-toast';

// ─── ADMIN USERS HOOKS ───────────────────────────────────────────────────────

export function useAdminUsers(page: number, search: string) {
  return useQuery({
    queryKey: ['admin', 'users', page, search],
    queryFn: async () => {
      const response = await adminService.getUsers(page, 10, search);
      if (!response.success) {
        throw new Error('Foydalanuvchilarni yuklashda xatolik');
      }
      return response;
    },
  });
}

export function useDeleteAdminUser() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      const response = await adminService.deleteUser(userId);
      if (!response.success) {
        throw new Error(response.message || 'Foydalanuvchini o\'chirishda xatolik');
      }
      return response;
    },
    onSuccess: () => {
      toast.success('Foydalanuvchi muvaffaqiyatli o\'chirildi');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'O\'chirishda xatolik yuz berdi');
    },
  });
}

export function useActivateUserSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, months }: { userId: string; months: number }) => {
      return await adminSubscriptionApi.activateUser(userId, months);
    },
    onSuccess: () => {
      toast.success('Obuna muvaffaqiyatli faollashtirildi');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Obunani faollashtirishda xatolik');
    },
  });
}

export function useDeactivateUserSubscription() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (userId: string) => {
      return await adminSubscriptionApi.deactivateUser(userId);
    },
    onSuccess: () => {
      toast.success('Obuna bekor qilindi');
      queryClient.invalidateQueries({ queryKey: ['admin'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Obunani bekor qilishda xatolik');
    },
  });
}

export function useUpdateUserTrialDate() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async ({ userId, trialEndsAt }: { userId: string; trialEndsAt: string }) => {
      return await adminSubscriptionApi.updateUserTrial(userId, trialEndsAt);
    },
    onSuccess: () => {
      toast.success('Sana muvaffaqiyatli yangilandi');
      queryClient.invalidateQueries({ queryKey: ['admin', 'users'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'Sanamni yangilashda xatolik');
    },
  });
}

// ─── ADMIN STUDENTS HOOKS ────────────────────────────────────────────────────

export function useAdminStudents(page: number, search: string) {
  return useQuery({
    queryKey: ['admin', 'students', page, search],
    queryFn: async () => {
      const response = await adminService.getStudents(page, 10, search);
      if (!response.success) {
        throw new Error('O\'quvchilarni yuklashda xatolik');
      }
      return response;
    },
  });
}

export function useDeleteAdminStudent() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (studentId: string) => {
      const response = await adminService.deleteStudent(studentId);
      if (!response.success) {
        throw new Error(response.message || 'O\'quvchini o\'chirishda xatolik');
      }
      return response;
    },
    onSuccess: () => {
      toast.success('O\'quvchi o\'chirildi');
      queryClient.invalidateQueries({ queryKey: ['admin', 'students'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'O\'chirishda xatolik');
    },
  });
}

// ─── ADMIN GROUPS HOOKS ──────────────────────────────────────────────────────

export function useAdminGroups(page: number, search: string) {
  return useQuery({
    queryKey: ['admin', 'groups', page, search],
    queryFn: async () => {
      const response = await adminService.getGroups(page, 10, search);
      if (!response.success) {
        throw new Error('Guruhlarni yuklashda xatolik');
      }
      return response;
    },
  });
}

export function useDeleteAdminGroup() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: async (groupId: string) => {
      const response = await adminService.deleteGroup(groupId);
      if (!response.success) {
        throw new Error(response.message || 'Guruhni o\'chirishda xatolik');
      }
      return response;
    },
    onSuccess: () => {
      toast.success('Guruh o\'chirildi');
      queryClient.invalidateQueries({ queryKey: ['admin', 'groups'] });
      queryClient.invalidateQueries({ queryKey: ['admin', 'stats'] });
    },
    onError: (err: Error) => {
      toast.error(err.message || 'O\'chirishda xatolik');
    },
  });
}

// ─── ADMIN STATS HOOK ────────────────────────────────────────────────────────

export function useAdminStats() {
  return useQuery({
    queryKey: ['admin', 'stats'],
    queryFn: async () => {
      const response = await adminService.getStats();
      if (!response.success) {
        throw new Error('Statistikani yuklashda xatolik');
      }
      return response.data;
    },
  });
}
