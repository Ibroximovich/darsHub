// DarsHub Server — Production ready
import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import cookieParser from 'cookie-parser';
import swaggerUi from 'swagger-ui-express';
import { swaggerSpec } from './config/swagger';
import authRoutes from './routes/auth.routes';
import groupsRoutes from './routes/groups.routes';
import studentsRoutes from './routes/students.routes';
import attendanceRoutes from './routes/attendance.routes';
import paymentsRoutes from './routes/payments.routes';
import adminRoutes from './routes/admin.routes';
import telegramRoutes from './routes/telegram.routes';
import { initTelegramBot } from './services/telegram-bot.service';
import { initCronJobs } from './jobs/index';
import { errorHandler } from './middleware/error-handler';

const app = express();

// ─── Middleware'lar ──────────────────────────────────────────────────────────

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://127.0.0.1:5173',
  'http://127.0.0.1:3000',
  process.env.CLIENT_URL,
].filter(Boolean) as string[];

// Bulletproof CORS middleware with official cors package
app.use(
  cors({
    origin: true,
    credentials: true,
  })
);

app.use(express.json());
app.use(cookieParser());

// ─── Swagger Documentation ──────────────────────────────────────────────────
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec));

// ─── Routes ─────────────────────────────────────────────────────────────────

// Root endpoint
app.get('/', (_req, res) => {
  res.json({
    success: true,
    message: '📚 DarsHub API Server ishlayapti!',
    swaggerDocs: '/api-docs',
    healthCheck: '/api/health',
  });
});

// Health check
app.get('/api/health', (_req, res) => {
  res.json({
    success: true,
    message: '🚀 DarsHub API ishlayapti!',
    timestamp: new Date().toISOString(),
  });
});

// Auth routes
app.use('/api/auth', authRoutes);

// Groups routes
app.use('/api/groups', groupsRoutes);

// Students routes
app.use('/api/students', studentsRoutes);

// Attendance & Lessons routes
app.use('/api', attendanceRoutes);

// Payments routes
app.use('/api', paymentsRoutes);

// Admin routes
app.use('/api/admin', adminRoutes);

// Telegram routes
app.use('/api/telegram', telegramRoutes);

// ─── Markazlashtirilgan xatolarni qayta ishlash ─────────────────────────────

app.use(errorHandler);

// ─── Server'ni ishga tushirish ──────────────────────────────────────────────

const PORT = Number(process.env.PORT) || 5000;

app.listen(PORT, '0.0.0.0', () => {
  console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║                                                      ║
  ║   📚 DarsHub API Server                              ║
  ║   🌐 Port: ${PORT}                                    ║
  ║   📖 Swagger UI: /api-docs                           ║
  ║   📋 Environment: ${process.env.NODE_ENV || 'development'}                   ║
  ║                                                      ║
  ╚══════════════════════════════════════════════════════╝
  `);

  // Telegram botni ishga tushirish
  initTelegramBot();

  // Cron job'larni ishga tushirish
  initCronJobs();
});

export default app;
