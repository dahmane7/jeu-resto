import { Request, Response, NextFunction } from 'express';

export const requireRestaurantAccess = (req: Request, res: Response, next: NextFunction) => {
  const user = (req as any).user;
  const restaurantId = req.params.id || req.params.restaurantId;

  if (!restaurantId) {
    return res.status(400).json({ error: 'Restaurant ID manquant' });
  }

  if (user.role === 'SUPER_ADMIN') {
    return next();
  }

  if (user.restaurant_id !== restaurantId) {
    return res.status(403).json({ error: 'Accès refusé à ce restaurant' });
  }

  next();
};
