import { Resend } from 'resend';
import nodemailer from 'nodemailer';

/**
 * Tasdiqlash kodini chiroyli HTML shablon bilan email orqali yuborish.
 * Agar .env faylida SMTP_USER va SMTP_PASS ko'rsatilgan bo'lsa — Gmail Nodemailer ishlatadi.
 * Aks holda — Resend API orqali yuboradi.
 */
export async function sendVerificationEmail(
  to: string,
  code: string
): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="uz">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #6366f1, #8b5cf6); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
            📚 DarsHub
          </h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">
            Yakka repetitorlar uchun boshqaruv platformasi
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 36px 32px;">
          <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px; font-weight: 600;">
            Email tasdiqlash
          </h2>
          <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6;">
            Ro'yxatdan o'tishni yakunlash uchun quyidagi tasdiqlash kodini kiriting:
          </p>

          <!-- OTP Code -->
          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #f0f0ff, #e8e8ff); border: 2px dashed #6366f1; border-radius: 12px; padding: 16px 32px;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #4f46e5; font-family: 'Courier New', monospace;">
                ${code}
              </span>
            </div>
          </div>

          <p style="margin: 24px 0 0; color: #94a3b8; font-size: 13px; line-height: 1.5; text-align: center;">
            ⏱️ Bu kod <strong>10 daqiqa</strong> ichida amal qiladi.<br/>
            Agar siz bu so'rovni yubormagan bo'lsangiz, ushbu xatni e'tiborsiz qoldiring.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">
            © ${new Date().getFullYear()} DarsHub. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Agar Gmail SMTP sozlangan bo'lsa (va placeholder bo'lmasa) — Nodemailer ishlatish
  if (
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    !process.env.SMTP_USER.includes('your_gmail')
  ) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"DarsHub" <${process.env.SMTP_USER}>`,
      to,
      subject: 'DarsHub — Tasdiqlash kodi',
      html: htmlContent,
    });

    return;
  }

  // 2. Aks holda — Resend API ishlatish
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY yoki SMTP_USER/SMTP_PASS o'zgaruvchilari topilmadi.");
  }
  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'DarsHub <onboarding@resend.dev>';

  const response = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: 'DarsHub — Tasdiqlash kodi',
    html: htmlContent,
  });

  if (response.error) {
    console.error('❌ Resend API Error:', response.error.message || response.error);
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ [DEV MODE NOTICE]: Resend Sandbox cheklovi sababli xat faqat hisob egasiga (azamovsarvar555@gmail.com) boradi. Boshqa email apparatlari uchun yuqoridagi terminal OTP kodini kiriting.');
      return;
    }
    throw new Error(`Email yuborib bo'lmadi: ${response.error.message}`);
  }
}

/**
 * Parolni tiklash kodini email orqali yuborish
 */
export async function sendPasswordResetEmail(
  to: string,
  code: string
): Promise<void> {
  const htmlContent = `
    <!DOCTYPE html>
    <html lang="uz">
    <head>
      <meta charset="UTF-8" />
      <meta name="viewport" content="width=device-width, initial-scale=1.0" />
    </head>
    <body style="margin: 0; padding: 0; background-color: #f4f7fa; font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif;">
      <div style="max-width: 520px; margin: 40px auto; background: #ffffff; border-radius: 16px; overflow: hidden; box-shadow: 0 4px 24px rgba(0,0,0,0.08);">
        
        <!-- Header -->
        <div style="background: linear-gradient(135deg, #ef4444, #f97316); padding: 32px 24px; text-align: center;">
          <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: 700; letter-spacing: -0.5px;">
            🔑 DarsHub
          </h1>
          <p style="margin: 8px 0 0; color: rgba(255,255,255,0.85); font-size: 14px;">
            Parolni tiklash so'rovi
          </p>
        </div>

        <!-- Body -->
        <div style="padding: 36px 32px;">
          <h2 style="margin: 0 0 8px; color: #1e293b; font-size: 20px; font-weight: 600;">
            Parolni yangilash kodi
          </h2>
          <p style="margin: 0 0 24px; color: #64748b; font-size: 15px; line-height: 1.6;">
            DarsHub hisobingiz parolini tiklash uchun quyidagi maxfiylik kodini kiriting:
          </p>

          <!-- OTP Code -->
          <div style="text-align: center; margin: 24px 0;">
            <div style="display: inline-block; background: linear-gradient(135deg, #fff5f5, #ffe8e8); border: 2px dashed #ef4444; border-radius: 12px; padding: 16px 32px;">
              <span style="font-size: 36px; font-weight: 800; letter-spacing: 8px; color: #dc2626; font-family: 'Courier New', monospace;">
                ${code}
              </span>
            </div>
          </div>

          <p style="margin: 24px 0 0; color: #94a3b8; font-size: 13px; line-height: 1.5; text-align: center;">
            ⏱️ Bu kod <strong>10 daqiqa</strong> ichida amal qiladi.<br/>
            Agar siz parolni tiklash so'rovini yubormagan bo'lsangiz, xavfsizligingiz uchun ushbu xatni e'tiborsiz qoldiring.
          </p>
        </div>

        <!-- Footer -->
        <div style="background: #f8fafc; padding: 20px 32px; text-align: center; border-top: 1px solid #e2e8f0;">
          <p style="margin: 0; color: #94a3b8; font-size: 12px;">
            © ${new Date().getFullYear()} DarsHub. Barcha huquqlar himoyalangan.
          </p>
        </div>
      </div>
    </body>
    </html>
  `;

  // 1. Gmail SMTP bo'lsa (va placeholder bo'lmasa) — Nodemailer
  if (
    process.env.SMTP_USER &&
    process.env.SMTP_PASS &&
    !process.env.SMTP_USER.includes('your_gmail')
  ) {
    const transporter = nodemailer.createTransport({
      host: process.env.SMTP_HOST || 'smtp.gmail.com',
      port: Number(process.env.SMTP_PORT) || 587,
      secure: false,
      auth: {
        user: process.env.SMTP_USER,
        pass: process.env.SMTP_PASS,
      },
    });

    await transporter.sendMail({
      from: `"DarsHub" <${process.env.SMTP_USER}>`,
      to,
      subject: 'DarsHub — Parolni tiklash kodi',
      html: htmlContent,
    });

    return;
  }

  // 2. Resend API
  const apiKey = process.env.RESEND_API_KEY;
  if (!apiKey) {
    throw new Error("RESEND_API_KEY yoki SMTP_USER/SMTP_PASS o'zgaruvchilari topilmadi.");
  }
  const resend = new Resend(apiKey);
  const fromEmail = process.env.RESEND_FROM_EMAIL || 'DarsHub <onboarding@resend.dev>';

  const response = await resend.emails.send({
    from: fromEmail,
    to: [to],
    subject: 'DarsHub — Parolni tiklash kodi',
    html: htmlContent,
  });

  if (response.error) {
    console.error('❌ Resend API Error:', response.error.message || response.error);
    if (process.env.NODE_ENV !== 'production') {
      console.warn('⚠️ [DEV MODE NOTICE]: Resend Sandbox cheklovi sababli xat faqat hisob egasiga (azamovsarvar555@gmail.com) boradi. Boshqa email apparatlari uchun yuqoridagi terminal OTP kodini kiriting.');
      return;
    }
    throw new Error(`Email yuborib bo'lmadi: ${response.error.message}`);
  }
}
