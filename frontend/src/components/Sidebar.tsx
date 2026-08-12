import React, { useState, useRef, useEffect } from 'react';
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
  ShieldCheck,
  Settings,
  MessageSquarePlus,
  ChevronDown,
} from 'lucide-react';
import { authService } from '../services/auth.service';
import type { User } from '../types/auth.types';
import { Modal } from './ui/Modal';
import { DarsHubLogo } from './ui/DarsHubLogo';
import { FeedbackLink } from './FeedbackLink';
import toast from 'react-hot-toast';
import { FEEDBACK_TELEGRAM_URL } from '../constants/links';

interface SidebarProps {
  user: User | null;
}

export const Sidebar: React.FC<SidebarProps> = ({ user }) => {
  const navigate = useNavigate();
  const location = useLocation();

  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);
  const [userMenuOpen, setUserMenuOpen] = useState(false);
  const userMenuRef = useRef<HTMLDivElement>(null);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (userMenuRef.current && !userMenuRef.current.contains(e.target as Node)) {
        setUserMenuOpen(false);
      }
    };
    document.addEventListener('mousedown', handler);
    return () => document.removeEventListener('mousedown', handler);
  }, []);

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
      toast.success('Tizimdan muvaffaqiyatli chiqdingiz');
      navigate('/login');
    } catch {
      toast.error('Chiqishda xatolik yuz berdi');
    } finally {
      setLoggingOut(false);
      setShowLogoutModal(false);
      setUserMenuOpen(false);
    }
  };

  interface NavItem {
    name: string;
    shortName: string; // for bottom tab bar (must fit 1 line)
    path: string;
    icon: any;
    enabled: boolean;
    badge?: string;
  }

  const navItems: NavItem[] = [
    {
      name: 'Guruhlar',
      shortName: 'Guruhlar',
      path: '/dashboard/groups',
      icon: FolderKanban,
      enabled: true,
    },
    {
      name: "O'quvchilar",
      shortName: "O'quvchi",
      path: '/dashboard/students',
      icon: Users,
      enabled: true,
    },
    {
      name: 'Davomat',
      shortName: 'Davomat',
      path: '/dashboard/attendance',
      icon: CalendarCheck,
      enabled: true,
    },
    {
      name: "To'lovlar",
      shortName: "To'lov",
      path: '/dashboard/payments',
      icon: CreditCard,
      enabled: true,
    },
    {
      name: 'Sozlamalar',
      shortName: 'Sozlama',
      path: '/dashboard/settings',
      icon: Settings,
      enabled: true,
    },
    ...(user?.isAdmin || user?.role === 'admin'
      ? [
          {
            name: 'Admin Panel',
            shortName: 'Admin',
            path: '/admin',
            icon: ShieldCheck,
            enabled: true,
          },
        ]
      : []),
  ];

  const isProfileActive = location.pathname === '/dashboard/profile';

  // All nav items + Profile for bottom bar
  const bottomItems = [
    ...navItems,
    {
      name: 'Profil',
      shortName: 'Profil',
      path: '/dashboard/profile',
      icon: UserIcon,
      enabled: true,
    },
  ];

  return (
    <>
      {/* ─── MOBILE TOP HEADER ──────────────────────────────────────────────────── */}
      <header className="lg:hidden sticky top-0 z-30 bg-white border-b border-stone-200 shadow-sm">
        <div className="flex items-center justify-between px-4 h-14">
          {/* Logo */}
          <button
            onClick={() => navigate('/dashboard/groups')}
            className="flex items-center gap-2 min-w-0 shrink-0"
            aria-label="Bosh sahifa"
          >
            <DarsHubLogo className="w-8 h-8 drop-shadow-xs shrink-0" />
            <span className="font-bold text-stone-900 tracking-tight text-base leading-none">
              DarsHub
            </span>
          </button>

          {/* Right side actions */}
          <div className="flex items-center gap-1 shrink-0">
            {/* Feedback — icon only on mobile */}
            <a
              href={FEEDBACK_TELEGRAM_URL}
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Fikr bildirish"
              className="flex items-center justify-center w-11 h-11 rounded-xl text-[#0F766E] hover:bg-teal-50 transition-colors"
            >
              <MessageSquarePlus className="w-5 h-5" />
            </a>

            {/* User avatar + dropdown */}
            <div className="relative" ref={userMenuRef}>
              <button
                onClick={() => setUserMenuOpen((v) => !v)}
                className={`flex items-center gap-1.5 h-11 px-2 rounded-xl transition-all ${
                  isProfileActive || userMenuOpen
                    ? 'bg-[#0F766E]/10 text-[#0F766E]'
                    : 'hover:bg-stone-100 text-stone-700'
                }`}
                aria-label="Foydalanuvchi menyu"
                aria-expanded={userMenuOpen}
              >
                <div className="w-8 h-8 rounded-lg bg-[#0F766E] text-white flex items-center justify-center text-[10px] font-bold shadow-xs shrink-0">
                  {getInitials(user?.fullName)}
                </div>
                <ChevronDown
                  className={`w-3.5 h-3.5 text-stone-400 transition-transform duration-200 ${
                    userMenuOpen ? 'rotate-180' : ''
                  }`}
                />
              </button>

              {/* Dropdown menu */}
              {userMenuOpen && (
                <div className="absolute right-0 top-full mt-1.5 w-52 bg-white rounded-2xl shadow-xl border border-stone-200 py-2 z-50">
                  {/* User info */}
                  <div className="px-4 py-2.5 border-b border-stone-100 mb-1">
                    <p className="text-xs font-semibold text-stone-900 truncate">
                      {user?.fullName || 'Foydalanuvchi'}
                    </p>
                    <p className="text-[11px] text-stone-500 truncate mt-0.5">
                      {user?.email}
                    </p>
                  </div>
                  {/* Profile link */}
                  <button
                    onClick={() => {
                      navigate('/dashboard/profile');
                      setUserMenuOpen(false);
                    }}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-medium text-stone-700 hover:bg-stone-50 transition-colors"
                  >
                    <UserIcon className="w-4 h-4 text-stone-400" />
                    Profilim
                  </button>
                  {/* Feedback */}
                  <a
                    href={FEEDBACK_TELEGRAM_URL}
                    target="_blank"
                    rel="noopener noreferrer"
                    onClick={() => setUserMenuOpen(false)}
                    className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-medium text-[#0F766E] hover:bg-teal-50 transition-colors"
                  >
                    <MessageSquarePlus className="w-4 h-4" />
                    Fikr bildirish
                  </a>
                  {/* Logout */}
                  <div className="border-t border-stone-100 mt-1 pt-1">
                    <button
                      onClick={() => {
                        setUserMenuOpen(false);
                        setShowLogoutModal(true);
                      }}
                      className="flex items-center gap-3 w-full px-4 py-2.5 text-xs font-medium text-red-600 hover:bg-red-50 transition-colors"
                    >
                      <LogOut className="w-4 h-4" />
                      Chiqish
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>
      </header>

      {/* ─── MOBILE BOTTOM TAB BAR ──────────────────────────────────────────────── */}
      <nav
        className="lg:hidden fixed bottom-0 left-0 right-0 z-40 bg-white border-t border-stone-200 shadow-lg"
        style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
      >
        <div className="flex items-stretch justify-around px-1 h-[56px]">
          {bottomItems.map((item) => {
            const Icon = item.icon;
            if (!item.enabled) {
              return (
                <div
                  key={item.name}
                  className="flex flex-col items-center justify-center flex-1 py-1 text-stone-300 opacity-60 cursor-not-allowed select-none"
                >
                  <Icon className="w-5 h-5 mb-0.5 shrink-0" />
                  <span className="text-[10px] font-medium leading-tight whitespace-nowrap">
                    {item.shortName}
                  </span>
                </div>
              );
            }

            return (
              <NavLink
                key={item.name}
                to={item.path}
                className={({ isActive }) =>
                  `flex flex-col items-center justify-center flex-1 py-1 rounded-lg transition-colors min-w-0 ${
                    isActive
                      ? 'text-[#0F766E]'
                      : 'text-stone-500 hover:text-stone-800'
                  }`
                }
              >
                {({ isActive }) => (
                  <>
                    <Icon
                      className={`w-5 h-5 mb-0.5 shrink-0 transition-transform ${
                        isActive ? 'scale-110' : ''
                      }`}
                    />
                    <span
                      className={`text-[10px] leading-tight whitespace-nowrap ${
                        isActive ? 'font-bold' : 'font-medium'
                      }`}
                    >
                      {item.shortName}
                    </span>
                  </>
                )}
              </NavLink>
            );
          })}
        </div>
      </nav>

      {/* ─── DESKTOP SIDEBAR ────────────────────────────────────────────────────── */}
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
                    {item.badge && (
                      <span className="text-[9px] font-semibold bg-stone-100 text-stone-400 px-1.5 py-0.5 rounded border border-stone-200">
                        {item.badge}
                      </span>
                    )}
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
          <FeedbackLink className="mb-2.5" />
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
                <p className="text-[10px] text-stone-500 truncate">{user?.email}</p>
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

      {/* ─── LOGOUT MODAL ───────────────────────────────────────────────────────── */}
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
              DarsHub tizimidan chiqmoqchimisiz? Qayta kirish uchun email va parolingizni
              kiritishingiz kerak bo'ladi.
            </p>
          </div>
        </div>
      </Modal>
    </>
  );
};
