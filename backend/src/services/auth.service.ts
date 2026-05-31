/**
 * Servicio de autenticación: registro y login. Encapsula las reglas de negocio
 * (email único, verificación de credenciales) y emite el JWT.
 */
import {
  PrismaUserRepository,
  type IUserRepository,
} from '../repositories/user.repository.js';
import { ConflictError, UnauthorizedError } from '../errors/AppError.js';
import { hashPassword, verifyPassword } from '../utils/password.js';
import { signToken } from '../utils/jwt.js';

export interface AuthResult {
  token: string;
  user: { id: string; email: string; name: string };
}

export class AuthService {
  constructor(private readonly users: IUserRepository = new PrismaUserRepository()) {}

  async register(email: string, name: string, password: string): Promise<AuthResult> {
    const existing = await this.users.findByEmail(email);
    if (existing) {
      throw new ConflictError('Ya existe una cuenta con ese email');
    }

    const passwordHash = await hashPassword(password);
    const user = await this.users.create({ email, name, passwordHash });

    return this.buildResult(user.id, user.email, user.name);
  }

  async login(email: string, password: string): Promise<AuthResult> {
    const user = await this.users.findByEmail(email);
    if (!user) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    const ok = await verifyPassword(password, user.passwordHash);
    if (!ok) {
      throw new UnauthorizedError('Credenciales inválidas');
    }

    return this.buildResult(user.id, user.email, user.name);
  }

  private buildResult(id: string, email: string, name: string): AuthResult {
    const token = signToken({ sub: id, email });
    return { token, user: { id, email, name } };
  }
}
