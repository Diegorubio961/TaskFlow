/** Tarjeta de tarea arrastrable (draggable) dentro del Kanban. */
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { PRIORITY_LABELS, PRIORITY_STYLES, type Task } from '../../types';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

/** Formatea cuánto tiempo lleva la tarea en su estado actual. */
function timeInStatus(since: string | null): string {
  const ref = since ?? new Date().toISOString();
  const ms = Date.now() - new Date(ref).getTime();
  const mins = Math.floor(ms / 60_000);
  if (mins < 60) return `${Math.max(mins, 1)}m`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h`;
  const days = Math.floor(hours / 24);
  if (days < 7) return `${days}d`;
  return `${Math.floor(days / 7)}sem`;
}

/** Etiqueta y color del badge de fecha de entrega. */
function dueDateBadge(dueDate: string | null): { label: string; cls: string } | null {
  if (!dueDate) return null;
  const diffDays = Math.ceil((new Date(dueDate).getTime() - Date.now()) / 86_400_000);
  const label = new Date(dueDate).toLocaleDateString('es-CO', { day: '2-digit', month: 'short' });
  if (diffDays < 0)
    return { label, cls: 'bg-red-900/40 text-red-300 border border-red-800' };
  if (diffDays <= 2)
    return { label, cls: 'bg-amber-900/40 text-amber-300 border border-amber-800' };
  return { label, cls: 'bg-slate-800 text-slate-400 border border-slate-700' };
}

export function TaskCard({ task, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({
    id: task.id,
    data: { status: task.status },
  });

  const style = {
    transform: CSS.Translate.toString(transform),
    opacity: isDragging ? 0.2 : 1,
  };

  const due = dueDateBadge(task.dueDate);
  const elapsed = timeInStatus(task.statusChangedAt);

  return (
    <div
      ref={setNodeRef}
      style={style}
      {...attributes}
      {...listeners}
      className="group cursor-grab active:cursor-grabbing bg-slate-800 border border-slate-700 rounded-xl p-3 shadow-lg transition-shadow hover:shadow-indigo-900/20 hover:border-slate-600"
    >
      {/* fila superior: título + acciones */}
      <div className="flex items-start justify-between gap-2 mb-2">
        <p className="text-slate-100 text-sm font-medium leading-snug">{task.title}</p>
        <div className="flex gap-1 shrink-0 opacity-0 group-hover:opacity-100 transition-opacity">
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onEdit(task)}
            className="rounded p-1 text-slate-500 hover:bg-slate-700 hover:text-slate-200 transition"
            title="Editar"
          >
            ✎
          </button>
          <button
            onPointerDown={(e) => e.stopPropagation()}
            onClick={() => onDelete(task)}
            className="rounded p-1 text-slate-500 hover:bg-red-900/40 hover:text-red-400 transition"
            title="Eliminar"
          >
            ✕
          </button>
        </div>
      </div>

      {task.description && (
        <p className="text-slate-400 text-xs mb-2 line-clamp-2">{task.description}</p>
      )}

      {/* fila inferior: prioridad + fecha + tiempo en estado */}
      <div className="flex flex-wrap items-center gap-1.5 mt-1">
        <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
          {PRIORITY_LABELS[task.priority]}
        </span>

        {due && (
          <span className={`text-xs px-2 py-0.5 rounded-full flex items-center gap-1 ${due.cls}`}>
            <span>📅</span>
            {due.label}
          </span>
        )}

        <span
          className="text-xs px-2 py-0.5 rounded-full bg-slate-700/60 text-slate-400 border border-slate-600 flex items-center gap-1"
          title="Tiempo en este estado"
        >
          <span>⏱</span>
          {elapsed}
        </span>
      </div>
    </div>
  );
}
