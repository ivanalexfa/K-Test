import type { UserRole } from './types/exam';

/**
 * Todas las URLs de K-test en un solo lugar. Las pantallas navegan con estas
 * funciones, nunca con cadenas sueltas. Ver docs/general/decisiones/0005-react-router-y-estado.md.
 */
export const rutas = {
  /** Landing pública. */
  inicio: '/',
  entrar: '/entrar',
  estudiante: '/inicio',
  pruebas: '/inicio/pruebas',
  material: '/inicio/material',
  misResultados: '/inicio/resultados',
  docente: '/docente',
  examen: (clave: string) => `/examen/${encodeURIComponent(clave)}`,
  resultados: (intentoId: string) => `/resultados/${encodeURIComponent(intentoId)}`,
} as const;

/** Pantalla de inicio de cada rol después de entrar. */
export function rutaDeRol(rol: UserRole): string {
  return rol === 'teacher' ? rutas.docente : rutas.pruebas;
}

/** Pestañas del portal del estudiante y su URL. */
export const PESTANAS_ESTUDIANTE = {
  tests: rutas.pruebas,
  materials: rutas.material,
  history: rutas.misResultados,
} as const;

export type PestanaEstudiante = keyof typeof PESTANAS_ESTUDIANTE;
