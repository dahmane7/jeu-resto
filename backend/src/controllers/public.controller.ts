import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

function generateClaimCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  const part = (n: number) =>
    Array.from({ length: n }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part(3)}-${part(3)}-${part(3)}`;
}

export const getRestaurantBySlug = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug, is_active: true },
      include: {
        prizes: {
          where: { is_active: true },
          orderBy: { name: 'asc' },
          select: { id: true, name: true, percentage: true, message: true },
        },
      },
    });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant non trouvé' });
    }
    res.json({
      id: restaurant.id,
      name: restaurant.name,
      slug: restaurant.slug,
      google_review_url: restaurant.google_review_url,
      wheel_active: restaurant.wheel_active,
      prizes: restaurant.prizes,
    });
  } catch (e) {
    console.error('getRestaurantBySlug', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const trackVisit = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug, is_active: true },
      select: { id: true },
    });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant non trouvé' });
    await prisma.analytics.create({
      data: { restaurant_id: restaurant.id, event_type: 'VISIT' },
    });
    res.status(204).send();
  } catch (e) {
    console.error('trackVisit', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const trackGoogleClick = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { slug, is_active: true },
      select: { id: true },
    });
    if (!restaurant) return res.status(404).json({ error: 'Restaurant non trouvé' });
    await prisma.analytics.create({
      data: { restaurant_id: restaurant.id, event_type: 'GOOGLE_CLICK' },
    });
    res.status(204).send();
  } catch (e) {
    console.error('trackGoogleClick', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const participate = async (req: Request, res: Response) => {
  try {
    const { slug } = req.params;
    const body = req.body as {
      phone: string;
      email: string;
      first_name?: string;
      last_name?: string;
      city?: string;
      age_range?: string;
      gdpr_consent?: boolean;
    };

    if (!body.phone?.trim() || !body.email?.trim()) {
      return res.status(400).json({ error: 'Téléphone et email requis' });
    }

    const restaurant = await prisma.restaurant.findUnique({
      where: { slug, is_active: true },
      include: {
        prizes: { where: { is_active: true }, orderBy: { name: 'asc' } },
      },
    });

    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant non trouvé' });
    }
    if (!restaurant.wheel_active) {
      return res.status(400).json({ error: 'La roue est actuellement désactivée' });
    }

    const totalPct = restaurant.prizes.reduce((s, p) => s + p.percentage, 0);
    if (restaurant.prizes.length === 0 || totalPct <= 0) {
      return res.status(400).json({ error: 'Aucun lot configuré' });
    }

    let client = await prisma.client.findFirst({
      where: {
        restaurant_id: restaurant.id,
        phone: body.phone.trim(),
      },
    });

    if (!client) {
      client = await prisma.client.create({
        data: {
          restaurant_id: restaurant.id,
          phone: body.phone.trim(),
          email: body.email.trim(),
          first_name: body.first_name?.trim() || undefined,
          last_name: body.last_name?.trim() || undefined,
          city: body.city?.trim() || undefined,
          age_range: body.age_range?.trim() || undefined,
          gdpr_consent: body.gdpr_consent ?? false,
          consent_date: body.gdpr_consent ? new Date() : undefined,
        },
      });
    }

    const random = Math.random() * 100;
    let cumulative = 0;
    let selectedPrize: (typeof restaurant.prizes)[0] | null = null;
    for (const p of restaurant.prizes) {
      cumulative += (p.percentage / totalPct) * 100;
      if (random < cumulative) {
        selectedPrize = p;
        break;
      }
    }
    if (!selectedPrize) selectedPrize = restaurant.prizes[restaurant.prizes.length - 1];
    const isLost = selectedPrize.name.toLowerCase() === 'perdu' || selectedPrize.name.toLowerCase().includes('perdu');

    const expiresAt = new Date();
    expiresAt.setDate(expiresAt.getDate() + 7);
    const claimCode = generateClaimCode();

    const participation = await prisma.participation.create({
      data: {
        restaurant_id: restaurant.id,
        client_id: client.id,
        prize_id: selectedPrize.id,
        is_lost: isLost,
        status: 'A_RECUPERER',
        expires_at: expiresAt,
        claim_code: claimCode,
      },
      include: { prize: true },
    });

    await Promise.all([
      prisma.analytics.create({
        data: { restaurant_id: restaurant.id, event_type: 'FORM_SUBMIT', client_id: client.id },
      }),
      prisma.analytics.create({
        data: {
          restaurant_id: restaurant.id,
          event_type: 'SPIN',
          client_id: client.id,
          participation_id: participation.id,
        },
      }),
    ]);

    res.status(201).json({
      prize: selectedPrize
        ? {
            id: selectedPrize.id,
            name: selectedPrize.name,
            message: selectedPrize.message,
          }
        : null,
      participation: {
        id: participation.id,
        claim_code: participation.claim_code,
        expires_at: participation.expires_at,
      },
      isWin: !isLost,
    });
  } catch (e) {
    console.error('participate', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
