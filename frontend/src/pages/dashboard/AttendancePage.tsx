import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  CalendarCheck,
  FolderKanban,
  Clock,
  CalendarDays,
  Loader2,
  CheckCircle2,
  AlertCircle,
} from 'lucide-react';
import { groupsApi } from '../../api/groups';
import type { DayOfWeek } from '../../types/groups.types';
import { TodayLessonCard } from '../../components/attendance/TodayLessonCard';
import { AttendanceSummary } from '../../components/attendance/AttendanceSummary';

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

const DAY_LABELS: Record<DayOfWeek, string> = {
  monday: 'Dush',
  tuesday: 'Sesh',
  wednesday: 'Chor',
  thursday: 'Pay',
  friday: 'Juma',
  saturday: 'Shan',
  sunday: 'Yak',
};

function formatUzbekDate(date: Date = new Date()): string {
  const day = date.getDate();
  const month = UZ_MONTHS[date.getMonth()];
  const year = date.getFullYear();
  const weekday = UZ_WEEKDAYS[date.getDay()];
  return `${day}-${month}, ${year}-yil (${weekday})`;
}

export const AttendancePage: React.FC = () => {
  const [selectedGroupId, setSelectedGroupId] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<'today' | 'summary'>('today');

  // Fetch all groups for this tutor
  const {
    data: groups = [],
    isLoading,
    isError,
  } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getGroups,
  });

  // Select first group by default when data loads
  const currentGroupId = selectedGroupId || (groups.length > 0 ? groups[0].id : null);
  const selectedGroup = groups.find((g) => g.id === currentGroupId);

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

  const isTodayScheduled = (groupDays?: DayOfWeek[]) => {
    if (!groupDays) return false;
    return groupDays.includes(getTodayDayOfWeek());
  };

  const formatDays = (days?: DayOfWeek[]) => {
    if (!days || days.length === 0) return 'Belgilanmagan';
    return days.map((d) => DAY_LABELS[d] || d).join(', ');
  };

  return (
    <div className="space-y-6 pb-12">
      {/* Page Title & Date Banner */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200/80 rounded-2xl p-6 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <CalendarCheck className="w-6 h-6 text-[#0F766E]" />
            <span>Davomat Boshqaruvi</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            Barcha guruhlaringiz bo'yicha kunlik va oylik davomat ko'rsatkichlari
          </p>
        </div>

        <div className="bg-[#0F766E]/10 border border-[#0F766E]/20 text-[#0F766E] font-semibold text-xs px-3.5 py-2 rounded-xl flex items-center gap-2 self-start sm:self-auto">
          <CalendarDays className="w-4 h-4" />
          <span>{formatUzbekDate()}</span>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-stone-400">
          <Loader2 className="w-7 h-7 animate-spin text-[#0F766E] mb-2" />
          <p className="text-xs font-medium">Guruhlar yuklanmoqda...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 text-xs">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
          <p className="font-semibold">Guruhlarni yuklashda xatolik yuz berdi</p>
        </div>
      ) : groups.length === 0 ? (
        /* Empty Groups State */
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mb-3">
            <FolderKanban className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-stone-900 mb-1">
            Hali guruhlar yaratilmagan
          </h3>
          <p className="text-xs text-stone-500 max-w-xs mb-4">
            Davomatni belgilash uchun avval "Guruhlar" bo'limida yangi guruh yarating.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* Group Selector Cards Bar */}
          <div>
            <h2 className="text-xs font-bold text-stone-500 uppercase tracking-wider mb-3">
              Guruhni Tanlang:
            </h2>

            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
              {groups.map((group) => {
                const isSelected = group.id === currentGroupId;
                const todayScheduled = isTodayScheduled(group.days as DayOfWeek[]);

                return (
                  <div
                    key={group.id}
                    onClick={() => setSelectedGroupId(group.id)}
                    className={`p-4 rounded-2xl border transition-all cursor-pointer relative overflow-hidden ${
                      isSelected
                        ? 'bg-white border-[#0F766E] shadow-sm ring-2 ring-[#0F766E]/20'
                        : 'bg-white border-stone-200/80 hover:border-stone-300 hover:bg-stone-50/50'
                    }`}
                  >
                    <div className="flex items-start justify-between gap-2 mb-2">
                      <h3 className="font-bold text-sm text-stone-900 truncate">
                        {group.name}
                      </h3>
                      {todayScheduled ? (
                        <span className="text-[10px] font-semibold bg-emerald-50 text-emerald-700 px-2 py-0.5 rounded border border-emerald-200 shrink-0">
                          Bugun dars kuni
                        </span>
                      ) : (
                        <span className="text-[10px] font-medium bg-stone-100 text-stone-500 px-2 py-0.5 rounded shrink-0">
                          Bugun dars yo'q
                        </span>
                      )}
                    </div>

                    <div className="flex items-center gap-3 text-xs text-stone-500 font-medium">
                      <span className="flex items-center gap-1">
                        <Clock className="w-3.5 h-3.5 text-[#0F766E]" />
                        {group.time}
                      </span>
                      <span>•</span>
                      <span>{formatDays(group.days as DayOfWeek[])}</span>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>

          {/* Selected Group Attendance Management Workspace */}
          {selectedGroup && (
            <div className="space-y-6">
              {/* Tab Navigation for Selected Group */}
              <div className="flex items-center justify-between border-b border-stone-200/80 pb-1">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setActiveTab('today')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                      activeTab === 'today'
                        ? 'border-[#0F766E] text-[#0F766E]'
                        : 'border-transparent text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <CheckCircle2 className="w-4 h-4" />
                    <span>Bugungi Davomat</span>
                  </button>

                  <button
                    onClick={() => setActiveTab('summary')}
                    className={`flex items-center gap-2 px-4 py-2 text-xs font-bold border-b-2 transition-all ${
                      activeTab === 'summary'
                        ? 'border-[#0F766E] text-[#0F766E]'
                        : 'border-transparent text-stone-500 hover:text-stone-900'
                    }`}
                  >
                    <CalendarCheck className="w-4 h-4" />
                    <span>Oylik Davomat Hisoboti</span>
                  </button>
                </div>

                <span className="text-xs font-semibold text-stone-600 hidden sm:inline-block">
                  Tanlangan: <strong className="text-stone-900">{selectedGroup.name}</strong>
                </span>
              </div>

              {/* Tab 1: Today's Attendance */}
              {activeTab === 'today' ? (
                <div>
                  {isTodayScheduled(selectedGroup.days as DayOfWeek[]) ? (
                    <TodayLessonCard
                      groupId={selectedGroup.id}
                      groupDays={(selectedGroup.days as DayOfWeek[]) || []}
                    />
                  ) : (
                    <div className="bg-white border border-stone-200/80 rounded-2xl p-8 text-center space-y-2">
                      <div className="w-12 h-12 rounded-2xl bg-stone-100 text-stone-400 flex items-center justify-center mx-auto mb-2">
                        <Clock className="w-6 h-6" />
                      </div>
                      <h4 className="text-sm font-bold text-stone-900">
                        Bugun "{selectedGroup.name}" guruhida dars kuni emas
                      </h4>
                      <p className="text-xs text-stone-500 max-w-sm mx-auto">
                        Ushbu guruh dars jadvali: <strong>{formatDays(selectedGroup.days as DayOfWeek[])}</strong> ({selectedGroup.time}). Oylik hisobotni ko'rish uchun "Oylik Davomat Hisoboti" tabiga o'ting.
                      </p>
                    </div>
                  )}
                </div>
              ) : (
                /* Tab 2: Attendance Summary Report */
                <AttendanceSummary
                  groupId={selectedGroup.id}
                  paymentType={selectedGroup.paymentType as any}
                  lessonsPerCycle={selectedGroup.lessonsPerCycle}
                />
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
