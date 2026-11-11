import React from 'react';
import { Link, useLocation } from 'react-router';
import { LogOut } from 'lucide-react';
import { LogoKey } from './brand/LogoKey';

/**
 * Encabezado de los portales (estudiante y docente): blanco y fijo, con el logo de Key y un
 * menú de celdas con borde fino, como keyinstitute.com. La celda de la sección activa se
 * pinta de azul Key. Ver ADR estudiante/0001 y docente/0002.
 */
export interface ItemMenu {
  texto: string;
  ruta: string;
  exacta: boolean;
  /** Otro prefijo de URL que también marca la celda como activa (por ejemplo, la ficha de un estudiante). */
  tambien?: string;
}

interface Props {
  /** Nombre accesible del menú, por ejemplo «Portal del estudiante». */
  etiqueta: string;
  menu: readonly ItemMenu[];
  inicio: string;
  nombre: string;
  detalle?: string;
  onSalir: () => void;
}

const claseCelda = (activa: boolean) =>
  `flex items-center justify-center h-11 px-3 sm:px-5 text-sm sm:text-base whitespace-nowrap
   border-[0.8px] border-key-negro -ml-[0.8px] first:ml-0 transition-colors duration-200
   focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul
   ${activa ? 'bg-key-azul text-key-blanco font-semibold' : 'bg-key-blanco text-key-tinta hover:bg-key-gris-claro'}`;

export const EncabezadoPortal: React.FC<Props> = ({ etiqueta, menu, inicio, nombre, detalle, onSalir }) => {
  const { pathname } = useLocation();
  const activa = (item: ItemMenu) =>
    (item.exacta ? pathname === item.ruta : pathname.startsWith(item.ruta)) ||
    Boolean(item.tambien && pathname.startsWith(item.tambien));
  const celdas = (extra = '') =>
    menu.map((item) => (
      <Link
        key={item.ruta}
        to={item.ruta}
        aria-current={activa(item) ? 'page' : undefined}
        className={`${claseCelda(activa(item))} ${extra}`}
      >
        {item.texto}
      </Link>
    ));

  return (
    <header className="sticky top-0 z-40 bg-key-blanco border-b-[0.8px] border-key-negro">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10">
        <div className="h-16 lg:h-20 flex items-center justify-between gap-4">
          <Link
            to={inicio}
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
          <nav aria-label={etiqueta} className="hidden lg:flex">
            {celdas()}
          </nav>

          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden md:block text-right min-w-0">
              <p className="text-sm font-semibold text-key-tinta truncate max-w-[220px]">{nombre}</p>
              {detalle && <p className="text-xs text-key-texto-suave truncate max-w-[220px]">{detalle}</p>}
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
        <nav
          aria-label={etiqueta}
          className="lg:hidden grid pb-3"
          style={{ gridTemplateColumns: `repeat(${menu.length}, minmax(0, 1fr))` }}
        >
          {celdas('!px-1 text-[13px] min-[380px]:text-sm')}
        </nav>
      </div>
    </header>
  );
};
