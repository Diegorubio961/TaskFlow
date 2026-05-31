/**
 * Tipos de dominio compartidos. Se reexportan los enums de Prisma para que las
 * capas superiores no dependan directamente del cliente de datos.
 */
import type { TaskPriority, TaskStatus } from '@prisma/client';

export { TaskPriority, TaskStatus };

export interface AuthenticatedUser {
  id: string;
  email: string;
}

// Aumenta el tipo Request de Express para incluir el usuario autenticado.
declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Express {
    interface Request {
      user?: AuthenticatedUser;
    }
  }
}
