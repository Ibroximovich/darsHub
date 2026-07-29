import React, { useState } from 'react';
import { useQuery } from '@tanstack/react-query';
import {
  Wallet,
  CheckCircle2,
  AlertTriangle,
  Loader2,
  AlertCircle,
  ChevronLeft,
  ChevronRight,
  CalendarDays,
  FolderKanban,
  Phone,
  Users,
} from 'lucide-react';
import { paymentsApi, type PaymentsSummary } from '../../api/payments';
import { PaymentStatCard } from '../../components/payments/PaymentStatCard';

const UZ_MONTHS = [
  'Yanvar', 'Fevral', 'Mart', 'Aprel', 'May', 'Iyun',
  'Iyul', 'Avgust', 'Sentabr', 'Oktabr', 'Noyabr', 'Dekabr',
];

function formatAmount(amount: number): string {
  return amount.toLocaleString('uz-UZ').replace(/,/g, ' ') + " so'm";
}

export const PaymentsPage: React.FC = () => {
  const [selectedMonth, setSelectedMonth] = useState<string>(() => {
    const now = new Date();
    const year = now.getFullYear();
    const month = String(now.getMonth() + 1).padStart(2, '0');
    return `${year}-${month}`;
  });

  const [activeTab, setActiveTab] = useState<'unpaid' | 'paid'>('unpaid');

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

  const formatMonthLabel = (monthStr: string): string => {
    try {
      const [year, month] = monthStr.split('-').map(Number);
      return `${UZ_MONTHS[month - 1]} ${year}`;
    } catch {
      return monthStr;
    }
  };

  const {
    data: summary,
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['paymentsSummary', selectedMonth],
    queryFn: () => paymentsApi.getPaymentsSummary(selectedMonth),
  });

  return (
    <div className="space-y-6 pb-12">
      {/* Page Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 bg-white border border-stone-200/80 rounded-2xl p-6 shadow-2xs">
        <div>
          <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
            <Wallet className="w-6 h-6 text-[#0F766E]" />
            <span>To'lovlar Boshqaruvi</span>
          </h1>
          <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
            Barcha guruhlaringiz bo'yicha to'lov holati va statistikasi
          </p>
        </div>

        {/* Month Selector */}
        <div className="flex items-center gap-2 bg-stone-50 p-1.5 rounded-xl border border-stone-200/80 self-start sm:self-auto">
          <button
            onClick={handlePrevMonth}
            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
          >
            <ChevronLeft className="w-4 h-4" />
          </button>
          <span className="text-xs font-bold text-stone-800 capitalize min-w-[110px] text-center">
            {formatMonthLabel(selectedMonth)}
          </span>
          <button
            onClick={handleNextMonth}
            className="p-1 text-stone-500 hover:text-stone-900 hover:bg-stone-200/60 rounded-lg transition-colors"
          >
            <ChevronRight className="w-4 h-4" />
          </button>
        </div>
      </div>

      {isLoading ? (
        <div className="py-16 flex flex-col items-center justify-center text-stone-400">
          <Loader2 className="w-7 h-7 animate-spin text-[#0F766E] mb-2" />
          <p className="text-xs font-medium">To'lov statistikasi yuklanmoqda...</p>
        </div>
      ) : isError ? (
        <div className="bg-red-50 border border-red-200 rounded-2xl p-6 text-center text-red-700 text-xs">
          <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
          <p className="font-semibold mb-2">Ma'lumotlarni yuklashda xatolik</p>
          <button
            onClick={() => refetch()}
            className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
          >
            Qayta urinish
          </button>
        </div>
      ) : !summary || (summary.paidStudents.length === 0 && summary.unpaidStudents.length === 0) ? (
        <div className="bg-white border border-stone-200 rounded-2xl p-12 text-center flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mb-3">
            <FolderKanban className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-stone-900 mb-1">
            Hali to'lov ma'lumotlari yo'q
          </h3>
          <p className="text-xs text-stone-500 max-w-xs">
            To'lov ma'lumotlarini ko'rish uchun avval guruhlar yaratib, o'quvchilarni qo'shing.
          </p>
        </div>
      ) : (
        <div className="space-y-6">
          {/* 3 Stat Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <PaymentStatCard
              icon={CalendarDays}
              label="Kutilayotgan summa"
              amount={summary.totalExpected}
              variant="neutral"
            />
            <PaymentStatCard
              icon={CheckCircle2}
              label="To'langan"
              amount={summary.totalPaid}
              variant="success"
            />
            <PaymentStatCard
              icon={AlertTriangle}
              label="To'lanmagan"
              amount={summary.totalUnpaid}
              variant="warning"
            />
          </div>

          {/* Tabs: Unpaid / Paid */}
          <div className="flex items-center gap-2 border-b border-stone-200/80 pt-2">
            <button
              onClick={() => setActiveTab('unpaid')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'unpaid'
                  ? 'border-amber-500 text-amber-700'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <AlertTriangle className="w-4 h-4" />
              <span>To'lamagan ({summary.unpaidStudents.length})</span>
            </button>

            <button
              onClick={() => setActiveTab('paid')}
              className={`flex items-center gap-2 px-4 py-2.5 text-xs font-bold border-b-2 transition-all ${
                activeTab === 'paid'
                  ? 'border-emerald-500 text-emerald-700'
                  : 'border-transparent text-stone-500 hover:text-stone-900'
              }`}
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>To'lagan ({summary.paidStudents.length})</span>
            </button>
          </div>

          {/* Tab Content: Unpaid Students */}
          {activeTab === 'unpaid' ? (
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
              {summary.unpaidStudents.length === 0 ? (
                <div className="py-10 text-center text-stone-500 text-xs flex flex-col items-center">
                  <CheckCircle2 className="w-8 h-8 text-emerald-500 mb-2" />
                  <p className="font-bold text-emerald-800 text-sm">
                    Barcha o'quvchilar to'lagan! 🎉
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider bg-stone-50/60">
                        <th className="py-3 px-4 rounded-l-lg">O'quvchi</th>
                        <th className="py-3 px-4">Guruh</th>
                        <th className="py-3 px-4 text-right">Summa</th>
                        <th className="py-3 px-4 text-right rounded-r-lg">Telefon</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {summary.unpaidStudents.map((st, idx) => (
                        <tr key={idx} className="hover:bg-amber-50/40">
                          <td className="py-3 px-4 font-bold text-stone-900">
                            {st.firstName} {st.lastName}
                          </td>
                          <td className="py-3 px-4 text-stone-600 font-medium">
                            {st.groupName}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-amber-800 tabular-nums">
                            {formatAmount(st.amount)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <a
                              href={`tel:${st.phone}`}
                              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-[#0F766E] hover:bg-[#0D625C] text-white font-semibold text-[11px] transition-all active:scale-95 shadow-2xs"
                            >
                              <Phone className="w-3.5 h-3.5" />
                              <span>Qo'ng'iroq</span>
                            </a>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          ) : (
            /* Tab Content: Paid Students */
            <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs">
              {summary.paidStudents.length === 0 ? (
                <div className="py-10 text-center text-stone-500 text-xs flex flex-col items-center">
                  <Users className="w-8 h-8 text-stone-400 mb-2" />
                  <p className="font-bold text-stone-600 text-sm">
                    Hali hech kim to'lamagan
                  </p>
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs">
                    <thead>
                      <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider bg-stone-50/60">
                        <th className="py-3 px-4 rounded-l-lg">O'quvchi</th>
                        <th className="py-3 px-4">Guruh</th>
                        <th className="py-3 px-4 text-right">Summa</th>
                        <th className="py-3 px-4 text-right rounded-r-lg">Holat</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-stone-100">
                      {summary.paidStudents.map((st, idx) => (
                        <tr key={idx} className="hover:bg-emerald-50/40">
                          <td className="py-3 px-4 font-bold text-stone-900">
                            {st.firstName} {st.lastName}
                          </td>
                          <td className="py-3 px-4 text-stone-600 font-medium">
                            {st.groupName}
                          </td>
                          <td className="py-3 px-4 text-right font-bold text-emerald-800 tabular-nums">
                            {formatAmount(st.amount)}
                          </td>
                          <td className="py-3 px-4 text-right">
                            <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-bold bg-emerald-50 text-emerald-800 border border-emerald-200">
                              <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                              To'landi
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
};
