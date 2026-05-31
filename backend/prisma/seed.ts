/**
 * Seed con pg directo (sin Prisma Client).
 * Credenciales demo: demo@gestiontareas.dev / Demo1234!
 */
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });

async function main() {
  const email = 'demo@gestiontareas.dev';
  const passwordHash = await bcrypt.hash('Demo1234!', 10);

  // Idempotente: borra el demo antes de recrearlo
  const existing = await pool.query('SELECT id FROM users WHERE email = $1', [email]);
  if (existing.rows[0]) {
    await pool.query('DELETE FROM users WHERE id = $1', [existing.rows[0].id]);
  }

  const userRes = await pool.query<{ id: string }>(
    `INSERT INTO users (email, name, "passwordHash") VALUES ($1, $2, $3) RETURNING id`,
    [email, 'Usuario Demo', passwordHash],
  );
  const userId = userRes.rows[0].id;

  const proj1 = await pool.query<{ id: string }>(
    `INSERT INTO projects (name, description, "ownerId") VALUES ($1, $2, $3) RETURNING id`,
    ['Rediseño Web Corporativa', 'Migración del sitio a una nueva identidad visual.', userId],
  );
  const proj1Id = proj1.rows[0].id;

  await pool.query(
    `INSERT INTO tasks (title, description, status, priority, "projectId") VALUES
     ($1, $2, 'DONE',        'MEDIUM', $5),
     ($3, $4, 'IN_PROGRESS', 'HIGH',   $5),
     ('Optimizar imágenes y SEO', NULL, 'TODO', 'LOW', $5),
     ('Corregir bug de menú móvil', 'No cierra en iOS Safari.', 'TODO', 'URGENT', $5)`,
    ['Definir paleta de colores', 'Acordar la paleta con el equipo de marca.',
     'Maquetar landing principal', null, proj1Id],
  );

  const proj2 = await pool.query<{ id: string }>(
    `INSERT INTO projects (name, description, "ownerId") VALUES ($1, $2, $3) RETURNING id`,
    ['App de Inventario', 'Backend y panel para control de stock.', userId],
  );
  const proj2Id = proj2.rows[0].id;

  await pool.query(
    `INSERT INTO tasks (title, status, priority, "projectId") VALUES
     ('Diseñar esquema de base de datos', 'DONE',        'HIGH',   $1),
     ('Endpoint de entradas de stock',    'IN_PROGRESS', 'MEDIUM', $1),
     ('Reporte de inventario bajo',       'TODO',        'MEDIUM', $1)`,
    [proj2Id],
  );

  console.log('✅ Seed completado.');
  console.log(`   Usuario demo: ${email} / Demo1234!`);
}

main()
  .catch((e) => { console.error('❌ Error en el seed:', e); process.exit(1); })
  .finally(() => pool.end());
