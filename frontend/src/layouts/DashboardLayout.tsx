import React, { useEffect, useState, useMemo } from 'react';
import { Outlet, useNavigate } from 'react-router-dom';
import { Sidebar } from '../components/Sidebar';
import { FeedbackBanner } from '../components/FeedbackBanner';
import { authService } from '../services/auth.service';
import type { User } from '../types/auth.types';
import { Loader2 } from 'lucide-react';

const SEVEN_DAYS_MS = 7 * 24 * 60 * 60 * 1000;

export const DashboardLayout: React.FC = () => {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const navigate = useNavigate();
  

  useEffect(() => {
    const fetchUser = async () => {
      try {
        const response = await authService.getMe();
        if (response.success && response.user) {
          setUser(response.user);
        } else {
          navigate('/login');
        }
      } catch {
        navigate('/login');
      } finally {
        setLoading(false);
      }
    };

    fetchUser();
  }, [navigate]);

  const isSevenDaysOldUser = useMemo(() => {
    if (!user?.createdAt) return false;
    const createdTime = new Date(user.createdAt).getTime();
    return !isNaN(createdTime) && (Date.now() - createdTime) >= SEVEN_DAYS_MS;
  }, [user]);

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[#FAFAF9]">
        <div className="flex items-center gap-2.5 text-[#0F766E] font-semibold text-xs">
          <Loader2 className="w-5 h-5 animate-spin text-[#0F766E]" />
          <span>Yuklanmoqda...</span>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-[#FAFAF9] text-[#1C1917] flex flex-col lg:flex-row font-sans tabular-nums antialiased selection:bg-[#0F766E]/15 selection:text-[#0F766E]">
      <Sidebar user={user} />
      {/* 
        pb-[calc(56px+env(safe-area-inset-bottom))] — mobile bottom nav (56px) + iPhone safe area
        lg:pb-8 — desktop override
      */}
      <main
        className="flex-1 px-4 pt-4 pb-[calc(56px+env(safe-area-inset-bottom,0px))] sm:px-6 sm:pt-5 lg:px-8 lg:pt-8 lg:pb-8 max-w-7xl mx-auto w-full overflow-x-hidden space-y-4 sm:space-y-5 lg:space-y-6"
      >
        {isSevenDaysOldUser && (
          <FeedbackBanner
            storageKey="feedback_7days_banner_dismissed"
            title="DarsHub'ni bir haftadan beri ishlatyapsiz 👋"
            message="Qanday o'tyapti? Fikringiz yoki taklifingiz bo'lsa, to'g'ridan-to'g'ri menga yozing"
            buttonText="Telegram'da yozish"
            variant="teal"
          />
        )}
        <Outlet context={{ user }} />
      </main>
    </div>
  );
};
