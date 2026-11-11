import { createContext } from 'react';
import type { SesionValor } from './SesionContext';
import type { ExamenValor } from './ExamenContext';

/**
 * Los objetos de contexto viven aparte de sus providers para que los archivos .tsx
 * solo exporten componentes (react-refresh). Se leen con useSesion() y useExamen().
 */
export const SesionContexto = createContext<SesionValor | null>(null);
export const ExamenContexto = createContext<ExamenValor | null>(null);
