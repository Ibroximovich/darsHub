import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import { adminSubscriptionApi } from '../../api/admin';
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
  ShieldCheck,
  CheckCircle,
  Clock,
  XCircle,
  Pencil,
} from 'lucide-react';
import { Modal } from '../../components/ui/Modal';
import { ActivateSubscriptionModal } from '../../components/admin/ActivateSubscriptionModal';
import toast from 'react-hot-toast';

type StatusBadge = {
  label: string;
  icon: React.ReactNode;
  className: string;
};

function getStatusBadge(status: AdminUser['subscriptionStatus']): StatusBadge {
  switch (status) {
    case 'trial':
      return {
        label: 'Trial',
        icon: <Clock className="w-3 h-3" />,
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      };
    case 'active':
      return {
        label: 'Faol',
        icon: <CheckCircle className="w-3 h-3" />,
        className: 'bg-emerald-50 text-emerald-700 border-emerald-200',
      };
    case 'expired':
      return {
        label: 'Tugagan',
        icon: <XCircle className="w-3 h-3" />,
        className: 'bg-red-50 text-red-600 border-red-200',
      };
    default:
      return {
        label: 'Trial',
        icon: <Clock className="w-3 h-3" />,
        className: 'bg-blue-50 text-blue-700 border-blue-200',
      };
  }
}

// O'qish uchun o'zbekcha sana formati (masalan: "25 Avgust, 2026")
function formatTrialDate(dateStr: string | null | undefined): string {
  if (!dateStr) return '—';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '—';

  const day = date.getDate();
  const monthNames = [
    'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
    'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr'
  ];
  const monthNameUz = monthNames[date.getMonth()];

  return `${day} ${monthNameUz}, ${date.getFullYear()}`;
}

// HTML <input type="date"> uchun YYYY-MM-DD format
function toInputDateValue(dateStr: string | null | undefined): string {
  if (!dateStr) return '';
  const date = new Date(dateStr);
  if (isNaN(date.getTime())) return '';
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, '0');
  const day = String(date.getDate()).padStart(2, '0');
  return `${year}-${month}-${day}`;
}

interface InlineTrialEditorProps {
  userId: string;
  currentTrialEndsAt: string;
  onSave: (userId: string, isoDate: string) => void;
  isUpdating: boolean;
}

const InlineTrialEditor: React.FC<InlineTrialEditorProps> = ({
  userId,
  currentTrialEndsAt,
  onSave,
  isUpdating,
}) => {
  const [isEditing, setIsEditing] = useState(false);

  if (isUpdating) {
    return (
      <div className="flex items-center gap-1.5 text-teal-700 text-xs font-medium">
        <Loader2 className="w-3.5 h-3.5 animate-spin" />
        <span>Saqlanmoqda...</span>
      </div>
    );
  }

  if (isEditing) {
    return (
      <input
        type="date"
        defaultValue={toInputDateValue(currentTrialEndsAt)}
        autoFocus
        onChange={(e) => {
          if (e.target.value) {
            const iso = new Date(`${e.target.value}T00:00:00.000Z`).toISOString();
            onSave(userId, iso);
            setIsEditing(false);
          }
        }}
        onBlur={() => setIsEditing(false)}
        className="px-2 py-1 text-xs border border-teal-400 rounded-lg focus:outline-none focus:ring-2 focus:ring-teal-500/30 bg-white text-stone-900 shadow-xs"
      />
    );
  }

  return (
    <button
      onClick={() => setIsEditing(true)}
      type="button"
      className="group flex items-center gap-1.5 hover:bg-stone-100 px-2 py-1 rounded-lg transition-colors text-left"
      title="Trial sanasini tahrirlash uchun bosing"
    >
      <span className="text-xs font-medium text-stone-700">
        {formatTrialDate(currentTrialEndsAt)}
      </span>
      <Pencil className="w-3 h-3 text-stone-400 opacity-60 group-hover:opacity-100 group-hover:text-teal-600 transition-all" />
    </button>
  );
};

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

  // Subscription management state
  const [activateTarget, setActivateTarget] = useState<AdminUser | null>(null);
  const [updatingUserId, setUpdatingUserId] = useState<string | null>(null);
  const [deactivatingId, setDeactivatingId] = useState<string | null>(null);

  const fetchUsers = async (page = pagination.page, searchQuery = search) => {
    try {
      setLoading(true);
      const response = await adminService.getUsers(page, 10, searchQuery);
      if (response.success) {
        setUsers(response.data);
        setPagination(response.pagination);
      }
    } catch {
      toast.error('Foydalanuvchilarni yuklashda xatolik');
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

  const handleTrialDateSave = async (userId: string, newIsoDate: string) => {
    try {
      setUpdatingUserId(userId);
      await adminSubscriptionApi.updateUserTrial(userId, newIsoDate);
      toast.success('Trial sanasi yangilandi');
      fetchUsers(pagination.page, search);
    } catch {
      toast.error('Trial sanasini yangilashda xatolik yuz berdi');
    } finally {
      setUpdatingUserId(null);
    }
  };

  const handleDeactivate = async (userId: string) => {
    try {
      setDeactivatingId(userId);
      await adminSubscriptionApi.deactivateUser(userId);
      toast.success('Obuna bekor qilindi');
      fetchUsers(pagination.page, search);
    } catch {
      toast.error('Obunani bekor qilishda xatolik');
    } finally {
      setDeactivatingId(null);
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
            Platformada ro'yxatdan o'tgan barcha repetitorlar, obunalar va sinov muddatlari
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
                <th className="py-3.5 px-4">Obuna Holati</th>
                <th className="py-3.5 px-4">Tugash Sanasi</th>
                <th className="py-3.5 px-4 text-center">Guruhlar</th>
                <th className="py-3.5 px-4 text-center">O'quvchilar</th>
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
                users.map((u) => {
                  const badge = getStatusBadge(u.subscriptionStatus);
                  const isUpdatingThisUser = updatingUserId === u.id;
                  const isDeactivatingThisUser = deactivatingId === u.id;

                  // Active yoki Expired bo'lsa obuna tugash sanasini, trial bo'lsa trial sanasini ko'rsatamiz
                  const displayDate =
                    u.subscriptionExpiresAt && (u.subscriptionStatus === 'active' || u.subscriptionStatus === 'expired')
                      ? u.subscriptionExpiresAt
                      : u.trialEndsAt;

                  return (
                    <tr key={u.id} className="hover:bg-stone-50/50 transition-colors">
                      {/* Name + email */}
                      <td className="py-3 px-4">
                        <div className="flex items-center gap-2">
                          <div className="font-semibold text-stone-900">{u.fullName}</div>
                          {u.isAdmin && (
                            <span title="Admin">
                              <ShieldCheck className="w-3.5 h-3.5 text-teal-600 shrink-0" />
                            </span>
                          )}
                        </div>
                        <div className="text-[11px] text-stone-500">{u.email}</div>
                      </td>

                      {/* Phone */}
                      <td className="py-3 px-4 font-mono text-stone-600">{u.phone}</td>

                      {/* Subscription Status Badge */}
                      <td className="py-3 px-4">
                        <span
                          className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${badge.className}`}
                        >
                          {badge.icon}
                          {badge.label}
                        </span>
                      </td>

                      {/* Expiry Date / Trial Ends At inline editor */}
                      <td className="py-3 px-4">
                        <InlineTrialEditor
                          userId={u.id}
                          currentTrialEndsAt={displayDate}
                          onSave={handleTrialDateSave}
                          isUpdating={isUpdatingThisUser}
                        />
                      </td>

                      {/* Groups count */}
                      <td className="py-3 px-4 text-center font-bold text-stone-900">
                        {u._count?.groups || 0}
                      </td>

                      {/* Students count */}
                      <td className="py-3 px-4 text-center font-bold text-stone-900">
                        {u._count?.students || 0}
                      </td>

                      {/* Actions */}
                      <td className="py-3 px-4 text-right">
                        <div className="flex items-center justify-end gap-1.5">
                          {/* Activate / Extend Button */}
                          <button
                            onClick={() => setActivateTarget(u)}
                            className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-teal-50 text-teal-700 border border-teal-200 hover:bg-teal-100 transition-colors"
                            title={u.subscriptionStatus === 'active' ? "Obunani uzaytirish" : "Obunani faollashtirish"}
                          >
                            <UserCheck className="w-3.5 h-3.5" />
                            <span>{u.subscriptionStatus === 'active' ? 'Uzaytirish' : 'Faollashtirish'}</span>
                          </button>

                          {/* Deactivate Button */}
                          {u.subscriptionStatus === 'active' && !u.isAdmin && (
                            <button
                              onClick={() => handleDeactivate(u.id)}
                              disabled={isDeactivatingThisUser}
                              className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-xs font-semibold bg-red-50 text-red-600 border border-red-200 hover:bg-red-100 transition-colors disabled:opacity-50"
                              title="Obunani bekor qilish"
                            >
                              {isDeactivatingThisUser ? (
                                <Loader2 className="w-3.5 h-3.5 animate-spin" />
                              ) : (
                                <UserX className="w-3.5 h-3.5" />
                              )}
                              <span>Bekor</span>
                            </button>
                          )}

                          {/* View Modal Button */}
                          <button
                            onClick={() => {
                              setSelectedUser(u);
                              setShowViewModal(true);
                            }}
                            className="p-1.5 text-stone-500 hover:text-[#0F766E] hover:bg-stone-100 rounded-lg transition-colors"
                            title="Tafsilotlar"
                          >
                            <Eye className="w-4 h-4" />
                          </button>

                          {/* Delete Button */}
                          <button
                            onClick={() => setDeleteTargetUser(u)}
                            disabled={u.isAdmin || u.role === 'admin'}
                            className="p-1.5 text-stone-400 hover:text-red-600 hover:bg-red-50 rounded-lg transition-colors disabled:opacity-30 disabled:hover:bg-transparent"
                            title="O'chirish"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })
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

      {/* Activate Subscription Modal */}
      {activateTarget && (
        <ActivateSubscriptionModal
          userId={activateTarget.id}
          userName={activateTarget.fullName}
          onClose={() => {
            setActivateTarget(null);
            fetchUsers(pagination.page, search);
          }}
        />
      )}

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
                <span className="text-stone-400 block text-[10px] uppercase font-bold">Obuna Holati</span>
                <span className="font-semibold text-stone-800 uppercase">{selectedUser.subscriptionStatus || 'trial'}</span>
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
              <span className="text-stone-400 block text-[10px] uppercase font-bold">Trial Tugash Sanasi</span>
              <span className="font-semibold text-stone-800">
                {formatTrialDate(selectedUser.trialEndsAt)}
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
              <strong>{deleteTargetUser?.fullName}</strong> foydalanuvchisi va unga tegishli barcha guruhlar, o'quvchilar va to'lov ma'lumotlari butunlay o'chiriladi.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};
