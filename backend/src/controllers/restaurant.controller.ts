import { Request, Response } from 'express';
import { prisma } from '../lib/prisma.js';

export const getRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const restaurant = await prisma.restaurant.findUnique({
      where: { id },
      include: {
        prizes: { where: { is_active: true }, orderBy: { name: 'asc' } },
      },
    });
    if (!restaurant) {
      return res.status(404).json({ error: 'Restaurant non trouvé' });
    }
    res.json(restaurant);
  } catch (e) {
    console.error('getRestaurant', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateRestaurant = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const { wheel_active } = req.body as { wheel_active?: boolean };
    const restaurant = await prisma.restaurant.update({
      where: { id },
      data: wheel_active !== undefined ? { wheel_active } : {},
    });
    res.json(restaurant);
  } catch (e) {
    console.error('updateRestaurant', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getStats = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;

    const [visits, googleClicks, forms, spins, prizesToClaim, prizesClaimed, prizesExpired] = await Promise.all([
      prisma.analytics.count({ where: { restaurant_id: id, event_type: 'VISIT' } }),
      prisma.analytics.count({ where: { restaurant_id: id, event_type: 'GOOGLE_CLICK' } }),
      prisma.analytics.count({ where: { restaurant_id: id, event_type: 'FORM_SUBMIT' } }),
      prisma.analytics.count({ where: { restaurant_id: id, event_type: 'SPIN' } }),
      prisma.participation.count({
        where: { restaurant_id: id, status: 'A_RECUPERER', expires_at: { gte: new Date() } },
      }),
      prisma.participation.count({ where: { restaurant_id: id, status: 'RECUPERE' } }),
      prisma.participation.count({
        where: {
          restaurant_id: id,
          OR: [{ status: 'EXPIRE' }, { status: 'A_RECUPERER', expires_at: { lt: new Date() } }],
        },
      }),
    ]);

    res.json({
      visits,
      googleClicks,
      forms,
      spins,
      prizesToClaim,
      prizesClaimed,
      prizesExpired,
    });
  } catch (e) {
    console.error('getStats', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getPrizes = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const prizes = await prisma.prize.findMany({
      where: { restaurant_id: id },
      orderBy: { name: 'asc' },
    });
    res.json(prizes);
  } catch (e) {
    console.error('getPrizes', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createPrize = async (req: Request, res: Response) => {
  try {
    const { id: restaurantId } = req.params;
    const { name, percentage, message } = req.body as { name: string; percentage: number; message: string };
    if (!name || percentage == null || !message) {
      return res.status(400).json({ error: 'name, percentage et message requis' });
    }
    const prize = await prisma.prize.create({
      data: { restaurant_id: restaurantId, name, percentage, message },
    });
    res.status(201).json(prize);
  } catch (e) {
    console.error('createPrize', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updatePrize = async (req: Request, res: Response) => {
  try {
    const { id: restaurantId, prizeId } = req.params;
    const body = req.body as { name?: string; percentage?: number; message?: string; is_active?: boolean };
    const prize = await prisma.prize.updateMany({
      where: { id: prizeId, restaurant_id: restaurantId },
      data: body,
    });
    if (prize.count === 0) {
      return res.status(404).json({ error: 'Lot non trouvé' });
    }
    const updated = await prisma.prize.findUnique({ where: { id: prizeId } });
    res.json(updated);
  } catch (e) {
    console.error('updatePrize', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deletePrize = async (req: Request, res: Response) => {
  try {
    const { id: restaurantId, prizeId } = req.params;
    const result = await prisma.prize.deleteMany({
      where: { id: prizeId, restaurant_id: restaurantId },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Lot non trouvé' });
    }
    res.status(204).send();
  } catch (e) {
    console.error('deletePrize', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const getClients = async (req: Request, res: Response) => {
  try {
    const { id } = req.params;
    const search = (req.query.search as string) || '';
    const clients = await prisma.client.findMany({
      where: {
        restaurant_id: id,
        ...(search.trim()
          ? {
              OR: [
                { phone: { contains: search, mode: 'insensitive' } },
                { email: { contains: search, mode: 'insensitive' } },
                { first_name: { contains: search, mode: 'insensitive' } },
                { last_name: { contains: search, mode: 'insensitive' } },
              ],
            }
          : {}),
      },
      include: { _count: { select: { participations: true } } },
      orderBy: { created_at: 'desc' },
    });
    res.json(
      clients.map((c) => ({
        id: c.id,
        phone: c.phone,
        email: c.email,
        first_name: c.first_name,
        last_name: c.last_name,
        city: c.city,
        age_range: c.age_range,
        created_at: c.created_at,
        participations_count: c._count.participations,
      }))
    );
  } catch (e) {
    console.error('getClients', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const createClient = async (req: Request, res: Response) => {
  try {
    const { id: restaurantId } = req.params;
    const { phone, email, first_name, last_name, city, age_range } = req.body as {
      phone: string;
      email: string;
      first_name?: string;
      last_name?: string;
      city?: string;
      age_range?: string;
    };
    if (!phone?.trim() || !email?.trim()) {
      return res.status(400).json({ error: 'Téléphone et email requis' });
    }
    const client = await prisma.client.create({
      data: {
        restaurant_id: restaurantId,
        phone: phone.trim(),
        email: email.trim(),
        first_name: first_name?.trim() || undefined,
        last_name: last_name?.trim() || undefined,
        city: city?.trim() || undefined,
        age_range: age_range?.trim() || undefined,
      },
    });
    const withCount = await prisma.client.findUnique({
      where: { id: client.id },
      include: { _count: { select: { participations: true } } },
    });
    res.status(201).json({
      id: withCount!.id,
      phone: withCount!.phone,
      email: withCount!.email,
      first_name: withCount!.first_name,
      last_name: withCount!.last_name,
      city: withCount!.city,
      age_range: withCount!.age_range,
      created_at: withCount!.created_at,
      participations_count: withCount!._count.participations,
    });
  } catch (e: unknown) {
    console.error('createClient', e);
    const isPrisma = e && typeof e === 'object' && 'code' in e;
    if (isPrisma && (e as { code: string }).code === 'P2002') {
      return res.status(409).json({ error: 'Un client avec ce numéro de téléphone existe déjà pour ce restaurant.' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const updateClient = async (req: Request, res: Response) => {
  try {
    const { id: restaurantId, clientId } = req.params;
    const body = req.body as {
      phone?: string;
      email?: string;
      first_name?: string;
      last_name?: string;
      city?: string;
      age_range?: string;
    };
    const data: Record<string, unknown> = {};
    if (body.phone !== undefined) data.phone = body.phone.trim();
    if (body.email !== undefined) data.email = body.email.trim();
    if (body.first_name !== undefined) data.first_name = body.first_name?.trim() || null;
    if (body.last_name !== undefined) data.last_name = body.last_name?.trim() || null;
    if (body.city !== undefined) data.city = body.city?.trim() || null;
    if (body.age_range !== undefined) data.age_range = body.age_range?.trim() || null;
    const updated = await prisma.client.updateMany({
      where: { id: clientId, restaurant_id: restaurantId },
      data,
    });
    if (updated.count === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    const client = await prisma.client.findUnique({
      where: { id: clientId },
      include: { _count: { select: { participations: true } } },
    });
    if (!client) return res.status(404).json({ error: 'Client non trouvé' });
    res.json({
      id: client.id,
      phone: client.phone,
      email: client.email,
      first_name: client.first_name ?? undefined,
      last_name: client.last_name ?? undefined,
      city: client.city ?? undefined,
      age_range: client.age_range ?? undefined,
      created_at: client.created_at,
      participations_count: client._count.participations,
    });
  } catch (e: unknown) {
    console.error('updateClient', e);
    const isPrisma = e && typeof e === 'object' && 'code' in e;
    if (isPrisma && (e as { code: string }).code === 'P2002') {
      return res.status(409).json({ error: 'Un client avec ce numéro de téléphone existe déjà pour ce restaurant.' });
    }
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const deleteClient = async (req: Request, res: Response) => {
  try {
    const { id: restaurantId, clientId } = req.params;
    const result = await prisma.client.deleteMany({
      where: { id: clientId, restaurant_id: restaurantId },
    });
    if (result.count === 0) {
      return res.status(404).json({ error: 'Client non trouvé' });
    }
    res.status(204).send();
  } catch (e) {
    console.error('deleteClient', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

const mapParticipation = (p: {
  id: string;
  claim_code: string | null;
  won_at: Date;
  expires_at: Date;
  status: string;
  claimed_at: Date | null;
  prize: { id: string; name: string; message: string } | null;
  client: { id: string; phone: string; email: string; first_name: string | null; last_name: string | null } | null;
}) => ({
  id: p.id,
  prize: p.prize ? { id: p.prize.id, name: p.prize.name, message: p.prize.message } : null,
  claim_code: p.claim_code ?? p.id,
  won_at: p.won_at,
  expires_at: p.expires_at,
  status: p.status,
  claimed_at: p.claimed_at,
  client: p.client
    ? {
        id: p.client.id,
        phone: p.client.phone,
        email: p.client.email,
        first_name: p.client.first_name,
        last_name: p.client.last_name,
      }
    : null,
});

export const getParticipations = async (req: Request, res: Response) => {
  try {
    const { id: restaurantId } = req.params;
    const search = (req.query.search as string) || '';
    const statusFilter = req.query.status as string | undefined;

    // Liste par statut (ex. Lots à récupérer) sans recherche
    if (statusFilter && ['A_RECUPERER', 'RECUPERE', 'EXPIRE'].includes(statusFilter)) {
      const participations = await prisma.participation.findMany({
        where: { restaurant_id: restaurantId, status: statusFilter as 'A_RECUPERER' | 'RECUPERE' | 'EXPIRE' },
        include: { client: true, prize: true },
        orderBy: { won_at: 'desc' },
        take: 200,
      });
      return res.json(participations.map((p) => mapParticipation(p as Parameters<typeof mapParticipation>[0])));
    }

    if (!search.trim()) {
      return res.json([]);
    }
    const query = search.trim();
    const isUuid = /^[0-9a-f-]{36}$/i.test(query);
    const isClaimCode = /^[A-Z0-9]{2,4}-[A-Z0-9]{2,4}-[A-Z0-9]{2,4}$/i.test(query.replace(/\s/g, ''));
    const clients = await prisma.client.findMany({
      where: {
        restaurant_id: restaurantId,
        OR: [
          { phone: { contains: query, mode: 'insensitive' } },
          { email: { contains: query, mode: 'insensitive' } },
        ],
      },
      select: { id: true },
    });
    const clientIds = clients.map((c) => c.id);

    const participations = await prisma.participation.findMany({
      where: {
        restaurant_id: restaurantId,
        OR: [
          ...(isUuid ? [{ id: query }] : []),
          ...(isClaimCode ? [{ claim_code: query.replace(/\s/g, '').toUpperCase() }] : []),
          { client_id: { in: clientIds } },
        ],
      },
      include: {
        client: true,
        prize: true,
      },
      orderBy: { won_at: 'desc' },
    });

    res.json(participations.map(mapParticipation));
  } catch (e) {
    console.error('getParticipations', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};

export const claimParticipation = async (req: Request, res: Response) => {
  try {
    const { id: restaurantId, participationId } = req.params;
    const updated = await prisma.participation.updateMany({
      where: { id: participationId, restaurant_id: restaurantId, status: 'A_RECUPERER' },
      data: { status: 'RECUPERE', claimed_at: new Date() },
    });
    if (updated.count === 0) {
      return res.status(404).json({ error: 'Participation non trouvée ou déjà récupérée' });
    }
    const p = await prisma.participation.findUnique({
      where: { id: participationId },
      include: { client: true, prize: true },
    });
    res.json(p);
  } catch (e) {
    console.error('claimParticipation', e);
    res.status(500).json({ error: 'Erreur serveur' });
  }
};
