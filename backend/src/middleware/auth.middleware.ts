import { Request, Response, NextFunction } from 'express';
import { authService } from '../services/auth.service';
import { authServiceMock } from '../services/auth.service.mock';
import { airtable, TABLES } from '../utils/airtable';
import { User } from '../types';

// Mode MOCK : utiliser les données factices si USE_MOCK=true
const USE_MOCK = process.env.USE_MOCK === 'true' || !process.env.AIRTABLE_API_KEY;

// Étendre l'interface Request pour inclure user
declare global {
  namespace Express {
    interface Request {
      user?: any;
    }
  }
}

/**
 * Middleware d'authentification
 * Vérifie le token JWT et ajoute l'utilisateur à la requête
 */
export async function authenticate(
  req: Request,
  res: Response,
  next: NextFunction
) {
  try {
    // Récupérer le token depuis le header Authorization
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({
        message: 'Token manquant',
      });
    }

    const token = authHeader.substring(7); // Enlever "Bearer "

    // Vérifier le token
    const decoded = USE_MOCK 
      ? authServiceMock.verifyToken(token)
      : authService.verifyToken(token);

    // Récupérer l'utilisateur
    let user;
    if (USE_MOCK) {
      user = await authServiceMock.getUserById(decoded.userId);
    } else {
      user = await airtable.findById<User>(TABLES.USERS, decoded.userId);
    }

    if (!user) {
      return res.status(401).json({
        message: 'Utilisateur non trouvé',
      });
    }

    // Ajouter l'utilisateur à la requête
    const restaurantId = Array.isArray(user.restaurant_id)
      ? user.restaurant_id[0]
      : user.restaurant_id;

    req.user = {
      ...user,
      restaurant_id: restaurantId,
    };

    next();
  } catch (error: any) {
    return res.status(401).json({
      message: error.message || 'Token invalide',
    });
  }
}

/**
 * Middleware pour vérifier les rôles
 */
export function requireRole(...allowedRoles: string[]) {
  return (req: Request, res: Response, next: NextFunction) => {
    if (!req.user) {
      return res.status(401).json({
        message: 'Non authentifié',
      });
    }

    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({
        message: 'Accès refusé - Rôle insuffisant',
      });
    }

    next();
  };
}

/**
 * Middleware pour vérifier que l'utilisateur appartient au restaurant
 */
export function requireRestaurantAccess(
  req: Request,
  res: Response,
  next: NextFunction
) {
  if (!req.user) {
    return res.status(401).json({
      message: 'Non authentifié',
    });
  }

  // Les SUPER_ADMIN ont accès à tout
  if (req.user.role === 'SUPER_ADMIN') {
    return next();
  }

  // Vérifier que l'utilisateur a un restaurant_id
  if (!req.user.restaurant_id) {
    return res.status(403).json({
      message: 'Accès refusé - Aucun restaurant associé',
    });
  }

  // Vérifier que l'utilisateur accède à son propre restaurant
  const restaurantId = req.params.id || req.params.restaurantId;

  if (restaurantId && req.user.restaurant_id !== restaurantId) {
    return res.status(403).json({
      message: 'Accès refusé - Restaurant différent',
    });
  }

  next();
}
