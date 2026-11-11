import React from 'react';
import { Navigate, Outlet, useLocation } from 'react-router';
import type { UserRole } from '../types/exam';
import { useSesion } from '../estado/useSesion';
import { rutaDeRol, rutas } from '../rutas';

/**
 * Protege las rutas internas: sin sesión manda a /entrar (y vuelve después a donde
 * iba); con otro rol, a la pantalla de inicio de su rol.
 */
export const RequiereSesion: React.FC<{ rol: UserRole }> = ({ rol }) => {
  const { usuario } = useSesion();
  const ubicacion = useLocation();

  if (!usuario) {
    return <Navigate to={rutas.entrar} replace state={{ desde: ubicacion.pathname }} />;
  }
  if (usuario.role !== rol) {
    return <Navigate to={rutaDeRol(usuario.role)} replace />;
  }
  return <Outlet />;
};

/** Para las pantallas de resultados, que ven estudiantes y docentes. */
export const RequiereCualquierSesion: React.FC = () => {
  const { usuario } = useSesion();
  const ubicacion = useLocation();
  if (!usuario) {
    return <Navigate to={rutas.entrar} replace state={{ desde: ubicacion.pathname }} />;
  }
  return <Outlet />;
};
