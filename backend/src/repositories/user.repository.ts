/** Repositorio de usuarios — implementación con pg (sin Prisma). */
import type { Pool } from 'pg';
import { pool as defaultPool } from '../config/db.js';
import type { User } from '../domain/types.js';

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

export class PgUserRepository implements IUserRepository {
  constructor(private readonly db: Pool = defaultPool) {}

  async findByEmail(email: string): Promise<User | null> {
    const r = await this.db.query<User>(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email],
    );
    return r.rows[0] ?? null;
  }

  async findById(id: string): Promise<User | null> {
    const r = await this.db.query<User>('SELECT * FROM users WHERE id = $1 LIMIT 1', [id]);
    return r.rows[0] ?? null;
  }

  async create(data: CreateUserData): Promise<User> {
    const r = await this.db.query<User>(
      `INSERT INTO users (email, name, "passwordHash")
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.email, data.name, data.passwordHash],
    );
    return r.rows[0];
  }
}
