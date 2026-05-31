/** Tarjeta de tarea arrastrable (draggable) dentro del Kanban. */
import { useDraggable } from '@dnd-kit/core';
import { CSS } from '@dnd-kit/utilities';
import { PRIORITY_LABELS, PRIORITY_STYLES, type Task } from '../../types';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
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
      <span className={`text-xs px-2 py-0.5 rounded-full font-medium ${PRIORITY_STYLES[task.priority]}`}>
        {PRIORITY_LABELS[task.priority]}
      </span>
    </div>
  );
}
