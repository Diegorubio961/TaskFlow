/**
 * Middleware de autenticación: exige un JWT válido en la cabecera
 * Authorization: Bearer <token> e inyecta el usuario en req.user.
 */
import type { NextFunction, Request, Response } from 'express';
import { UnauthorizedError } from '../errors/AppError.js';
import { verifyToken } from '../utils/jwt.js';

export const authenticate = (req: Request, _res: Response, next: NextFunction): void => {
  const header = req.headers.authorization;

  if (!header?.startsWith('Bearer ')) {
    throw new UnauthorizedError('Falta el token de autenticación');
  }

  const token = header.slice('Bearer '.length).trim();

  try {
    const payload = verifyToken(token);
    req.user = { id: payload.sub, email: payload.email };
    next();
  } catch {
    throw new UnauthorizedError('Token inválido o expirado');
  }
};
