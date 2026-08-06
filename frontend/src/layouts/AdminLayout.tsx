import React, { useEffect, useState } from 'react';
import { Outlet, useNavigate, NavLink, useLocation } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { User } from '../types/auth.types';
import {
  LayoutDashboard,
  Users,
  FolderKanban,
  GraduationCap,
  CreditCard,
  LogOut,
  ArrowLeft,
  Loader2,
} from 'lucide-react';
import { DarsHubLogo } from '../components/ui/DarsHubLogo';
import { FeedbackLink } from '../components/FeedbackLink';
import toast from 'react-hot-toast';

export const AdminLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getMe();
        if (response.success && response.user) {
          if (response.user.role !== 'admin') {
            toast.error("Ruxsat berilmagan! Admin emasasiz.");
            navigate('/dashboard', { replace: true });
            return;
          }
          setUser(response.user);
        } else {
          navigate('/login', { replace: true });
        }
      } catch {
        navigate('/login', { replace: true });
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const handleLogout = async () => {
    try {
      await authService.logout();
      toast.success("Tizimdan muvaffaqiyatli chiqdingiz");
      navigate('/login');
    } catch {
      toast.error("Chiqishda xatolik yuz berdi");
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="flex items-center gap-2.5 text-[#0F766E] font-semibold text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-[#0F766E]" />
          <span>Admin panel yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  if (!user || user.role !== 'admin') {
    return null;
  }

  const adminNavItems = [
    {
      name: 'Statistika',
      path: '/admin',
      icon: LayoutDashboard,
      exact: true,
    },
    {
      name: 'Foydalanuvchilar',
      path: '/admin/users',
      icon: Users,
    },
    {
      name: 'Guruhlar',
      path: '/admin/groups',
      icon: FolderKanban,
    },
    {
      name: "O'quvchilar",
      path: '/admin/students',
      icon: GraduationCap,
    },
    {
      name: "To'lovlar",
      path: '/admin/payments',
      icon: CreditCard,
    },
  ];

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917] flex flex-col lg:flex-row font-sans tabular-nums antialiased selection:bg-[#0F766E]/15 selection:text-[#0F766E]">
      {/* Mobile Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-stone-900 text-white border-b border-stone-800 sticky top-0 z-30 shadow-md">
        <div className="flex items-center gap-2.5">
          <DarsHubLogo className="w-8 h-8 drop-shadow-xs" />
          <div>
            <span className="font-bold tracking-tight text-sm block leading-none">
              DarsHub Admin
            </span>
            <span className="text-[10px] text-amber-400 font-semibold uppercase tracking-wider">
              Boshqaruv paneli
            </span>
          </div>
        </div>

        <button
          onClick={() => navigate('/dashboard')}
          className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-stone-800 text-stone-200 hover:bg-stone-700 text-xs font-medium transition-colors"
        >
          <ArrowLeft className="w-3.5 h-3.5" />
          <span>Repetitor rejimi</span>
        </button>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-stone-900 border-t border-stone-800 flex items-center justify-around py-1.5 px-2 text-stone-400 shadow-xl">
        {adminNavItems.map((item) => {
          const Icon = item.icon;
          const isActive = item.exact
            ? location.pathname === item.path
            : location.pathname.startsWith(item.path);

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={`flex flex-col items-center justify-center py-1 px-2.5 rounded-lg transition-colors ${
                isActive
                  ? 'text-amber-400 font-bold'
                  : 'text-stone-400 hover:text-white'
              }`}
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.name}</span>
            </NavLink>
          );
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-64 h-screen sticky top-0 shrink-0 flex-col justify-between p-4 bg-stone-900 text-stone-200 border-r border-stone-800">
        <div>
          {/* Admin Header */}
          <div className="flex items-center gap-3 px-3 py-3 mb-4 border-b border-stone-800">
            <DarsHubLogo className="w-9 h-9 drop-shadow-xs" />
            <div>
              <h1 className="font-bold text-base text-white tracking-tight leading-none flex items-center gap-1.5">
                <span>DarsHub</span>
                <span className="text-[10px] px-1.5 py-0.5 rounded bg-amber-500/20 text-amber-400 border border-amber-500/30 uppercase tracking-wider font-semibold">
                  Admin
                </span>
              </h1>
              <p className="text-[11px] text-stone-400 font-medium mt-1">
                Tizim boshqaruv paneli
              </p>
            </div>
          </div>

          {/* Repetitor Mode Switch Button */}
          <button
            onClick={() => navigate('/dashboard')}
            className="w-full flex items-center justify-between px-3 py-2.5 mb-4 rounded-xl text-xs font-semibold bg-stone-800/80 hover:bg-stone-800 text-stone-300 hover:text-white transition-all border border-stone-700/50 shadow-2xs group"
          >
            <div className="flex items-center gap-2">
              <ArrowLeft className="w-4 h-4 text-stone-400 group-hover:-translate-x-0.5 transition-transform" />
              <span>Repetitor paneliga o'tish</span>
            </div>
          </button>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {adminNavItems.map((item) => {
              const Icon = item.icon;
              const isActive = item.exact
                ? location.pathname === item.path
                : location.pathname.startsWith(item.path);

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={`flex items-center gap-3 px-3 py-2.5 rounded-xl text-xs font-medium transition-all ${
                    isActive
                      ? 'bg-amber-500/15 text-amber-400 font-semibold border border-amber-500/30'
                      : 'text-stone-400 hover:bg-stone-800 hover:text-stone-100'
                  }`}
                >
                  <Icon className="w-4 h-4 shrink-0" />
                  <span>{item.name}</span>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout */}
        <div className="pt-3 border-t border-stone-800">
          <FeedbackLink className="mb-2.5" />
          <div className="flex items-center justify-between p-2 rounded-xl bg-stone-800/60 border border-stone-700/50">
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-amber-500 text-stone-950 flex items-center justify-center text-xs font-bold shrink-0">
                {user.fullName.slice(0, 2).toUpperCase()}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-white truncate leading-tight">
                  {user.fullName}
                </p>
                <p className="text-[10px] text-amber-400/90 font-medium truncate">
                  Administrator
                </p>
              </div>
            </div>
            <button
              onClick={handleLogout}
              title="Chiqish"
              className="p-1.5 text-stone-400 hover:text-red-400 hover:bg-stone-800 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Main Content */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden pb-20 lg:pb-8">
        <Outlet context={{ user }} />
      </main>
    </div>
  );
};
