/**
 * Cliente Prisma con driver adapter para pg (sin binarios nativos).
 * Necesario para ejecutar en ARM 32-bit donde Prisma no tiene engine nativo.
 * El adapter delega las queries al pool de pg (JavaScript puro).
 */
// Usa el motor WASM (independiente de arquitectura) para evitar binarios nativos ARM.
import { PrismaClient } from '@prisma/client/wasm';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import { env, isProd } from './env.js';

const pool = new Pool({ connectionString: env.DATABASE_URL });
const adapter = new PrismaPg(pool);

export const prisma = new PrismaClient({
  adapter,
  log: isProd ? ['error'] : ['error', 'warn'],
});
