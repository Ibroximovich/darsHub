import React, { useState } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CheckCircle, Loader2, X } from 'lucide-react';
import { adminSubscriptionApi } from '../../api/admin';
import toast from 'react-hot-toast';

interface ActivateSubscriptionModalProps {
  userId: string;
  userName: string;
  onClose: () => void;
}

const MONTH_OPTIONS = [1, 3, 6, 12] as const;

export const ActivateSubscriptionModal: React.FC<ActivateSubscriptionModalProps> = ({
  userId,
  userName,
  onClose,
}) => {
  const [selectedMonths, setSelectedMonths] = useState<number>(1);
  const queryClient = useQueryClient();

  const { mutate, isPending } = useMutation({
    mutationFn: () => adminSubscriptionApi.activateUser(userId, selectedMonths),
    onSuccess: () => {
      toast.success(`${userName} uchun ${selectedMonths} oylik obuna faollashtirildi`);
      queryClient.invalidateQueries({ queryKey: ['admin'] });
      onClose();
    },
    onError: () => {
      toast.error('Faollashtrishda xatolik yuz berdi');
    },
  });

  return (
    <div className="fixed inset-0 z-50 flex items-end sm:items-center justify-center p-4 bg-black/40 backdrop-blur-sm animate-in fade-in duration-200">
      <div className="w-full max-w-sm bg-white rounded-3xl shadow-2xl animate-in slide-in-from-bottom-4 sm:slide-in-from-bottom-0 duration-200">
        {/* Header */}
        <div className="flex items-center justify-between px-6 pt-6 pb-4 border-b border-stone-100">
          <div>
            <h3 className="font-bold text-stone-900 text-sm">Obunani faollashtirish</h3>
            <p className="text-xs text-stone-500 mt-0.5 truncate max-w-[220px]">{userName}</p>
          </div>
          <button
            onClick={onClose}
            className="p-2 rounded-xl hover:bg-stone-100 text-stone-400 hover:text-stone-600 transition-colors"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        <div className="px-6 py-5 space-y-4">
          {/* Month selector */}
          <div>
            <p className="text-xs font-semibold text-stone-600 mb-3 uppercase tracking-wide">
              Necha oyga?
            </p>
            <div className="grid grid-cols-4 gap-2">
              {MONTH_OPTIONS.map((m) => (
                <button
                  key={m}
                  onClick={() => setSelectedMonths(m)}
                  className={`py-2.5 rounded-xl text-sm font-bold transition-all ${
                    selectedMonths === m
                      ? 'bg-[#0F766E] text-white shadow-sm shadow-teal-200'
                      : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                  }`}
                >
                  {m} oy
                </button>
              ))}
            </div>
          </div>

          {/* Summary */}
          <div className="rounded-2xl bg-teal-50 border border-teal-100 px-4 py-3.5 text-xs text-teal-800">
            <span className="font-semibold">{selectedMonths} oylik</span> obuna faollashtiriladi.
            <br />
            Agar avvalgi obuna muddati tugamagan bo'lsa, ustiga qo'shiladi.
          </div>

          {/* Actions */}
          <div className="flex gap-2.5 pt-1">
            <button
              onClick={onClose}
              className="flex-1 py-3 rounded-2xl border border-stone-200 text-sm font-semibold text-stone-600 hover:bg-stone-50 transition-colors"
            >
              Bekor
            </button>
            <button
              onClick={() => mutate()}
              disabled={isPending}
              className="flex-1 py-3 rounded-2xl bg-[#0F766E] text-white text-sm font-bold hover:bg-teal-600 transition-all disabled:opacity-60 flex items-center justify-center gap-2"
            >
              {isPending ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <CheckCircle className="w-4 h-4" />
              )}
              Faollashtirish
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
