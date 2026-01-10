import { authServiceMock } from './auth.service.mock.js';

// Pour l'instant, on utilise uniquement le mode mock
// Quand Airtable sera configuré, on pourra basculer vers le vrai service
export const authService = authServiceMock;
