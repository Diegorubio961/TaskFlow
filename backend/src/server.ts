/** Punto de entrada: aplica el esquema SQL y arranca el servidor HTTP. */
import { createApp } from './app.js';
import { env } from './config/env.js';
import { prisma } from './config/prisma.js';
import { runMigrations } from './config/runMigrations.js';

const start = async () => {
  await runMigrations();

  const app = createApp();
  const server = app.listen(env.API_PORT, () => {
    console.log(`🚀 API escuchando en http://localhost:${env.API_PORT}/api`);
    console.log(`   Entorno: ${env.NODE_ENV}`);
  });

  const shutdown = async (signal: string) => {
    console.log(`\n${signal} recibido, cerrando servidor...`);
    server.close(async () => {
      await prisma.$disconnect();
      process.exit(0);
    });
  };

  process.on('SIGTERM', () => void shutdown('SIGTERM'));
  process.on('SIGINT', () => void shutdown('SIGINT'));
};

start().catch((err) => {
  console.error('❌ Error al arrancar el servidor:', err);
  process.exit(1);
});
