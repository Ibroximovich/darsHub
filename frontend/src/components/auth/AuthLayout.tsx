import React from 'react';
import { DarsHubLogo } from '../ui/DarsHubLogo';

interface AuthLayoutProps {
  title: string;
  subtitle?: string;
  children: React.ReactNode;
}

export const AuthLayout: React.FC<AuthLayoutProps> = ({
  title,
  subtitle,
  children,
}) => {
  return (
    <div className="relative h-screen w-screen overflow-hidden flex items-center justify-center p-3 bg-slate-950 select-none">
      {/* Background ambient glows */}
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-[#0F766E]/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-[#0F766E]/15 rounded-full blur-[100px] pointer-events-none" />

      {/* Glass Card */}
      <div className="relative w-full max-w-[390px] bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-2xl rounded-2xl p-4 sm:p-5">
        {/* Compact Brand Header */}
        <div className="text-center space-y-1 mb-2.5">
          <div className="inline-flex items-center justify-center">
            <DarsHubLogo className="w-11 h-11 drop-shadow-md" />
          </div>
          <div>
            <h1 className="text-base font-black text-white tracking-tight leading-tight">
              DarsHub
            </h1>
          </div>
          <div>
            <h2 className="text-sm font-bold text-slate-100">{title}</h2>
            {subtitle && (
              <p className="text-[11px] text-slate-400 max-w-xs mx-auto leading-tight">
                {subtitle}
              </p>
            )}
          </div>
        </div>

        {/* Form Body */}
        <div>{children}</div>
      </div>
    </div>
  );
};
