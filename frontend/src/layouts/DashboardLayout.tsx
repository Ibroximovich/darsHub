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
      <main className="flex-1 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto w-full overflow-x-hidden pb-20 lg:pb-8 space-y-6">
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
