import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import swaggerUi from 'swagger-ui-express';
import { initializeDatabase } from './db/index.js';
import { swaggerSpec } from './swagger.js';
import authRoutes from './routes/auth.routes.js';
import groupsRoutes from './routes/groups.routes.js';
import studentsRoutes from './routes/students.routes.js';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Swagger docs
app.use('/api-docs', swaggerUi.serve, swaggerUi.setup(swaggerSpec, {
  swaggerOptions: {
    persistAuthorization: true,
  }
}));

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/groups', groupsRoutes);
app.use('/api/students', studentsRoutes);

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'OK' });
});

// Initialize database and start server
async function startServer() {
  try {
    await initializeDatabase();
    app.listen(PORT, () => {
      console.log(`🚀 Server ${PORT} portida ishga tushdi`);
      console.log(`📚 Swagger docs: http://localhost:${PORT}/api-docs`);
    });
  } catch (error) {
    console.error('Server xatosi:', error);
    process.exit(1);
  }
}

startServer();
