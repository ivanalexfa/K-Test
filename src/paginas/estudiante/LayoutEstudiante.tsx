import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { EncabezadoPortal } from '../../components/EncabezadoPortal';
import { useSesion } from '../../estado/useSesion';
import { MENU_ESTUDIANTE, rutas } from '../../rutas';

/**
 * Marco de las pantallas del estudiante (/inicio y sus pestañas): encabezado con el menú,
 * y fondo blanco. Ya no se pide el ciclo de admisión (se quitó el paso; ver ADR estudiante/0001).
 * El examen tiene su propio encabezado y no usa este marco.
 */
export const LayoutEstudiante: React.FC = () => {
  const { usuario, salir } = useSesion();
  const navigate = useNavigate();
  if (!usuario) return null; // RequiereSesion ya filtró

  return (
    <div className="min-h-dvh flex flex-col bg-key-blanco">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-key-negro focus:px-5 focus:py-3 focus:text-key-blanco"
      >
        Saltar al contenido
      </a>
      <EncabezadoPortal
        etiqueta="Portal del estudiante"
        menu={MENU_ESTUDIANTE}
        inicio={rutas.estudiante}
        nombre={usuario.name}
        detalle={usuario.cohort}
        onSalir={() => {
          salir();
          navigate(rutas.inicio, { replace: true });
        }}
      />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
    </div>
  );
};
