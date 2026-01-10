import { Request, Response } from 'express';
import { authService } from '../services/auth.service.js';

export const login = async (req: Request, res: Response) => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      return res.status(400).json({ error: 'Email et mot de passe requis' });
    }

    const result = await authService.login(email, password);

    if (!result) {
      return res.status(401).json({ error: 'Email ou mot de passe incorrect' });
    }

    res.json(result);
  } catch (error) {
    console.error('Login error:', error);
    res.status(500).json({ error: 'Erreur lors de la connexion' });
  }
};

export const me = async (req: Request, res: Response) => {
  try {
    const user = (req as any).user;
    const userData = await authService.getUserById(user.id);

    if (!userData) {
      return res.status(404).json({ error: 'Utilisateur non trouvé' });
    }

    res.json({ user: userData });
  } catch (error) {
    console.error('Me error:', error);
    res.status(500).json({ error: 'Erreur lors de la récupération du profil' });
  }
};
