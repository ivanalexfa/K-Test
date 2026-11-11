import rawExamData from '../data/mockPaaExam.json';
import { SPRINTS_CATALOG } from '../data/sprintsCatalog';
import type { MockPaaExamData, SprintConfig, TestMode } from '../types/exam';

/** Banco de preguntas de la PAA (por ahora, el JSON local). */
export const examData = rawExamData as unknown as MockPaaExamData;

/** Identifica un examen en la URL: `simulacro`, `lectura`, `matematicas` o el id de un sprint. */
export type ClaveExamen = string;

export function claveDeExamen(modo: TestMode, sprint?: SprintConfig | null): ClaveExamen {
  if (sprint) return sprint.id;
  if (modo === 'simulacro') return 'simulacro';
  return modo === 'sprint_reading' ? 'lectura' : 'matematicas';
}

/** Traduce la clave de la URL a modo + sprint; null si no existe. */
export function examenDeClave(
  clave: string,
): { modo: TestMode; sprint: SprintConfig | null } | null {
  if (clave === 'simulacro') return { modo: 'simulacro', sprint: null };
  if (clave === 'lectura') return { modo: 'sprint_reading', sprint: null };
  if (clave === 'matematicas') return { modo: 'sprint_math', sprint: null };
  const sprint = SPRINTS_CATALOG.find((s) => s.id === clave);
  return sprint ? { modo: sprint.mode, sprint } : null;
}

/** Título legible de un examen, para la pantalla de «Empezar examen». */
export function tituloDeExamen(clave: string): string {
  const def = examenDeClave(clave);
  if (!def) return 'Examen';
  if (def.sprint) return `${def.sprint.code} · ${def.sprint.title}`;
  if (def.modo === 'simulacro') return 'Simulacro completo PAA';
  return def.modo === 'sprint_reading' ? 'Sprint de Lectura y Redacción' : 'Sprint de Matemáticas';
}
