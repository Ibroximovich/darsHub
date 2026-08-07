import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../lib/prisma';

const token = process.env.TELEGRAM_BOT_TOKEN as string;

let bot: TelegramBot | null = null;

/**
 * Telegram botni polling rejimida ishga tushirish va /start buyrug'ini qayta ishlash
 */
export function initTelegramBot(): void {
  if (!token) {
    console.warn('[TelegramBot] TELEGRAM_BOT_TOKEN topilmadi. Bot ishga tushmaydi.');
    return;
  }

  bot = new TelegramBot(token, { polling: true });

  console.log('[TelegramBot] ✅ Bot polling rejimida ishga tushdi.');

  // /start <userId> buyrug'ini qabul qilish
  bot.onText(/\/start (.+)/, async (msg, match) => {
    const chatId = msg.chat.id.toString();
    const userId = match ? match[1].trim() : null;

    if (!userId) {
      await bot!.sendMessage(chatId, '❌ Noto\'g\'ri havola. Iltimos, DarsHub ilovasidan qaytadan ulanish havolasini oling.');
      return;
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        await bot!.sendMessage(chatId, '❌ Foydalanuvchi topilmadi. Iltimos, DarsHub ilovasidan qaytadan ulanish havolasini oling.');
        return;
      }

      // Telegram Chat ID sini foydalanuvchiga bog'lash
      await prisma.user.update({
        where: { id: userId },
        data: { telegramChatId: chatId },
      });

      await bot!.sendMessage(
        chatId,
        `✅ DarsHub xabarnomalari ulandi!\n\nSalom, *${user.fullName}*! Endi dars va to'lov eslatmalarini shu yerda olasiz. 🎉`,
        { parse_mode: 'Markdown' }
      );

      console.log(`[TelegramBot] Foydalanuvchi ulandi: ${user.email} -> chatId: ${chatId}`);
    } catch (error) {
      console.error('[TelegramBot] /start buyrug\'ida xato:', error);
      await bot!.sendMessage(chatId, '❌ Xato yuz berdi. Iltimos, keyinroq urinib ko\'ring.');
    }
  });

  // /start parametrsiz bosish
  bot.onText(/^\/start$/, async (msg) => {
    const chatId = msg.chat.id.toString();
    await bot!.sendMessage(
      chatId,
      '👋 Salom! Bu DarsHub xabarnoma boti.\n\nBotni faollashtirish uchun DarsHub ilovasidan ulanish havolasini oling va shu yerga yuboring.'
    );
  });

  bot.on('polling_error', (err) => {
    console.error('[TelegramBot] Polling xato:', err.message);
  });
}

/**
 * Telegram orqali xabar yuboruvchi umumiy funksiya.
 * Agar chatId null bo'lsa yoki xato bo'lsa — log qilinadi, dastur yiqilmaydi.
 */
export async function sendTelegramMessage(chatId: string | null, text: string): Promise<void> {
  if (!chatId) return;
  if (!bot) {
    console.warn('[TelegramBot] Bot ishga tushmagan. Xabar yuborilmadi.');
    return;
  }

  try {
    await bot.sendMessage(chatId, text, { parse_mode: 'Markdown' });
  } catch (error: any) {
    console.error(`[TelegramBot] Xabar yuborishda xato (chatId: ${chatId}):`, error.message);
  }
}
