/** Columna del Kanban: zona donde se pueden soltar tarjetas (droppable). */
import { useDroppable } from '@dnd-kit/core';
import { SortableContext, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { STATUS_LABELS, type Task, type TaskStatus } from '../../types';
import { TaskCard } from './TaskCard';
import { Button } from '../../components/ui';

interface Props {
  status: TaskStatus;
  tasks: Task[];
  onAdd: (status: TaskStatus) => void;
  onEdit: (task: Task) => void;
  onDelete: (task: Task) => void;
}

export function KanbanColumn({ status, tasks, onAdd, onEdit, onDelete }: Props) {
  const { setNodeRef, isOver } = useDroppable({ id: status });

  return (
    <div className="flex w-full flex-col rounded-xl bg-slate-100 p-3">
      <div className="mb-3 flex items-center justify-between px-1">
        <h3 className="text-sm font-semibold text-slate-700">
          {STATUS_LABELS[status]} <span className="text-slate-400">({tasks.length})</span>
        </h3>
        <button
          onClick={() => onAdd(status)}
          className="rounded px-2 text-lg leading-none text-slate-400 hover:bg-slate-200 hover:text-slate-700"
          title="Añadir tarea"
        >
          +
        </button>
      </div>
      <div
        ref={setNodeRef}
        className={`flex min-h-[120px] flex-1 flex-col gap-2 rounded-lg p-1 transition ${
          isOver ? 'bg-brand-50 ring-2 ring-brand-500/40' : ''
        }`}
      >
        <SortableContext items={tasks.map((t) => t.id)} strategy={verticalListSortingStrategy}>
          {tasks.map((task) => (
            <TaskCard key={task.id} task={task} onEdit={onEdit} onDelete={onDelete} />
          ))}
        </SortableContext>
        {tasks.length === 0 && (
          <p className="py-4 text-center text-xs text-slate-400">Sin tareas</p>
        )}
      </div>
      <Button variant="ghost" className="mt-2 w-full" onClick={() => onAdd(status)}>
        + Añadir
      </Button>
    </div>
  );
}
