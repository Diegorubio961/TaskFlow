/** Controlador de autenticación: mapea HTTP ↔ AuthService. Sin lógica de negocio. */
import type { Request, Response } from 'express';
import { AuthService } from '../services/auth.service.js';

export class AuthController {
  constructor(private readonly service: AuthService = new AuthService()) {}

  register = async (req: Request, res: Response): Promise<void> => {
    const { email, name, password } = req.body;
    const result = await this.service.register(email, name, password);
    res.status(201).json(result);
  };

  login = async (req: Request, res: Response): Promise<void> => {
    const { email, password } = req.body;
    const result = await this.service.login(email, password);
    res.status(200).json(result);
  };
}
