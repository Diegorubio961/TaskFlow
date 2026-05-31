/**
 * Middleware central de manejo de errores. Traduce errores de dominio (AppError)
 * y de Prisma a respuestas HTTP coherentes, sin filtrar el stack en producción.
 */
import { Prisma } from '@prisma/client';
import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError.js';
import { isProd } from '../config/env.js';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  // next es obligatorio para que Express reconozca esto como error handler.
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }

  // Violación de restricción única en Prisma (p. ej. email duplicado).
  if (err instanceof Prisma.PrismaClientKnownRequestError && err.code === 'P2002') {
    res.status(409).json({ error: { code: 'CONFLICT', message: 'El recurso ya existe' } });
    return;
  }

  if (!isProd) {
    console.error('Error no controlado:', err);
  }

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ha ocurrido un error interno',
      ...(isProd ? {} : { detail: err instanceof Error ? err.message : String(err) }),
    },
  });
};
