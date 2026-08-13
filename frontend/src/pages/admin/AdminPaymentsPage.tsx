import React, { useState } from 'react';
import type { Pagination } from '../../types/admin.types';
import { useAdminPayments } from '../../hooks/useAdminQueries';
import {
  Search,
  Loader2,
  ChevronLeft,
  ChevronRight,
  CheckCircle2,
  XCircle,
  AlertCircle,
} from 'lucide-react';

export const AdminPaymentsPage: React.FC = () => {
  const [page, setPage] = useState<number>(1);
  const [search, setSearch] = useState<string>('');
  const [statusFilter, setStatusFilter] = useState<string>('all');

  const { data, isLoading, isError, refetch } = useAdminPayments(page, search, statusFilter);

  const payments = data?.data ?? [];
  const pagination: Pagination = data?.pagination ?? {
    total: 0,
    page: 1,
    limit: 10,
    totalPages: 1,
  };

  const handlePageChange = (newPage: number) => {
    if (newPage >= 1 && newPage <= pagination.totalPages) {
      setPage(newPage);
    }
  };

  const handleSearch = (val: string) => {
    setSearch(val);
    setPage(1);
  };

  const handleStatusFilter = (val: string) => {
    setStatusFilter(val);
    setPage(1);
  };

  const formatMoney = (amount: number) => {
    return new Intl.NumberFormat('uz-UZ').format(amount) + " so'm";
  };

  return (
    <div className="space-y-6">
      {/* Header & Controls */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900 tracking-tight">
            To'lovlar Boshqaruvi
          </h1>
          <p className="text-xs text-stone-500 font-medium mt-1">
            Tizimdagi barcha to'langan va kutilayotgan to'lovlar monitoringi
          </p>
        </div>

        <div className="flex flex-col sm:flex-row items-stretch sm:items-center gap-3">
          {/* Status Tabs */}
          <div className="flex bg-stone-200/70 p-1 rounded-xl text-xs font-semibold text-stone-600">
            <button
              onClick={() => handleStatusFilter('all')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'all'
                  ? 'bg-white text-stone-900 shadow-2xs'
                  : 'hover:text-stone-900'
              }`}
            >
              Barchasi
            </button>
            <button
              onClick={() => handleStatusFilter('paid')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'paid'
                  ? 'bg-white text-emerald-700 shadow-2xs font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              To'langan
            </button>
            <button
              onClick={() => handleStatusFilter('unpaid')}
              className={`px-3 py-1.5 rounded-lg transition-all ${
                statusFilter === 'unpaid'
                  ? 'bg-white text-amber-700 shadow-2xs font-bold'
                  : 'hover:text-stone-900'
              }`}
            >
              To'lanmagan
            </button>
          </div>

          {/* Search Input */}
          <div className="relative w-full sm:w-64">
            <Search className="w-4 h-4 absolute left-3 top-1/2 -translate-y-1/2 text-stone-400" />
            <input
              type="text"
              value={search}
              onChange={(e) => handleSearch(e.target.value)}
              placeholder="O'quvchi, guruh yoki davr..."
              className="w-full pl-9 pr-3 py-2 bg-white border border-stone-200 rounded-xl text-xs text-stone-900 placeholder:text-stone-400 focus:outline-none focus:ring-2 focus:ring-[#0F766E]/20 focus:border-[#0F766E] transition-all shadow-2xs"
            />
          </div>
        </div>
      </div>

      {/* Table Container */}
      <div className="bg-white border border-stone-200/80 rounded-2xl shadow-xs overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="bg-stone-50/70 border-b border-stone-200/80 text-[11px] font-bold text-stone-500 uppercase tracking-wider">
                <th className="py-3.5 px-4">O'quvchi</th>
                <th className="py-3.5 px-4">Guruh</th>
                <th className="py-3.5 px-4">Repetitor</th>
                <th className="py-3.5 px-4">Davr</th>
                <th className="py-3.5 px-4">Summa</th>
                <th className="py-3.5 px-4">Status</th>
                <th className="py-3.5 px-4 text-right">Sana</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-stone-100 text-xs text-stone-700">
              {isLoading ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400">
                    <div className="flex items-center justify-center gap-2">
                      <Loader2 className="w-5 h-5 animate-spin text-[#0F766E]" />
                      <span>Yuklanmoqda...</span>
                    </div>
                  </td>
                </tr>
              ) : isError ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center gap-2 text-red-500">
                      <AlertCircle className="w-6 h-6" />
                      <span className="text-xs font-semibold">Yuklashda xatolik</span>
                      <button
                        onClick={() => refetch()}
                        className="px-3 py-1.5 bg-red-600 text-white rounded-lg text-xs font-semibold hover:bg-red-700"
                      >
                        Qayta urinish
                      </button>
                    </div>
                  </td>
                </tr>
              ) : payments.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center text-stone-400 font-medium">
                    To'lovlar topilmadi
                  </td>
                </tr>
              ) : (
                payments.map((p) => {
                  const student = p.groupStudent?.student;
                  const group = p.groupStudent?.group;
                  const tutor = group?.user;

                  return (
                    <tr key={p.id} className="hover:bg-stone-50/50 transition-colors">
                      <td className="py-3 px-4">
                        <div className="font-semibold text-stone-900">
                          {student ? `${student.firstName} ${student.lastName}` : "Noma'lum o'quvchi"}
                        </div>
                        <div className="text-[11px] text-stone-500 font-mono">
                          {student?.phone}
                        </div>
                      </td>
                      <td className="py-3 px-4 font-medium text-stone-800">
                        {group?.name || '—'}
                      </td>
                      <td className="py-3 px-4">
                        <div className="font-medium text-stone-800">{tutor?.fullName || '—'}</div>
                        <div className="text-[11px] text-stone-500">{tutor?.email}</div>
                      </td>
                      <td className="py-3 px-4 font-mono font-medium text-stone-700 uppercase">
                        {p.period}
                      </td>
                      <td className="py-3 px-4 font-bold text-stone-900">
                        {formatMoney(p.amount)}
                      </td>
                      <td className="py-3 px-4">
                        {p.status === 'paid' ? (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-emerald-100 text-emerald-800 border border-emerald-200">
                            <CheckCircle2 className="w-3 h-3" />
                            <span>To'langan</span>
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-md text-[10px] font-bold bg-amber-100 text-amber-800 border border-amber-200">
                            <XCircle className="w-3 h-3" />
                            <span>Kutilmoqda</span>
                          </span>
                        )}
                      </td>
                      <td className="py-3 px-4 text-right text-[11px] text-stone-500">
                        {p.paidAt
                          ? new Date(p.paidAt).toLocaleDateString('uz-UZ')
                          : new Date(p.createdAt).toLocaleDateString('uz-UZ')}
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
    </div>
  );
};
