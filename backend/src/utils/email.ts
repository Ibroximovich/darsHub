import nodemailer from 'nodemailer';

const transporter = nodemailer.createTransport({
  service: 'gmail',
  auth: {
    user: process.env.EMAIL_USER,
    pass: process.env.EMAIL_PASSWORD,
  },
});

export const sendResetCodeEmail = async (to: string, code: string) => {
  const mailOptions = {
    from: process.env.EMAIL_USER,
    to,
    subject: 'DarsHub - Parolni tiklash',
    html: `
      <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 24px; border: 1px solid #e5e7eb; border-radius: 12px;">
        <h2 style="color: #2563eb; margin-bottom: 12px;">DarsHub parol tiklash</h2>
        <p style="font-size: 16px; color: #374151;">Parolingizni tiklash uchun quyidagi 6 xonali kodni kiriting:</p>
        <div style="margin: 24px 0; padding: 16px 24px; background: #eff6ff; border-radius: 8px; text-align: center; font-size: 32px; letter-spacing: 6px; font-weight: bold; color: #1d4ed8;">${code}</div>
        <p style="font-size: 14px; color: #6b7280;">Ushbu kod 10 daqiqa davom etadi. Agar bu so'rov sizdan bo'lmasa, bu xatni e'tiborsiz qoldirishingiz mumkin.</p>
      </div>
    `,
  };

  await transporter.sendMail(mailOptions);
};
