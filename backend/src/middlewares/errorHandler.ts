import type { NextFunction, Request, Response } from 'express';
import { AppError } from '../errors/AppError.js';
import { isProd } from '../config/env.js';

export const errorHandler = (
  err: unknown,
  _req: Request,
  res: Response,
  _next: NextFunction,
): void => {
  if (err instanceof AppError) {
    res.status(err.statusCode).json({ error: { code: err.code, message: err.message } });
    return;
  }

  // Violación de unique constraint en pg (código 23505)
  if (typeof err === 'object' && err !== null && (err as { code?: string }).code === '23505') {
    res.status(409).json({ error: { code: 'CONFLICT', message: 'El recurso ya existe' } });
    return;
  }

  if (!isProd) console.error('Error no controlado:', err);

  res.status(500).json({
    error: {
      code: 'INTERNAL_ERROR',
      message: 'Ha ocurrido un error interno',
      ...(isProd ? {} : { detail: err instanceof Error ? err.message : String(err) }),
    },
  });
};
