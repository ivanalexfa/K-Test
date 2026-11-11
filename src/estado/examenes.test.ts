import { describe, expect, it } from 'vitest';
import { claveDeExamen, examenDeClave, tituloDeExamen } from './examenes';
import { SPRINTS_CATALOG } from '../data/sprintsCatalog';
import { rutaDeRol, rutas } from '../rutas';

describe('claves de examen en la URL', () => {
  it('ida y vuelta para el simulacro y los sprints genéricos', () => {
    expect(claveDeExamen('simulacro')).toBe('simulacro');
    expect(claveDeExamen('sprint_reading')).toBe('lectura');
    expect(claveDeExamen('sprint_math')).toBe('matematicas');
    expect(examenDeClave('lectura')).toEqual({ modo: 'sprint_reading', sprint: null });
  });

  it('un sprint del catálogo se identifica por su id', () => {
    const sprint = SPRINTS_CATALOG[0];
    const clave = claveDeExamen(sprint.mode, sprint);
    expect(clave).toBe(sprint.id);
    expect(examenDeClave(clave)).toEqual({ modo: sprint.mode, sprint });
    expect(tituloDeExamen(clave)).toContain(sprint.code);
  });

  it('una clave desconocida no es un examen', () => {
    expect(examenDeClave('no-existe')).toBeNull();
  });
});

describe('rutas', () => {
  it('cada rol tiene su pantalla de inicio', () => {
    expect(rutaDeRol('student')).toBe('/inicio');
    expect(rutaDeRol('teacher')).toBe('/docente');
  });

  it('codifica los ids en la URL', () => {
    expect(rutas.resultados('att 1')).toBe('/resultados/att%201');
  });
});
