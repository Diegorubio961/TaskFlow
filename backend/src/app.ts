/**
 * Construye la aplicación Express con las capas de seguridad transversales.
 * Se exporta separada del arranque del servidor para poder testearla con supertest.
 */
import express, { type Express } from 'express';
import helmet from 'helmet';
import cors from 'cors';
import rateLimit from 'express-rate-limit';
import { env } from './config/env.js';
import { apiRouter } from './routes/index.js';
import { errorHandler } from './middlewares/errorHandler.js';
import { notFound } from './middlewares/notFound.js';

export const createApp = (): Express => {
  const app = express();

  // --- Capas de seguridad ---
  app.use(helmet()); // cabeceras HTTP seguras
  app.use(
    cors({
      origin: env.CORS_ORIGIN.split(',').map((o) => o.trim()),
      credentials: true,
    }),
  );
  app.use(express.json({ limit: '100kb' })); // límite de tamaño del body

  // Rate limit general de la API.
  app.use(
    rateLimit({
      windowMs: env.RATE_LIMIT_WINDOW_MS,
      max: env.RATE_LIMIT_MAX,
      standardHeaders: true,
      legacyHeaders: false,
    }),
  );

  // Confía en el proxy (nginx) para obtener la IP real en rate-limit.
  app.set('trust proxy', 1);

  // --- Rutas ---
  app.use('/api', apiRouter);

  // --- Manejo de errores (siempre al final) ---
  app.use(notFound);
  app.use(errorHandler);

  return app;
};
