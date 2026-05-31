/**
 * Cliente Prisma como singleton. Evita abrir múltiples pools de conexiones
 * (especialmente importante en desarrollo con hot-reload).
 */
import { PrismaClient } from '@prisma/client';
import { isProd } from './env.js';

const globalForPrisma = globalThis as unknown as { prisma?: PrismaClient };

export const prisma =
  globalForPrisma.prisma ??
  new PrismaClient({
    log: isProd ? ['error'] : ['error', 'warn'],
  });

if (!isProd) globalForPrisma.prisma = prisma;
