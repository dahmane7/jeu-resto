import { Router } from 'express';
import { authenticate } from '../middleware/auth.middleware.js';
import { requireRole } from '../middleware/auth.middleware.js';
import { requireRestaurantAccess } from '../middleware/restaurant.middleware.js';
import {
  getRestaurant,
  updateRestaurant,
  getStats,
  getPrizes,
  createPrize,
  updatePrize,
  deletePrize,
  getClients,
  createClient,
  updateClient,
  deleteClient,
  getParticipations,
  claimParticipation,
} from '../controllers/restaurant.controller.js';

const router = Router({ mergeParams: true });

router.use(authenticate);
router.use(requireRole('ADMIN_RESTAURANT', 'SUPER_ADMIN'));

router.get('/:id', requireRestaurantAccess, getRestaurant);
router.patch('/:id', requireRestaurantAccess, updateRestaurant);
router.get('/:id/stats', requireRestaurantAccess, getStats);
router.get('/:id/prizes', requireRestaurantAccess, getPrizes);
router.post('/:id/prizes', requireRestaurantAccess, createPrize);
router.patch('/:id/prizes/:prizeId', requireRestaurantAccess, updatePrize);
router.delete('/:id/prizes/:prizeId', requireRestaurantAccess, deletePrize);
router.get('/:id/clients', requireRestaurantAccess, getClients);
router.post('/:id/clients', requireRestaurantAccess, createClient);
router.patch('/:id/clients/:clientId', requireRestaurantAccess, updateClient);
router.delete('/:id/clients/:clientId', requireRestaurantAccess, deleteClient);
router.get('/:id/participations', requireRestaurantAccess, getParticipations);
router.patch('/:id/participations/:participationId/claim', requireRestaurantAccess, claimParticipation);

export default router;
