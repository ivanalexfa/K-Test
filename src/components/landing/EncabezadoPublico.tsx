import React from 'react';
import { Link } from 'react-router';
import { LogoKey } from '../brand/LogoKey';
import { BotonPastilla } from './BotonPastilla';
import { rutas } from '../../rutas';

/**
 * Encabezado de la landing: blanco, fijo al bajar, con borde fino abajo, como las páginas
 * internas de keyinstitute.com. Una sola acción destacada: «Empezar a practicar».
 */
export const EncabezadoPublico: React.FC = () => (
  <header className="sticky top-0 z-40 bg-key-blanco border-b-[0.8px] border-key-negro">
    <div className="mx-auto max-w-[1360px] h-16 sm:h-20 px-5 sm:px-8 lg:px-10 flex items-center justify-between gap-3 sm:gap-4">
      <Link
        to={rutas.inicio}
        aria-label="K-Test, inicio"
        className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-key-azul"
      >
        <span className="hidden md:inline-flex">
          <LogoKey theme="light" variant="full" />
        </span>
        {/* En teléfonos chicos (320 px) el isotipo baja a 28 px para que quepan logo, nombre y botón. */}
        <span className="md:hidden inline-flex max-[379px]:[&_img]:h-7 max-[379px]:[&>span]:gap-2.5">
          <LogoKey theme="light" variant="mark-only" />
        </span>
      </Link>
      <BotonPastilla to={rutas.entrar} className="max-[379px]:px-4">

        <span className="sm:hidden">Empezar</span>
        <span className="hidden sm:inline">Empezar a practicar</span>
      </BotonPastilla>
    </div>
  </header>
);
