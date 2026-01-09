import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { airtable, TABLES } from '../utils/airtable';
import { User } from '../types';
import { authServiceMock } from './auth.service.mock';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Mode MOCK : utiliser les données factices si USE_MOCK=true
const USE_MOCK = process.env.USE_MOCK === 'true' || !process.env.AIRTABLE_API_KEY;

export class AuthService {
  /**
   * Hasher un mot de passe
   */
  async hashPassword(password: string): Promise<string> {
    return bcrypt.hash(password, 10);
  }

  /**
   * Comparer un mot de passe avec un hash
   */
  async comparePassword(password: string, hash: string): Promise<boolean> {
    return bcrypt.compare(password, hash);
  }

  /**
   * Générer un token JWT
   */
  generateToken(userId: string, role: string, restaurantId?: string): string {
    const payload: any = {
      userId,
      role,
    };

    if (restaurantId) {
      payload.restaurantId = restaurantId;
    }

    return jwt.sign(payload, JWT_SECRET, {
      expiresIn: JWT_EXPIRES_IN,
    });
  }

  /**
   * Vérifier un token JWT
   */
  verifyToken(token: string): any {
    try {
      return jwt.verify(token, JWT_SECRET);
    } catch (error) {
      throw new Error('Token invalide ou expiré');
    }
  }

  /**
   * Se connecter
   */
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    // Mode MOCK : utiliser les données factices
    if (USE_MOCK) {
      return authServiceMock.login(email, password);
    }

    // Mode réel : utiliser Airtable
    const user = await airtable.findByField<User>(TABLES.USERS, 'email', email);

    if (!user) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe
    const isPasswordValid = await this.comparePassword(password, user.password_hash);

    if (!isPasswordValid) {
      throw new Error('Email ou mot de passe incorrect');
    }

    // Générer le token
    const restaurantId = Array.isArray(user.restaurant_id) 
      ? user.restaurant_id[0] 
      : user.restaurant_id;

    const token = this.generateToken(user.id, user.role, restaurantId);

    // Retourner l'utilisateur sans le password_hash
    const { password_hash, ...userWithoutPassword } = user;

    return {
      token,
      user: {
        ...userWithoutPassword,
        restaurant_id: restaurantId,
      },
    };
  }

  /**
   * Créer un utilisateur
   */
  async register(
    email: string,
    password: string,
    role: string,
    restaurantId?: string
  ): Promise<User> {
    // Vérifier si l'email existe déjà
    const existingUser = await airtable.findByField<User>(TABLES.USERS, 'email', email);

    if (existingUser) {
      throw new Error('Cet email est déjà utilisé');
    }

    // Hasher le mot de passe
    const passwordHash = await this.hashPassword(password);

    // Créer l'utilisateur
    const userData: any = {
      email,
      password_hash: passwordHash,
      role,
      created_at: new Date(),
    };

    if (restaurantId) {
      userData.restaurant_id = [restaurantId]; // Airtable links sont des arrays
    }

    const user = await airtable.create<User>(TABLES.USERS, userData);

    return user;
  }
}

export const authService = new AuthService();
