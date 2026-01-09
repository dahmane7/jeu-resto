import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key';
const JWT_EXPIRES_IN = process.env.JWT_EXPIRES_IN || '7d';

// Utilisateur factice pour les tests (ADMIN_RESTAURANT uniquement)
const MOCK_USERS = [
  {
    id: '1',
    email: 'admin@restaurant.com',
    password: 'Admin123!', // Mot de passe en clair pour le mock
    password_hash: '', // Sera généré
    role: 'ADMIN_RESTAURANT',
    restaurant_id: 'restaurant-1',
  },
];

// Initialiser les hashs (simulation)
async function initMockUsers() {
  for (const user of MOCK_USERS) {
    user.password_hash = await bcrypt.hash(user.password, 10);
  }
}

// Initialiser au chargement
initMockUsers();

export class AuthServiceMock {
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
   * Se connecter (MOCK)
   */
  async login(email: string, password: string): Promise<{ token: string; user: any }> {
    // Simuler un petit délai
    await new Promise(resolve => setTimeout(resolve, 300));

    // Trouver l'utilisateur dans les données factices
    const user = MOCK_USERS.find(u => u.email.toLowerCase() === email.toLowerCase());

    if (!user) {
      console.log('❌ User not found:', email);
      console.log('Available users:', MOCK_USERS.map(u => u.email));
      throw new Error('Email ou mot de passe incorrect');
    }

    // Vérifier le mot de passe (comparaison directe pour le mock)
    if (password !== user.password) {
      console.log('❌ Password incorrect for:', email);
      throw new Error('Email ou mot de passe incorrect');
    }

    console.log('✅ Login successful for:', email);

    // Générer le token
    const token = this.generateToken(user.id, user.role, user.restaurant_id || undefined);

    // Retourner l'utilisateur sans le password_hash
    const { password_hash, password: _, ...userWithoutPassword } = user;

    return {
      token,
      user: {
        ...userWithoutPassword,
        restaurant_id: user.restaurant_id,
      },
    };
  }

  /**
   * Récupérer un utilisateur par ID (pour le middleware)
   */
  async getUserById(userId: string): Promise<any> {
    await new Promise(resolve => setTimeout(resolve, 100));
    
    const user = MOCK_USERS.find(u => u.id === userId);
    
    if (!user) {
      return null;
    }

    const { password_hash, password: _, ...userWithoutPassword } = user;
    
    return {
      ...userWithoutPassword,
      restaurant_id: user.restaurant_id,
    };
  }
}

export const authServiceMock = new AuthServiceMock();
