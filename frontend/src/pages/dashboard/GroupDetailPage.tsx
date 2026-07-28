import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  ArrowLeft,
  UserPlus,
  Users,
  CalendarDays,
  Clock,
  Banknote,
  Loader2,
  AlertCircle,
  Trash2,
  CalendarCheck,
} from 'lucide-react';
import { groupsApi } from '../../api/groups';
import { studentsApi } from '../../api/students';
import type { GroupStudentItem } from '../../types/students.types';
import type { DayOfWeek } from '../../types/groups.types';
import { StudentRow } from '../../components/students/StudentRow';
import { AddStudentModal } from '../../components/students/AddStudentModal';
import { TodayLessonCard } from '../../components/attendance/TodayLessonCard';
import { AttendanceSummary } from '../../components/attendance/AttendanceSummary';
import { Modal } from '../../components/ui/Modal';
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

export const GroupDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [activeTab, setActiveTab] = useState<'students' | 'summary'>('students');
  const [isAddModalOpen, setIsAddModalOpen] = useState(false);
  const [removingStudent, setRemovingStudent] = useState<GroupStudentItem | null>(null);

  // Fetch Group Info
  const { data: group, isLoading: isGroupLoading } = useQuery({
    queryKey: ['group', id],
    queryFn: () => groupsApi.getGroupById(id!),
    enabled: Boolean(id),
  });

  // Fetch Group Students
  const {
    data: students = [],
    isLoading: isStudentsLoading,
    isError: isStudentsError,
    refetch: refetchStudents,
  } = useQuery({
    queryKey: ['groupStudents', id],
    queryFn: () => studentsApi.getGroupStudents(id!),
    enabled: Boolean(id),
  });

  // Remove student from group mutation
  const removeMutation = useMutation({
    mutationFn: (studentId: string) =>
      studentsApi.removeStudentFromGroup(id!, studentId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['groupStudents', id] });
      queryClient.invalidateQueries({ queryKey: ['groups'] });
      toast.success("O'quvchi guruhdan chiqarildi");
      setRemovingStudent(null);
    },
    onError: (err: any) => {
      toast.error(
        err.response?.data?.message || err.message || "Guruhdan chiqarishda xatolik"
      );
    },
  });

  const formatDays = (days?: DayOfWeek[]) => {
    if (!days || days.length === 0) return 'Belgilanmagan';
    return days.map((d) => DAY_LABELS[d] || d).join(', ');
  };

  const formatPrice = (price?: number) => {
    if (price === undefined) return '';
    return price.toLocaleString('uz-UZ') + " so'm";
  };

  return (
    <div className="space-y-6">
      {/* Back button */}
      <div>
        <button
          onClick={() => navigate('/dashboard/groups')}
          className="inline-flex items-center gap-2 px-3 py-1.5 text-xs font-semibold text-stone-600 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 hover:text-stone-900 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Guruhlarga qaytish</span>
        </button>
      </div>

      {/* Group Info Header Card */}
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
        {isGroupLoading ? (
          <div className="flex items-center gap-2 text-[#0F766E] text-xs font-medium py-4">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span>Guruh ma'lumotlari yuklanmoqda...</span>
          </div>
        ) : (
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
            <div>
              <div className="flex items-center gap-3 mb-2">
                <h2 className="text-xl font-bold text-stone-900 tracking-tight">
                  {group?.name}
                </h2>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-md text-xs font-semibold bg-[#0F766E]/10 text-[#0F766E]">
                  {group?.paymentType === 'monthly'
                    ? 'Oylik'
                    : `${group?.lessonsPerCycle || 12} darslik`}
                </span>
              </div>

              {/* Badges info */}
              <div className="flex flex-wrap items-center gap-4 text-xs text-stone-600">
                <div className="flex items-center gap-1.5">
                  <CalendarDays className="w-4 h-4 text-[#0F766E]" />
                  <span className="font-semibold">{formatDays(group?.days)}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Clock className="w-4 h-4 text-[#0F766E]" />
                  <span className="font-bold text-stone-900">{group?.time}</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Banknote className="w-4 h-4 text-[#0F766E]" />
                  <span className="font-bold text-stone-900">
                    {formatPrice(group?.price)}
                  </span>
                </div>
              </div>
            </div>

            {/* Action button */}
            <button
              onClick={() => setIsAddModalOpen(true)}
              className="inline-flex items-center justify-center gap-2 px-4 py-2.5 bg-[#0F766E] hover:bg-[#0D9488] text-white font-semibold text-xs rounded-xl shadow-xs transition-all active:scale-[0.98] shrink-0"
            >
              <UserPlus className="w-4 h-4" />
              <span>O'quvchi qo'shish</span>
            </button>
          </div>
        )}
      </div>

      {/* Today's Lesson Section (Only renders if today is in group.days) */}
      {group && id && (
        <TodayLessonCard
          groupId={id}
          groupDays={(group.days as DayOfWeek[]) || []}
        />
      )}

      {/* Tabs Switcher: Students vs Attendance Summary */}
      <div className="flex items-center gap-2 border-b border-stone-200/80 pt-2">
        <button
          onClick={() => setActiveTab('students')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'students'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <Users className="w-4 h-4" />
          <span>O'quvchilar ro'yxati ({students.length})</span>
        </button>

        <button
          onClick={() => setActiveTab('summary')}
          className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
            activeTab === 'summary'
              ? 'border-[#0F766E] text-[#0F766E]'
              : 'border-transparent text-stone-500 hover:text-stone-900'
          }`}
        >
          <CalendarCheck className="w-4 h-4" />
          <span>Davomat hisoboti</span>
        </button>
      </div>

      {/* Tab 1: Students List */}
      {activeTab === 'students' ? (
        <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
          <div className="flex items-center justify-between mb-4 pb-3 border-b border-stone-100">
            <div className="flex items-center gap-2">
              <Users className="w-5 h-5 text-[#0F766E]" />
              <h3 className="text-base font-bold text-stone-900">
                Guruh o'quvchilari
              </h3>
            </div>
            <span className="text-xs font-semibold bg-stone-100 text-stone-700 px-2.5 py-1 rounded-lg">
              Jami: {students.length} ta
            </span>
          </div>

          {isStudentsLoading ? (
            <div className="py-12 flex flex-col items-center justify-center text-stone-400">
              <Loader2 className="w-6 h-6 animate-spin text-[#0F766E] mb-2" />
              <p className="text-xs font-medium">O'quvchilar yuklanmoqda...</p>
            </div>
          ) : isStudentsError ? (
            <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-700 text-xs">
              <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
              <p className="font-semibold mb-2">O'quvchilar ro'yxatini yuklashda xatolik</p>
              <button
                onClick={() => refetchStudents()}
                className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
              >
                Qayta urinish
              </button>
            </div>
          ) : students.length === 0 ? (
            /* Empty Students State */
            <div className="py-12 text-center flex flex-col items-center justify-center">
              <div className="w-14 h-14 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mb-3">
                <Users className="w-7 h-7" />
              </div>
              <h4 className="text-base font-bold text-stone-900 mb-1">
                Bu guruhda hali o'quvchi yo'q
              </h4>
              <p className="text-xs text-stone-500 max-w-xs mb-4">
                Guruhga yangi yoki ilovada mavjud bo'lgan o'quvchilarni biriktiring.
              </p>
              <button
                onClick={() => setIsAddModalOpen(true)}
                className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F766E] hover:bg-[#0D9488] text-white font-semibold text-xs rounded-xl transition-all shadow-xs"
              >
                <UserPlus className="w-4 h-4" />
                <span>O'quvchi qo'shish</span>
              </button>
            </div>
          ) : (
            /* Students Table */
            <div className="overflow-x-auto">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider bg-stone-50/50">
                    <th className="py-2.5 px-4 rounded-l-lg">O'quvchi (F.I.SH)</th>
                    <th className="py-2.5 px-4">Telefon</th>
                    <th className="py-2.5 px-4">Ota-ona ma'lumoti</th>
                    <th className="py-2.5 px-4 text-right rounded-r-lg">Amallar</th>
                  </tr>
                </thead>
                <tbody>
                  {students.map((st) => (
                    <StudentRow
                      key={st.groupStudentId}
                      student={st}
                      onRemove={(s) => setRemovingStudent(s)}
                    />
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </div>
      ) : (
        /* Tab 2: Attendance Summary */
        id && (
          <AttendanceSummary
            groupId={id}
            paymentType={group?.paymentType as any}
            lessonsPerCycle={group?.lessonsPerCycle}
          />
        )
      )}

      {/* Add Student Modal */}
      {id && (
        <AddStudentModal
          isOpen={isAddModalOpen}
          onClose={() => setIsAddModalOpen(false)}
          groupId={id}
        />
      )}

      {/* Remove Confirmation Modal */}
      <Modal
        isOpen={Boolean(removingStudent)}
        onClose={() => setRemovingStudent(null)}
        title="Guruhdan chiqarish"
        maxWidth="max-w-sm"
        footer={
          <>
            <button
              type="button"
              onClick={() => setRemovingStudent(null)}
              disabled={removeMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-stone-700 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={() => removingStudent && removeMutation.mutate(removingStudent.id)}
              disabled={removeMutation.isPending}
              className="px-4 py-2 text-xs font-semibold text-white bg-red-600 hover:bg-red-700 rounded-xl transition-colors flex items-center gap-1.5 shadow-xs"
            >
              {removeMutation.isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <Trash2 className="w-4 h-4" />
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
            <strong className="text-stone-900">
              {removingStudent?.firstName} {removingStudent?.lastName}
            </strong>{' '}
            ushbu guruhdan chiqariladi (maqomi "To'xtatilgan" ga o'zgartiriladi).
          </p>
        </div>
      </Modal>
    </div>
  );
};
