import React from 'react';
import { Clock, AlertTriangle, Send } from 'lucide-react';
import { PAYMENT_TELEGRAM_URL } from '../../constants/payment';

interface TrialBannerProps {
  daysLeft: number;
}

export const TrialBanner: React.FC<TrialBannerProps> = ({ daysLeft }) => {
  const isUrgent = daysLeft <= 2;

  if (isUrgent) {
    return (
      <div className="w-full rounded-2xl border border-amber-300/60 bg-gradient-to-r from-amber-50 via-amber-50 to-orange-50 px-4 py-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <div className="w-8 h-8 rounded-xl bg-amber-100 border border-amber-200 flex items-center justify-center shrink-0">
              <AlertTriangle className="w-4 h-4 text-amber-600" />
            </div>
            <div className="min-w-0">
              <p className="text-xs font-semibold text-amber-800 leading-tight">
                Sinov muddati tugayapti:{' '}
                <span className="text-amber-700 font-bold">
                  {daysLeft === 0 ? 'Bugun tugaydi' : `${daysLeft} kun qoldi`}
                </span>
              </p>
              <p className="text-xs text-amber-700/80 mt-0.5 leading-snug">
                Obunani davom ettirish uchun bog'laning
              </p>
            </div>
          </div>

          <a
            href={PAYMENT_TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold bg-amber-500 text-white hover:bg-amber-400 transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-sm shrink-0 self-start sm:self-auto"
          >
            <Send className="w-3.5 h-3.5" />
            <span>To'lov haqida</span>
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full rounded-2xl border border-teal-200/70 bg-teal-50/60 px-4 py-3 shadow-sm animate-in fade-in slide-in-from-top-2 duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 rounded-xl bg-teal-100 border border-teal-200 flex items-center justify-center shrink-0">
          <Clock className="w-4 h-4 text-teal-600" />
        </div>
        <p className="text-xs text-teal-700 font-medium leading-snug">
          <span className="font-semibold text-teal-800">Bepul sinov:</span>{' '}
          <span className="font-bold text-teal-700">{daysLeft} kun qoldi</span>
        </p>
      </div>
    </div>
  );
};
