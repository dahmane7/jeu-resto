import { Router } from 'express';
import { authController } from '../controllers/auth.controller';
import { authenticate } from '../middleware/auth.middleware';

const router = Router();

// POST /api/auth/login
router.post('/login', authController.login.bind(authController));

// POST /api/auth/register (optionnel, pour créer des utilisateurs)
router.post('/register', authController.register.bind(authController));

// GET /api/auth/me (récupérer l'utilisateur connecté)
router.get('/me', authenticate, authController.me.bind(authController));

export default router;
