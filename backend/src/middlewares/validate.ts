/**
 * Middleware de validación basado en zod. Valida body/params/query contra un
 * esquema y reemplaza los valores por los ya parseados/coaccionados.
 */
import type { NextFunction, Request, Response } from 'express';
import { ZodError, type ZodSchema } from 'zod';
import { BadRequestError } from '../errors/AppError.js';

interface Schemas {
  body?: ZodSchema;
  params?: ZodSchema;
  query?: ZodSchema;
}

export const validate =
  (schemas: Schemas) =>
  (req: Request, _res: Response, next: NextFunction): void => {
    try {
      if (schemas.body) req.body = schemas.body.parse(req.body);
      if (schemas.params) req.params = schemas.params.parse(req.params);
      if (schemas.query) Object.assign(req.query, schemas.query.parse(req.query));
      next();
    } catch (err) {
      if (err instanceof ZodError) {
        const detail = err.issues.map((i) => `${i.path.join('.')}: ${i.message}`).join('; ');
        throw new BadRequestError(`Datos inválidos: ${detail}`);
      }
      throw err;
    }
  };
