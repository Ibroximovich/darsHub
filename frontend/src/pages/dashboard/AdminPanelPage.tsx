import React, { useState } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import { useQuery } from '@tanstack/react-query';
import { ShieldCheck, Search, Loader2, AlertTriangle } from 'lucide-react';
import { adminSubscriptionApi } from '../../api/admin';
import { UserTable } from '../../components/admin/UserTable';
import type { User } from '../../types/auth.types';

interface DashboardOutletContext {
  user: User | null;
}

export const AdminPanelPage: React.FC = () => {
  const { user } = useOutletContext<DashboardOutletContext>();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');

  // isAdmin bo'lmasa — yo'naltirish
  if (user && !user.isAdmin) {
    navigate('/dashboard/groups', { replace: true });
    return null;
  }

  const { data, isLoading, isError } = useQuery({
    queryKey: ['admin-users', search],
    queryFn: () => adminSubscriptionApi.getUsers(search),
    enabled: !!user?.isAdmin,
    staleTime: 30_000,
  });

  const users = data?.data ?? [];

  return (
    <div className="space-y-5">
      {/* Header */}
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-2xl bg-teal-50 border border-teal-200 flex items-center justify-center shrink-0">
          <ShieldCheck className="w-5 h-5 text-teal-600" />
        </div>
        <div>
          <h1 className="text-lg font-bold text-stone-900 leading-tight">Admin Panel</h1>
          <p className="text-xs text-stone-500 mt-0.5">Foydalanuvchilar va obunalarni boshqarish</p>
        </div>
      </div>

      {/* Search */}
      <div className="relative">
        <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-stone-400 pointer-events-none" />
        <input
          type="text"
          placeholder="Ism yoki email bo'yicha qidirish..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-3 rounded-2xl border border-stone-200 bg-white text-sm text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-teal-500/30 focus:border-teal-400 transition-all"
        />
      </div>

      {/* Content */}
      {isLoading ? (
        <div className="flex items-center justify-center py-16">
          <div className="flex items-center gap-2.5 text-stone-400 text-xs">
            <Loader2 className="w-4 h-4 animate-spin text-teal-500" />
            <span>Yuklanmoqda...</span>
          </div>
        </div>
      ) : isError ? (
        <div className="flex flex-col items-center gap-3 py-12 text-center">
          <div className="w-10 h-10 rounded-2xl bg-red-50 border border-red-100 flex items-center justify-center">
            <AlertTriangle className="w-5 h-5 text-red-500" />
          </div>
          <p className="text-sm font-medium text-stone-700">Ma'lumotlarni yuklashda xatolik</p>
          <p className="text-xs text-stone-400">Sahifani yangilab ko'ring</p>
        </div>
      ) : (
        <div className="bg-white rounded-2xl border border-stone-200 shadow-sm overflow-hidden">
          <div className="px-5 py-4 border-b border-stone-100 flex items-center justify-between">
            <h2 className="text-sm font-semibold text-stone-800">
              Barcha foydalanuvchilar
            </h2>
            <span className="text-xs text-stone-400 font-medium">
              Jami: {users.length} ta
            </span>
          </div>
          <div className="p-4 md:p-0">
            <UserTable users={users} />
          </div>
        </div>
      )}
    </div>
  );
};
