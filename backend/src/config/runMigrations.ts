/**
 * Crea el esquema de la base de datos con SQL puro (sin schema-engine de Prisma).
 * Se ejecuta al arrancar el servidor. Todas las sentencias son idempotentes
 * (IF NOT EXISTS / DO ... EXCEPTION) para que sea seguro ejecutar varias veces.
 */
import { Pool } from 'pg';
import { env } from './env.js';

const SCHEMA_SQL = `
  DO $$ BEGIN
    CREATE TYPE "TaskStatus" AS ENUM ('TODO', 'IN_PROGRESS', 'DONE');
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  DO $$ BEGIN
    CREATE TYPE "TaskPriority" AS ENUM ('LOW', 'MEDIUM', 'HIGH', 'URGENT');
  EXCEPTION WHEN duplicate_object THEN null;
  END $$;

  CREATE TABLE IF NOT EXISTS "users" (
    "id"           UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "email"        TEXT        UNIQUE NOT NULL,
    "passwordHash" TEXT        NOT NULL,
    "name"         TEXT        NOT NULL,
    "createdAt"    TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS "projects" (
    "id"          UUID        PRIMARY KEY DEFAULT gen_random_uuid(),
    "name"        TEXT        NOT NULL,
    "description" TEXT,
    "ownerId"     UUID        NOT NULL REFERENCES "users"("id") ON DELETE CASCADE,
    "createdAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMPTZ NOT NULL DEFAULT NOW()
  );

  CREATE TABLE IF NOT EXISTS "tasks" (
    "id"          UUID          PRIMARY KEY DEFAULT gen_random_uuid(),
    "title"       TEXT          NOT NULL,
    "description" TEXT,
    "status"      "TaskStatus"  NOT NULL DEFAULT 'TODO',
    "priority"    "TaskPriority" NOT NULL DEFAULT 'MEDIUM',
    "order"       INTEGER       NOT NULL DEFAULT 0,
    "dueDate"     TIMESTAMPTZ,
    "projectId"   UUID          NOT NULL REFERENCES "projects"("id") ON DELETE CASCADE,
    "createdAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW(),
    "updatedAt"   TIMESTAMPTZ   NOT NULL DEFAULT NOW()
  );

  CREATE INDEX IF NOT EXISTS "projects_ownerId_idx" ON "projects"("ownerId");
  CREATE INDEX IF NOT EXISTS "tasks_projectId_idx"  ON "tasks"("projectId");
  CREATE INDEX IF NOT EXISTS "tasks_status_idx"     ON "tasks"("status");

  -- Columna para rastrear cuándo cambió el estado (idempotente)
  ALTER TABLE "tasks" ADD COLUMN IF NOT EXISTS "statusChangedAt" TIMESTAMPTZ DEFAULT NOW();

  -- Rellena registros existentes que quedaron en NULL
  UPDATE "tasks" SET "statusChangedAt" = "updatedAt" WHERE "statusChangedAt" IS NULL;
`;

export async function runMigrations(): Promise<void> {
  const pool = new Pool({ connectionString: env.DATABASE_URL });
  try {
    await pool.query(SCHEMA_SQL);
    console.log('✅ Esquema de base de datos verificado/creado');
  } finally {
    await pool.end();
  }
}
