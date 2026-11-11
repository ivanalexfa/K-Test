import React from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router';
import { AuthView } from '../components/AuthView';
import { useSesion } from '../estado/useSesion';
import { rutaDeRol } from '../rutas';
import type { UserRecord } from '../types/exam';

/**
 * Acceso con Google o Microsoft. Si ya hay sesión, va directo a la pantalla del rol.
 * Después de entrar vuelve a la página que pidió el acceso (por ejemplo, un enlace
 * a /inicio/material), si era de su rol.
 */
export const PaginaAcceso: React.FC = () => {
  const { usuario, usuarios, entrarConGoogle, entrarConMicrosoft, entrarComo } = useSesion();
  const navigate = useNavigate();
  const ubicacion = useLocation();
  const desde = (ubicacion.state as { desde?: string } | null)?.desde;

  const destino = (u: UserRecord) => {
    const inicioRol = rutaDeRol(u.role);
    const mismaZona =
      desde &&
      (u.role === 'teacher' ? desde.startsWith('/docente') : !desde.startsWith('/docente'));
    return mismaZona ? desde : inicioRol;
  };

  if (usuario) return <Navigate to={destino(usuario)} replace />;

  return (
    <AuthView
      users={usuarios}
      onSelectUser={(u) => {
        entrarComo(u);
        navigate(destino(u), { replace: true });
      }}
      onMicrosoftLogin={async (payload) => {
        const u = await entrarConMicrosoft(payload);
        navigate(destino(u), { replace: true });
      }}
      onGoogleLogin={async (payload) => {
        const u = await entrarConGoogle(payload);
        navigate(destino(u), { replace: true });
      }}
    />
  );
};
