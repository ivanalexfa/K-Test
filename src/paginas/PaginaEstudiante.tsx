import React from 'react';
import { useNavigate } from 'react-router';
import { StudentDashboard, type StudentTab } from '../components/StudentDashboard';
import { StudentOnboardingModal } from '../components/StudentOnboardingModal';
import { instantiateUserClass, StudentUser } from '../models/UserClasses';
import { useSesion } from '../estado/useSesion';
import { useExamen } from '../estado/useExamen';
import { claveDeExamen, examData } from '../estado/examenes';
import { PESTANAS_ESTUDIANTE, rutas } from '../rutas';

/** Portal del estudiante. La pestaña sale de la URL: /inicio/pruebas, /material o /resultados. */
export const PaginaEstudiante: React.FC<{ pestana: StudentTab }> = ({ pestana }) => {
  const { usuario, materiales, intentos, cambiarCohorte, salir } = useSesion();
  const { iniciar } = useExamen();
  const navigate = useNavigate();

  const estudiante = usuario ? instantiateUserClass(usuario) : null;
  if (!(estudiante instanceof StudentUser)) return null; // RequiereSesion ya filtró el rol

  const necesitaCohorte = !estudiante.cohort || estudiante.cohort.trim() === '';

  return (
    <>
      {necesitaCohorte && (
        <StudentOnboardingModal studentName={estudiante.name} onConfirmCohort={cambiarCohorte} />
      )}
      <StudentDashboard
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
          navigate(rutas.entrar, { replace: true });
        }}
      />
    </>
  );
};
