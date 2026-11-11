import { useContext } from 'react';
import { SesionContexto } from './contextos';
import type { SesionValor } from './SesionContext';

/** Datos de la plataforma y sesión del usuario. Requiere <SesionProvider>. */
export function useSesion(): SesionValor {
  const valor = useContext(SesionContexto);
  if (!valor) throw new Error('useSesion debe usarse dentro de <SesionProvider>.');
  return valor;
}
