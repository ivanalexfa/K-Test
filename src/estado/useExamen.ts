import { useContext } from 'react';
import { ExamenContexto } from './contextos';
import type { ExamenValor } from './ExamenContext';

/** Examen en curso y su último resultado. Requiere <ExamenProvider>. */
export function useExamen(): ExamenValor {
  const valor = useContext(ExamenContexto);
  if (!valor) throw new Error('useExamen debe usarse dentro de <ExamenProvider>.');
  return valor;
}
