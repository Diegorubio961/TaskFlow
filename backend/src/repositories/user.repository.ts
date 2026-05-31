/**
 * Repositorio de usuarios. La interfaz define el contrato (DIP): los servicios
 * dependen de la abstracción, no de Prisma. Facilita testear con dobles.
 */
import type { PrismaClient, User } from '@prisma/client';
import { prisma as defaultPrisma } from '../config/prisma.js';

export interface CreateUserData {
  email: string;
  name: string;
  passwordHash: string;
}

export interface IUserRepository {
  findByEmail(email: string): Promise<User | null>;
  findById(id: string): Promise<User | null>;
  create(data: CreateUserData): Promise<User>;
}

export class PrismaUserRepository implements IUserRepository {
  constructor(private readonly db: PrismaClient = defaultPrisma) {}

  findByEmail(email: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { email } });
  }

  findById(id: string): Promise<User | null> {
    return this.db.user.findUnique({ where: { id } });
  }

  create(data: CreateUserData): Promise<User> {
    return this.db.user.create({ data });
  }
}
