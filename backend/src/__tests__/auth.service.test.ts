/**
 * Tests unitarios de AuthService usando un repositorio falso en memoria.
 * No requieren base de datos: validan la lógica de negocio de forma aislada,
 * lo que es posible gracias a la inversión de dependencias (DIP).
 */
import { describe, expect, it } from 'vitest';
import { AuthService } from '../services/auth.service.js';
import type {
  CreateUserData,
  IUserRepository,
} from '../repositories/user.repository.js';
import type { User } from '../domain/types.js';
import { hashPassword } from '../utils/password.js';

class InMemoryUserRepository implements IUserRepository {
  private users: User[] = [];

  async findByEmail(email: string): Promise<User | null> {
    return this.users.find((u) => u.email === email) ?? null;
  }

  async findById(id: string): Promise<User | null> {
    return this.users.find((u) => u.id === id) ?? null;
  }

  async create(data: CreateUserData): Promise<User> {
    const user: User = {
      id: `user-${this.users.length + 1}`,
      email: data.email,
      name: data.name,
      passwordHash: data.passwordHash,
      createdAt: new Date(),
    };
    this.users.push(user);
    return user;
  }
}

describe('AuthService', () => {
  it('registra un usuario nuevo y devuelve un token', async () => {
    const service = new AuthService(new InMemoryUserRepository());
    const result = await service.register('nuevo@test.dev', 'Nuevo', 'Password123');

    expect(result.token).toBeTypeOf('string');
    expect(result.user.email).toBe('nuevo@test.dev');
  });

  it('rechaza el registro de un email duplicado', async () => {
    const service = new AuthService(new InMemoryUserRepository());
    await service.register('dup@test.dev', 'A', 'Password123');

    await expect(service.register('dup@test.dev', 'B', 'Password123')).rejects.toThrow(
      /ya existe/i,
    );
  });

  it('permite login con credenciales correctas', async () => {
    const repo = new InMemoryUserRepository();
    await repo.create({
      email: 'login@test.dev',
      name: 'Login',
      passwordHash: await hashPassword('Secreta123'),
    });
    const service = new AuthService(repo);

    const result = await service.login('login@test.dev', 'Secreta123');
    expect(result.user.email).toBe('login@test.dev');
  });

  it('rechaza login con contraseña incorrecta', async () => {
    const repo = new InMemoryUserRepository();
    await repo.create({
      email: 'login@test.dev',
      name: 'Login',
      passwordHash: await hashPassword('Secreta123'),
    });
    const service = new AuthService(repo);

    await expect(service.login('login@test.dev', 'malisima')).rejects.toThrow(
      /credenciales inválidas/i,
    );
  });
});
