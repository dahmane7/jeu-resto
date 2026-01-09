import { Request, Response } from 'express';
import { authService } from '../services/auth.service';

export class AuthController {
  /**
   * POST /api/auth/login
   */
  async login(req: Request, res: Response) {
    try {
      const { email, password } = req.body;

      if (!email || !password) {
        return res.status(400).json({
          message: 'Email et mot de passe requis',
        });
      }

      const result = await authService.login(email, password);

      res.json(result);
    } catch (error: any) {
      res.status(401).json({
        message: error.message || 'Erreur de connexion',
      });
    }
  }

  /**
   * POST /api/auth/register
   */
  async register(req: Request, res: Response) {
    try {
      const { email, password, role, restaurantId } = req.body;

      if (!email || !password || !role) {
        return res.status(400).json({
          message: 'Email, mot de passe et rôle requis',
        });
      }

      const user = await authService.register(email, password, role, restaurantId);

      // Retourner l'utilisateur sans le password_hash
      const { password_hash, ...userWithoutPassword } = user;

      res.status(201).json({
        message: 'Utilisateur créé avec succès',
        user: userWithoutPassword,
      });
    } catch (error: any) {
      res.status(400).json({
        message: error.message || 'Erreur lors de la création',
      });
    }
  }

  /**
   * GET /api/auth/me
   * Récupérer l'utilisateur connecté
   */
  async me(req: Request, res: Response) {
    try {
      // L'utilisateur est ajouté par le middleware auth
      const user = (req as any).user;

      if (!user) {
        return res.status(401).json({
          message: 'Non authentifié',
        });
      }

      res.json({ user });
    } catch (error: any) {
      res.status(500).json({
        message: error.message || 'Erreur serveur',
      });
    }
  }
}

export const authController = new AuthController();
