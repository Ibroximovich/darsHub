import React, { useState } from 'react';
import { Lock, Send, Copy, Check, LogOut, Loader2 } from 'lucide-react';
import {
  PAYMENT_CARD_NUMBER,
  PAYMENT_CARD_NAME,
  PAYMENT_MONTHLY_PRICE,
  PAYMENT_TELEGRAM_URL,
} from '../../constants/payment';
import { authService } from '../../services/auth.service';
import { useSubscriptionStore } from '../../utils/subscription.store';
import { DarsHubLogo } from '../ui/DarsHubLogo';

export const Paywall: React.FC = () => {
  const [copied, setCopied] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const clearSubscriptionRequired = useSubscriptionStore(
    (s) => s.clearSubscriptionRequired
  );

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(PAYMENT_CARD_NUMBER.replace(/\s/g, ''));
      setCopied(true);
      setTimeout(() => setCopied(false), 2500);
    } catch {
      /* ignore */
    }
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await authService.logout();
      clearSubscriptionRequired();
      window.location.href = '/login';
    } catch {
      window.location.href = '/login';
    }
  };

  const priceFormatted = PAYMENT_MONTHLY_PRICE.toLocaleString('uz-UZ') + " so'm";

  return (
    <div className="fixed inset-0 z-[9999] flex flex-col items-center justify-center bg-[#FAFAF9] px-4">
      {/* Logo */}
      <div className="flex items-center gap-2.5 mb-8">
        <DarsHubLogo className="w-9 h-9 drop-shadow-sm" />
        <span className="font-bold text-stone-900 text-xl tracking-tight">DarsHub</span>
      </div>

      {/* Card */}
      <div className="w-full max-w-sm bg-white rounded-3xl border border-stone-200 shadow-lg overflow-hidden">
        {/* Header */}
        <div className="bg-gradient-to-br from-[#0F766E] to-teal-700 px-6 pt-7 pb-8 flex flex-col items-center text-center relative">
          <div className="w-14 h-14 rounded-2xl bg-white/15 border border-white/25 flex items-center justify-center mb-4 shadow-inner">
            <Lock className="w-7 h-7 text-white" />
          </div>
          <h1 className="text-lg font-bold text-white leading-tight">
            Bepul sinov muddati tugadi
          </h1>
          <p className="text-sm text-teal-100/90 mt-2 leading-relaxed max-w-xs">
            DarsHub'dan foydalanishni davom ettirish uchun oylik obunani faollashtiring
          </p>
        </div>

        {/* Payment info */}
        <div className="px-5 py-5 space-y-3.5">
          {/* Price */}
          <div className="flex items-center justify-between rounded-2xl bg-teal-50 border border-teal-100 px-4 py-3.5">
            <div className="flex items-center gap-2.5">
              <span className="text-lg">💰</span>
              <span className="text-sm font-medium text-stone-700">Oylik narx</span>
            </div>
            <span className="text-sm font-bold text-teal-700">{priceFormatted} / oy</span>
          </div>

          {/* Card number */}
          <div className="rounded-2xl bg-stone-50 border border-stone-200 px-4 py-3.5">
            <div className="flex items-center gap-2 mb-2.5">
              <span className="text-base">💳</span>
              <span className="text-xs font-semibold text-stone-600 uppercase tracking-wide">
                Karta raqami
              </span>
            </div>
            <div className="flex items-center justify-between gap-2">
              <div>
                <p className="text-base font-mono font-bold text-stone-900 tracking-widest leading-none">
                  {PAYMENT_CARD_NUMBER}
                </p>
                <p className="text-xs text-stone-500 mt-1">{PAYMENT_CARD_NAME} nomiga</p>
              </div>
              <button
                onClick={handleCopy}
                className="shrink-0 p-2 rounded-xl bg-white border border-stone-200 hover:border-teal-300 hover:bg-teal-50 transition-all text-stone-500 hover:text-teal-600"
                title="Nusxa olish"
              >
                {copied ? (
                  <Check className="w-4 h-4 text-teal-600" />
                ) : (
                  <Copy className="w-4 h-4" />
                )}
              </button>
            </div>
          </div>

          {/* Screenshot instruction */}
          <div className="rounded-2xl bg-amber-50 border border-amber-100 px-4 py-3.5">
            <div className="flex items-start gap-2.5">
              <span className="text-base shrink-0 mt-0.5">📸</span>
              <p className="text-xs text-amber-800 leading-relaxed">
                To'lovdan keyin chek skrinshotini quyidagi Telegram'ga yuboring
              </p>
            </div>
          </div>

          {/* Telegram button */}
          <a
            href={PAYMENT_TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center justify-center gap-2 w-full py-3.5 rounded-2xl bg-[#0F766E] text-white font-bold text-sm hover:bg-teal-600 transition-all transform hover:scale-[1.01] active:scale-[0.99] shadow-md shadow-teal-200"
          >
            <Send className="w-4 h-4" />
            <span>Telegram'da yozish</span>
          </a>
        </div>

        {/* Footer note */}
        <div className="px-5 pb-5">
          <p className="text-xs text-stone-400 text-center leading-relaxed">
            To'lov tasdiqlangach, hisobingiz avtomatik faollashadi
            <br />
            <span className="text-stone-500 font-medium">(odatda bir necha soat ichida)</span>
          </p>
        </div>
      </div>

      {/* Logout */}
      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="mt-6 flex items-center gap-1.5 text-xs text-stone-400 hover:text-stone-600 transition-colors disabled:opacity-50"
      >
        {loggingOut ? (
          <Loader2 className="w-3.5 h-3.5 animate-spin" />
        ) : (
          <LogOut className="w-3.5 h-3.5" />
        )}
        <span>Tizimdan chiqish</span>
      </button>
    </div>
  );
};
