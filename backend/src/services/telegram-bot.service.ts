import TelegramBot from 'node-telegram-bot-api';
import { prisma } from '../lib/prisma';

const token = process.env.TELEGRAM_BOT_TOKEN as string;

let bot: TelegramBot | null = null;

/**
 * Inline keyboard tugmasi — "🌐 DarsHub'ga o'tish"
 */
function getFrontendKeyboard() {
  const url = process.env.FRONTEND_URL || process.env.CLIENT_URL || 'https://darshub.uz';
  return {
    reply_markup: {
      inline_keyboard: [
        [
          {
            text: "🌐 DarsHub'ga o'tish",
            url,
          },
        ],
      ],
    },
  };
}

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
      await bot!.sendMessage(
        chatId,
        `❌ <b>Bog'lanish havolasi noto'g'ri</b>\n\nIltimos, DarsHub saytidagi Sozlamalar bo'limidan 'Telegram'ni ulash' tugmasini bosib qayta urinib ko'ring.`,
        { parse_mode: 'HTML', ...getFrontendKeyboard() }
      );
      return;
    }

    try {
      const user = await prisma.user.findUnique({ where: { id: userId } });

      if (!user) {
        await bot!.sendMessage(
          chatId,
          `❌ <b>Foydalanuvchi topilmadi</b>\n\nIltimos, DarsHub saytidagi Sozlamalar bo'limidan 'Telegram'ni ulash' tugmasini bosib qayta urinib ko'ring.`,
          { parse_mode: 'HTML', ...getFrontendKeyboard() }
        );
        return;
      }

      // Foydalanuvchi allaqachon shu chat bilan ulangan bo'lsa
      if (user.telegramChatId === chatId) {
        await bot!.sendMessage(
          chatId,
          `ℹ️ <b>Siz allaqachon ulangansiz. Xabarnomalar faol.</b>`,
          { parse_mode: 'HTML', ...getFrontendKeyboard() }
        );
        return;
      }

      // Telegram Chat ID sini foydalanuvchiga bog'lash
      await prisma.user.update({
        where: { id: userId },
        data: { telegramChatId: chatId },
      });

      await bot!.sendMessage(
        chatId,
        `✅ <b>DarsHub xabarnomalari ulandi!</b>\n\n` +
        `Endi quyidagi eslatmalarni shu yerda olasiz:\n` +
        `📅 Dars boshlanishidan 30 daqiqa oldin\n` +
        `💰 To'lov muddati yaqinlashganda\n\n` +
        `Savol yoki taklif bo'lsa, shu yerga yozing — men (Sarvar) shaxsan javob beraman.`,
        { parse_mode: 'HTML', ...getFrontendKeyboard() }
      );

      console.log(`[TelegramBot] Foydalanuvchi ulandi: ${user.email} -> chatId: ${chatId}`);
    } catch (error) {
      console.error('[TelegramBot] /start buyrug\'ida xato:', error);
      await bot!.sendMessage(chatId, '❌ Xato yuz berdi. Iltimos, keyinroq urinib ko\'ring.');
    }
  });

  // /start parametrsiz (oddiy, USERID'siz) bosish
  bot.onText(/^\/start$/, async (msg) => {
    const chatId = msg.chat.id.toString();
    await bot!.sendMessage(
      chatId,
      `❌ <b>Bog'lanish havolasi noto'g'ri</b>\n\nIltimos, DarsHub saytidagi Sozlamalar bo'limidan 'Telegram'ni ulash' tugmasini bosib qayta urinib ko'ring.`,
      { parse_mode: 'HTML', ...getFrontendKeyboard() }
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
    initTelegramBot();
  }
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
