import { authServiceMock } from './auth.service.mock.js';
import { authServicePrisma } from './auth.service.prisma.js';

const usePrisma = !!process.env.DATABASE_URL;
export const authService = usePrisma ? authServicePrisma : authServiceMock;
