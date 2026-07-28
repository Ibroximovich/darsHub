import React from 'react';

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
      <div className="absolute -top-32 -left-32 w-80 h-80 bg-indigo-600/20 rounded-full blur-[100px] pointer-events-none" />
      <div className="absolute -bottom-32 -right-32 w-80 h-80 bg-purple-600/20 rounded-full blur-[100px] pointer-events-none" />

      {/* Glass Card */}
      <div className="relative w-full max-w-[390px] bg-slate-900/95 backdrop-blur-2xl border border-slate-800 shadow-2xl rounded-2xl p-4 sm:p-5">
        {/* Compact Brand Header */}
        <div className="text-center space-y-1 mb-2.5">
          <div className="inline-flex items-center justify-center w-9 h-9 rounded-xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white font-extrabold text-base shadow-md shadow-indigo-500/20 border border-indigo-400/20">
            📚
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
