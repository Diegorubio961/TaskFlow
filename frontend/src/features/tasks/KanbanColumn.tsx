/** Columna del Kanban: zona donde se pueden soltar tarjetas (droppable). */
import { useDroppable } from '@dnd-kit/core';
import { STATUS_LABELS, type Task, type TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';

interface Props {
  status: TaskStatus;
  tasks: Task[];
  onAdd: (status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

const COLUMN_BORDER: Record<TaskStatus, string> = {
  TODO: 'border-l-4 border-slate-500',
  IN_PROGRESS: 'border-l-4 border-amber-500',
  DONE: 'border-l-4 border-emerald-500',
};

export function KanbanColumn({ status, tasks, onAdd, onEdit, onDelete }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className={`flex flex-col rounded-2xl bg-slate-900 border border-slate-800 overflow-hidden ${COLUMN_BORDER[status]}`}>
      <div className="flex items-center justify-between px-4 py-3">
        <h3 className="text-sm font-semibold text-slate-300">
          {STATUS_LABELS[status]}{' '}
          <span className="text-slate-500 text-xs font-normal">({tasks.length})</span>
        </h3>
        <button
          onClick={() => onAdd(status)}
          className="rounded px-2 text-lg leading-none text-slate-500 hover:bg-slate-800 hover:text-slate-200 transition"
          title="Añadir tarea"
        >
          +
        </button>
      </div>

      <div
        ref={setNodeRef}
        className={`min-h-[200px] flex-1 flex flex-col gap-2 p-2 rounded-xl transition-colors ${
          isOver ? 'bg-indigo-900/20 ring-1 ring-indigo-500/50' : ''
        }`}
      >
        {tasks.map((task) => (
          <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
        ))}
        {tasks.length === 0 && (
          <p className="py-6 text-center text-xs text-slate-600">Sin tareas</p>
        )}
      </div>

      <button
        onClick={() => onAdd(status)}
        className="m-2 rounded-lg px-3 py-2 text-sm text-slate-500 hover:text-slate-200 hover:bg-slate-800 transition text-left"
      >
        + Añadir tarea
      </button>
    </div>
  );
}
