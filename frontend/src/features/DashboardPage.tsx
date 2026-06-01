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
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const activeId = selectedId ?? projects[0]?.id ?? null;
  const activeProject = projects.find((p) => p.id === activeId);

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
          {/* Hamburger visible solo en móvil */}
          <button
            className="md:hidden rounded p-1.5 text-slate-400 hover:bg-slate-800 hover:text-slate-200 transition"
            onClick={() => setSidebarOpen(true)}
            aria-label="Abrir proyectos"
          >
            <svg className="w-5 h-5" fill="none" stroke="currentColor" strokeWidth={2} viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" d="M4 6h16M4 12h16M4 18h16" />
            </svg>
          </button>
          <h1 className="text-lg font-bold text-slate-100">
            Task<span className="text-indigo-400">Flow</span>
          </h1>
          {activeProject && (
            <span className="hidden sm:block text-sm text-slate-400 truncate max-w-[200px]">
              / {activeProject.name}
            </span>
          )}
        </div>
        <div className="flex items-center gap-2">
          <span className="hidden sm:block text-sm text-slate-400">{user?.name}</span>
          <Button variant="secondary" onClick={logout} className="text-xs px-2 py-1.5">
            Salir
          </Button>
        </div>
      </header>

      <div className="flex flex-1 overflow-hidden">
        {/* Overlay oscuro para móvil cuando el sidebar está abierto */}
        {sidebarOpen && (
          <div
            className="fixed inset-0 z-40 bg-black/60 md:hidden"
            onClick={() => setSidebarOpen(false)}
          />
        )}

        <ProjectSidebar
          selectedId={activeId}
          isMobileOpen={sidebarOpen}
          onSelect={(id) => {
            setSelectedId(id);
            setSidebarOpen(false);
          }}
          onMobileClose={() => setSidebarOpen(false)}
        />

        <main className="flex-1 overflow-y-auto bg-slate-950 p-4 md:p-6">
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
