/** Tarjeta de tarea arrastrable (draggable) dentro del Kanban. */
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { PRIORITY_LABELS, PRIORITY_STYLES, type Task } from '../../types';

interface Props {
  task: Task;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function TaskCard({ task, onEdit, onDelete }: Props) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({
    id: task.id,
    data: { status: task.status },
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.4 : 1,
  };

  return (
    <div
      ref={setNodeRef}
      style={style}
      className="group rounded-lg border border-slate-200 bg-white p-3 shadow-sm"
    >
      <div className="flex items-start justify-between gap-2">
        {/* El asa de arrastre son los listeners; el resto permite clics. */}
        <button
          className="flex-1 cursor-grab text-left active:cursor-grabbing"
          {...attributes}
          {...listeners}
        >
          <p className="text-sm font-medium text-slate-800">{task.title}</p>
        </button>
        <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
          <button
            onClick={() => onEdit(task)}
            className="rounded p-1 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            title="Editar"
          >
            ✎
          </button>
          <button
            onClick={() => onDelete(task)}
            className="rounded p-1 text-slate-400 hover:bg-red-50 hover:text-red-600"
            title="Eliminar"
          >
            ✕
          </button>
        </div>
      </div>
      {task.description && (
        <p className="mt-1 line-clamp-2 text-xs text-slate-500">{task.description}</p>
      )}
      <span
        className={`mt-2 inline-block rounded-full px-2 py-0.5 text-xs font-medium ${PRIORITY_STYLES[task.priority]}`}
      >
        {PRIORITY_LABELS[task.priority]}
      </span>
    </div>
  );
}
