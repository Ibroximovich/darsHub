import React, { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  CheckCircle2,
  XCircle,
  Calendar,
  Loader2,
  RefreshCw,
  AlertTriangle,
  Pencil,
  ChevronDown,
} from 'lucide-react';
import { attendanceApi } from '../../api/attendance';
import type { DayOfWeek } from '../../types/groups.types';
import type { LessonStatus } from '../../types/attendance.types';
import { AttendanceList } from './AttendanceList';
import toast from 'react-hot-toast';

interface TodayLessonCardProps {
  groupId: string;
  groupDays: DayOfWeek[];
}

const UZ_MONTHS = [
  'Yanvar',
  'Fevral',
  'Mart',
  'Aprel',
  'May',
  'Iyun',
  'Iyul',
  'Avgust',
  'Sentabr',
  'Oktabr',
  'Noyabr',
  'Dekabr',
];

const UZ_WEEKDAYS: Record<number, string> = {
  0: 'Yakshanba',
  1: 'Dushanba',
  2: 'Seshanba',
  3: 'Chorshanba',
  4: 'Payshanba',
  5: 'Juma',
  6: 'Shanba',
};

function formatUzbekDate(date: Date = new Date()): string {
  const day = date.getDate();
  const month = UZ_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const weekday = UZ_WEEKDAYS[date.getDay()];
  return `${day}-${month}, ${year}-yil (${weekday})`;
}

export const TodayLessonCard: React.FC<TodayLessonCardProps> = ({
  groupId,
  groupDays,
}) => {
  const queryClient = useQueryClient();
  const [isChangingStatus, setIsChangingStatus] = useState(false);
  const [isAttendanceExpanded, setIsAttendanceExpanded] = useState<boolean>(false);
  const [hasUserToggled, setHasUserToggled] = useState<boolean>(false);

  // Check if today is a scheduled lesson day
  const getTodayDayOfWeek = (): DayOfWeek => {
    const days: DayOfWeek[] = [
      'sunday',
      'monday',
      'tuesday',
      'wednesday',
      'thursday',
      'friday',
      'saturday',
    ];
    const dayIndex = new Date().getDay();
    return days[dayIndex];
  };

  const isTodayLessonDay = groupDays?.includes(getTodayDayOfWeek());

  // Fetch Today's Lesson
  const {
    data: lesson,
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['todayLesson', groupId],
    queryFn: () => attendanceApi.getTodayLesson(groupId),
    enabled: Boolean(groupId) && isTodayLessonDay,
  });

  // Fetch attendance for summary counts on collapsed state
  const { data: attendanceList = [] } = useQuery({
    queryKey: ['lessonAttendance', lesson?.id],
    queryFn: () => attendanceApi.getLessonAttendance(lesson!.id),
    enabled: Boolean(lesson?.id) && lesson?.status === 'held',
  });

  const presentCount = attendanceList.filter((a) => a.present === true).length;
  const absentCount = attendanceList.filter((a) => a.present === false).length;
  const unmarkedCount = attendanceList.filter((a) => a.present === null).length;
  const markedCount = presentCount + absentCount;

  // Smart default expansion state logic:
  // If lesson exists and has marked attendances or saved collapse preference -> start COLLAPSED.
  // Only if no attendances marked yet and user didn't toggle -> start EXPANDED.
  useEffect(() => {
    if (!lesson || lesson.status !== 'held' || hasUserToggled) return;

    const savedState = localStorage.getItem(`attendance_collapsed_${lesson.id}`);
    if (savedState === 'true') {
      setIsAttendanceExpanded(false);
    } else if (savedState === 'false') {
      setIsAttendanceExpanded(true);
    } else if (markedCount > 0) {
      // If attendance is already marked and no explicit local storage setting -> collapse by default
      setIsAttendanceExpanded(false);
    } else {
      // If nothing is marked yet -> expand so tutor can mark
      setIsAttendanceExpanded(true);
    }
  }, [lesson, markedCount, hasUserToggled]);

  // Mutation to mark today's lesson status
  const markMutation = useMutation({
    mutationFn: (status: LessonStatus) =>
      attendanceApi.markTodayLesson(groupId, status),
    onSuccess: (updatedLesson) => {
      queryClient.invalidateQueries({ queryKey: ['todayLesson', groupId] });
      queryClient.invalidateQueries({ queryKey: ['attendanceSummary', groupId] });
      if (updatedLesson.status === 'held') {
        queryClient.invalidateQueries({
          queryKey: ['lessonAttendance', updatedLesson.id],
        });
        toast.success("Bugungi dars o'tkazildi deb belgilandi");
        setIsAttendanceExpanded(true);
        setHasUserToggled(true);
        localStorage.setItem(`attendance_collapsed_${updatedLesson.id}`, 'false');
      } else {
        toast.success("Bugungi dars bekor qilindi");
      }
      setIsChangingStatus(false);
    },
    onError: (err: any) => {
      toast.error(
        err?.response?.data?.message || "Dars holatini belgilashda xatolik"
      );
    },
  });

  const handleExpand = () => {
    setIsAttendanceExpanded(true);
    setHasUserToggled(true);
    if (lesson?.id) {
      localStorage.setItem(`attendance_collapsed_${lesson.id}`, 'false');
    }
  };

  const handleCollapse = () => {
    setIsAttendanceExpanded(false);
    setHasUserToggled(true);
    if (lesson?.id) {
      localStorage.setItem(`attendance_collapsed_${lesson.id}`, 'true');
    }
  };

  // If today is NOT a scheduled lesson day for this group, do not render this section
  if (!isTodayLessonDay) {
    return null;
  }

  if (isLoading) {
    return (
      <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-2xs flex items-center justify-center py-6 text-[#0F766E] text-xs font-semibold">
        <Loader2 className="w-4 h-4 animate-spin mr-2" />
        <span>Bugungi dars holati yuklanmoqda...</span>
      </div>
    );
  }

  if (isError) {
    return null;
  }

  const showStatusSelection = !lesson || isChangingStatus;

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-2xs space-y-4">
      {/* Top Banner / Selection Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center shrink-0">
            <Calendar className="w-4 h-4" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-stone-900 leading-tight">
              Bugungi Dars Holati
            </h3>
            <p className="text-[11px] text-stone-500 font-medium">
              {formatUzbekDate()}
            </p>
          </div>
        </div>

        {lesson && !isChangingStatus && (
          <button
            onClick={() => setIsChangingStatus(true)}
            className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0F766E] hover:text-[#0D625C] hover:underline self-start sm:self-auto"
          >
            <RefreshCw className="w-3.5 h-3.5" />
            <span>Holatni o'zgartirish</span>
          </button>
        )}
      </div>

      {/* State 1: Unmarked / Changing Status -> Two Big Action Buttons */}
      {showStatusSelection ? (
        <div className="space-y-3">
          <p className="text-xs text-stone-600 font-medium">
            Bugun ushbu guruhda dars kuni. Dars bo'lib o'tganligini tasdiqlang:
          </p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              onClick={() => markMutation.mutate('held')}
              disabled={markMutation.isPending}
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-[#0F766E] hover:bg-[#0D625C] text-white font-bold text-xs shadow-xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {markMutation.isPending && markMutation.variables === 'held' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle2 className="w-4 h-4" />
              )}
              <span>✅ Bugun dars bo'ldi</span>
            </button>

            <button
              onClick={() => markMutation.mutate('cancelled')}
              disabled={markMutation.isPending}
              className="flex items-center justify-center gap-2.5 px-5 py-3 rounded-xl bg-stone-100 hover:bg-red-50 text-stone-700 hover:text-red-700 border border-stone-200 hover:border-red-200 font-bold text-xs transition-all active:scale-[0.98] disabled:opacity-50"
            >
              {markMutation.isPending && markMutation.variables === 'cancelled' ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <XCircle className="w-4 h-4" />
              )}
              <span>❌ Bugun dars bo'lmadi</span>
            </button>
          </div>

          {isChangingStatus && (
            <div className="pt-2 text-right">
              <button
                onClick={() => setIsChangingStatus(false)}
                className="text-xs font-semibold text-stone-500 hover:text-stone-800"
              >
                Bekor qilish
              </button>
            </div>
          )}
        </div>
      ) : lesson.status === 'cancelled' ? (
        /* State 2: Lesson Cancelled Banner */
        <div className="bg-stone-50 border border-stone-200/80 rounded-xl p-4 flex items-center gap-3 text-xs">
          <div className="w-8 h-8 rounded-lg bg-red-100 text-red-600 flex items-center justify-center shrink-0">
            <AlertTriangle className="w-4 h-4" />
          </div>
          <div>
            <p className="font-bold text-stone-700 line-through">
              Bugungi dars bekor qilindi
            </p>
            <p className="text-[11px] text-stone-500 mt-0.5">
              Bekor qilingan darslar davomat va to'lov hisobiga kirmaydi.
            </p>
          </div>
        </div>
      ) : (
        /* State 3: Lesson Held -> Show Attendance List (Expanded or Collapsed) */
        <div className="space-y-4">
          {!isAttendanceExpanded ? (
            /* Collapsed State Summary Card */
            <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-xl p-4 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div className="flex items-center gap-3">
                <div className="w-8 h-8 rounded-lg bg-emerald-600 text-white flex items-center justify-center font-bold shrink-0 shadow-2xs">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <div>
                  <h4 className="text-xs font-bold text-emerald-950">
                    Bugungi dars o'tkazildi
                  </h4>
                  <p className="text-[11px] text-emerald-800 font-medium mt-0.5">
                    {presentCount} ta keldi, {absentCount} ta kelmadi
                    {unmarkedCount > 0 && `, ${unmarkedCount} ta belgilanmagan`}
                  </p>
                </div>
              </div>

              <button
                onClick={handleExpand}
                className="inline-flex items-center gap-1.5 px-3.5 py-2 bg-white border border-emerald-300 hover:bg-emerald-100 text-emerald-800 font-semibold text-xs rounded-xl transition-all shadow-2xs self-start sm:self-auto"
              >
                <Pencil className="w-3.5 h-3.5" />
                <span>Davomatni tahrirlash</span>
                <ChevronDown className="w-3.5 h-3.5" />
              </button>
            </div>
          ) : (
            /* Expanded Attendance List with Save & Close button */
            <>
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2 text-xs text-emerald-800 font-semibold bg-emerald-50 border border-emerald-200/80 px-3 py-1.5 rounded-xl">
                  <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                  <span>Bugungi dars o'tkazildi deb belgilangan</span>
                </div>
              </div>

              <AttendanceList
                lessonId={lesson.id}
                groupId={groupId}
                onClose={handleCollapse}
              />
            </>
          )}
        </div>
      )}
    </div>
  );
};
