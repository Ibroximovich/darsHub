import React, { useEffect, useState } from 'react';
import { Button, Card, Spin, message, Badge } from 'antd';
import { LogoutOutlined, UserOutlined, SafetyCertificateOutlined, MailOutlined, PhoneOutlined, KeyOutlined } from '@ant-design/icons';
import { useNavigate } from 'react-router-dom';
import { authService } from '../services/auth.service';
import type { User } from '../types/auth.types';

export const DashboardPage: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [loggingOut, setLoggingOut] = useState<boolean>(false);
  const navigate = useNavigate();

  useEffect(() => {
    const fetchMe = async () => {
      try {
        const response = await authService.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        }
      } catch (err) {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };
    fetchMe();
  }, [navigate]);

  const handleLogout = async () => {
    setLoggingOut(true);
    try {
      await authService.logout();
      message.success('Tizimdan muvaffaqiyatli chiqdingiz');
      navigate('/login');
    } catch (err) {
      message.error('Chiqishda xatolik yuz berdi');
    } finally {
      setLoggingOut(false);
    }
  };

  if (loading) {
    return (
      <div className="min-h-screen flex justify-center items-center bg-slate-900">
        <Spin size="large" tip={<span className="text-slate-300 font-semibold mt-2">Yuklanmoqda...</span>} />
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-slate-900 text-slate-100 p-4 sm:p-8 relative overflow-hidden">
      {/* Background Glow Orbs */}
      <div className="absolute top-0 right-0 w-96 h-96 bg-indigo-600/20 rounded-full blur-[128px] pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-96 h-96 bg-purple-600/20 rounded-full blur-[128px] pointer-events-none" />

      <div className="relative max-w-4xl mx-auto space-y-6">
        {/* Navbar Card */}
        <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 bg-slate-800/80 backdrop-blur-xl border border-slate-700/60 p-6 rounded-3xl shadow-xl">
          <div className="flex items-center space-x-4">
            <div className="w-12 h-12 rounded-2xl bg-gradient-to-tr from-indigo-600 to-purple-600 text-white flex items-center justify-center font-black text-2xl shadow-lg shadow-indigo-500/30">
              📚
            </div>
            <div>
              <h1 className="text-xl font-black text-white tracking-tight">DarsHub Boshqaruv Paneli</h1>
              <p className="text-xs text-slate-400 font-medium">Yakka repetitorlar uchun avtomatlashtirilgan platforma</p>
            </div>
          </div>
          <Button
            type="primary"
            danger
            icon={<LogoutOutlined />}
            loading={loggingOut}
            onClick={handleLogout}
            className="h-11 px-6 rounded-xl font-bold border-none shadow-lg shadow-red-500/20 hover:scale-[1.02] active:scale-[0.98] transition-all"
          >
            Chiqish
          </Button>
        </div>

        {/* Profile Details Card */}
        <Card className="bg-slate-800/80 backdrop-blur-xl border-slate-700/60 rounded-3xl shadow-xl">
          <div className="space-y-6">
            <div className="flex items-center justify-between border-b border-slate-700/60 pb-4">
              <div className="flex items-center space-x-3 text-indigo-400">
                <UserOutlined className="text-2xl" />
                <h2 className="text-xl font-extrabold text-white">Profil Ma'lumotlari</h2>
              </div>
              <Badge status="success" text={<span className="text-emerald-400 font-semibold text-sm">Faol</span>} />
            </div>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-6 text-sm">
              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/40 space-y-1">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <UserOutlined /> F.I.SH
                </div>
                <div className="text-base font-bold text-slate-100">{user?.fullName}</div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/40 space-y-1">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <MailOutlined /> Email Pochta
                </div>
                <div className="text-base font-bold text-slate-100">{user?.email}</div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/40 space-y-1">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <PhoneOutlined /> Telefon Raqam
                </div>
                <div className="text-base font-bold text-slate-100">{user?.phone || 'Biriktirilmagan'}</div>
              </div>

              <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/40 space-y-1">
                <div className="text-slate-400 text-xs font-semibold uppercase tracking-wider flex items-center gap-1.5">
                  <SafetyCertificateOutlined /> Email Holati
                </div>
                <div>
                  <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold bg-emerald-500/10 border border-emerald-500/30 text-emerald-400">
                    <SafetyCertificateOutlined /> Tasdiqlangan
                  </span>
                </div>
              </div>
            </div>

            <div className="bg-slate-900/60 p-4 rounded-2xl border border-slate-700/40 text-xs text-slate-400 flex items-center justify-between">
              <span className="flex items-center gap-1">
                <KeyOutlined /> User ID: <code className="font-mono text-indigo-300 ml-1">{user?.id}</code>
              </span>
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
};
