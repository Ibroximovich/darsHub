import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Banknote,
  Loader2,
  AlertCircle,
  CheckCircle2,
  Clock,
  Phone,
} from 'lucide-react';
import { paymentsApi, type GroupPaymentItem } from '../../api/payments';
import toast from 'react-hot-toast';

interface GroupPaymentsListProps {
  groupId: string;
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

function formatAmount(amount: number): string {
  return amount.toLocaleString('uz-UZ').replace(/,/g, ' ') + " so'm";
}

function formatPeriodLabel(periodStr?: string): string {
  if (!periodStr) return '';
  if (/^\d{4}-\d{2}$/.test(periodStr)) {
    const [year, month] = periodStr.split('-').map(Number);
    if (month >= 1 && month <= 12) {
      return `${UZ_MONTHS[month - 1]}, ${year}`;
    }
  }
  if (periodStr.startsWith('cycle-')) {
    const cycleNum = periodStr.replace('cycle-', '');
    return `${cycleNum}-sikl`;
  }
  return periodStr;
}

export const GroupPaymentsList: React.FC<GroupPaymentsListProps> = ({
  groupId,
}) => {
  const queryClient = useQueryClient();

  const {
    data: payments = [],
    isLoading,
    isError,
    refetch,
  } = useQuery({
    queryKey: ['groupPayments', groupId],
    queryFn: () => paymentsApi.getGroupPayments(groupId),
    enabled: Boolean(groupId),
  });

  const toggleMutation = useMutation({
    mutationFn: ({
      paymentId,
      status,
    }: {
      paymentId: string;
      status: 'paid' | 'unpaid';
    }) => paymentsApi.updatePaymentStatus(paymentId, status),
    onMutate: async ({ paymentId, status }) => {
      await queryClient.cancelQueries({
        queryKey: ['groupPayments', groupId],
      });

      const previous = queryClient.getQueryData<GroupPaymentItem[]>([
        'groupPayments',
        groupId,
      ]);

      if (previous) {
        queryClient.setQueryData<GroupPaymentItem[]>(
          ['groupPayments', groupId],
          previous.map((p) =>
            p.paymentId === paymentId
              ? {
                  ...p,
                  status,
                  paidAt: status === 'paid' ? new Date().toISOString() : null,
                }
              : p
          )
        );
      }

      return { previous };
    },
    onError: (_err, _vars, context) => {
      if (context?.previous) {
        queryClient.setQueryData(
          ['groupPayments', groupId],
          context.previous
        );
      }
      toast.error("To'lov holatini o'zgartirishda xatolik");
    },
    onSettled: () => {
      queryClient.invalidateQueries({ queryKey: ['groupPayments', groupId] });
      queryClient.invalidateQueries({ queryKey: ['paymentsSummary'] });
    },
  });

  const handleToggle = (item: GroupPaymentItem) => {
    const newStatus = item.status === 'paid' ? 'unpaid' : 'paid';
    toggleMutation.mutate({ paymentId: item.paymentId, status: newStatus });
  };

  const paidCount = payments.filter((p) => p.status === 'paid').length;
  const unpaidCount = payments.filter((p) => p.status === 'unpaid').length;

  if (isLoading) {
    return (
      <div className="py-12 flex flex-col items-center justify-center text-stone-400">
        <Loader2 className="w-6 h-6 animate-spin text-[#0F766E] mb-2" />
        <p className="text-xs font-medium">To'lovlar yuklanmoqda...</p>
      </div>
    );
  }

  if (isError) {
    return (
      <div className="bg-red-50 border border-red-200 rounded-xl p-4 text-center text-red-700 text-xs">
        <AlertCircle className="w-6 h-6 mx-auto mb-2 text-red-500" />
        <p className="font-semibold mb-2">To'lovlarni yuklashda xatolik</p>
        <button
          onClick={() => refetch()}
          className="px-3 py-1.5 bg-red-600 text-white rounded-lg font-semibold hover:bg-red-700 transition-colors"
        >
          Qayta urinish
        </button>
      </div>
    );
  }

  if (payments.length === 0) {
    return (
      <div className="py-12 text-center flex flex-col items-center justify-center">
        <div className="w-14 h-14 rounded-2xl bg-[#0F766E]/10 text-[#0F766E] flex items-center justify-center mb-3">
          <Banknote className="w-7 h-7" />
        </div>
        <h4 className="text-base font-bold text-stone-900 mb-1">
          Guruhda hali o'quvchi yo'q
        </h4>
        <p className="text-xs text-stone-500 max-w-xs">
          To'lov ma'lumotlarini ko'rish uchun guruhga o'quvchi qo'shing.
        </p>
      </div>
    );
  }

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl p-5 shadow-xs space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-3 border-b border-stone-100">
        <div>
          <h3 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <Banknote className="w-5 h-5 text-[#0F766E]" />
            <span>Guruh To'lovlari</span>
          </h3>
          <p className="text-xs text-stone-500 font-medium mt-0.5">
            Davr: <strong className="text-stone-700">{formatPeriodLabel(payments[0]?.period)}</strong>
          </p>
        </div>

        <div className="flex items-center gap-2 text-[11px]">
          <span className="inline-flex items-center gap-1 font-semibold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200/60">
            <CheckCircle2 className="w-3 h-3" /> {paidCount} to'langan
          </span>
          <span className="inline-flex items-center gap-1 font-semibold text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200/60">
            <Clock className="w-3 h-3" /> {unpaidCount} to'lanmagan
          </span>
        </div>
      </div>

      {/* Payments Table */}
      <div className="overflow-x-auto">
        <table className="w-full text-left border-collapse text-xs">
          <thead>
            <tr className="border-b border-stone-200 text-[11px] font-bold text-stone-500 uppercase tracking-wider bg-stone-50/60">
              <th className="py-3 px-4 rounded-l-lg">O'quvchi (F.I.SH)</th>
              <th className="py-3 px-4">Telefon</th>
              <th className="py-3 px-4 text-right">Summa</th>
              <th className="py-3 px-4 text-right rounded-r-lg">Holat</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-stone-100">
            {payments.map((item) => {
              const isPaid = item.status === 'paid';
              const isUpdating =
                toggleMutation.isPending &&
                toggleMutation.variables?.paymentId === item.paymentId;

              return (
                <tr key={item.paymentId} className="hover:bg-stone-50/50">
                  <td className="py-3 px-4">
                    <p className="font-bold text-stone-900">
                      {item.firstName} {item.lastName}
                    </p>
                  </td>

                  <td className="py-3 px-4">
                    <a
                      href={`tel:${item.phone}`}
                      className="inline-flex items-center gap-1 text-stone-600 hover:text-[#0F766E] font-medium transition-colors"
                    >
                      <Phone className="w-3 h-3" />
                      <span>{item.phone}</span>
                    </a>
                  </td>

                  <td className="py-3 px-4 text-right font-bold text-stone-900 tabular-nums">
                    {formatAmount(item.amount)}
                  </td>

                  <td className="py-3 px-4 text-right">
                    <button
                      onClick={() => handleToggle(item)}
                      disabled={isUpdating}
                      className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-bold transition-all active:scale-95 ${
                        isPaid
                          ? 'bg-emerald-600 text-white shadow-2xs ring-2 ring-emerald-600/20 hover:bg-emerald-700'
                          : 'bg-amber-50 text-amber-800 border border-amber-300 hover:bg-amber-100'
                      }`}
                    >
                      {isUpdating ? (
                        <Loader2 className="w-3.5 h-3.5 animate-spin" />
                      ) : isPaid ? (
                        <CheckCircle2 className="w-3.5 h-3.5" />
                      ) : (
                        <Clock className="w-3.5 h-3.5" />
                      )}
                      <span>{isPaid ? "To'landi" : "To'lanmadi"}</span>
                    </button>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
};
