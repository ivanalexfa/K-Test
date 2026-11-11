import type { TestAttemptRecord, UserRecord } from '../../types/exam';

/** Resumen de un estudiante a partir de sus intentos (lista de estudiantes y ficha). */
export interface ResumenEstudiante {
  estudiante: UserRecord;
  intentos: TestAttemptRecord[];
  precision: number | null;
  lectura: number | null;
  matematicas: number | null;
  mejorSimulacro: number | null;
  ultimo: string | null;
}

const promedio = (valores: number[]) =>
  valores.length ? Math.round(valores.reduce((a, b) => a + b, 0) / valores.length) : null;

export function resumirEstudiante(estudiante: UserRecord, todos: TestAttemptRecord[]): ResumenEstudiante {
  const intentos = todos
    .filter((a) => a.userId === estudiante.id)
    .sort((a, b) => b.completedAt.localeCompare(a.completedAt));
  const conLectura = intentos.filter((a) => a.readingTotal > 0);
  const conMate = intentos.filter((a) => a.mathTotal > 0);
  const simulacros = intentos.filter((a) => a.mode === 'simulacro');
  return {
    estudiante,
    intentos,
    precision: promedio(intentos.map((a) => a.percentage)),
    lectura: promedio(conLectura.map((a) => (a.readingCorrect / a.readingTotal) * 100)),
    matematicas: promedio(conMate.map((a) => (a.mathCorrect / a.mathTotal) * 100)),
    mejorSimulacro: simulacros.length ? Math.max(...simulacros.map((s) => s.scaledScore)) : null,
    ultimo: intentos[0]?.completedAt ?? null,
  };
}

/** Niveles de desempeño que usa el filtro (mismos cortes que el portal anterior). */
export type Nivel = 'all' | 'high' | 'medium' | 'low';

export const NIVELES: { id: Nivel; texto: string }[] = [
  { id: 'all', texto: 'Todos los niveles' },
  { id: 'high', texto: 'Sobresaliente (85% o más)' },
  { id: 'medium', texto: 'En progreso (60% a 84%)' },
  { id: 'low', texto: 'Necesita refuerzo (menos de 60%)' },
];

export function enNivel(porcentaje: number | null, nivel: Nivel): boolean {
  if (nivel === 'all') return true;
  if (porcentaje === null) return false;
  if (nivel === 'high') return porcentaje >= 85;
  if (nivel === 'medium') return porcentaje >= 60 && porcentaje < 85;
  return porcentaje < 60;
}

/** Iniciales para el cuadro del estudiante («Sofía Martínez» → «SM»). */
export const iniciales = (nombre: string) =>
  nombre
    .split(' ')
    .filter(Boolean)
    .slice(0, 2)
    .map((p) => p[0])
    .join('')
    .toUpperCase();

/** «Dr. Roberto Méndez» → «Dr. Roberto»; «Ana López» → «Ana». */
export const saludo = (nombre: string) => {
  const partes = nombre.split(' ');
  return partes[0].endsWith('.') ? partes.slice(0, 2).join(' ') : partes[0];
};

export function tamanoArchivo(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

/** Clase común de campos del docente: rectos, línea fina y foco azul. */
export const claseCampo =
  'w-full h-11 px-3.5 border-[0.8px] border-key-negro bg-key-blanco text-base text-key-tinta placeholder:text-key-texto-suave focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul';
