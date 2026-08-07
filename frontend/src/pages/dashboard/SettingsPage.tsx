import React from 'react';
import { Settings } from 'lucide-react';
import { TelegramConnect } from '../../components/settings/TelegramConnect';

export const SettingsPage: React.FC = () => {
  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h2 className="text-2xl font-bold text-stone-900 tracking-tight flex items-center gap-2.5">
          <Settings className="w-6 h-6 text-[#0F766E]" />
          Sozlamalar
        </h2>
        <p className="text-xs text-stone-500 mt-1">
          Ilova sozlamalari va integratsiyalarni boshqarish
        </p>
      </div>

      {/* Xabarnomalar bo'limi */}
      <div className="space-y-3">
        <h3 className="text-sm font-semibold text-stone-700 flex items-center gap-2">
          <span className="w-1 h-4 bg-[#0F766E] rounded-full inline-block" />
          Xabarnomalar
        </h3>
        <TelegramConnect />
      </div>
    </div>
  );
};
