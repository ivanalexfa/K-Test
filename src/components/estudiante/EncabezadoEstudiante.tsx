import React from 'react';
import { Link, NavLink } from 'react-router';
import { LogOut } from 'lucide-react';
import { LogoKey } from '../brand/LogoKey';
import { MENU_ESTUDIANTE, rutas } from '../../rutas';

/**
 * Encabezado del portal del estudiante: blanco y fijo, con el logo de Key y un menú de
 * celdas con borde fino, como keyinstitute.com. La celda de la sección activa se pinta
 * de azul Key (en Key se pinta del color de la sección). Ver docs/estudiante/decisiones/0001.
 */
interface Props {
  nombre: string;
  ciclo: string;
  onSalir: () => void;
}

const claseCelda = ({ isActive }: { isActive: boolean }) =>
  `flex items-center justify-center h-11 px-3 sm:px-5 text-sm sm:text-base whitespace-nowrap
   border-[0.8px] border-key-negro -ml-[0.8px] first:ml-0 transition-colors duration-200
   focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul
   ${isActive ? 'bg-key-azul text-key-blanco font-semibold' : 'bg-key-blanco text-key-tinta hover:bg-key-gris-claro'}`;

export const EncabezadoEstudiante: React.FC<Props> = ({ nombre, ciclo, onSalir }) => (
  <header className="sticky top-0 z-40 bg-key-blanco border-b-[0.8px] border-key-negro">
    <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10">
      <div className="h-16 lg:h-20 flex items-center justify-between gap-4">
        <Link
          to={rutas.estudiante}
          aria-label="K-Test, inicio"
          className="shrink-0 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-key-azul max-[379px]:[&_img]:h-7"
        >
          <span className="hidden xl:inline-flex">
            <LogoKey theme="light" variant="full" />
          </span>
          <span className="xl:hidden inline-flex">
            <LogoKey theme="light" variant="mark-only" />
          </span>
        </Link>

        {/* Menú en escritorio: al centro del encabezado. */}
        <nav aria-label="Portal del estudiante" className="hidden lg:flex">
          {MENU_ESTUDIANTE.map((item) => (
            <NavLink key={item.ruta} to={item.ruta} end={item.exacta} className={claseCelda}>
              {item.texto}
            </NavLink>
          ))}
        </nav>

        <div className="flex items-center gap-4 min-w-0">
          <div className="hidden md:block text-right min-w-0">
            <p className="text-sm font-semibold text-key-tinta truncate max-w-[220px]">{nombre}</p>
            {ciclo && <p className="text-xs text-key-texto-suave truncate max-w-[220px]">{ciclo}</p>}
          </div>
          <button
            type="button"
            onClick={onSalir}
            className="inline-flex items-center gap-2 h-10 px-4 rounded-full border-[0.8px] border-key-negro text-sm font-semibold text-key-tinta hover:bg-key-gris-claro transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
          >
            <LogOut aria-hidden="true" className="h-4 w-4" />
            Salir
          </button>
        </div>
      </div>

      {/* Menú en celular y tableta: fila completa debajo del logo. */}
      <nav aria-label="Portal del estudiante" className="lg:hidden grid grid-cols-4 pb-3">
        {MENU_ESTUDIANTE.map((item) => (
          <NavLink
            key={item.ruta}
            to={item.ruta}
            end={item.exacta}
            className={(p) => `${claseCelda(p)} !px-1 text-[13px] min-[380px]:text-sm`}
          >
            {item.texto}
          </NavLink>
        ))}
      </nav>
    </div>
  </header>
);
