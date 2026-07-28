import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  User,
  Phone,
  Pencil,
  FolderKanban,
  CalendarDays,
  Clock,
  Loader2,
  AlertCircle,
  LogOut,
} from 'lucide-react';
import { studentsApi } from '../../api/students';
import { applyPhoneMask, cleanPhoneNumber, formatPhoneDisplay } from '../../utils/phone.utils';
import { Modal } from '../../components/ui/Modal';
import type { DayOfWeek } from '../../types/groups.types';
import toast from 'react-hot-toast';

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Dush',
  tuesday: 'Sesh',
  wednesday: 'Chor',
  thursday: 'Pay',
  friday: 'Juma',
  saturday: 'Shan',
  sunday: 'Yak',
};

export const StudentProfilePage: React.FC = () => {
  const { studentId } = useParams<{ studentId: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [removingGroupLink, setRemovingGroupLink] = useState<{
    groupId: string;
    groupName: string;
  } | null>(null);

  // Form state for Edit Modal
  const [editFirstName, setEditFirstName] = useState('');
  const [editLastName, setEditLastName] = useState('');
  const [editPhone, setEditPhone] = useState('');
  const [editParentName, setEditParentName] = useState('');
  const [editParentPhone, setEditParentPhone] = useState('');
  const [editError, setEditError] = useState('');

  // Fetch Student Profile
  const {
    data: student,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['student', studentId],
    queryFn: () => studentsApi.getStudentById(studentId!),
    enabled: Boolean(studentId),
  });

  // Edit student mutation
  const updateMutation = useMutation({
    mutationFn: (data: any) => studentsApi.updateStudent(studentId!, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      toast.success("O'quvchi ma'lumotlari yangilandi");
      setIsEditModalOpen(false);
    },
    onError: (err: any) => {
      const msg =
        err.response?.data?.message || err.message || "Tahrirlashda xatolik yuz berdi";
      setEditError(msg);
      toast.error(msg);
    },
  });

  // Remove from group mutation
  const removeMutation = useMutation({
    mutationFn: (groupId: string) =>
      studentsApi.removeStudentFromGroup(groupId, studentId!),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['student', studentId] });
      toast.success("Guruhdan chiqarildi");
      setRemovingGroupLink(null);
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || err.message || "Guruhdan chiqarishda xatolik"
      );
    },
  });

  const handleOpenEdit = () => {
    if (student) {
      setEditFirstName(student.firstName || '');
      setEditLastName(student.lastName || '');
      setEditPhone(formatPhoneDisplay(student.phone));
      setEditParentName(student.parentName || '');
      setEditParentPhone(formatPhoneDisplay(student.parentPhone));
      setEditError('');
      setIsEditModalOpen(true);
    }
  };

  const handleEditSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setEditError('');

    if (!editFirstName.trim() || !editLastName.trim()) {
      setEditError("Ism va familiya majburiy");
      return;
    }

    const cleanP = cleanPhoneNumber(editPhone);
    const cleanPP = cleanPhoneNumber(editParentPhone);

    if (cleanP.length < 13 || cleanPP.length < 13) {
      setEditError("Telefon raqamlarini to'liq kiriting");
      return;
    }

    updateMutation.mutate({
      firstName: editFirstName.trim(),
      lastName: editLastName.trim(),
      phone: cleanP,
      parentName: editParentName.trim() || null,
      parentPhone: cleanPP,
    });
  };

  const formatDays = (days?: DayOfWeek[]) => {
    if (!days || days.length === 0) return 'Belgilanmagan';
    return days.map((d) => DAY_LABELS[d] || d).join(', ');
  };

  if (isLoading) {
    return (
      <div className="py-20 flex flex-col items-center justify-center text-stone-400">
        <Loader2 className="w-8 h-8 animate-spin text-[#0F766E] mb-3" />
        <p className="text-xs font-medium">O'quvchi profili yuklanmoqda...</p>
      </div>
    );
  }

  if (isError || !student) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700">
        <AlertCircle className="w-8 h-8 mx-auto mb-2 text-red-500" />
        <p className="text-sm font-semibold mb-3">
          O'quvchi ma'lumotlarini yuklashda xatolik yuz berdi
        </p>
        <button
          onClick={() => refetch()}
          className="px-4 py-2 bg-red-600 text-white rounded-xl text-xs font-semibold hover:bg-red-700 transition-colors"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate(-1)}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Orqaga</span>
        </button>
      </div>

      {/* Student Profile Info Header */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-6 shadow-xs">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="w-14 h-14 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center font-bold text-xl shadow-xs">
              {student.firstName[0]}
              {student.lastName[0]}
            </div>
            <div>
              <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                {student.firstName} {student.lastName}
              </h2>
              <div className="flex flex-wrap items-center gap-3 text-xs text-stone-600 mt-1">
                <span className="flex items-center gap-1 font-semibold tabular-nums">
                  <Phone className="w-3.5 h-3.5 text-[#0F766E]" />
                  {formatPhoneDisplay(student.phone)}
                </span>
                {student.parentPhone && (
                  <span className="flex items-center gap-1 text-stone-500 tabular-nums">
                    <span className="font-semibold text-stone-700">Ota-ona:</span>
                    {formatPhoneDisplay(student.parentPhone)}
                    {student.parentName && ` (${student.parentName})`}
                  </span>
                )}
              </div>
            </div>
          </div>

          <button
            onClick={handleOpenEdit}
            className="inline-flex items-center justify-center gap-2 px-4 py-2 bg-stone-100 hover:bg-stone-200 text-stone-800 font-semibold text-xs rounded-xl transition-colors shrink-0"
          >
            <Pencil className="w-4 h-4 text-stone-600" />
            <span>Tahrirlash</span>
          </button>
        </div>
      </div>

      {/* Student Groups Membership Section */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
        <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
          <div className="flex items-center gap-2">
            <FolderKanban className="w-5 h-5 text-[#0F766E]" />
            <h3 className="text-base font-bold text-stone-900">
              Biriktirilgan guruhlari
            </h3>
          </div>
          <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg">
            Jami guruhlar: {student.groupLinks.length} ta
          </span>
        </div>

        {student.groupLinks.length === 0 ? (
          <div className="py-8 text-center text-stone-500 text-xs font-medium">
            Ushbu o'quvchi hali birorta guruhga biriktirilmagan.
          </div>
        ) : (
          <div className="space-y-3">
            {student.groupLinks.map((link) => {
              const isActive = link.status === 'active';
              return (
                <div
                  key={link.id}
                  className="p-4 bg-stone-50/60 border border-stone-200 rounded-xl flex flex-col sm:flex-row sm:items-center justify-between gap-3 hover:border-[#0F766E]/30 transition-all"
                >
                  <div className="space-y-1">
                    <div className="flex items-center gap-2.5">
                      <h4
                        onClick={() => navigate(`/dashboard/groups/${link.groupId}`)}
                        className="font-bold text-sm text-stone-900 hover:text-[#0F766E] cursor-pointer transition-colors"
                      >
                        {link.group.name}
                      </h4>
                      {/* Status Badge */}
                      <span
                        className={`inline-flex items-center px-2 py-0.5 rounded text-[10px] font-bold ${
                          isActive
                            ? 'bg-[#15803D]/10 text-[#15803D] border border-[#15803D]/20'
                            : 'bg-stone-200 text-stone-600 border border-stone-300'
                        }`}
                      >
                        {isActive ? 'Faol' : "To'xtatilgan"}
                      </span>
                    </div>

                    <div className="flex items-center gap-4 text-xs text-stone-600">
                      <span className="flex items-center gap-1">
                        <CalendarDays className="w-3.5 h-3.5 text-[#0F766E]" />
                        {formatDays(link.group.days)}
                      </span>
                      <span className="flex items-center gap-1 font-semibold text-stone-900">
                        <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
                        {link.group.time}
                      </span>
                      <span className="font-semibold text-[#0F766E]">
                        {link.group.price.toLocaleString('uz-UZ')} so'm
                      </span>
                    </div>
                  </div>

                  {isActive && (
                    <button
                      type="button"
                      onClick={() =>
                        setRemovingGroupLink({
                          groupId: link.groupId,
                          groupName: link.group.name,
                        })
                      }
                      className="px-3 py-1.5 text-xs font-semibold text-red-600 bg-red-50 hover:bg-red-100 rounded-lg transition-colors flex items-center gap-1 self-start sm:self-center shrink-0"
                    >
                      <LogOut className="w-3.5 h-3.5" />
                      <span>Guruhdan chiqarish</span>
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        )}
      </div>

      {/* Edit Student Modal */}
      <Modal
        isOpen={isEditModalOpen}
        onClose={() => setIsEditModalOpen(false)}
        title="O'quvchi ma'lumotlarini tahrirlash"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setIsEditModalOpen(false)}
              disabled={updateMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              form="edit-student-form"
              disabled={updateMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0D9488] rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {updateMutation.isPending && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Saqlash</span>
            </button>
          </>
        }
      >
        <form
          id="edit-student-form"
          onSubmit={handleEditSubmit}
          className="space-y-3 text-xs"
        >
          {editError && (
            <div className="p-3 bg-red-50 border border-red-200 text-red-700 rounded-xl text-xs">
              {editError}
            </div>
          )}

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Ismi</label>
            <input
              type="text"
              value={editFirstName}
              onChange={(e) => setEditFirstName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Familiyasi</label>
            <input
              type="text"
              value={editLastName}
              onChange={(e) => setEditLastName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">Telefon raqami</label>
            <input
              type="text"
              value={editPhone}
              onChange={(e) => setEditPhone(applyPhoneMask(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold tabular-nums"
              required
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Ota-ona ismi <span className="text-stone-400 font-normal">(ixtiyoriy)</span>
            </label>
            <input
              type="text"
              value={editParentName}
              onChange={(e) => setEditParentName(e.target.value)}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-medium"
            />
          </div>

          <div>
            <label className="block font-semibold text-stone-700 mb-1">
              Ota-ona telefon raqami
            </label>
            <input
              type="text"
              value={editParentPhone}
              onChange={(e) => setEditParentPhone(applyPhoneMask(e.target.value))}
              className="w-full px-3 py-2 bg-stone-50 border border-stone-300 rounded-xl font-semibold tabular-nums"
              required
            />
          </div>
        </form>
      </Modal>

      {/* Remove from Group Confirmation Modal */}
      <Modal
        isOpen={Boolean(removingGroupLink)}
        onClose={() => setRemovingGroupLink(null)}
        title="Guruhdan chiqarish"
        maxWidth="max-w-sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRemovingGroupLink(null)}
              disabled={removeMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={() =>
                removingGroupLink && removeMutation.mutate(removingGroupLink.groupId)
              }
              disabled={removeMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {removeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>Chiqarish</span>
            </button>
          </>
        }
      >
        <div className="space-y-2 text-xs text-stone-600">
          <p className="font-semibold text-stone-900 text-sm">
            Rostdan ham guruhdan chiqarmoqchimisiz?
          </p>
          <p>
            O'quvchi <strong className="text-stone-900">{removingGroupLink?.groupName}</strong>{' '}
            guruhidan chiqariladi (holati "To'xtatilgan" ga o'tadi).
          </p>
        </div>
      </Modal>
    </div>
  );
};
