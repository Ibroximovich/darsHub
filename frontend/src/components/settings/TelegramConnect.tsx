import React from 'react';
import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import {
  Send,
  CheckCircle2,
  BellRing,
  ExternalLink,
  RefreshCw,
  Loader2,
  Unlink,
  ShieldCheck,
  Clock,
  CreditCard,
} from 'lucide-react';
import { telegramApi } from '../../api/telegram';
import toast from 'react-hot-toast';

export const TelegramConnect: React.FC = () => {
  const queryClient = useQueryClient();

  // Ulanish holati — sahifa fokusga qaytganda avtomatik qayta so'rov
  const {
    data,
    isLoading,
    isError,
    refetch,
    isFetching,
  } = useQuery({
    queryKey: ['telegram-status'],
    queryFn: telegramApi.getStatus,
    refetchOnWindowFocus: true,   // foydalanuvchi Telegramdan qaytganda avtomatik yangilanadi
    staleTime: 10 * 1000,         // 10 sekund
  });

  // Ulanish havolasini olish va ochish
  const connectMutation = useMutation({
    mutationFn: telegramApi.getConnectLink,
    onSuccess: (result) => {
      window.open(result.link, '_blank', 'noopener,noreferrer');
      toast.success("Telegram oynasi ochildi. Bot'ga \"Start\" bosing!");
    },
    onError: () => {
      toast.error("Havola olishda xato yuz berdi. Qayta urinib ko'ring.");
    },
  });

  // Ulanishni uzish
  const disconnectMutation = useMutation({
    mutationFn: telegramApi.disconnect,
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['telegram-status'] });
      toast.success("Telegram ulanishi uzildi.");
    },
    onError: () => {
      toast.error("Ulanishni uzishda xato yuz berdi.");
    },
  });

  const connected = data?.connected ?? false;

  return (
    <div className="bg-white border border-stone-200/80 rounded-2xl overflow-hidden shadow-xs">
      {/* Header */}
      <div className="flex items-center gap-3 px-5 py-4 border-b border-stone-100">
        <div className="w-9 h-9 rounded-xl bg-[#229ED9]/10 flex items-center justify-center shrink-0">
          {/* Telegram icon SVG */}
          <svg className="w-5 h-5 text-[#229ED9]" viewBox="0 0 24 24" fill="currentColor">
            <path d="M12 0C5.373 0 0 5.373 0 12s5.373 12 12 12 12-5.373 12-12S18.627 0 12 0zm5.894 8.221-1.97 9.28c-.145.658-.537.818-1.084.508l-3-2.21-1.447 1.394c-.16.16-.295.295-.605.295l.213-3.053 5.56-5.023c.242-.213-.054-.333-.373-.12L7.19 13.982l-2.963-.924c-.643-.204-.657-.643.136-.953l11.57-4.46c.537-.194 1.006.131.961.576z"/>
          </svg>
        </div>
        <div className="flex-1 min-w-0">
          <h3 className="text-sm font-bold text-stone-900 leading-tight">Telegram xabarnomalari</h3>
          <p className="text-xs text-stone-500 mt-0.5">
            {connected ? 'Bot ulangan — eslatmalar yoqilgan' : 'Dars va to\'lov eslatmalarini oling'}
          </p>
        </div>

        {/* Holat badge */}
        {!isLoading && (
          <div className={`flex items-center gap-1.5 px-2.5 py-1 rounded-full text-[11px] font-semibold border ${
            connected
              ? 'bg-green-50 text-green-700 border-green-200'
              : 'bg-stone-100 text-stone-500 border-stone-200'
          }`}>
            <div className={`w-1.5 h-1.5 rounded-full ${connected ? 'bg-green-500 animate-pulse' : 'bg-stone-400'}`} />
            {connected ? 'Ulangan' : 'Ulanmagan'}
          </div>
        )}
      </div>

      <div className="p-5">
        {/* Loading holati */}
        {isLoading && (
          <div className="flex items-center gap-2 text-stone-400 py-4 justify-center">
            <Loader2 className="w-4 h-4 animate-spin" />
            <span className="text-xs">Tekshirilmoqda...</span>
          </div>
        )}

        {/* Xato holati */}
        {isError && !isLoading && (
          <div className="text-center py-4">
            <p className="text-xs text-red-600 mb-3">Holat yuklanmadi.</p>
            <button
              onClick={() => refetch()}
              className="text-xs text-[#0F766E] font-semibold hover:underline flex items-center gap-1 mx-auto"
            >
              <RefreshCw className="w-3 h-3" /> Qayta urinish
            </button>
          </div>
        )}

        {/* ULANGAN HOLAT */}
        {!isLoading && !isError && connected && (
          <div className="space-y-4">
            {/* Muvaffaqiyat xabari */}
            <div className="flex items-start gap-3 p-3.5 bg-green-50 rounded-xl border border-green-100">
              <CheckCircle2 className="w-5 h-5 text-green-600 shrink-0 mt-0.5" />
              <div>
                <p className="text-xs font-semibold text-green-800">Telegram boti ulandi!</p>
                <p className="text-xs text-green-700 mt-0.5 leading-relaxed">
                  Endi dars va to'lov eslatmalarini @DarsHubNotifyBot orqali olasiz.
                </p>
              </div>
            </div>

            {/* Faol eslatmalar ro'yxati */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-stone-700">Faol eslatmalar:</p>
              <div className="space-y-1.5">
                <div className="flex items-center gap-2.5 text-xs text-stone-600">
                  <Clock className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                  <span>Dars boshlanishidan <strong>30 daqiqa</strong> oldin eslatma</span>
                </div>
                <div className="flex items-center gap-2.5 text-xs text-stone-600">
                  <CreditCard className="w-3.5 h-3.5 text-[#0F766E] shrink-0" />
                  <span>Oy oxiriga <strong>3 kun</strong> qolganda to'lovlar ro'yxati</span>
                </div>
              </div>
            </div>

            {/* Uzish tugmasi + qayta tekshirish */}
            <div className="flex items-center gap-2 pt-1">
              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors disabled:opacity-50"
                title="Holatni yangilash"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                Yangilash
              </button>

              <button
                onClick={() => disconnectMutation.mutate()}
                disabled={disconnectMutation.isPending}
                className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-red-500 hover:text-red-700 hover:bg-red-50 transition-colors ml-auto disabled:opacity-50"
              >
                {disconnectMutation.isPending ? (
                  <Loader2 className="w-3.5 h-3.5 animate-spin" />
                ) : (
                  <Unlink className="w-3.5 h-3.5" />
                )}
                Ulanishni uzish
              </button>
            </div>
          </div>
        )}

        {/* ULANMAGAN HOLAT */}
        {!isLoading && !isError && !connected && (
          <div className="space-y-4">
            {/* Foyda tushuntirish kartalar */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-2.5">
              {[
                {
                  icon: Clock,
                  title: 'Dars eslatmasi',
                  desc: 'Dars boshlanishidan 30 daqiqa oldin xabar olasiz',
                  color: 'text-[#0F766E]',
                  bg: 'bg-teal-50',
                },
                {
                  icon: CreditCard,
                  title: 'To\'lov eslatmasi',
                  desc: 'Oy oxiriga 3 kun qolganda to\'lanmagan o\'quvchilar ro\'yxati',
                  color: 'text-amber-600',
                  bg: 'bg-amber-50',
                },
                {
                  icon: ShieldCheck,
                  title: 'Xavfsiz',
                  desc: 'Faqat siz belgilagan Telegram akkauntiga yuboriladi',
                  color: 'text-blue-600',
                  bg: 'bg-blue-50',
                },
              ].map((item) => {
                const Icon = item.icon;
                return (
                  <div key={item.title} className={`${item.bg} rounded-xl p-3 border border-stone-100`}>
                    <Icon className={`w-4 h-4 ${item.color} mb-1.5`} />
                    <p className="text-xs font-semibold text-stone-800 leading-tight">{item.title}</p>
                    <p className="text-[11px] text-stone-500 mt-0.5 leading-relaxed">{item.desc}</p>
                  </div>
                );
              })}
            </div>

            {/* Ulanish tugmasi */}
            <div className="flex items-center gap-3">
              <button
                onClick={() => connectMutation.mutate()}
                disabled={connectMutation.isPending}
                className="flex items-center gap-2 px-4 py-2.5 bg-[#229ED9] hover:bg-[#1a8bbf] text-white text-xs font-bold rounded-xl transition-all shadow-xs active:scale-[0.98] disabled:opacity-70"
              >
                {connectMutation.isPending ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
                <span>Telegram'ni ulash</span>
                <ExternalLink className="w-3.5 h-3.5 opacity-70" />
              </button>

              <button
                onClick={() => refetch()}
                disabled={isFetching}
                className="flex items-center gap-1.5 px-3 py-2.5 rounded-xl text-xs font-medium text-stone-500 hover:text-stone-700 hover:bg-stone-100 transition-colors border border-stone-200 disabled:opacity-50"
                title="Bot'ga Start bossangiz, shu tugma bilan yangilang"
              >
                <RefreshCw className={`w-3.5 h-3.5 ${isFetching ? 'animate-spin' : ''}`} />
                Tekshirish
              </button>
            </div>

            {/* Qo'llanma */}
            <div className="flex items-start gap-2 p-3 bg-stone-50 rounded-xl border border-stone-100">
              <BellRing className="w-4 h-4 text-stone-400 shrink-0 mt-0.5" />
              <p className="text-[11px] text-stone-500 leading-relaxed">
                <strong className="text-stone-700">"Telegram'ni ulash"</strong> tugmasini bosing → Telegram oynasida <strong className="text-stone-700">Start</strong> tugmasini bosing → bu sahifaga qaytib <strong className="text-stone-700">"Tekshirish"</strong> tugmasini bosing yoki sahifa avtomatik yangilanadi.
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
