/** Página principal: cabecera + sidebar de proyectos + tablero Kanban. */
import { useState } from 'react';
import { useAuth } from './auth/AuthContext';
import { ProjectSidebar } from './projects/ProjectSidebar';
import { useProjects } from './projects/useProjects';
import { KanbanBoard } from './tasks/KanbanBoard';
import { Button } from '../components/ui';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { data: projects = [] } = useProjects();
  const [selectedId, setSelectedId] = useState<string | null>(null);

  // Selecciona el primer proyecto por defecto cuando cargan.
  const activeId = selectedId ?? projects[0]?.id ?? null;
  const activeProject = projects.find((p) => p.id === activeId);

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-6 py-3">
        <h1 className="text-lg font-bold text-slate-100">
          Gestión de Tareas <span className="text-slate-400">por Proyectos</span>
        </h1>
        <div className="flex items-center gap-3">
          <span className="text-sm text-slate-400">{user?.name}</span>
          <Button variant="secondary" onClick={logout}>
            Salir
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        <ProjectSidebar selectedId={activeId} onSelect={setSelectedId} />

        <main className="flex-1 overflow-y-auto bg-slate-950 p-6">
          {activeProject ? (
            <>
              <div className="mb-4">
                <h2 className="text-xl font-semibold text-slate-100">{activeProject.name}</h2>
                {activeProject.description && (
                  <p className="text-sm text-slate-400">{activeProject.description}</p>
                )}
              </div>
              <KanbanBoard projectId={activeProject.id} />
            </>
          ) : (
            <div className="flex h-full items-center justify-center text-center text-slate-500">
              <p>
                Selecciona un proyecto en la barra lateral
                <br />o crea uno nuevo para empezar.
              </p>
            </div>
          )}
        </main>
      </div>
    </div>
  );
}
