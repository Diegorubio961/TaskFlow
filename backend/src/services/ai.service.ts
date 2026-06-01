/** Servicio de IA: genera resúmenes de proyectos usando OpenAI. */
import OpenAI from 'openai';
import { env } from '../config/env.js';
import type { Project, Task } from '../domain/types.js';

export class AiService {
  private getClient(): OpenAI {
    if (!env.OPENAI_API_KEY) {
      throw new Error('OPENAI_API_KEY no está configurada en las variables de entorno.');
    }
    return new OpenAI({ apiKey: env.OPENAI_API_KEY });
  }

  async summarizeProject(project: Project, tasks: Task[]): Promise<string> {
    const client = this.getClient();

    const todo       = tasks.filter((t) => t.status === 'TODO');
    const inProgress = tasks.filter((t) => t.status === 'IN_PROGRESS');
    const done       = tasks.filter((t) => t.status === 'DONE');
    const overdue    = tasks.filter((t) => t.dueDate && new Date(t.dueDate) < new Date() && t.status !== 'DONE');
    const urgent     = tasks.filter((t) => t.priority === 'URGENT' || t.priority === 'HIGH');

    const list = (items: Task[]) =>
      items.length ? items.map((t) => `"${t.title}"`).join(', ') : 'ninguna';

    const prompt = `
Eres un asistente de gestión de proyectos. Analiza el siguiente proyecto y genera un resumen ejecutivo en español de 2 a 3 oraciones. Menciona el estado general, el avance real y cualquier punto de atención (tareas vencidas, urgentes o cuellos de botella). Sé directo y útil, sin saludos ni introducciones.

Proyecto: ${project.name}
${project.description ? `Descripción: ${project.description}` : ''}

Resumen de tareas (${tasks.length} en total):
- Por hacer (${todo.length}): ${list(todo)}
- En progreso (${inProgress.length}): ${list(inProgress)}
- Completadas (${done.length})
- Vencidas (${overdue.length}): ${list(overdue)}
- Alta prioridad o urgente (${urgent.length}): ${list(urgent)}
`.trim();

    const response = await client.chat.completions.create({
      model: 'gpt-4o-mini',
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 200,
      temperature: 0.5,
    });

    return response.choices[0]?.message?.content?.trim() ?? 'No se pudo generar el resumen.';
  }
}
