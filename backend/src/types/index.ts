export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_RESTAURANT = 'ADMIN_RESTAURANT',
  STAFF = 'STAFF',
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: Role;
  restaurant_id?: string;
  created_at: Date;
}

export interface Restaurant {
  id: string;
  name: string;
  slug: string;
  address: string;
  google_review_url: string;
  is_active: boolean;
  phone?: string;
  email?: string;
  wheel_active: boolean;
  created_at: Date;
  updated_at: Date;
}

export interface Client {
  id: string;
  restaurant_id: string;
  first_name: string;
  last_name: string;
  email: string;
  phone: string;
  created_at: Date;
}

export interface Prize {
  id: string;
  restaurant_id: string;
  name: string;
  description?: string;
  percentage: number;
  is_active: boolean;
  created_at: Date;
}

export interface Participation {
  id: string;
  restaurant_id: string;
  client_id: string;
  prize_id?: string;
  claim_code: string;
  status: 'EN_ATTENTE' | 'RECUPERE' | 'EXPIRE';
  won_at: Date;
  claimed_at?: Date;
  expires_at: Date;
}
