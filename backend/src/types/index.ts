// Types pour les modèles de données
// Ces types correspondent aux tables Airtable

export enum Role {
  SUPER_ADMIN = 'SUPER_ADMIN',
  ADMIN_RESTAURANT = 'ADMIN_RESTAURANT',
  STAFF = 'STAFF',
}

export enum PrizeStatus {
  A_RECUPERER = 'A_RECUPERER',
  RECUPERE = 'RECUPERE',
  EXPIRE = 'EXPIRE',
}

export enum AnalyticsEvent {
  VISIT = 'VISIT',
  GOOGLE_CLICK = 'GOOGLE_CLICK',
  FORM_SUBMIT = 'FORM_SUBMIT',
  SPIN = 'SPIN',
  WIN = 'WIN',
  LOSE = 'LOSE',
  CLAIM = 'CLAIM',
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
  created_at: string;
  updated_at: string;
}

export interface User {
  id: string;
  email: string;
  password_hash: string;
  role: Role;
  restaurant_id?: string | string[]; // Airtable peut retourner un array pour les links
  created_at: string;
}

export interface Client {
  id: string;
  restaurant_id: string | string[];
  phone: string;
  email: string;
  first_name?: string;
  last_name?: string;
  city?: string;
  age_range?: string;
  gdpr_consent: boolean;
  consent_date?: string;
  created_at: string;
  updated_at: string;
}

export interface Prize {
  id: string;
  restaurant_id: string | string[];
  name: string;
  percentage: number;
  message: string;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}

export interface Participation {
  id: string;
  restaurant_id: string | string[];
  client_id: string | string[];
  prize_id?: string | string[];
  status: PrizeStatus;
  won_at: string;
  expires_at: string;
  claimed_at?: string;
  is_lost: boolean;
  created_at: string;
}

export interface Analytics {
  id: string;
  restaurant_id: string | string[];
  event_type: AnalyticsEvent | string;
  date: string;
  client_id?: string | string[];
  participation_id?: string | string[];
}
