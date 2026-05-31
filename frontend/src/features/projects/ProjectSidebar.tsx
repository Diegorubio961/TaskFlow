/** Barra lateral con la lista de proyectos y acciones CRUD. */
import { useState } from 'react';
import { useCreateProject, useDeleteProject, useProjects, useUpdateProject } from './useProjects';
import { ProjectModal } from './ProjectModal';
import { Spinner } from '../../components/ui';
import type { Project } from '../../types';

interface Props {
  selectedId: string | null;
  onSelect: (id: string) => void;
}

export function ProjectSidebar({ selectedId, onSelect }: Props) {
  const { data: projects = [], isLoading } = useProjects();
  const createProject = useCreateProject();
  const updateProject = useUpdateProject();
  const deleteProject = useDeleteProject();

  const [modalOpen, setModalOpen] = useState(false);
  const [editing, setEditing] = useState<Project | undefined>();

  const handleDelete = (project: Project) => {
    if (confirm(`¿Eliminar el proyecto "${project.name}" y todas sus tareas?`)) {
      deleteProject.mutate(project.id);
    }
  };

  return (
    <aside className="flex w-64 shrink-0 flex-col border-r border-slate-200 bg-white">
      <div className="flex items-center justify-between p-4">
        <h2 className="text-sm font-semibold uppercase tracking-wide text-slate-500">Proyectos</h2>
        <button
          onClick={() => {
            setEditing(undefined);
            setModalOpen(true);
          }}
          className="rounded bg-brand-600 px-2 py-1 text-sm font-medium text-white hover:bg-brand-700"
        >
          +
        </button>
      </div>

      <div className="flex-1 overflow-y-auto px-2">
        {isLoading ? (
          <Spinner />
        ) : projects.length === 0 ? (
          <p className="px-2 py-4 text-sm text-slate-400">
            Aún no tienes proyectos. Crea el primero con el botón +.
          </p>
        ) : (
          <ul className="space-y-1">
            {projects.map((project) => (
              <li key={project.id}>
                <div
                  className={`group flex items-center justify-between rounded-md px-3 py-2 text-sm ${
                    selectedId === project.id
                      ? 'bg-brand-50 text-brand-700'
                      : 'text-slate-700 hover:bg-slate-50'
                  }`}
                >
                  <button className="flex-1 text-left" onClick={() => onSelect(project.id)}>
                    <span className="font-medium">{project.name}</span>
                    {project._count && (
                      <span className="ml-1 text-xs text-slate-400">({project._count.tasks})</span>
                    )}
                  </button>
                  <div className="flex gap-1 opacity-0 transition group-hover:opacity-100">
                    <button
                      onClick={() => {
                        setEditing(project);
                        setModalOpen(true);
                      }}
                      className="text-slate-400 hover:text-slate-700"
                      title="Editar"
                    >
                      ✎
                    </button>
                    <button
                      onClick={() => handleDelete(project)}
                      className="text-slate-400 hover:text-red-600"
                      title="Eliminar"
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ProjectModal
        open={modalOpen}
        onClose={() => setModalOpen(false)}
        initial={editing}
        submitting={createProject.isPending || updateProject.isPending}
        onSubmit={(data) => {
          if (editing) {
            updateProject.mutate({ id: editing.id, payload: data });
          } else {
            createProject.mutate(data, { onSuccess: (p) => onSelect(p.id) });
          }
          setModalOpen(false);
        }}
      />
    </aside>
  );
}
