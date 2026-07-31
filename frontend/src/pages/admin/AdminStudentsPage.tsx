import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { AdminStudent, Pagination } from '../../types/admin.types';
import {
  Search,
  Trash2,
  Eye,
  Loader2,
  ChevronLeft,
  ChevronRight,
  AlertTriangle,
  GraduationCap,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import toast from 'react-hot-toast';

export const AdminStudentsPage: React.FC = () => {
  const [students, setStudents] = useState<AdminStudent[]>([]);
  const [pagination, setPagination] = useState<Pagination>({
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  });
  const [search, setSearch] = useState<string>('');
  const [loading, setLoading] = useState<boolean>(true);

  // Modals state
  const [selectedStudent, setSelectedStudent] = useState<AdminStudent | null>(null);
  const [showViewModal, setShowViewModal] = useState<boolean>(false);
  const [deleteTargetStudent, setDeleteTargetStudent] = useState<AdminStudent | null>(null);
  const [deleting, setDeleting] = useState<boolean>(false);

  const fetchStudents = async (page = pagination.page, searchQuery = search) => {
    try {
      setLoading(true);
      const response = await adminService.getStudents(page, 10, searchQuery);
      if (response.success) {
        setStudents(response.data);
        setPagination(response.pagination);
      }
    } catch {
      toast.error("O'quvchilarni yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStudents(1, search);
  }, [search]);

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      fetchStudents(newPage, search);
    }
  };

  const handleDeleteStudent = async () => {
    if (!deleteTargetStudent) return;
    try {
      setDeleting(true);
      const res = await adminService.deleteStudent(deleteTargetStudent.id);
      if (res.success) {
        toast.success(res.message || "O'quvchi o'chirildi");
        setDeleteTargetStudent(null);
        fetchStudents(pagination.page, search);
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
            O'quvchilar Boshqaruvi
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Tizimdagi barcha foydalanuvchilarga biriktirilgan o'quvchilar ro'yxati
          </p>
        </div>

        {/* Search Input */}
        <div className="relative w-full sm:w-72">
          <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
          <input
            type="text"
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            placeholder="Ism, telefon, ota-ona ismi yoki repetitor..."
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
                <th className="py-3.5 px-4">O'quvchi</th>
                <th className="py-3.5 px-4">Telefon</th>
                <th className="py-3.5 px-4">Ota-ona</th>
                <th className="py-3.5 px-4">Biriktirilgan Repetitor</th>
                <th className="py-3.5 px-4">Guruhlar</th>
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
              ) : students.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center text-stone-400 font-medium">
                    O'quvchilar topilmadi
                  </td>
                </tr>
              ) : (
                students.map((s) => (
                  <tr key={s.id} className="hover:bg-stone-50/50 transition-colors">
                    <td className="py-3 px-4">
                      <div className="font-semibold text-stone-900 flex items-center gap-2">
                        <GraduationCap className="w-4 h-4 text-[#0F766E]" />
                        <span>{s.firstName} {s.lastName}</span>
                      </div>
                    </td>
                    <td className="py-3 px-4 font-mono text-stone-600">{s.phone}</td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-800">
                        {s.parentName || 'Ko\'rsatilmagan'}
                      </div>
                      <div className="text-[11px] text-stone-500 font-mono">{s.parentPhone}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="font-medium text-stone-800">{s.user?.fullName}</div>
                      <div className="text-[11px] text-stone-500">{s.user?.email}</div>
                    </td>
                    <td className="py-3 px-4">
                      <div className="flex flex-wrap gap-1 max-w-[200px]">
                        {s.groupLinks && s.groupLinks.length > 0 ? (
                          s.groupLinks.map((gl, i) => (
                            <span
                              key={i}
                              className="px-2 py-0.5 rounded bg-stone-100 text-stone-700 text-[10px] font-medium border border-stone-200"
                            >
                              {gl.group?.name}
                            </span>
                          ))
                        ) : (
                          <span className="text-[11px] text-stone-400">Guruhsiz</span>
                        )}
                      </div>
                    </td>
                    <td className="py-3 px-4 text-right">
                      <div className="flex items-center justify-end gap-1.5">
                        <button
                          onClick={() => {
                            setSelectedStudent(s);
                            setShowViewModal(true);
                          }}
                          className="p-1.5 text-stone-500 hover:text-[#0F766E] hover:bg-stone-100 rounded-lg transition-colors"
                          title="Ko'rish"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        <button
                          onClick={() => setDeleteTargetStudent(s)}
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

      {/* View Student Modal */}
      <Modal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        title="O'quvchi Tafsilotlari"
        maxWidth="max-w-md"
      >
        {selectedStudent && (
          <div className="space-y-4">
            <div className="flex items-center gap-3 p-3 bg-stone-50 rounded-xl border border-stone-100">
              <div className="w-10 h-10 rounded-xl bg-purple-600 text-white flex items-center justify-center font-bold text-sm">
                <GraduationCap className="w-5 h-5" />
              </div>
              <div>
                <h4 className="font-bold text-stone-900">
                  {selectedStudent.firstName} {selectedStudent.lastName}
                </h4>
                <p className="text-xs text-stone-500">
                  Repetitor: {selectedStudent.user?.fullName} ({selectedStudent.user?.email})
                </p>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3 text-xs">
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">O'quvchi Telefoni</span>
                <span className="font-semibold text-stone-800">{selectedStudent.phone}</span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Ota-ona Ismi</span>
                <span className="font-semibold text-stone-800">
                  {selectedStudent.parentName || 'Ko\'rsatilmagan'}
                </span>
              </div>
              <div className="p-3 bg-stone-50 rounded-xl col-span-2">
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Ota-ona Telefoni</span>
                <span className="font-semibold text-stone-800">{selectedStudent.parentPhone}</span>
              </div>
            </div>

            <div className="p-3 bg-stone-50 rounded-xl text-xs">
              <span className="text-stone-400 block text-[10px] uppercase font-bold mb-1">Azo bo'lgan guruhlar</span>
              <div className="flex flex-wrap gap-1.5">
                {selectedStudent.groupLinks && selectedStudent.groupLinks.length > 0 ? (
                  selectedStudent.groupLinks.map((gl, i) => (
                    <span
                      key={i}
                      className="px-2.5 py-1 rounded-lg bg-white border border-stone-200 text-stone-800 text-xs font-semibold"
                    >
                      {gl.group?.name}
                    </span>
                  ))
                ) : (
                  <span className="text-stone-400">Hech qaysi guruhga biriktirilmagan</span>
                )}
              </div>
            </div>
          </div>
        )}
      </Modal>

      {/* Delete Student Modal */}
      <Modal
        isOpen={!!deleteTargetStudent}
        onClose={() => setDeleteTargetStudent(null)}
        title="O'quvchini O'chirish"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              onClick={() => setDeleteTargetStudent(null)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              onClick={handleDeleteStudent}
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
              <strong>{deleteTargetStudent?.firstName} {deleteTargetStudent?.lastName}</strong> o'quvchisi va unga bog'liq barcha to'lovlar hamda davomatlar tizimdan o'chiriladi.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
