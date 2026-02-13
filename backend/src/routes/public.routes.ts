import { Router } from 'express';
import {
  getRestaurantBySlug,
  trackVisit,
  trackGoogleClick,
  participate,
} from '../controllers/public.controller.js';

const router = Router();

router.get('/r/:slug', getRestaurantBySlug);
router.post('/r/:slug/track/visit', trackVisit);
router.post('/r/:slug/track/google-click', trackGoogleClick);
router.post('/r/:slug/participate', participate);

export default router;
