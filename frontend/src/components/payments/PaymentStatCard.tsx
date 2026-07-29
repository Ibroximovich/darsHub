import React from 'react';
import type { LucideIcon } from 'lucide-react';

interface PaymentStatCardProps {
  icon: LucideIcon;
  label: string;
  amount: number;
  variant: 'neutral' | 'success' | 'warning';
}

function formatAmount(amount: number): string {
  return amount.toLocaleString('uz-UZ').replace(/,/g, ' ');
}

const variantStyles = {
  neutral: {
    bg: 'bg-white',
    border: 'border-stone-200/80',
    iconBg: 'bg-stone-100',
    iconColor: 'text-stone-600',
    labelColor: 'text-stone-500',
    amountColor: 'text-stone-900',
  },
  success: {
    bg: 'bg-emerald-50/50',
    border: 'border-emerald-200/80',
    iconBg: 'bg-emerald-100',
    iconColor: 'text-emerald-600',
    labelColor: 'text-emerald-700',
    amountColor: 'text-emerald-900',
  },
  warning: {
    bg: 'bg-amber-50/50',
    border: 'border-amber-200/80',
    iconBg: 'bg-amber-100',
    iconColor: 'text-amber-600',
    labelColor: 'text-amber-700',
    amountColor: 'text-amber-900',
  },
};

export const PaymentStatCard: React.FC<PaymentStatCardProps> = ({
  icon: Icon,
  label,
  amount,
  variant,
}) => {
  const style = variantStyles[variant];

  return (
    <div
      className={`${style.bg} border ${style.border} rounded-2xl p-5 shadow-2xs flex flex-col gap-3`}
    >
      <div className="flex items-center gap-2.5">
        <div
          className={`w-9 h-9 rounded-xl ${style.iconBg} ${style.iconColor} flex items-center justify-center shrink-0`}
        >
          <Icon className="w-5 h-5" />
        </div>
        <span className={`text-xs font-semibold ${style.labelColor}`}>
          {label}
        </span>
      </div>

      <p className={`text-2xl font-extrabold ${style.amountColor} tabular-nums tracking-tight`}>
        {formatAmount(amount)} <span className="text-sm font-bold opacity-60">so'm</span>
      </p>
    </div>
  );
};
