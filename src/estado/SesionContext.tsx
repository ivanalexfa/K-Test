import React, { useCallback, useEffect, useMemo, useState } from 'react';
import { SesionContexto } from './contextos';
import type { StudyMaterial, TestAttemptRecord, UserRecord } from '../types/exam';
import {
  apiAuthenticateWithGoogle,
  apiAuthenticateWithMicrosoft,
  apiCreateStudyMaterial,
  apiDeleteStudyMaterial,
  apiUpdateStudyMaterial,
  apiUpdateUserCohort,
  fetchBootstrapData,
} from '../services/api';

/**
 * Datos de la plataforma (usuarios, material e intentos) y sesión del usuario.
 * Antes vivía todo en App.tsx; ver docs/general/decisiones/0005-react-router-y-estado.md.
 *
 * La sesión se guarda en sessionStorage (solo el id del usuario) para que recargar
 * la página no cierre la sesión; se borra al cerrar la pestaña o al salir.
 */

const CLAVE_SESION = 'ktest_usuario';

type PayloadMicrosoft = Parameters<typeof apiAuthenticateWithMicrosoft>[0];
type PayloadGoogle = Parameters<typeof apiAuthenticateWithGoogle>[0];
type PayloadMaterial = Parameters<typeof apiCreateStudyMaterial>[0];
type CambiosMaterial = Parameters<typeof apiUpdateStudyMaterial>[1];

export interface SesionValor {
  cargando: boolean;
  usuarios: UserRecord[];
  materiales: StudyMaterial[];
  intentos: TestAttemptRecord[];
  usuario: UserRecord | null;
  entrarConMicrosoft: (payload: PayloadMicrosoft) => Promise<UserRecord>;
  entrarConGoogle: (payload: PayloadGoogle) => Promise<UserRecord>;
  /** Solo para el panel de cuentas demo (VITE_ENABLE_DEMO_ACCOUNTS). */
  entrarComo: (usuario: UserRecord) => void;
  salir: () => void;
  cambiarCohorte: (cohorte: string) => Promise<void>;
  crearMaterial: (payload: PayloadMaterial) => Promise<void>;
  editarMaterial: (id: string, cambios: CambiosMaterial) => Promise<void>;
  eliminarMaterial: (id: string) => Promise<void>;
  /** Reemplaza la lista de intentos (después de guardar uno). */
  actualizarIntentos: (intentos: TestAttemptRecord[]) => void;
}

function leerSesionGuardada(): string | null {
  try {
    return sessionStorage.getItem(CLAVE_SESION);
  } catch {
    return null;
  }
}

function guardarSesion(id: string | null) {
  try {
    if (id) sessionStorage.setItem(CLAVE_SESION, id);
    else sessionStorage.removeItem(CLAVE_SESION);
  } catch {
    // Sin sessionStorage (modo privado estricto): la sesión dura hasta recargar.
  }
}

export const SesionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [cargando, setCargando] = useState(true);
  const [usuarios, setUsuarios] = useState<UserRecord[]>([]);
  const [materiales, setMateriales] = useState<StudyMaterial[]>([]);
  const [intentos, setIntentos] = useState<TestAttemptRecord[]>([]);
  const [usuarioId, setUsuarioId] = useState<string | null>(leerSesionGuardada);

  useEffect(() => {
    fetchBootstrapData()
      .then((datos) => {
        setUsuarios(datos.users);
        setMateriales(datos.materials);
        setIntentos(datos.attempts);
      })
      .catch((error) => {
        console.error('Error cargando la base de datos:', error);
      })
      .finally(() => setCargando(false));
  }, []);

  const usuario = useMemo(
    () => (usuarioId ? usuarios.find((u) => u.id === usuarioId) ?? null : null),
    [usuarioId, usuarios],
  );

  const iniciar = useCallback((nuevo: UserRecord, lista: UserRecord[]) => {
    setUsuarios(lista);
    setUsuarioId(nuevo.id);
    guardarSesion(nuevo.id);
    return nuevo;
  }, []);

  const valor = useMemo<SesionValor>(
    () => ({
      cargando,
      usuarios,
      materiales,
      intentos,
      usuario,
      entrarConMicrosoft: async (payload) => {
        const res = await apiAuthenticateWithMicrosoft(payload);
        return iniciar(res.user, res.users);
      },
      entrarConGoogle: async (payload) => {
        const res = await apiAuthenticateWithGoogle(payload);
        return iniciar(res.user, res.users);
      },
      entrarComo: (u) => {
        setUsuarioId(u.id);
        guardarSesion(u.id);
      },
      salir: () => {
        setUsuarioId(null);
        guardarSesion(null);
      },
      cambiarCohorte: async (cohorte) => {
        if (!usuario) return;
        const res = await apiUpdateUserCohort(usuario.id, cohorte);
        setUsuarios(res.users);
        setIntentos(res.attempts);
      },
      crearMaterial: async (payload) => {
        const res = await apiCreateStudyMaterial(payload);
        setMateriales(res.materials);
      },
      editarMaterial: async (id, cambios) => {
        const res = await apiUpdateStudyMaterial(id, cambios);
        setMateriales(res.materials);
      },
      eliminarMaterial: async (id) => {
        const res = await apiDeleteStudyMaterial(id);
        setMateriales(res.materials);
      },
      actualizarIntentos: setIntentos,
    }),
    [cargando, usuarios, materiales, intentos, usuario, iniciar],
  );

  return <SesionContexto.Provider value={valor}>{children}</SesionContexto.Provider>;
};
