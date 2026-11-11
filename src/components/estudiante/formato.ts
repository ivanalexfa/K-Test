import type { SectionType } from '../../types/exam';

/** Nombre de cada materia de la PAA tal como se muestra en la interfaz. */
export const MATERIA: Record<SectionType, string> = {
  reading: 'Lectura y Redacción',
  math: 'Matemáticas',
};

/** Fecha corta para el historial: «10 nov 2026». */
export const formatoFecha = new Intl.DateTimeFormat('es-SV', {
  day: 'numeric',
  month: 'short',
  year: 'numeric',
});
