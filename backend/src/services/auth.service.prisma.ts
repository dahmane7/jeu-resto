import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { prisma } from '../lib/prisma.js';
import { Role } from '../types/index.js';

const JWT_SECRET = process.env.JWT_SECRET || 'your-secret-key-change-in-production';

export const authServicePrisma = {
  async login(
    email: string,
    password: string
  ): Promise<{ user: { id: string; email: string; role: string; restaurant_id?: string }; token: string } | null> {
    const user = await prisma.user.findUnique({ where: { email } });
    if (!user) return null;

    const isValid = await bcrypt.compare(password, user.password_hash);
    if (!isValid) return null;

    const token = jwt.sign(
      { id: user.id, email: user.email, role: user.role, restaurant_id: user.restaurant_id ?? undefined },
      JWT_SECRET,
      { expiresIn: '7d' }
    );

    return {
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        restaurant_id: user.restaurant_id ?? undefined,
      },
      token,
    };
  },

  async verifyToken(
    token: string
  ): Promise<{ id: string; email: string; role: Role; restaurant_id?: string } | null> {
    try {
      const decoded = jwt.verify(token, JWT_SECRET) as {
        id: string;
        email: string;
        role: Role;
        restaurant_id?: string;
      };
      return decoded;
    } catch {
      return null;
    }
  },

  async getUserById(id: string) {
    const user = await prisma.user.findUnique({
      where: { id },
      select: { id: true, email: true, role: true, restaurant_id: true, created_at: true },
    });
    return user;
  },
};
