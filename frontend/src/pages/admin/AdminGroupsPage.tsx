import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { AdminGroup, Pagination } from '../../types/admin.types';
import {
  Search,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  FolderKanban,
  Clock,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export const AdminGroupsPage: React.FC = () => {
  const [groups, setGroups] = useState<AdminGroup[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [selectedGroup, setSelectedGroup] = useState<AdminGroup | null>(null);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [deleteTargetGroup, setDeleteTargetGroup] = useState<AdminGroup | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchGroups = async (page = pagination.page, searchQuery = search) => {
    try {
      setLoading(true);
      const response = await adminService.getGroups(page, 10, searchQuery);
      if (response.success) {
        setGroups(response.data);
        setPagination(response.pagination);
      }
    } catch {
      toast.error("Guruhlarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchGroups(1, search);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchGroups(newPage, search);
    }
  };

  const handleDeleteGroup = async () => {
    if (!deleteTargetGroup) return;
    try {
      setDeleting(true);
      const res = await adminService.deleteGroup(deleteTargetGroup.id);
      if (res.success) {
        toast.success(res.message || "Guruh o'chirildi");
        setDeleteTargetGroup(null);
        fetchGroups(pagination.page, search);
      }
    } catch (error: any) {
      toast.error(error.response?.data?.message || "O'chirishda xatolik yuz berdi");
    } finally {
      setDeleting(false);
    }
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  return (
    <div className="space-y-6">
      {/* Header & Search */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Guruhlar Boshqaruvi
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Tizimdagi barcha repetitorlarga tegishli o'quv guruhlari
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Guruh nomi yoki repetitor ismi..."
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
                <th className="py-3.5 px-4">Guruh Nomi</th>
                <th className="py-3.5 px-4">Repetitor</th>
                <th className="py-3.5 px-4">Vaqt & Kunlar</th>
                <th className="py-3.5 px-4">Narxi</th>
                <th className="py-3.5 px-4 text-center">O'quvchilar</th>
                <th className="py-3.5 px-4 text-right">Amallar</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
              {loading ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#0F766E]" />
                      <span>Yuklanmoqda...</span>
                    </div>
                  </td>
                </tr>
              ) : groups.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 font-medium">
                    Guruhlar topilmadi
                  </td>
                </tr>
              ) : (
                groups.map((g) => (
                  <tr key={g.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900 flex items-center gap-2">
                        <FolderKanban className="w-4 h-4 text-[#0F766E]" />
                        <span>{g.name}</span>
                      </div>
                      <span className="text-[10px] text-stone-400 font-medium capitalize">
                        {g.paymentType === 'monthly' ? 'Oylik to\'lov' : 'Darsbay to\'lov'}
                      </span>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-800">{g.user?.fullName}</div>
                      <div className="text-[11px] text-stone-500">{g.user?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex items-center gap-1.5 text-stone-700">
                        <Clock className="w-3.5 h-3.5 text-stone-400" />
                        <span>{g.time}</span>
                      </div>
                      <div className="text-[11px] text-stone-400 capitalize truncate max-w-[160px]">
                        {g.days.join(', ')}
                      </div>
                    </td>
                    <td className="py-3 px-4 font-bold text-stone-900">
                      {formatMoney(g.price)}
                    </td>
                    <td className="py-3 px-4 text-center font-bold text-[#0F766E]">
                      {g._count?.studentLinks || 0} ta
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedGroup(g);
                            setShowViewModal(true);
                          }}
                          className="p-1.5 text-stone-500 hover:text-[#0F766E] hover:bg-stone-100 rounded-lg transition-colors"
                          title="Ko'rish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetGroup(g)}
                          className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors"
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

      {/* View Group Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="Guruh Tafsilotlari"
        maxWidth="max-w-md"
      >
        {selectedGroup && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-teal-600 text-white flex items-center justify-center font-bold text-sm">
                <FolderKanban className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900">{selectedGroup.name}</h4>
                <p className="text-xs text-stone-500">
                  Egasi: {selectedGroup.user?.fullName} ({selectedGroup.user?.email})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Narxi</span>
                <span className="font-bold text-stone-900">{formatMoney(selectedGroup.price)}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">To'lov Turi</span>
                <span className="font-semibold text-stone-800 capitalize">
                  {selectedGroup.paymentType === 'monthly' ? 'Oylik' : 'Darsbay'}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Dars Vaqti</span>
                <span className="font-semibold text-stone-800">{selectedGroup.time}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">O'quvchilar Soni</span>
                <span className="font-semibold text-[#0F766E]">{selectedGroup._count?.studentLinks || 0} ta</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-xs">
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Dars kunlari</span>
              <span className="font-semibold text-stone-800 capitalize">
                {selectedGroup.days.join(', ')}
              </span>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Group Modal */}
      <Modal
        isOpen={!!deleteTargetGroup}
        onClose={() => setDeleteTargetGroup(null)}
        title="Guruhni O'chirish"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              onClick={() => setDeleteTargetGroup(null)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleDeleteGroup}
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
              <strong>{deleteTargetGroup?.name}</strong> guruhi va unga bog'liq barcha darslar, to'lovlar hamda davomat yozuvlari o'chiriladi.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
