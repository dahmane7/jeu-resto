import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors({
  origin: process.env.CORS_ORIGIN || 'http://localhost:5173',
  credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check
app.get('/health', (req, res) => {
  res.json({ status: 'ok', message: 'Server is running' });
});

// Routes
import authRoutes from './routes/auth.routes';
app.use('/api/auth', authRoutes);

// Routes will be added here
// app.use('/api/r', publicRoutes);
// app.use('/api/admin', adminRoutes);
// app.use('/api/restaurant', restaurantRoutes);
// app.use('/api/caisse', caisseRoutes);

app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  
  // Afficher le mode (MOCK ou réel)
  const USE_MOCK = process.env.USE_MOCK === 'true' || !process.env.AIRTABLE_API_KEY;
  if (USE_MOCK) {
    console.log('📝 Mode MOCK activé - Utilisation de données factices');
    console.log('👤 Utilisateur disponible :');
    console.log('   - admin@restaurant.com / Admin123! (ADMIN_RESTAURANT)');
    console.log('   → Redirection : /restaurant/restaurant-1/dashboard');
  } else {
    console.log('🔗 Mode Airtable activé');
  }
});
