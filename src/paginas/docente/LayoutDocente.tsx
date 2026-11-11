import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { EncabezadoPortal } from '../../components/EncabezadoPortal';
import { useSesion } from '../../estado/useSesion';
import { MENU_DOCENTE, rutas } from '../../rutas';

/**
 * Marco del portal del docente: el mismo encabezado que el del estudiante, con su propio
 * menú de celdas (Estudiantes · Intentos · Material). Ver ADR docente/0002.
 */
export const LayoutDocente: React.FC = () => {
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
        etiqueta="Portal del docente"
        menu={MENU_DOCENTE}
        inicio={rutas.docente}
        nombre={usuario.name}
        detalle="Docente"
        onSalir={() => {
          salir();
          navigate(rutas.entrar, { replace: true });
        }}
      />
      <main id="contenido" className="flex-1">
        <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10 py-8 lg:py-10">
          <Outlet />
        </div>
      </main>
    </div>
  );
};
