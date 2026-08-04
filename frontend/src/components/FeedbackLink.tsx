import React from 'react';
import { MessageSquarePlus, ExternalLink } from 'lucide-react';
import { FEEDBACK_TELEGRAM_URL } from '../constants/links';

interface FeedbackLinkProps {
  className?: string;
  variant?: 'sidebar' | 'mobile';
}

export const FeedbackLink: React.FC<FeedbackLinkProps> = ({
  className = '',
  variant = 'sidebar',
}) => {
  if (variant === 'mobile') {
    return (
      <a
        href={FEEDBACK_TELEGRAM_URL}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-1.5 px-2.5 py-1 rounded-lg bg-teal-50 hover:bg-teal-100 text-[#0F766E] border border-teal-200/80 text-xs font-semibold transition-all ${className}`}
        title="Telegram orqali fikr bildirish"
      >
        <MessageSquarePlus className="w-3.5 h-3.5 shrink-0" />
        <span>Fikr bildirish</span>
        <ExternalLink className="w-3 h-3 opacity-60 shrink-0" />
      </a>
    );
  }

  return (
    <a
      href={FEEDBACK_TELEGRAM_URL}
      target="_blank"
      rel="noopener noreferrer"
      className={`flex items-center justify-between px-3 py-2 rounded-xl text-xs font-semibold text-[#0F766E] bg-teal-50/80 hover:bg-teal-100/90 border border-teal-200/80 transition-all group shadow-2xs ${className}`}
      title="Telegram orqali fikr yoki taklif yuborish"
    >
      <div className="flex items-center gap-2">
        <MessageSquarePlus className="w-4 h-4 text-[#0F766E] group-hover:scale-110 transition-transform" />
        <span>💬 Fikr bildiring</span>
      </div>
      <ExternalLink className="w-3.5 h-3.5 opacity-50 group-hover:opacity-100 transition-opacity" />
    </a>
  );
};
