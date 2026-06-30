import { Response } from 'express';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import pool from '../db/index.js';
import { AuthRequest } from '../middleware/auth.middleware.js';
import { sendResetCodeEmail } from '../utils/email.js';

// Email validation regex
const EMAIL_REGEX = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

export const register = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password, full_name, role = 'teacher' } = req.body;

    console.log(email,password,full_name);
    // 1. Barcha maydonlar to'ldirilganini tekshirish
    if (!email || !password || !full_name) {
      
      return res.json({
        success: false,
        message: 'Barcha maydonlar to\'ldirilishi kerak: email, password, full_name'
      });
    }

    // 2. Email formatini tekshirish
    if (!EMAIL_REGEX.test(email)) {
      return res.json({
        success: false,
        message: 'Email formati noto\'g\'ri'
      });
    }

    // 3. Parol minimum 8 ta belgi ekanligini tekshirish
    if (password.length < 7) {
      return res.json({
        success: false,
        message: 'Parol minimum 8 ta belgi bo\'lishi kerak'
      });
    }

    // 4. Email database da bor yoki yo'qligini tekshirish
    const userExists = await pool.query('SELECT id FROM users WHERE email = $1', [email.toLowerCase()]);
    if (userExists.rows.length > 0) {
      return res.json({
        success: false,
        message: 'Bu email allaqachon ro\'yxatdan o\'tgan'
      });
    }

    // 5. Parolni bcrypt bilan shifrlash
    const hashedPassword = await bcrypt.hash(password, 10);

    // 6. Database ga saqlash
    const result = await pool.query(
      'INSERT INTO users (email, password, full_name, role) VALUES ($1, $2, $3, $4) RETURNING id, email, full_name, role',
      [email.toLowerCase(), hashedPassword, full_name, role]
    );

    const user = result.rows[0];

    // 7. JWT token generatsiya qilish
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_secret',
      { expiresIn: '7d' }
    );

    // 8. Token va user ma'lumotlarini qaytarish
    res.status(201).json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Register error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

export const login = async (req: AuthRequest, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.json({
        success: false,
        message: 'Email va parol kerak'
      });
    }

    // Find user
    const result = await pool.query('SELECT * FROM users WHERE email = $1', [email.toLowerCase()]);

    if (result.rows.length === 0) {
      return res.json({
        success: false,
        message: 'Email yoki parol noto\'g\'ri'
      });
    }

    const user = result.rows[0];

    // Compare password
    const passwordMatch = await bcrypt.compare(password, user.password);

    if (!passwordMatch) {
      return res.json({
        success: false,
        message: 'Email yoki parol noto\'g\'ri'
      });
    }

    // Create token
    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role },
      process.env.JWT_SECRET || 'your_secret',
      { expiresIn: '7d' }
    );

    res.json({
      success: true,
      token,
      user: {
        id: user.id,
        full_name: user.full_name,
        email: user.email,
        role: user.role
      }
    });
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

export const forgotPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { email } = req.body;

    if (!email) {
      return res.json({
        success: false,
        message: 'Email kerak'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);

    if (userResult.rows.length > 0) {
      const userId = userResult.rows[0].id;
      const code = Math.floor(100000 + Math.random() * 900000).toString();
      const expiresAt = new Date(Date.now() + 10 * 60 * 1000);

      await pool.query('DELETE FROM password_resets WHERE user_id = $1', [userId]);
      await pool.query(
        'INSERT INTO password_resets (user_id, code, expires_at) VALUES ($1, $2, $3)',
        [userId, code, expiresAt]
      );

      await sendResetCodeEmail(normalizedEmail, code);
    }

    return res.json({
      success: true,
      message: "Tasdiqlash kodi yuborildi"
    });
  } catch (error) {
    console.error('Forgot password error:', error);
    return res.json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

export const verifyCode = async (req: AuthRequest, res: Response) => {
  try {
    const { email, code } = req.body;

    if (!email || !code) {
      return res.status(400).json({
        success: false,
        message: 'Email va kod kerak'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Kod noto'g'ri yoki muddati o'tgan"
      });
    }

    const userId = userResult.rows[0].id;
    const resetCodeResult = await pool.query(
      'SELECT id FROM password_resets WHERE user_id = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [userId, String(code)]
    );

    if (resetCodeResult.rows.length === 0) {
      return res.json({
        success: false,
        message: "Kod noto'g'ri yoki muddati o'tgan"
      });
    }

    return res.json({
      success: true,
      message: "Kod to'g'ri"
    });
  } catch (error) {
    console.error('Verify code error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};

export const resetPassword = async (req: AuthRequest, res: Response) => {
  try {
    const { email, code, new_password } = req.body;

    if (!email || !code || !new_password) {
      return res.status(400).json({
        success: false,
        message: "Barcha maydonlar to'ldirilishi kerak"
      });
    }

    if (String(new_password).length < 8) {
      return res.status(400).json({
        success: false,
        message: 'Parol minimum 8 ta belgi bo\'lishi kerak'
      });
    }

    const normalizedEmail = String(email).trim().toLowerCase();
    const userResult = await pool.query('SELECT id FROM users WHERE email = $1', [normalizedEmail]);

    if (userResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Kod noto'g'ri yoki muddati o'tgan"
      });
    }

    const userId = userResult.rows[0].id;
    const resetCodeResult = await pool.query(
      'SELECT id FROM password_resets WHERE user_id = $1 AND code = $2 AND expires_at > NOW() ORDER BY created_at DESC LIMIT 1',
      [userId, String(code)]
    );

    if (resetCodeResult.rows.length === 0) {
      return res.status(400).json({
        success: false,
        message: "Kod noto'g'ri yoki muddati o'tgan"
      });
    }

    const hashedPassword = await bcrypt.hash(String(new_password), 10);
    await pool.query('UPDATE users SET password = $1, updated_at = NOW() WHERE id = $2', [hashedPassword, userId]);
    await pool.query('DELETE FROM password_resets WHERE user_id = $1', [userId]);

    return res.json({
      success: true,
      message: 'Parol muvaffaqiyatli yangilandi'
    });
  } catch (error) {
    console.error('Reset password error:', error);
    return res.status(500).json({
      success: false,
      message: 'Server xatosi'
    });
  }
};
