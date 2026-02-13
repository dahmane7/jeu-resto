import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import authRoutes from './routes/auth.routes.js';
import restaurantRoutes from './routes/restaurant.routes.js';
import publicRoutes from './routes/public.routes.js';
import { prisma } from './lib/prisma.js';

dotenv.config();

export const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());

// Routes
app.use('/api/auth', authRoutes);
app.use('/api/restaurants', restaurantRoutes);
app.use('/api/public', publicRoutes);

// Health check (inclut un ping DB si DATABASE_URL est défini)
app.get('/api/health', async (req, res) => {
  const dbStatus = process.env.DATABASE_URL
    ? await prisma.$queryRaw`SELECT 1`
        .then(() => 'connected')
        .catch(() => 'error')
    : 'not_configured';
  res.json({
    status: 'ok',
    message: 'Backend is running',
    database: dbStatus,
  });
});

/** Démarrer le serveur en local (non utilisé sur Netlify) */
export function startServer(): void {
  app.listen(PORT, () => {
    console.log(`🚀 Server running on http://localhost:${PORT}`);
  });
}
