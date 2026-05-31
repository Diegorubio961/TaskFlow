/** Tipos compartidos del dominio, alineados con la API del backend. */

export type TaskStatus = 'TODO' | 'IN_PROGRESS' | 'DONE';
export type TaskPriority = 'LOW' | 'MEDIUM' | 'HIGH' | 'URGENT';

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface AuthResponse {
  token: string;
  user: User;
}

export interface Project {
  id: string;
  name: string;
  description: string | null;
  ownerId: string;
  createdAt: string;
  updatedAt: string;
  _count?: { tasks: number };
}

export interface Task {
  id: string;
  title: string;
  description: string | null;
  status: TaskStatus;
  priority: TaskPriority;
  order: number;
  dueDate: string | null;
  projectId: string;
  createdAt: string;
  updatedAt: string;
}

export const STATUS_LABELS: Record<TaskStatus, string> = {
  TODO: 'Por hacer',
  IN_PROGRESS: 'En progreso',
  DONE: 'Hecho',
};

export const STATUS_ORDER: TaskStatus[] = ['TODO', 'IN_PROGRESS', 'DONE'];

export const PRIORITY_LABELS: Record<TaskPriority, string> = {
  LOW: 'Baja',
  MEDIUM: 'Media',
  HIGH: 'Alta',
  URGENT: 'Urgente',
};

export const PRIORITY_STYLES: Record<TaskPriority, string> = {
  LOW: 'bg-slate-700 text-slate-300 border border-slate-600',
  MEDIUM: 'bg-blue-900/40 text-blue-300 border border-blue-800',
  HIGH: 'bg-amber-900/40 text-amber-300 border border-amber-800',
  URGENT: 'bg-red-900/40 text-red-300 border border-red-800',
};
