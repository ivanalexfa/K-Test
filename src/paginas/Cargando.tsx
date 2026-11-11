import React from 'react';
import { LogoKey } from '../components/brand/LogoKey';

/** Pantalla mientras se cargan los datos de la plataforma. */
export const Cargando: React.FC = () => (
  <div
    className="min-h-dvh flex items-center justify-center bg-key-blanco"
    role="status"
    aria-live="polite"
  >
    <div className="text-center space-y-4">
      <div className="flex justify-center motion-safe:animate-pulse">
        <LogoKey theme="light" variant="full" />
      </div>
      <p className="text-sm text-key-texto-suave">Preparando tu práctica…</p>
    </div>
  </div>
);
