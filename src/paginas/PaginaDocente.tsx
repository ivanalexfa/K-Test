import React from 'react';
import { useNavigate } from 'react-router';
import { TeacherDashboard } from '../components/TeacherDashboard';
import { instantiateUserClass, TeacherUser } from '../models/UserClasses';
import { useSesion } from '../estado/useSesion';
import { rutas } from '../rutas';

/** Portal del docente (/docente). */
export const PaginaDocente: React.FC = () => {
  const { usuario, usuarios, materiales, intentos, crearMaterial, editarMaterial, eliminarMaterial, salir } =
    useSesion();
  const navigate = useNavigate();

  const docente = usuario ? instantiateUserClass(usuario) : null;
  if (!(docente instanceof TeacherUser)) return null; // RequiereSesion ya filtró el rol

  return (
    <TeacherDashboard
      teacher={docente}
      users={usuarios}
      materials={materiales}
      attempts={intentos}
      onCreateMaterial={crearMaterial}
      onUpdateMaterial={editarMaterial}
      onDeleteMaterial={eliminarMaterial}
      onInspectAttempt={(intento) => navigate(rutas.resultados(intento.id))}
      onLogout={() => {
        salir();
        navigate(rutas.entrar, { replace: true });
      }}
    />
  );
};
