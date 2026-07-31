import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { AdminUser, Pagination } from '../../types/admin.types';
import {
  Search,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  UserCheck,
  UserX,
  Shield,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export const AdminUsersPage: React.FC = () => {
  const [users, setUsers] = useState<AdminUser[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [deleteTargetUser, setDeleteTargetUser] = useState<AdminUser | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchUsers = async (page = pagination.page, searchQuery = search) => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(page, 10, searchQuery);
      if (response.success) {
        setUsers(response.data);
        setPagination(response.pagination);
      }
    } catch {
      toast.error("Foydalanuvchilarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchUsers(1, search);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchUsers(newPage, search);
    }
  };

  const handleDeleteUser = async () => {
    if (!deleteTargetUser) return;
    try {
      setDeleting(true);
      const res = await adminService.deleteUser(deleteTargetUser.id);
      if (res.success) {
        toast.success(res.message || "Foydalanuvchi o'chirildi");
        setDeleteTargetUser(null);
        fetchUsers(pagination.page, search);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "O'chirishda xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Foydalanuvchilar Boshqaruvi
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Platformada ro'yxatdan o'tgan barcha repetitorlar va ularning huquqlari
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, email yoki telefon..."
            className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all shadow-2xs"
          />
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-stone-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200/80 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">Foydalanuvchi</th>
                <th className="py-3.5 px-4">Telefon</th>
                <th className="py-3.5 px-4">Roli</th>
                <th className="py-3.5 px-4 text-center">Guruhlar</th>
                <th className="py-3.5 px-4 text-center">O'quvchilar</th>
                <th className="py-3.5 px-4">Holati</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#0F766E]" />
                      <span>Yuklanmoqda...</span>
                    </div>
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 font-medium">
                    Foydalanuvchilar topilmadi
                  </td>
                </tr>
              ) : (
                users.map((u) => (
                  <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900">{u.fullName}</div>
                      <div className="text-[11px] text-stone-500">{u.email}</div>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-600">{u.phone}</td>
                    <td className="py-3 px-4">
                      {u.role === 'admin' ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                          <Shield className="w-3 h-3" />
                          <span>Admin</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center px-2 py-0.5 rounded-md text-[10px] font-medium bg-stone-100 text-stone-600">
                          Repetitor
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-stone-900">
                      {u._count?.groups || 0}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-stone-900">
                      {u._count?.students || 0}
                    </td>
                    <td className="py-3 px-4">
                      {u.isVerified ? (
                        <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-emerald-600">
                          <UserCheck className="w-3.5 h-3.5" />
                          <span>Tasdiqlangan</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 text-[11px] font-medium text-stone-400">
                          <UserX className="w-3.5 h-3.5" />
                          <span>Kutilmoqda</span>
                        </span>
                      )}
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedUser(u);
                            setShowViewModal(true);
                          }}
                          className="p-1.5 text-stone-500 hover:text-[#0F766E] hover:bg-stone-100 rounded-lg transition-colors"
                          title="Ko'rish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetUser(u)}
                          disabled={u.role === 'admin'}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                          title="O'chirish"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>

        {/* Pagination Footer */}
        {pagination.totalPages > 1 && (
          <div className="flex items-center justify-between px-4 py-3 border-t border-stone-100 bg-stone-50/40 text-xs">
            <span className="text-stone-500">
              Jami <strong>{pagination.total}</strong> tadan {((pagination.page - 1) * pagination.limit) + 1} - {Math.min(pagination.page * pagination.limit, pagination.total)} ko'rsatilmoqda
            </span>

            <div className="flex items-center gap-2">
              <button
                onClick={() => handlePageChange(pagination.page - 1)}
                disabled={pagination.page === 1}
                className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronLeft className="w-4 h-4" />
              </button>

              <span className="font-semibold text-stone-700">
                {pagination.page} / {pagination.totalPages}
              </span>

              <button
                onClick={() => handlePageChange(pagination.page + 1)}
                disabled={pagination.page === pagination.totalPages}
                className="p-1.5 rounded-lg border border-stone-200 bg-white hover:bg-stone-50 text-stone-600 disabled:opacity-40 disabled:hover:bg-white"
              >
                <ChevronRight className="w-4 h-4" />
              </button>
            </div>
          </div>
        )}
      </div>

      {/* View User Detail Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Foydalanuvchi Tafsilotlari"
        maxWidth="max-w-md"
      >
        {selectedUser && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-sm">
                {selectedUser.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div>
                <h4 className="font-bold text-stone-900">{selectedUser.fullName}</h4>
                <p className="text-xs text-stone-500">{selectedUser.email}</p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Telefon</span>
                <span className="font-semibold text-stone-800">{selectedUser.phone}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Roli</span>
                <span className="font-semibold text-stone-800 capitalize">{selectedUser.role}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Guruhlari</span>
                <span className="font-semibold text-stone-800">{selectedUser._count?.groups || 0} ta</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">O'quvchilari</span>
                <span className="font-semibold text-stone-800">{selectedUser._count?.students || 0} ta</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-xs">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Ro'yxatdan o'tgan sana</span>
              <span className="font-semibold text-stone-800">
                {new Date(selectedUser.createdAt).toLocaleString('uz-UZ')}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete User Confirmation Modal */}
      <Modal
        isOpen={!!deleteTargetUser}
        onClose={() => setDeleteTargetUser(null)}
        title="Foydalanuvchini O'chirish"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              onClick={() => setDeleteTargetUser(null)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleDeleteUser}
              disabled={deleting}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors disabled:opacity-50"
            >
              {deleting ? <Loader2 className="w-4 h-4 animate-spin" /> : <Trash2 className="w-4 h-4" />}
              <span>Rostdan ham o'chirish</span>
            </button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-900">
              Rostdan ham o'chirmoqchimisiz?
            </h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              <strong>{deleteTargetUser?.fullName}</strong> foydalanuvchisi va unga tegishli barcha guruhlar, o'quvchilar va to'lov ma'lumotlari buttunlay o'chiriladi.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
