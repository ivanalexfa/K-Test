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
  /** Abre un material concreto en la pestaña de material. */
  materialDe: (id: string) => `/inicio/material?m=${encodeURIComponent(id)}`,
  misResultados: '/inicio/resultados',
  docente: '/docente',
  examen: (clave: string) => `/examen/${encodeURIComponent(clave)}`,
  resultados: (intentoId: string) => `/resultados/${encodeURIComponent(intentoId)}`,
} as const;

/** Pantalla de inicio de cada rol después de entrar. */
export function rutaDeRol(rol: UserRole): string {
  return rol === 'teacher' ? rutas.docente : rutas.estudiante;
}

/** Menú del portal del estudiante (encabezado), en orden. */
export const MENU_ESTUDIANTE = [
  { texto: 'Inicio', ruta: rutas.estudiante, exacta: true },
  { texto: 'Pruebas', ruta: rutas.pruebas, exacta: false },
  { texto: 'Material', ruta: rutas.material, exacta: false },
  { texto: 'Resultados', ruta: rutas.misResultados, exacta: false },
] as const;
