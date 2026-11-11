import React from 'react';
import { useNavigate, useSearchParams } from 'react-router';
import { StudentDashboard, type StudentTab } from '../components/StudentDashboard';
import { instantiateUserClass, StudentUser } from '../models/UserClasses';
import { useSesion } from '../estado/useSesion';
import { useExamen } from '../estado/useExamen';
import { claveDeExamen, examData } from '../estado/examenes';
import { PESTANAS_ESTUDIANTE, rutas } from '../rutas';

/**
 * Pestañas del portal del estudiante: /inicio/pruebas, /material y /resultados.
 * Van dentro de LayoutEstudiante (encabezado y menú), así que StudentDashboard se muestra
 * incrustado, sin su encabezado ni su banner. `?m=<id>` abre un material concreto.
 */
export const PaginaEstudiante: React.FC<{ pestana: StudentTab }> = ({ pestana }) => {
  const { usuario, materiales, intentos, cambiarCohorte, salir } = useSesion();
  const { iniciar } = useExamen();
  const navigate = useNavigate();
  const [parametros] = useSearchParams();

  const estudiante = usuario ? instantiateUserClass(usuario) : null;
  if (!(estudiante instanceof StudentUser)) return null; // RequiereSesion ya filtró el rol

  return (
    <StudentDashboard
      // Al cambiar de material desde el inicio se vuelve a montar para abrirlo.
      key={parametros.get('m') ?? 'sin-material'}
      incrustado
      materialInicial={parametros.get('m')}
      student={estudiante}
      examData={examData}
      materials={materiales}
      allAttempts={intentos}
      tab={pestana}
      onChangeTab={(t) => navigate(PESTANAS_ESTUDIANTE[t])}
      onStartTest={(modo, sprint) => {
        iniciar(modo, sprint ?? null);
        navigate(rutas.examen(claveDeExamen(modo, sprint)));
        window.scrollTo({ top: 0, behavior: 'smooth' });
      }}
      onInspectAttempt={(intento) => navigate(rutas.resultados(intento.id))}
      onUpdateCohort={cambiarCohorte}
      onLogout={() => {
        salir();
        navigate(rutas.inicio, { replace: true });
      }}
    />
  );
};
