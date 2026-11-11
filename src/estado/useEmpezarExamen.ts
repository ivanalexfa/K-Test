import { useNavigate } from 'react-router';
import { useExamen } from './useExamen';
import { claveDeExamen } from './examenes';
import { rutas } from '../rutas';
import type { SprintConfig, TestMode } from '../types/exam';

/** Empieza un simulacro o un sprint y abre su pantalla (/examen/<clave>). */
export function useEmpezarExamen() {
  const { iniciar } = useExamen();
  const navigate = useNavigate();
  return (modo: TestMode, sprint: SprintConfig | null = null) => {
    iniciar(modo, sprint);
    navigate(rutas.examen(claveDeExamen(modo, sprint)));
    window.scrollTo({ top: 0 });
  };
}
