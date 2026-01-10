import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { User, Role } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

// Mock user data
const mockUsers: User[] = [
  {
    id: '1',
    email: 'admin@restaurant.com',
    password_hash: bcrypt.hashSync('Admin123!', 10),
    role: Role.ADMIN_RESTAURANT,
    restaurant_id: 'restaurant-1',
    created_at: new Date(),
  },
];

export const authServiceMock = {
  async login(email: string, password: string): Promise<{ user: Omit<User, 'password_hash'>; token: string } | null> {
    const user = mockUsers.find((u) => u.email === email);
    if (!user) {
      return null;
    }

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) {
      return null;
    }

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, restaurant_id: user.restaurant_id },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    const { password_hash, ...userWithoutPassword } = user;
    return { user: userWithoutPassword, token };
  },

  async verifyToken(token: string): Promise<{ id: string; email: string; role: Role; restaurant_id?: string } | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: Role;
        restaurant_id?: string;
      };
      return decoded;
    } catch (error) {
      return null;
    }
  },

  async getUserById(id: string): Promise<Omit<User, 'password_hash'> | null> {
    const user = mockUsers.find((u) => u.id === id);
    if (!user) {
      return null;
    }
    const { password_hash, ...userWithoutPassword } = user;
    return userWithoutPassword;
  },
};
