import React from 'react';
import { Outlet, useNavigate } from 'react-router';
import { EncabezadoEstudiante } from '../../components/estudiante/EncabezadoEstudiante';
import { StudentOnboardingModal } from '../../components/StudentOnboardingModal';
import { useSesion } from '../../estado/useSesion';
import { rutas } from '../../rutas';

/**
 * Marco de las pantallas del estudiante (/inicio y sus pestañas): encabezado con el menú,
 * fondo blanco y la ventana para elegir ciclo de admisión si todavía no lo tiene.
 * El examen tiene su propio encabezado y no usa este marco.
 */
export const LayoutEstudiante: React.FC = () => {
  const { usuario, cambiarCohorte, salir } = useSesion();
  const navigate = useNavigate();
  if (!usuario) return null; // RequiereSesion ya filtró

  const necesitaCiclo = !usuario.cohort || usuario.cohort.trim() === '';

  return (
    <div className="min-h-dvh flex flex-col bg-key-blanco">
      <a
        href="#contenido"
        className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-key-negro focus:px-5 focus:py-3 focus:text-key-blanco"
      >
        Saltar al contenido
      </a>
      <EncabezadoEstudiante
        nombre={usuario.name}
        ciclo={usuario.cohort}
        onSalir={() => {
          salir();
          navigate(rutas.inicio, { replace: true });
        }}
      />
      <main id="contenido" className="flex-1">
        <Outlet />
      </main>
      {necesitaCiclo && (
        <StudentOnboardingModal studentName={usuario.name} onConfirmCohort={cambiarCohorte} />
      )}
    </div>
  );
};
