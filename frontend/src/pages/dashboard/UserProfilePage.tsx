import React, { useState, useEffect } from 'react';
import { useOutletContext, useNavigate } from 'react-router-dom';
import {
  User as UserIcon,
  Mail,
  Phone,
  Calendar,
  ShieldCheck,
  FolderKanban,
  Users,
  LogOut,
  ArrowLeft,
  GraduationCap,
  Loader2,
  CheckCircle2,
  AlertCircle,
  Pencil,
} from 'lucide-react';
import { useQuery } from '@tanstack/react-query';
import { groupsApi } from '../../api/groups';
import { studentsApi } from '../../api/students';
import { authService } from '../../services/auth.service';
import { Modal } from '../../components/ui/Modal';
import { DarsHubLogo } from '../../components/ui/DarsHubLogo';
import type { User } from '../../types/auth.types';
import toast from 'react-hot-toast';

export const UserProfilePage: React.FC = () => {
  const { user } = useOutletContext<{ user: User | null }>();
  const navigate = useNavigate();

  // Local state for user info so changes reflect immediately after edit
  const [currentUser, setCurrentUser] = useState<User | null>(user);

  useEffect(() => {
    if (user) {
      setCurrentUser(user);
    }
  }, [user]);

  // Logout modal state
  const [showLogoutModal, setShowLogoutModal] = useState(false);
  const [loggingOut, setLoggingOut] = useState(false);

  // Edit profile modal state
  const [showEditModal, setShowEditModal] = useState(false);
  const [savingProfile, setSavingProfile] = useState(false);
  const [fullNameInput, setFullNameInput] = useState('');
  const [phoneInput, setPhoneInput] = useState('');

  // Fetch stats for profile page
  const { data: groups = [] } = useQuery({
    queryKey: ['groups'],
    queryFn: groupsApi.getGroups,
  });

  const { data: students = [] } = useQuery({
    queryKey: ['students'],
    queryFn: () => studentsApi.getAllStudents(),
  });

  const getInitials = (name?: string) => {
    if (!name) return 'DH';
    const parts = name.trim().split(' ');
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase();
    }
    return name.slice(0, 2).toUpperCase();
  };

  const handleOpenEditModal = () => {
    setFullNameInput(currentUser?.fullName || '');
    setPhoneInput(currentUser?.phone || '');
    setShowEditModal(true);
  };

  const handleSaveProfile = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullNameInput.trim() || fullNameInput.trim().length < 2) {
      toast.error("Ism-sharifingiz kamida 2 ta belgidan iborat bo'lishi kerak");
      return;
    }

    try {
      setSavingProfile(true);
      const res = await authService.updateProfile({
        fullName: fullNameInput.trim(),
        phone: phoneInput.trim(),
      });

      if (res.success && res.user) {
        setCurrentUser(res.user);
        toast.success("Profil ma'lumotlari muvaffaqiyatli yangilandi!");
        setShowEditModal(false);
      } else {
        toast.error(res.message || "Tahrirlashda xatolik yuz berdi");
      }
    } catch (err: any) {
      const msg = err?.response?.data?.message || "Server bilan bog'lanishda xatolik";
      toast.error(msg);
    } fontinally: {
      setSavingProfile(false);
    }
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

  const formatDate = (dateString?: string) => {
    if (!dateString) return "Mavjud emas";
    try {
      const d = new Date(dateString);
      return new Intl.DateTimeFormat('uz-UZ', {
        year: 'numeric',
        month: 'long',
        day: 'numeric',
      }).format(d);
    } catch {
      return dateString;
    }
  };

  return (
    <div className="space-y-6 max-w-4xl mx-auto pb-10">
      {/* Top Bar with Navigation */}
      <div className="flex items-center justify-between">
        <button
          onClick={() => navigate('/dashboard/groups')}
          className="inline-flex items-center gap-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-white border border-stone-200 px-3.5 py-2 rounded-xl hover:bg-stone-50 transition-colors shadow-2xs"
        >
          <ArrowLeft className="w-4 h-4" />
          <span>Guruhlarga qaytish</span>
        </button>
        <span className="text-xs font-semibold text-[#0F766E] bg-[#0F766E]/10 px-3 py-1 rounded-full border border-[#0F766E]/20">
          Shaxsiy profil
        </span>
      </div>

      {/* Main Profile Header Card */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 sm:p-8 shadow-2xs relative overflow-hidden">
        <div className="absolute top-0 right-0 w-32 h-32 bg-[#0F766E]/5 rounded-bl-full pointer-events-none" />

        <div className="flex flex-col sm:flex-row items-center sm:items-start gap-6 text-center sm:text-left relative z-10">
          <div className="w-20 h-20 sm:w-24 sm:h-24 rounded-2xl bg-[#0F766E] text-white flex items-center justify-center text-2xl sm:text-3xl font-bold shadow-md shrink-0">
            {getInitials(currentUser?.fullName)}
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h1 className="text-xl sm:text-2xl font-bold text-stone-900 tracking-tight">
                  {currentUser?.fullName || 'Foydalanuvchi'}
                </h1>
                <p className="text-xs sm:text-sm text-stone-500 font-medium mt-1">
                  {currentUser?.email}
                </p>
              </div>

              <div className="flex items-center justify-center sm:justify-start gap-2">
                <button
                  onClick={handleOpenEditModal}
                  className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold bg-[#0F766E] hover:bg-[#0D625C] text-white transition-all shadow-xs"
                >
                  <Pencil className="w-3.5 h-3.5" />
                  <span>Profilni tahrirlash</span>
                </button>
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-center sm:justify-start gap-3 mt-4 pt-4 border-t border-stone-100 text-xs text-stone-600 font-medium">
              <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200/60">
                <DarsHubLogo className="w-4 h-4" />
                <span>Rol: <strong>Repetitor / O'qituvchi</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-stone-50 px-3 py-1.5 rounded-lg border border-stone-200/60">
                <Calendar className="w-4 h-4 text-stone-400" />
                <span>A'zo bo'lingan: <strong>{formatDate(currentUser?.createdAt)}</strong></span>
              </div>
              <div className="flex items-center gap-1.5 bg-emerald-50 text-emerald-700 px-3 py-1.5 rounded-lg border border-emerald-200">
                <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                <span>Tasdiqlangan account</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Stats Summary Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-teal-50 text-[#0F766E] flex items-center justify-center font-bold shrink-0">
            <FolderKanban className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Faol Guruhlar</p>
            <p className="text-2xl font-bold text-stone-900 tracking-tight mt-0.5">
              {groups.length} ta
            </p>
          </div>
        </div>

        <div className="bg-white border border-stone-200 rounded-2xl p-5 shadow-2xs flex items-center gap-4">
          <div className="w-12 h-12 rounded-xl bg-blue-50 text-blue-700 flex items-center justify-center font-bold shrink-0">
            <Users className="w-6 h-6" />
          </div>
          <div>
            <p className="text-xs text-stone-500 font-medium">Jami O'quvchilar</p>
            <p className="text-2xl font-bold text-stone-900 tracking-tight mt-0.5">
              {students.length} ta
            </p>
          </div>
        </div>
      </div>

      {/* Detailed Profile Info Section */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs space-y-6">
        <div className="flex items-center justify-between pb-3 border-b border-stone-100">
          <h2 className="text-base font-bold text-stone-900 flex items-center gap-2">
            <UserIcon className="w-4 h-4 text-[#0F766E]" />
            <span>Shaxsiy Ma'lumotlar</span>
          </h2>
          <button
            onClick={handleOpenEditModal}
            className="text-xs font-semibold text-[#0F766E] hover:text-[#0D625C] flex items-center gap-1 hover:underline"
          >
            <Pencil className="w-3.5 h-3.5" />
            <span>Tahrirlash</span>
          </button>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 text-xs">
          <div className="space-y-1.5">
            <span className="text-stone-500 font-medium flex items-center gap-1.5">
              <UserIcon className="w-3.5 h-3.5 text-stone-400" />
              <span>To'liq ismi-sharifi:</span>
            </span>
            <p className="text-sm font-semibold text-stone-900 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
              {currentUser?.fullName || 'Kiritilmagan'}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-stone-500 font-medium flex items-center gap-1.5">
              <Mail className="w-3.5 h-3.5 text-stone-400" />
              <span>Email pochta manzili:</span>
            </span>
            <p className="text-sm font-semibold text-stone-900 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
              {currentUser?.email || 'Kiritilmagan'}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-stone-500 font-medium flex items-center gap-1.5">
              <Phone className="w-3.5 h-3.5 text-stone-400" />
              <span>Telefon raqami:</span>
            </span>
            <p className="text-sm font-semibold text-stone-900 bg-stone-50 p-3 rounded-xl border border-stone-200/80">
              {currentUser?.phone || 'Kiritilmagan'}
            </p>
          </div>

          <div className="space-y-1.5">
            <span className="text-stone-500 font-medium flex items-center gap-1.5">
              <ShieldCheck className="w-3.5 h-3.5 text-stone-400" />
              <span>Hisob holati:</span>
            </span>
            <div className="text-sm font-semibold text-emerald-800 bg-emerald-50 p-3 rounded-xl border border-emerald-200/80 flex items-center gap-2">
              <CheckCircle2 className="w-4 h-4 text-emerald-600" />
              <span>Email va hisob to'liq faol</span>
            </div>
          </div>
        </div>
      </div>

      {/* Account Actions / Security */}
      <div className="bg-white border border-stone-200 rounded-2xl p-6 shadow-2xs flex flex-col sm:flex-row items-center justify-between gap-4">
        <div>
          <h3 className="text-sm font-bold text-stone-900">Tizimdan chiqish</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            Akkauntdan chiqmoqchimisiz? Keyingi safar qayta tizimga kirishingiz kerak bo'ladi.
          </p>
        </div>

        <button
          onClick={() => setShowLogoutModal(true)}
          className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 text-xs font-semibold text-white bg-[#DC2626] hover:bg-[#B91C1C] rounded-xl transition-all shadow-xs"
        >
          <LogOut className="w-4 h-4" />
          <span>Tizimdan chiqish</span>
        </button>
      </div>

      {/* Edit Profile Modal */}
      <Modal
        isOpen={showEditModal}
        onClose={() => setShowEditModal(false)}
        title="Profil ma'lumotlarini tahrirlash"
        maxWidth="max-w-md"
        footer={
          <>
            <button
              type="button"
              onClick={() => setShowEditModal(false)}
              className="px-4 py-2 text-xs font-semibold text-stone-600 hover:text-stone-900 bg-stone-100 hover:bg-stone-200 rounded-xl transition-colors"
            >
              Bekor qilish
            </button>
            <button
              type="submit"
              form="edit-profile-form"
              disabled={savingProfile}
              className="flex items-center gap-2 px-4 py-2 text-xs font-semibold text-white bg-[#0F766E] hover:bg-[#0D625C] rounded-xl transition-colors shadow-xs disabled:opacity-50"
            >
              {savingProfile && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>Saqlash</span>
            </button>
          </>
        }
      >
        <form id="edit-profile-form" onSubmit={handleSaveProfile} className="space-y-4 text-xs">
          <div>
            <label className="block text-stone-700 font-semibold mb-1.5">
              To'liq ismi-sharifingiz <span className="text-red-500">*</span>
            </label>
            <input
              type="text"
              required
              value={fullNameInput}
              onChange={(e) => setFullNameInput(e.target.value)}
              placeholder="Masalan: Sarvar Azamov"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] text-stone-900 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-stone-700 font-semibold mb-1.5">
              Telefon raqamingiz
            </label>
            <input
              type="text"
              value={phoneInput}
              onChange={(e) => setPhoneInput(e.target.value)}
              placeholder="+998901234567"
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 focus:outline-none focus:border-[#0F766E] focus:ring-1 focus:ring-[#0F766E] text-stone-900 text-xs font-medium"
            />
          </div>

          <div>
            <label className="block text-stone-500 font-semibold mb-1.5">
              Email manzilingiz (O'zgartirib bo'lmaydi)
            </label>
            <input
              type="email"
              disabled
              value={currentUser?.email || ''}
              className="w-full px-3.5 py-2.5 rounded-xl border border-stone-200 bg-stone-100 text-stone-500 text-xs font-medium cursor-not-allowed"
            />
          </div>
        </form>
      </Modal>

      {/* Logout Confirm Modal */}
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
    </div>
  );
};
