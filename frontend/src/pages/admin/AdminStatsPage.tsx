import React, { useEffect, useState } from 'react';
import { adminService } from '../../services/admin.service';
import type { AdminStats } from '../../types/admin.types';
import {
  Users,
  FolderKanban,
  GraduationCap,
  CreditCard,
  TrendingUp,
  Loader2,
  RefreshCw,
} from 'lucide-react';
import toast from 'react-hot-toast';

export const AdminStatsPage: React.FC = () => {
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [loading, setLoading] = useState<boolean>(true);

  const fetchStats = async () => {
    try {
      setLoading(true);
      const response = await adminService.getStats();
      if (response.success && response.data) {
        setStats(response.data);
      }
    } catch {
      toast.error("Statistika ma'lumotlarini yuklashda xatolik");
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-[400px]">
        <div className="flex items-center gap-2.5 text-[#0F766E] font-semibold text-xs">
          <Loader2 className="w-5 h-5 animate-spin" />
          <span>Statistika yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  const statCards = [
    {
      title: "Jami Foydalanuvchilar",
      value: stats?.totalUsers || 0,
      subtext: "Platformadagi repetitorlar",
      icon: Users,
      color: "bg-blue-50 text-blue-600 border-blue-100",
      accent: "text-blue-600",
    },
    {
      title: "Faol Guruhlar",
      value: stats?.activeGroups || 0,
      subtext: "Yaratilgan ta'lim guruhlari",
      icon: FolderKanban,
      color: "bg-teal-50 text-teal-600 border-teal-100",
      accent: "text-teal-600",
    },
    {
      title: "Jami O'quvchilar",
      value: stats?.totalStudents || 0,
      subtext: "Tizimga biriktirilgan o'quvchilar",
      icon: GraduationCap,
      color: "bg-purple-50 text-purple-600 border-purple-100",
      accent: "text-purple-600",
    },
    {
      title: "Shu Oygi To'lovlar Summasi",
      value: formatMoney(stats?.currentMonthRevenue || 0),
      subtext: "Joriy oyda to'langan mablag'lar",
      icon: CreditCard,
      color: "bg-emerald-50 text-emerald-600 border-emerald-100",
      accent: "text-emerald-600",
    },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            Tizim Statistikasi
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            DarsHub platformasining umumiy ko'rsatkichlari va tahlili
          </p>
        </div>

        <button
          onClick={fetchStats}
          disabled={loading}
          className="flex items-center gap-2 px-3.5 py-2 text-xs font-semibold text-stone-700 bg-white border border-stone-200 rounded-xl hover:bg-stone-50 transition-colors shadow-2xs self-start sm:self-auto"
        >
          <RefreshCw className={`w-3.5 h-3.5 ${loading ? 'animate-spin' : ''}`} />
          <span>Yangilash</span>
        </button>
      </div>

      {/* Stats Cards Grid */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
        {statCards.map((card, idx) => {
          const Icon = card.icon;
          return (
            <div
              key={idx}
              className="bg-white p-5 rounded-2xl border border-stone-200/80 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between"
            >
              <div className="flex items-center justify-between">
                <span className="text-xs font-semibold text-stone-500">
                  {card.title}
                </span>
                <div className={`p-2 rounded-xl border ${card.color}`}>
                  <Icon className="w-5 h-5" />
                </div>
              </div>

              <div className="mt-4">
                <div className="text-2xl font-bold text-stone-900 tracking-tight">
                  {card.value}
                </div>
                <p className="text-[11px] text-stone-400 font-medium mt-1">
                  {card.subtext}
                </p>
              </div>
            </div>
          );
        })}
      </div>

      {/* Additional Overview Box */}
      <div className="bg-gradient-to-br from-stone-900 via-stone-850 to-stone-900 text-white p-6 rounded-2xl shadow-md border border-stone-800 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-6">
        <div className="flex items-center gap-4">
          <div className="w-12 h-12 rounded-2xl bg-amber-500/10 border border-amber-500/20 text-amber-400 flex items-center justify-center shrink-0">
            <TrendingUp className="w-6 h-6" />
          </div>
          <div>
            <h3 className="text-base font-bold tracking-tight">
              Jami Tizim Tushumi
            </h3>
            <p className="text-xs text-stone-400 mt-1">
              Barcha davrlar mobaynida to'langan to'lovlar summasi
            </p>
          </div>
        </div>

        <div className="text-left sm:text-right">
          <div className="text-2xl font-black text-amber-400 tracking-tight">
            {formatMoney(stats?.totalRevenue || 0)}
          </div>
          <span className="text-[10px] font-semibold uppercase tracking-wider text-stone-400 bg-stone-800 px-2 py-0.5 rounded border border-stone-700 mt-1 inline-block">
            Muvaffaqiyatli to'lovlar
          </span>
        </div>
      </div>
    </div>
  );
};
