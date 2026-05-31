/**
 * Envuelve un handler async de Express para capturar promesas rechazadas y
 * delegarlas a next(), evitando try/catch repetido en cada controlador.
 */
import type { NextFunction, Request, RequestHandler, Response } from 'express';

export const asyncHandler =
  (fn: (req: Request, res: Response, next: NextFunction) => Promise<unknown>): RequestHandler =>
  (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
  };
