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

app.use(cors({
  origin: (origin, callback) => {
    if (
      !origin ||
      allowedOrigins.includes(origin) ||
      origin.endsWith('.vercel.app') ||
      process.env.NODE_ENV !== 'production'
    ) {
      return callback(null, true);
    }
    return callback(new Error('CORS taqiqlandi'));
  },
  credentials: true,
}));
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

// ─── Markazlashtirilgan xatolarni qayta ishlash ─────────────────────────────

app.use(errorHandler);

// ─── Server'ni ishga tushirish ──────────────────────────────────────────────

const PORT = process.env.PORT || 5000;

app.listen(PORT, () => {
  console.log(`
  ╔══════════════════════════════════════════════════════╗
  ║                                                      ║
  ║   📚 DarsHub API Server                              ║
  ║   🌐 http://localhost:${PORT}                          ║
  ║   📖 Swagger UI: http://localhost:${PORT}/api-docs    ║
  ║   📋 Environment: ${process.env.NODE_ENV || 'development'}                   ║
  ║                                                      ║
  ╚══════════════════════════════════════════════════════╝
  `);
});

export default app;
