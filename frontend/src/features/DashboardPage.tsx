/** Página principal: cabecera + sidebar de proyectos + tablero Kanban. */
import { useEffect, useState } from 'react';
import { useAuth } from './auth/AuthContext';
import { ProjectSidebar } from './projects/ProjectSidebar';
import { useProjects } from './projects/useProjects';
import { KanbanBoard } from './tasks/KanbanBoard';
import { Button } from '../components/ui';
import { projectsApi } from '../api/projects';

export function DashboardPage() {
  const { user, logout } = useAuth();
  const { data: projects = [] } = useProjects();
  const [selectedId, setSelectedId] = useState<string | null>(null);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const [summary, setSummary] = useState<string | null>(null);
  const [summaryOpen, setSummaryOpen] = useState(false);
  const [summaryLoading, setSummaryLoading] = useState(false);

  const activeId = selectedId ?? projects[0]?.id ?? null;
  const activeProject = projects.find((p) => p.id === activeId);

  // Resetear resumen al cambiar de proyecto
  useEffect(() => {
    setSummary(null);
    setSummaryOpen(false);
  }, [activeId]);

  const handleSummary = async () => {
    if (!activeProject) return;
    if (summaryOpen && summary) { setSummaryOpen(false); return; }
    setSummaryOpen(true);
    if (summary) return;
    setSummaryLoading(true);
    try {
      const text = await projectsApi.summarize(activeProject.id);
      setSummary(text);
    } catch {
      setSummary('No se pudo generar el resumen. Verifica que OPENAI_API_KEY esté configurada.');
    } finally {
      setSummaryLoading(false);
    }
  };

  return (
    <div className="flex h-screen flex-col bg-slate-950">
      <header className="flex items-center justify-between border-b border-slate-800 bg-slate-900 px-4 py-3 md:px-6">
        <div className="flex items-center gap-3">
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
              {/* Cabecera del proyecto + botón IA */}
              <div className="mb-4">
                <div className="flex items-start justify-between gap-3 flex-wrap">
                  <div>
                    <h2 className="text-xl font-semibold text-slate-100">{activeProject.name}</h2>
                    {activeProject.description && (
                      <p className="text-sm text-slate-400">{activeProject.description}</p>
                    )}
                  </div>
                  <button
                    onClick={handleSummary}
                    disabled={summaryLoading}
                    className="flex items-center gap-1.5 rounded-lg border border-indigo-700/50 bg-indigo-900/20 px-3 py-1.5 text-sm text-indigo-300 hover:bg-indigo-900/40 hover:text-indigo-200 transition disabled:opacity-50 shrink-0"
                  >
                    <span>✨</span>
                    {summaryLoading ? 'Analizando…' : summaryOpen && summary ? 'Ocultar resumen' : 'Resumen IA'}
                  </button>
                </div>

                {/* Panel de resumen */}
                {summaryOpen && (
                  <div className="mt-3 rounded-xl border border-indigo-800/40 bg-indigo-950/30 px-4 py-3">
                    {summaryLoading ? (
                      <div className="flex items-center gap-2 text-sm text-indigo-300">
                        <svg className="animate-spin w-4 h-4" fill="none" viewBox="0 0 24 24">
                          <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
                          <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8v8z" />
                        </svg>
                        Generando resumen con IA…
                      </div>
                    ) : (
                      <p className="text-sm text-slate-300 leading-relaxed">{summary}</p>
                    )}
                  </div>
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
