import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  ChevronLeft,
  ChevronRight,
  Calendar,
  Loader2,
  AlertCircle,
  CreditCard,
  CheckCircle2,
  XCircle,
  Minus,
} from 'lucide-react';
import { attendanceApi } from '../../api/attendance';
import type { PaymentType } from '../../types/groups.types';
import type { AttendanceSummaryResponse } from '../../types/attendance.types';

interface AttendanceSummaryProps {
  groupId: string;
  paymentType?: PaymentType;
  lessonsPerCycle?: number | null;
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

function formatDayHeader(dateStr: string): string {
  try {
    const parts = dateStr.split('-');
    const day = parseInt(parts[2], 10);
    const month = parseInt(parts[1], 10);
    const monthName = UZ_MONTHS[month - 1]?.slice(0, 3) || '';
    return `${day}-${monthName}`;
  } catch {
    return dateStr;
  }
}

export const AttendanceSummary: React.FC<AttendanceSummaryProps> = ({
  groupId,
  paymentType,
  lessonsPerCycle,
}) => {
  // Current month YYYY-MM
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  // Navigate months
  const handlePrevMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month - 2, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${y}-${m}`);
  };

  const handleNextMonth = () => {
    const [year, month] = selectedMonth.split('-').map(Number);
    const d = new Date(year, month, 1);
    const y = d.getFullYear();
    const m = String(d.getMonth() + 1).padStart(2, '0');
    setSelectedMonth(`${y}-${m}`);
  };

  const formatMonthLabel = (monthStr: string) => {
    try {
      const [year, month] = monthStr.split('-').map(Number);
      if (month >= 1 && month <= 12) {
        return `${UZ_MONTHS[month - 1]}, ${year}`;
      }
      return monthStr;
    } catch {
      return monthStr;
    }
  };

  // Fetch summary query
  const {
    data: summaryData = { lessons: [], students: [] } as AttendanceSummaryResponse,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['attendanceSummary', groupId, selectedMonth],
    queryFn: () => attendanceApi.getAttendanceSummary(groupId, selectedMonth),
    enabled: Boolean(groupId),
  });

  const { lessons = [], students = [] } = summaryData;
  const maxCycleLessons = lessonsPerCycle || 12;

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Summary Header & Month Selector */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-3 border-b border-stone-100">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Calendar className="w-5 h-5 text-[#0F766E]" />
            <span>Davomat Hisoboti</span>
          </h3>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            O'quvchilarning kunlar bo'yicha darslarga qatnashishi jadvali
          </p>
        </div>

        {/* Month Navigation Control */}
        <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-xl border border-stone-200/80 self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
            title="O'tgan oy"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-stone-800 capitalize min-w-[110px] text-center">
            {formatMonthLabel(selectedMonth)}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
            title="Keyingi oy"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-12 flex flex-col items-center justify-center text-stone-400">
          <Loader2 className="w-6 h-6 animate-spin text-[#0F766E] mb-2" />
          <p className="text-xs font-medium">Hisobot yuklanmoqda...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-700 text-xs">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
          <p className="font-semibold mb-2">Hisobotni yuklashda xatolik</p>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      ) : students.length === 0 ? (
        <div className="py-12 text-center text-stone-500 text-xs">
          Ushbu oy uchun darslar va davomat ma'lumotlari topilmadi.
        </div>
      ) : (
        /* Summary Matrix Table */
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse text-xs">
            <thead>
              <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider bg-stone-50/60">
                <th className="py-3 px-4 rounded-l-lg whitespace-nowrap min-w-[140px] sticky left-0 bg-stone-50 z-10 border-r border-stone-200/40">
                  O'quvchi (F.I.SH)
                </th>

                {/* Real-time Lesson Date Columns */}
                {lessons.map((l) => (
                  <th
                    key={l.id}
                    className="py-3 px-2 text-center whitespace-nowrap min-w-[50px] border-r border-stone-200/30 text-stone-700 font-bold"
                    title={l.date}
                  >
                    {formatDayHeader(l.date)}
                  </th>
                ))}

                <th className="py-3 px-3 text-center whitespace-nowrap">Jami</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Kelgan</th>
                <th className="py-3 px-3 text-center whitespace-nowrap">Kelmagan</th>
                {paymentType === 'lesson_based' && (
                  <th className="py-3 px-4 min-w-[150px]">Tsikl Progress</th>
                )}
                <th className="py-3 px-4 text-right rounded-r-lg whitespace-nowrap">Holat</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100">
              {students.map((item) => {
                const percent =
                  item.totalLessons > 0
                    ? Math.round((item.present / item.totalLessons) * 100)
                    : 0;

                return (
                  <tr key={item.groupStudentId} className="hover:bg-stone-50/50">
                    <td className="py-3 px-4 font-bold text-stone-900 sticky left-0 bg-white z-10 border-r border-stone-200/40 shadow-2xs">
                      {item.firstName} {item.lastName}
                    </td>

                    {/* Render Real-Time Attendance for Each Lesson Date */}
                    {lessons.map((l) => {
                      const present = item.attendanceMap?.[l.id];

                      return (
                        <td
                          key={l.id}
                          className="py-3 px-2 text-center border-r border-stone-200/30"
                        >
                          {present === true ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-emerald-100 text-emerald-700 font-bold text-[11px] mx-auto shadow-2xs">
                              ✓
                            </span>
                          ) : present === false ? (
                            <span className="inline-flex items-center justify-center w-6 h-6 rounded-md bg-red-100 text-red-700 font-bold text-[11px] mx-auto shadow-2xs">
                              ✕
                            </span>
                          ) : (
                            <span className="inline-flex items-center justify-center w-6 h-6 text-stone-300 mx-auto">
                              <Minus className="w-3 h-3" />
                            </span>
                          )}
                        </td>
                      );
                    })}

                    <td className="py-3 px-3 text-center font-semibold text-stone-700">
                      {item.totalLessons} ta
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-emerald-700">
                      <span className="inline-flex items-center gap-1 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
                        <CheckCircle2 className="w-3 h-3 text-emerald-600" />
                        {item.present}
                      </span>
                    </td>

                    <td className="py-3 px-3 text-center font-bold text-red-700">
                      <span className="inline-flex items-center gap-1 bg-red-50 px-2 py-0.5 rounded border border-red-200/60">
                        <XCircle className="w-3 h-3 text-red-500" />
                        {item.absent}
                      </span>
                    </td>

                    {paymentType === 'lesson_based' && (
                      <td className="py-3 px-4">
                        <div className="space-y-1 max-w-[160px]">
                          <div className="flex justify-between text-[10px] font-semibold text-stone-600">
                            <span>{item.totalLessons} / {maxCycleLessons} dars</span>
                            <span>
                              {Math.min(
                                100,
                                Math.round((item.totalLessons / maxCycleLessons) * 100)
                              )}
                              %
                            </span>
                          </div>
                          <div className="w-full bg-stone-100 rounded-full h-2 overflow-hidden border border-stone-200/60">
                            <div
                              className={`h-full rounded-full transition-all ${
                                item.cycleCompleted
                                  ? 'bg-amber-500'
                                  : 'bg-[#0F766E]'
                              }`}
                              style={{
                                width: `${Math.min(
                                  100,
                                  (item.totalLessons / maxCycleLessons) * 100
                                )}%`,
                              }}
                            />
                          </div>
                        </div>
                      </td>
                    )}

                    <td className="py-3 px-4 text-right whitespace-nowrap">
                      {item.cycleCompleted ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-amber-50 text-amber-800 border border-amber-300 shadow-2xs">
                          <CreditCard className="w-3.5 h-3.5 text-amber-600" />
                          <span>To'lov vaqti keldi</span>
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded text-[11px] font-medium text-stone-600 bg-stone-100">
                          {percent}% davomat
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};
