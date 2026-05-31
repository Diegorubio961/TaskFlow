/** Repositorio de tareas — implementación con pg (sin Prisma). */
import type { Pool } from 'pg';
import { pool as defaultPool } from '../config/db.js';
import type { Task } from '../domain/types.js';
import type { TaskPriority, TaskStatus } from '../domain/types.js';

export interface CreateTaskData {
  title: string;
  description?: string | null;
  status?: TaskStatus;
  priority?: TaskPriority;
  dueDate?: Date | null;
}

export type UpdateTaskData = Partial<CreateTaskData & { order: number }>;

export interface MoveTaskData {
  status: TaskStatus;
  order: number;
}

export interface ITaskRepository {
  findAllByProject(projectId: string): Promise<Task[]>;
  findById(id: string): Promise<Task | null>;
  create(projectId: string, data: CreateTaskData): Promise<Task>;
  update(id: string, data: UpdateTaskData): Promise<Task>;
  move(id: string, data: MoveTaskData): Promise<Task>;
  delete(id: string): Promise<void>;
}

export class PgTaskRepository implements ITaskRepository {
  constructor(private readonly db: Pool = defaultPool) {}

  async findAllByProject(projectId: string): Promise<Task[]> {
    const r = await this.db.query<Task>(
      `SELECT * FROM tasks WHERE "projectId" = $1
       ORDER BY status ASC, "order" ASC, "createdAt" ASC`,
      [projectId],
    );
    return r.rows;
  }

  async findById(id: string): Promise<Task | null> {
    const r = await this.db.query<Task>('SELECT * FROM tasks WHERE id = $1 LIMIT 1', [id]);
    return r.rows[0] ?? null;
  }

  async create(projectId: string, data: CreateTaskData): Promise<Task> {
    const r = await this.db.query<Task>(
      `INSERT INTO tasks (title, description, status, priority, "dueDate", "projectId")
       VALUES ($1, $2, $3, $4, $5, $6)
       RETURNING *`,
      [
        data.title,
        data.description ?? null,
        data.status ?? 'TODO',
        data.priority ?? 'MEDIUM',
        data.dueDate ?? null,
        projectId,
      ],
    );
    return r.rows[0];
  }

  async update(id: string, data: UpdateTaskData): Promise<Task> {
    const sets: string[] = [];
    const values: unknown[] = [];
    let idx = 1;
    if (data.title !== undefined)       { sets.push(`title = $${idx++}`);        values.push(data.title); }
    if (data.description !== undefined) { sets.push(`description = $${idx++}`);  values.push(data.description); }
    if (data.status !== undefined)      { sets.push(`status = $${idx++}`);       values.push(data.status); }
    if (data.priority !== undefined)    { sets.push(`priority = $${idx++}`);     values.push(data.priority); }
    if (data.dueDate !== undefined)     { sets.push(`"dueDate" = $${idx++}`);    values.push(data.dueDate); }
    if (data.order !== undefined)       { sets.push(`"order" = $${idx++}`);      values.push(data.order); }
    sets.push(`"updatedAt" = NOW()`);
    values.push(id);
    const r = await this.db.query<Task>(
      `UPDATE tasks SET ${sets.join(', ')} WHERE id = $${idx} RETURNING *`,
      values,
    );
    return r.rows[0];
  }

  async move(id: string, data: MoveTaskData): Promise<Task> {
    const r = await this.db.query<Task>(
      `UPDATE tasks SET status = $1, "order" = $2, "updatedAt" = NOW()
       WHERE id = $3 RETURNING *`,
      [data.status, data.order, id],
    );
    return r.rows[0];
  }

  async delete(id: string): Promise<void> {
    await this.db.query('DELETE FROM tasks WHERE id = $1', [id]);
  }
}
