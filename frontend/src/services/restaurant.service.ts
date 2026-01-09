import api from './api';

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  google_review_url: string;
  is_active: boolean;
  wheel_active: boolean;
  phone?: string;
  email?: string;
}

export const restaurantService = {
  /**
   * Récupérer les infos d'un restaurant par son slug
   */
  async getBySlug(slug: string): Promise<Restaurant> {
    const response = await api.get(`/api/r/${slug}`);
    return response.data;
  },
};
