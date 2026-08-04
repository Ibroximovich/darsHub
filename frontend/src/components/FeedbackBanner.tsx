import React, { useEffect, useState } from 'react';
import { Send, X, MessageSquareHeart } from 'lucide-react';
import { FEEDBACK_TELEGRAM_URL } from '../constants/links';

interface FeedbackBannerProps {
  storageKey: string;
  message: React.ReactNode;
  title?: string;
  buttonText?: string;
  variant?: 'teal' | 'amber' | 'blue';
  className?: string;
  onDismiss?: () => void;
}

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const FeedbackBanner: React.FC<FeedbackBannerProps> = ({
  storageKey,
  message,
  title,
  buttonText = "Telegram'da yozish",
  variant = 'teal',
  className = '',
  onDismiss,
}) => {
  const [isVisible, setIsVisible] = useState<boolean>(false);

  useEffect(() => {
    try {
      const dismissedAt = localStorage.getItem(storageKey);
      if (dismissedAt) {
        const timePassed = Date.now() - Number(dismissedAt);
        if (timePassed < SEVEN_DAYS_MS) {
          setIsVisible(false);
          return;
        }
      }
      setIsVisible(true);
    } catch {
      setIsVisible(true);
    }
  }, [storageKey]);

  const handleDismiss = () => {
    try {
      localStorage.setItem(storageKey, Date.now().toString());
    } catch (e) {
      console.error("Could not save to localStorage", e);
    }
    setIsVisible(false);
    onDismiss?.();
  };

  if (!isVisible) return null;

  const variantStyles = {
    teal: 'bg-gradient-to-r from-teal-900 via-[#0F766E] to-teal-800 text-white border-teal-700/60 shadow-md',
    amber: 'bg-gradient-to-r from-amber-900 via-amber-800 to-amber-900 text-amber-50 border-amber-700/60 shadow-md',
    blue: 'bg-gradient-to-r from-slate-900 via-blue-950 to-slate-900 text-slate-100 border-blue-800/60 shadow-md',
  };

  const buttonStyles = {
    teal: 'bg-amber-400 text-stone-950 hover:bg-amber-300 shadow-xs',
    amber: 'bg-amber-400 text-stone-950 hover:bg-amber-300 shadow-xs',
    blue: 'bg-[#0F766E] text-white hover:bg-teal-600 shadow-xs',
  };

  return (
    <div
      className={`relative w-full p-3.5 sm:p-4 rounded-2xl border transition-all duration-300 animate-in fade-in slide-in-from-top-3 ${variantStyles[variant]} ${className}`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 pr-8 sm:pr-0">
        <div className="flex items-start sm:items-center gap-3">
          <div className="w-9 h-9 rounded-xl bg-white/10 backdrop-blur-xs flex items-center justify-center shrink-0 border border-white/15">
            <MessageSquareHeart className="w-5 h-5 text-amber-300" />
          </div>
          <div>
            {title && (
              <h4 className="font-bold text-xs sm:text-sm tracking-tight text-white leading-tight">
                {title}
              </h4>
            )}
            <p className="text-xs text-stone-200/90 leading-relaxed mt-0.5">
              {message}
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2 self-end sm:self-auto shrink-0">
          <a
            href={FEEDBACK_TELEGRAM_URL}
            target="_blank"
            rel="noopener noreferrer"
            className={`flex items-center gap-1.5 px-3.5 py-1.5 rounded-xl text-xs font-bold transition-all transform hover:scale-[1.02] active:scale-[0.98] ${buttonStyles[variant]}`}
          >
            <Send className="w-3.5 h-3.5" />
            <span>{buttonText}</span>
          </a>

          <button
            onClick={handleDismiss}
            type="button"
            className="p-1.5 text-stone-300 hover:text-white hover:bg-white/10 rounded-lg transition-colors"
            title="Yashirish (7 kun qaytmaydi)"
          >
            <X className="w-4 h-4" />
          </button>
        </div>
      </div>
    </div>
  );
};
