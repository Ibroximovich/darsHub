import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { Check, X, Loader2, AlertCircle, Users, CheckCircle2, ChevronUp } from 'lucide-react';
import { attendanceApi } from '../../api/attendance';
import type { AttendanceRecord } from '../../types/attendance.types';
import toast from 'react-hot-toast';

interface AttendanceListProps {
  lessonId: string;
  groupId: string;
  onClose?: () => void;
}

export const AttendanceList: React.FC<AttendanceListProps> = ({
  lessonId,
  groupId,
  onClose,
}) => {
  const queryClient = useQueryClient();

  // Fetch attendance list for this lesson
  const {
    data: attendanceList = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['lessonAttendance', lessonId],
    queryFn: () => attendanceApi.getLessonAttendance(lessonId),
    enabled: Boolean(lessonId),
  });

  // Optimistic mutation to toggle student attendance
  const saveMutation = useMutation({
    mutationFn: ({
      groupStudentId,
      present,
    }: {
      groupStudentId: string;
      present: boolean | null;
    }) =>
      attendanceApi.saveAttendance(lessonId, [
        { groupStudentId, present },
      ]),
    onMutate: async ({ groupStudentId, present }) => {
      await queryClient.cancelQueries({ queryKey: ['lessonAttendance', lessonId] });

      const previousList = queryClient.getQueryData<AttendanceRecord[]>([
        'lessonAttendance',
        lessonId,
      ]);

      if (previousList) {
        queryClient.setQueryData<AttendanceRecord[]>(
          ['lessonAttendance', lessonId],
          previousList.map((item) =>
            item.groupStudentId === groupStudentId
              ? { ...item, present }
              : item
          )
        );
      }

      return { previousList };
    },
    onError: (_err, _variables, context) => {
      if (context?.previousList) {
        queryClient.setQueryData(
          ['lessonAttendance', lessonId],
          context.previousList
        );
      }
      toast.error("Davomatni saqlashda xatolik yuz berdi");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['lessonAttendance', lessonId] });
      queryClient.invalidateQueries({ queryKey: ['attendanceSummary', groupId] });
    },
  });

  const handleTogglePresent = (
    groupStudentId: string,
    currentPresent: boolean | null,
    targetPresent: boolean
  ) => {
    const nextPresent = currentPresent === targetPresent ? null : targetPresent;
    saveMutation.mutate({ groupStudentId, present: nextPresent });
  };

  const totalStudents = attendanceList.length;
  const markedCount = attendanceList.filter((a) => a.present !== null).length;
  const presentCount = attendanceList.filter((a) => a.present === true).length;
  const absentCount = attendanceList.filter((a) => a.present === false).length;

  if (isLoading) {
    return (
      <div className="py-8 flex flex-col items-center justify-center text-stone-400">
        <Loader2 className="w-5 h-5 animate-spin text-[#0F766E] mb-2" />
        <p className="text-xs font-medium">Davomat ro'yxati yuklanmoqda...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-center text-red-700 text-xs">
        <AlertCircle className="w-5 h-5 mx-auto mb-1 text-red-500" />
        <p className="font-semibold mb-1">Davomat ro'yxatini yuklashda xatolik</p>
        <button
          onClick={() => refetch()}
          className="px-2.5 py-1 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  if (attendanceList.length === 0) {
    return (
      <div className="py-6 text-center text-stone-500 text-xs">
        Guruhda faol o'quvchilar topilmadi.
      </div>
    );
  }

  return (
    <div className="space-y-3 pt-2">
      {/* Attendance Header & Counter Badge */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between bg-stone-50 p-3 rounded-xl border border-stone-200/70 text-xs font-medium gap-2">
        <div className="flex items-center gap-2 text-stone-700">
          <Users className="w-4 h-4 text-[#0F766E]" />
          <span>
            Davomat belgilash:{' '}
            <strong className="text-stone-900">
              {markedCount} / {totalStudents} o'quvchi
            </strong>
          </span>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
            <Check className="w-3 h-3" /> {presentCount} keldi
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-red-700 bg-red-50 px-2 py-0.5 rounded border border-red-200/60">
            <X className="w-3 h-3" /> {absentCount} kelmadi
          </span>
        </div>
      </div>

      {/* Attendance Rows Table / List */}
      <div className="divide-y divide-stone-100 border border-stone-200/80 rounded-xl overflow-hidden bg-white">
        {attendanceList.map((item) => {
          const isPresent = item.present === true;
          const isAbsent = item.present === false;
          const isUpdatingThis =
            saveMutation.isPending &&
            saveMutation.variables?.groupStudentId === item.groupStudentId;

          return (
            <div
              key={item.groupStudentId}
              className="flex items-center justify-between p-3 hover:bg-stone-50/60 transition-colors"
            >
              <div>
                <p className="text-xs font-bold text-stone-900">
                  {item.firstName} {item.lastName}
                </p>
                <p className="text-[11px] text-stone-500 font-medium">
                  {item.phone}
                </p>
              </div>

              {/* Action Buttons: Keldi / Kelmadi */}
              <div className="flex items-center gap-2">
                <button
                  onClick={() =>
                    handleTogglePresent(item.groupStudentId, item.present, true)
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                    isPresent
                      ? 'bg-emerald-600 text-white shadow-2xs font-bold ring-2 ring-emerald-600/20'
                      : 'bg-stone-100 text-stone-600 hover:bg-emerald-50 hover:text-emerald-700 border border-stone-200/80'
                  }`}
                  title={isPresent ? "Belgini bekor qilish" : "Keldi deb belgilash"}
                >
                  {isUpdatingThis && saveMutation.variables?.present === true ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <Check className="w-3.5 h-3.5" />
                  )}
                  <span>Keldi</span>
                </button>

                <button
                  onClick={() =>
                    handleTogglePresent(item.groupStudentId, item.present, false)
                  }
                  className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-xs font-semibold transition-all active:scale-95 ${
                    isAbsent
                      ? 'bg-red-600 text-white shadow-2xs font-bold ring-2 ring-red-600/20'
                      : 'bg-stone-100 text-stone-600 hover:bg-red-50 hover:text-red-700 border border-stone-200/80'
                  }`}
                  title={isAbsent ? "Belgini bekor qilish" : "Kelmadi deb belgilash"}
                >
                  {isUpdatingThis && saveMutation.variables?.present === false ? (
                    <Loader2 className="w-3.5 h-3.5 animate-spin" />
                  ) : (
                    <X className="w-3.5 h-3.5" />
                  )}
                  <span>Kelmadi</span>
                </button>
              </div>
            </div>
          );
        })}
      </div>

      {/* Save & Close / Finish Button at the bottom */}
      {onClose && (
        <div className="pt-3 border-t border-stone-100 flex items-center justify-end gap-2">
          <button
            onClick={() => {
              toast.success("Davomat saqlandi va ro'yxat yopildi");
              onClose();
            }}
            className="inline-flex items-center gap-2 px-4 py-2 bg-[#0F766E] hover:bg-[#0D625C] text-white font-bold text-xs rounded-xl shadow-xs transition-all active:scale-95"
          >
            <CheckCircle2 className="w-4 h-4" />
            <span>Saqlash va Yopish</span>
            <ChevronUp className="w-3.5 h-3.5 opacity-80" />
          </button>
        </div>
      )}
    </div>
  );
};
