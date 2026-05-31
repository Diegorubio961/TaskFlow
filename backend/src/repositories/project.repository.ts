/** Repositorio de proyectos — implementación con pg (sin Prisma). */
import type { Pool } from 'pg';
import { pool as defaultPool } from '../config/db.js';
import type { Project } from '../domain/types.js';

export interface ProjectInput {
  name: string;
  description?: string | null;
}

export interface IProjectRepository {
  findAllByOwner(ownerId: string): Promise<Project[]>;
  findById(id: string): Promise<Project | null>;
  create(ownerId: string, data: ProjectInput): Promise<Project>;
  update(id: string, data: Partial<ProjectInput>): Promise<Project>;
  delete(id: string): Promise<void>;
}

type ProjectRow = {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: Date;
  updatedAt: Date;
  task_count?: string; // pg devuelve bigint como string
};

const mapRow = (row: ProjectRow): Project => ({
  id: row.id,
  name: row.name,
  description: row.description,
  ownerId: row.ownerId,
  createdAt: row.createdAt,
  updatedAt: row.updatedAt,
  ...(row.task_count !== undefined ? { _count: { tasks: Number(row.task_count) } } : {}),
});

export class PgProjectRepository implements IProjectRepository {
  constructor(private readonly db: Pool = defaultPool) {}

  async findAllByOwner(ownerId: string): Promise<Project[]> {
    const r = await this.db.query<ProjectRow>(
      `SELECT p.*, COUNT(t.id) AS task_count
       FROM projects p
       LEFT JOIN tasks t ON t."projectId" = p.id
       WHERE p."ownerId" = $1
       GROUP BY p.id
       ORDER BY p."createdAt" DESC`,
      [ownerId],
    );
    return r.rows.map(mapRow);
  }

  async findById(id: string): Promise<Project | null> {
    const r = await this.db.query<ProjectRow>(
      'SELECT * FROM projects WHERE id = $1 LIMIT 1',
      [id],
    );
    return r.rows[0] ? mapRow(r.rows[0]) : null;
  }

  async create(ownerId: string, data: ProjectInput): Promise<Project> {
    const r = await this.db.query<ProjectRow>(
      `INSERT INTO projects (name, description, "ownerId")
       VALUES ($1, $2, $3)
       RETURNING *`,
      [data.name, data.description ?? null, ownerId],
    );
    return mapRow(r.rows[0]);
  }

  async update(id: string, data: Partial<ProjectInput>): Promise<Project> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    if (data.name !== undefined) { sets.push(`name = $${idx++}`); values.push(data.name); }
    if (data.description !== undefined) { sets.push(`description = $${idx++}`); values.push(data.description); }
    sets.push(`"updatedAt" = NOW()`);
    values.push(id);
    const r = await this.db.query<ProjectRow>(
      `UPDATE projects SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return mapRow(r.rows[0]);
  }

  async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM projects WHERE id = $1', [id]);
  }
}
