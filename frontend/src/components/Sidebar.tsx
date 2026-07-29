import React, { useState } from 'react';
import { NavLink, useNavigate, useLocation } from 'react-router-dom';
import {
  FolderKanban,
  Users,
  CalendarCheck,
  CreditCard,
  LogOut,
  User as UserIcon,
  Loader2,
  AlertCircle,
} from 'lucide-react';
import { authService } from '../services/auth.service';
import type { User } from '../types/auth.types';
import { Modal } from './ui/Modal';
import { DarsHubLogo } from './ui/DarsHubLogo';
import toast from 'react-hot-toast';

interface SidebarProps {
  user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  const getInitials = (name?: string) => {
    if (!name) return 'DH';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleLogout = async () => {
    try {
      setLoggingOut(true);
      await authService.logout();
      toast.success("Tizimdan muvaffaqiyatli chiqdingiz");
      navigate('/login');
    } catch {
      toast.error("Chiqishda xatolik yuz berdi");
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
    }
  };

  const navItems = [
    {
      name: "Guruhlar",
      path: "/dashboard/groups",
      icon: FolderKanban,
      enabled: true,
    },
    {
      name: "O'quvchilar",
      path: "/dashboard/students",
      icon: Users,
      enabled: true,
    },
    {
      name: "Davomat",
      path: "/dashboard/attendance",
      icon: CalendarCheck,
      enabled: true,
    },
    {
      name: "To'lovlar",
      path: "/dashboard/payments",
      icon: CreditCard,
      enabled: true,
    },
  ];

  const isProfileActive = location.pathname === '/dashboard/profile';

  return (
    <>
      {/* Mobile Top Header */}
      <header className="lg:hidden flex items-center justify-between px-4 py-3 bg-white border-b border-stone-200 sticky top-0 z-30 shadow-2xs">
        <div
          onClick={() => navigate('/dashboard/groups')}
          className="flex items-center gap-2.5 cursor-pointer"
        >
          <DarsHubLogo className="w-8 h-8 drop-shadow-xs" />
          <span className="font-bold text-stone-900 tracking-tight text-base">
            DarsHub
          </span>
        </div>

        {/* User Avatar Card on Mobile Header -> Opens Profile */}
        <div className="flex items-center gap-2">
          <button
            onClick={() => navigate('/dashboard/profile')}
            className={`flex items-center gap-2 px-2 py-1 rounded-xl transition-all ${
              isProfileActive
                ? 'bg-[#0F766E]/15 text-[#0F766E] font-bold border border-[#0F766E]/30'
                : 'hover:bg-stone-100 text-stone-700'
            }`}
            title="Profilga o'tish"
          >
            <div className="w-7 h-7 rounded-lg bg-[#0F766E] text-white flex items-center justify-center text-[10px] font-bold shadow-xs">
              {getInitials(user?.fullName)}
            </div>
            <span className="text-xs font-semibold max-w-[110px] truncate text-stone-900">
              {user?.fullName?.split(' ')[0] || 'Profil'}
            </span>
          </button>

          <button
            onClick={() => setShowLogoutModal(true)}
            title="Chiqish"
            className="p-1.5 text-stone-400 hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors"
          >
            <LogOut className="w-4 h-4" />
          </button>
        </div>
      </header>

      {/* Mobile Bottom Tab Bar */}
      <nav className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 flex items-center justify-around py-1.5 px-2 shadow-lg">
        {navItems.map((item) => {
          const Icon = item.icon;
          if (!item.enabled) {
            return (
              <div
                key={item.name}
                className="flex flex-col items-center justify-center py-1 px-2 text-stone-300 opacity-60 cursor-not-allowed select-none"
              >
                <Icon className="w-5 h-5 mb-0.5" />
                <span className="text-[10px] font-medium">{item.name}</span>
              </div>
            );
          }

          return (
            <NavLink
              key={item.name}
              to={item.path}
              className={({ isActive }) =>
                `flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
                  isActive
                    ? 'text-[#0F766E] font-bold'
                    : 'text-stone-500 font-medium hover:text-stone-900'
                }`
              }
            >
              <Icon className="w-5 h-5 mb-0.5" />
              <span className="text-[10px]">{item.name}</span>
            </NavLink>
          );
        })}

        {/* Profile Mobile Tab */}
        <NavLink
          to="/dashboard/profile"
          className={({ isActive }) =>
            `flex flex-col items-center justify-center py-1 px-3 rounded-lg transition-colors ${
              isActive
                ? 'text-[#0F766E] font-bold'
                : 'text-stone-500 font-medium hover:text-stone-900'
            }`
          }
        >
          <UserIcon className="w-5 h-5 mb-0.5" />
          <span className="text-[10px]">Profil</span>
        </NavLink>
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden lg:flex w-60 h-screen sticky top-0 shrink-0 flex-col justify-between p-4 bg-white border-r border-stone-200 text-stone-800">
        <div>
          {/* Brand Header */}
          <div
            onClick={() => navigate('/dashboard/groups')}
            className="flex items-center gap-3 px-3 py-3 mb-5 border-b border-stone-100 cursor-pointer group"
          >
            <DarsHubLogo className="w-9 h-9 drop-shadow-xs group-hover:scale-105 transition-transform" />
            <div>
              <h1 className="font-bold text-base text-stone-900 tracking-tight leading-none group-hover:text-[#0F766E] transition-colors">
                DarsHub
              </h1>
              <p className="text-[11px] text-stone-500 font-medium mt-1">
                Ish quroli
              </p>
            </div>
          </div>

          {/* Navigation Items */}
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon;
              if (!item.enabled) {
                return (
                  <div
                    key={item.name}
                    className="flex items-center justify-between px-3 py-2.5 rounded-xl text-stone-400 cursor-not-allowed select-none text-xs font-medium"
                  >
                    <div className="flex items-center gap-2.5">
                      <Icon className="w-4 h-4 opacity-50" />
                      <span>{item.name}</span>
                    </div>
                    <span className="text-[9px] font-semibold bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded border border-stone-200">
                      {item.badge}
                    </span>
                  </div>
                );
              }

              return (
                <NavLink
                  key={item.name}
                  to={item.path}
                  className={({ isActive }) =>
                    `flex items-center justify-between px-3 py-2.5 rounded-xl text-xs transition-all ${
                      isActive
                        ? 'bg-[#0F766E]/10 text-[#0F766E] font-bold border border-[#0F766E]/20'
                        : 'text-stone-600 font-medium hover:bg-stone-100 hover:text-stone-900'
                    }`
                  }
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4" />
                    <span>{item.name}</span>
                  </div>
                </NavLink>
              );
            })}
          </nav>
        </div>

        {/* User Info & Logout Footer */}
        <div className="pt-3 border-t border-stone-100">
          <div
            onClick={() => navigate('/dashboard/profile')}
            className={`flex items-center justify-between p-2 rounded-xl border transition-all cursor-pointer group ${
              isProfileActive
                ? 'bg-[#0F766E]/10 border-[#0F766E]/30 text-[#0F766E]'
                : 'bg-stone-50 border-stone-200 hover:bg-stone-100/90'
            }`}
          >
            <div className="flex items-center gap-2.5 overflow-hidden">
              <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center text-xs font-bold shrink-0 shadow-xs">
                {getInitials(user?.fullName)}
              </div>
              <div className="overflow-hidden">
                <p className="text-xs font-semibold text-stone-900 truncate leading-tight group-hover:text-[#0F766E] transition-colors">
                  {user?.fullName || 'Foydalanuvchi'}
                </p>
                <p className="text-[10px] text-stone-500 truncate">
                  {user?.email}
                </p>
              </div>
            </div>
            <button
              onClick={(e) => {
                e.stopPropagation();
                setShowLogoutModal(true);
              }}
              disabled={loggingOut}
              title="Chiqish"
              className="p-1.5 text-stone-400 hover:text-[#DC2626] hover:bg-red-50 rounded-lg transition-colors shrink-0"
            >
              <LogOut className="w-4 h-4" />
            </button>
          </div>
        </div>
      </aside>

      {/* Logout Confirmation Modal */}
      <Modal
        isOpen={showLogoutModal}
        onClose={() => setShowLogoutModal(false)}
        title="Tizimdan chiqish"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowLogoutModal(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="button"
              onClick={handleLogout}
              disabled={loggingOut}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              {loggingOut ? (
                <Loader2 className="w-4 h-4 animate-spin" />
              ) : (
                <LogOut className="w-4 h-4" />
              )}
              <span>Tizimdan chiqish</span>
            </button>
          </>
        }
      >
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-full bg-red-50 text-[#DC2626] flex items-center justify-center shrink-0">
            <AlertCircle className="w-5 h-5" />
          </div>
          <div>
            <h4 className="text-sm font-semibold text-stone-900">
              Tizimdan chiqishni tasdiqlaysizmi?
            </h4>
            <p className="text-xs text-stone-500 mt-1 leading-relaxed">
              DarsHub tizimidan chiqmoqchimisiz? Qayta kirish uchun email va parolingizni kiritishingiz kerak bo'ladi.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};
