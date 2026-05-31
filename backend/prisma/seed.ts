/**
 * Seed de datos demo: un usuario, dos proyectos y varias tareas con estados
 * y prioridades variadas, para que el evaluador tenga datos al abrir la app.
 *
 * Credenciales demo:  demo@gestiontareas.dev  /  Demo1234!
 */
import { PrismaClient, TaskPriority, TaskStatus } from '@prisma/client/wasm';
import { PrismaPg } from '@prisma/adapter-pg';
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({ connectionString: process.env.DATABASE_URL });
const adapter = new PrismaPg(pool);
const prisma = new PrismaClient({ adapter });

async function main() {
  const email = 'demo@gestiontareas.dev';
  const passwordHash = await bcrypt.hash('Demo1234!', 10);

  // Idempotente: limpia el usuario demo y sus datos (cascade) antes de recrear.
  await prisma.user.deleteMany({ where: { email } });

  const user = await prisma.user.create({
    data: { email, name: 'Usuario Demo', passwordHash },
  });

  const webApp = await prisma.project.create({
    data: {
      name: 'Rediseño Web Corporativa',
      description: 'Migración del sitio a una nueva identidad visual.',
      ownerId: user.id,
      tasks: {
        create: [
          {
            title: 'Definir paleta de colores',
            description: 'Acordar la paleta con el equipo de marca.',
            status: TaskStatus.DONE,
            priority: TaskPriority.MEDIUM,
            order: 0,
          },
          {
            title: 'Maquetar landing principal',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.HIGH,
            order: 0,
          },
          {
            title: 'Optimizar imágenes y SEO',
            status: TaskStatus.TODO,
            priority: TaskPriority.LOW,
            order: 0,
          },
          {
            title: 'Corregir bug de menú móvil',
            description: 'El menú no cierra en iOS Safari.',
            status: TaskStatus.TODO,
            priority: TaskPriority.URGENT,
            order: 1,
          },
        ],
      },
    },
  });

  await prisma.project.create({
    data: {
      name: 'App de Inventario',
      description: 'Backend y panel para control de stock.',
      ownerId: user.id,
      tasks: {
        create: [
          {
            title: 'Diseñar esquema de base de datos',
            status: TaskStatus.DONE,
            priority: TaskPriority.HIGH,
            order: 0,
          },
          {
            title: 'Endpoint de entradas de stock',
            status: TaskStatus.IN_PROGRESS,
            priority: TaskPriority.MEDIUM,
            order: 0,
          },
          {
            title: 'Reporte de inventario bajo',
            status: TaskStatus.TODO,
            priority: TaskPriority.MEDIUM,
            order: 0,
          },
        ],
      },
    },
  });

  console.log('✅ Seed completado.');
  console.log(`   Usuario demo: ${email} / Demo1234!`);
  console.log(`   Proyectos creados: "${webApp.name}" y "App de Inventario".`);
}

main()
  .catch((e) => {
    console.error('❌ Error en el seed:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
