import React, { useEffect, useId, useRef, useState } from 'react';
import { Link } from 'react-router';
import { ArrowLeft, ChevronDown, ChevronUp, AlertCircle, X } from 'lucide-react';
import { UserRecord, UserRole } from '../types/exam';
import { LogoKey } from './brand/LogoKey';
import { rutas } from '../rutas';
import {
  isDemoAccountsEnabled,
  isRealMsalConfigured,
  MicrosoftIdentityPayload,
  triggerRealMicrosoftPopup,
} from '../config/msalConfig';
import {
  isRealGoogleConfigured,
  GoogleIdentityPayload,
  triggerRealGooglePopup,
} from '../config/googleConfig';

interface AuthViewProps {
  users: UserRecord[];
  onSelectUser: (user: UserRecord) => void;
  onMicrosoftLogin: (payload: {
    name: string;
    email: string;
    microsoftOid?: string;
    idToken?: string;
    accessToken?: string;
    requestedRole: UserRole;
    teacherPin?: string;
    cohort?: string;
  }) => Promise<void>;
  onGoogleLogin: (payload: {
    name: string;
    email: string;
    googleId?: string;
    idToken?: string;
    accessToken?: string;
    requestedRole: UserRole;
    teacherPin?: string;
    cohort?: string;
  }) => Promise<void>;
}

const MicrosoftLogoSvg: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 21 21" className={className} aria-hidden="true">
    <rect x="1" y="1" width="9" height="9" fill="#F25022" />
    <rect x="11" y="1" width="9" height="9" fill="#7FBA00" />
    <rect x="1" y="11" width="9" height="9" fill="#00A4EF" />
    <rect x="11" y="11" width="9" height="9" fill="#FFB900" />
  </svg>
);

const GoogleLogoSvg: React.FC<{ className?: string }> = ({
  className = 'w-5 h-5',
}) => (
  <svg viewBox="0 0 24 24" className={className} aria-hidden="true">
    <path
      fill="#4285F4"
      d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.8-2.4 3.65v3h3.88c2.27-2.09 3.66-5.17 3.66-9.09z"
    />
    <path
      fill="#34A853"
      d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.26v3.09C3.25 21.37 7.32 24 12 24z"
    />
    <path
      fill="#FBBC05"
      d="M5.28 14.32A7.18 7.18 0 0 1 4.9 12c0-.81.14-1.59.38-2.32V6.59H1.26A11.96 11.96 0 0 0 0 12c0 1.92.45 3.74 1.26 5.41l4.02-3.09z"
    />
    <path
      fill="#EA4335"
      d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.32 0 3.25 2.63 1.26 6.59l4.02 3.09c.95-2.83 3.6-4.93 6.72-4.93z"
    />
  </svg>
);

const INSTITUTIONAL_TEACHER_DOMAINS = (
  ((import.meta as any).env?.VITE_TEACHER_EMAIL_DOMAINS as string) ||
  'keyinstitute.edu.sv'
)
  .split(',')
  .map((d) => d.trim().toLowerCase().replace(/^@/, ''))
  .filter(Boolean);

function isInstitutionalTeacherEmail(email: string): boolean {
  const domain = email.trim().toLowerCase().split('@')[1] || '';
  return INSTITUTIONAL_TEACHER_DOMAINS.includes(domain);
}

export const AuthView: React.FC<AuthViewProps> = ({
  users,
  onSelectUser,
  onMicrosoftLogin,
  onGoogleLogin,
}) => {


  const [error, setError] = useState<string | null>(null);
  const [loadingMs, setLoadingMs] = useState<boolean>(false);
  const [loadingGoogle, setLoadingGoogle] = useState<boolean>(false);

  const realGoogleActive = isRealGoogleConfigured();

  // Collapsible Developer / Demo Accounts section
  const [demoPanelOpen, setDemoPanelOpen] = useState<boolean>(false);

  // Fallback Simulator Modal (only if VITE_MSAL_CLIENT_ID is empty)
  const [isMsSimModalOpen, setIsMsSimModalOpen] = useState<boolean>(false);
  const [simEmail, setSimEmail] = useState<string>('');
  const [simName, setSimName] = useState<string>('');

  const msDialogRef = useRef<HTMLDialogElement | null>(null);
  const msDialogTitleId = useId();
  const simEmailId = useId();
  const simNameId = useId();

  const realMsalActive = isRealMsalConfigured();
  const showDemoSection = isDemoAccountsEnabled();

  useEffect(() => {
    const dialog = msDialogRef.current;
    if (!dialog) return;
    if (isMsSimModalOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isMsSimModalOpen && dialog.open) {
      dialog.close();
    }
  }, [isMsSimModalOpen]);

  // Mandatory light-dismiss fallback for browsers without native <dialog closedby="any">
  useEffect(() => {
    const dialog = msDialogRef.current;
    if (!dialog) return;

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      };

      dialog.addEventListener('click', handleBackdropClick);
      return () => dialog.removeEventListener('click', handleBackdropClick);
    }
  }, []);

  const completeBackendGoogleHandshake = async (
    identity: GoogleIdentityPayload
  ) => {
    setError(null);
    setLoadingGoogle(true);
    try {
      await onGoogleLogin({
        name: identity.name,
        email: identity.email,
        googleId: identity.googleId,
        idToken: identity.idToken,
        accessToken: identity.accessToken,
        requestedRole: 'student',
        cohort: '',
      });
    } catch (err: any) {
      setError(
        err?.message || 'No se pudo completar el inicio de sesión con Google.'
      );
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleClickGoogleLogin = async () => {
    setError(null);

    if (realGoogleActive) {
      try {
        setLoadingGoogle(true);
        const identity = await triggerRealGooglePopup();
        await completeBackendGoogleHandshake(identity);
      } catch (err: any) {
        setError(
          err?.message || 'El inicio de sesión con Google fue cancelado o falló.'
        );
      } finally {
        setLoadingGoogle(false);
      }
    } else {
      await completeBackendGoogleHandshake({
        name: 'Aspirante Estudiante',
        email: 'estudiante.demo@gmail.com',
        googleId: 'google-sim-demo',
      });
    }
  };

  const completeBackendMicrosoftHandshake = async (
    identity: MicrosoftIdentityPayload
  ) => {
    setError(null);
    setLoadingMs(true);
    try {
      const isTeacher = isInstitutionalTeacherEmail(identity.email);
      await onMicrosoftLogin({
        name: identity.name,
        email: identity.email,
        microsoftOid: identity.microsoftOid,
        idToken: identity.idToken,
        accessToken: identity.accessToken,
        requestedRole: isTeacher ? 'teacher' : 'student',
        cohort: isTeacher
          ? 'Cátedra Key Institute · Microsoft 365'
          : '',
      });
      setIsMsSimModalOpen(false);
    } catch (err: any) {
      setError(
        err?.message || 'No se pudo completar el inicio de sesión con Microsoft.'
      );
      setIsMsSimModalOpen(false);
    } finally {
      setLoadingMs(false);
    }
  };

  const handleClickMicrosoftLogin = async () => {
    setError(null);

    if (realMsalActive) {
      try {
        setLoadingMs(true);
        const identity = await triggerRealMicrosoftPopup();
        await completeBackendMicrosoftHandshake(identity);
      } catch (err: any) {
        setError(
          err?.message || 'El inicio de sesión con Microsoft fue cancelado o falló.'
        );
      } finally {
        setLoadingMs(false);
      }
    } else {
      setSimName('Sofía Martínez');
      setSimEmail('sofia.martinez@outlook.com');
      setIsMsSimModalOpen(true);
    }
  };

  const handleSimulatedMsSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simEmail.trim()) return;
    await completeBackendMicrosoftHandshake({
      name: simName.trim() || simEmail.split('@')[0],
      email: simEmail.trim().toLowerCase(),
      microsoftOid: `ms-sim-${simEmail.trim().toLowerCase()}`,
    });
  };

  const ocupado = loadingGoogle || loadingMs;
  const claseBotonProveedor =
    'w-full h-14 rounded-full px-5 flex items-center justify-center gap-3 text-base font-semibold whitespace-nowrap transition-[background-color,border-color,transform] duration-200 ease-key motion-safe:active:scale-[0.98] focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-key-azul disabled:opacity-60 disabled:cursor-not-allowed cursor-pointer';

  return (
    <div className="min-h-dvh flex flex-col bg-key-negro">
      <main className="flex-1 flex items-center justify-center px-5 py-12 sm:py-16">
        <div className="w-full max-w-[460px]">
          <div className="bg-key-blanco text-key-tinta rounded-[4px] px-5 py-8 min-[380px]:px-7 min-[380px]:py-9 sm:px-10 sm:py-11">
            <Link
              to={rutas.inicio}
              aria-label="K-Test, inicio"
              className="inline-flex rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-key-azul max-[379px]:[&_img]:h-7"
            >
              <LogoKey theme="light" variant="mark-only" />
            </Link>

            <h1 className="mt-9 text-[30px] leading-9 sm:text-[34px] sm:leading-10 font-semibold tracking-[-0.01em] text-balance">
              Te damos la bienvenida
            </h1>
            <p className="mt-3 text-key-texto text-base leading-[26px]">
              Entra con tu cuenta de Google o de Microsoft. Si es tu primera vez, tu cuenta se crea
              al entrar.
            </p>

            {error && (
              <div
                role="alert"
                className="mt-6 flex items-start gap-2.5 rounded-[4px] border-[0.8px] border-estado-error bg-estado-error-fondo p-3.5 text-sm text-estado-error"
              >
                <AlertCircle aria-hidden="true" className="mt-0.5 h-4 w-4 shrink-0" />
                <p className="flex-1 font-medium">{error}</p>
              </div>
            )}

            <div className="mt-8 space-y-3" aria-busy={ocupado}>
              <button
                type="button"
                disabled={ocupado}
                onClick={handleClickGoogleLogin}
                className={`${claseBotonProveedor} bg-key-blanco text-key-tinta border-[0.8px] border-key-negro hover:bg-key-gris-claro`}
              >
                <GoogleLogoSvg className="w-5 h-5 shrink-0" />
                <span>{loadingGoogle ? 'Conectando con Google…' : 'Continuar con Google'}</span>
              </button>

              <button
                type="button"
                disabled={ocupado}
                onClick={handleClickMicrosoftLogin}
                className={`${claseBotonProveedor} bg-key-blanco text-key-tinta border-[0.8px] border-key-negro hover:bg-key-gris-claro`}
              >
                <MicrosoftLogoSvg className="w-5 h-5 shrink-0" />
                <span>{loadingMs ? 'Conectando con Microsoft…' : 'Continuar con Microsoft'}</span>
              </button>
            </div>

            <p className="mt-7 border-t-[0.8px] border-key-gris pt-5 text-sm leading-6 text-key-texto-suave">
              ¿Eres docente? Entra con tu cuenta de Microsoft de Key (
              <span className="whitespace-nowrap">@{INSTITUTIONAL_TEACHER_DOMAINS[0]}</span>).
            </p>
          </div>

          <Link
            to={rutas.inicio}
            className="mt-6 inline-flex items-center gap-1.5 text-sm font-medium text-key-blanco/85 hover:text-key-blanco rounded-sm focus-visible:outline-2 focus-visible:outline-offset-4 focus-visible:outline-key-blanco"
          >
            <ArrowLeft aria-hidden="true" className="h-4 w-4" />
            Volver al inicio
          </Link>

          {/* Acceso rápido con cuentas demo: solo con VITE_ENABLE_DEMO_ACCOUNTS=true (desarrollo). */}
          {showDemoSection && (
            <div className="mt-8 rounded-[4px] border-[0.8px] border-key-blanco/30 text-key-blanco">
              <button
                type="button"
                aria-expanded={demoPanelOpen}
                onClick={() => setDemoPanelOpen((v) => !v)}
                className="w-full px-4 py-3 flex items-center justify-between text-sm font-medium cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-blanco"
              >
                <span>Cuentas de prueba (solo desarrollo)</span>
                {demoPanelOpen ? (
                  <ChevronUp aria-hidden="true" className="w-4 h-4" />
                ) : (
                  <ChevronDown aria-hidden="true" className="w-4 h-4" />
                )}
              </button>

              {demoPanelOpen && (
                <ul className="max-h-64 overflow-y-auto border-t-[0.8px] border-key-blanco/30">
                  {users.map((u) => (
                    <li key={u.id}>
                      <button
                        type="button"
                        onClick={() => onSelectUser(u)}
                        className="w-full px-4 py-2.5 text-left flex items-center justify-between gap-3 hover:bg-key-blanco/10 cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-blanco"
                      >
                        <span className="min-w-0">
                          <span className="block truncate text-sm font-semibold">{u.name}</span>
                          <span className="block truncate text-xs text-key-blanco/70">
                            {u.role === 'teacher' ? 'Docente' : 'Estudiante'} · {u.cohort}
                          </span>
                        </span>
                        <span className="text-xs font-semibold shrink-0">Entrar</span>
                      </button>
                    </li>
                  ))}
                </ul>
              )}
            </div>
          )}
        </div>
      </main>

      {/* Fallback Microsoft SSO Simulator Modal (only if VITE_MSAL_CLIENT_ID is empty) */}
      <dialog
        ref={msDialogRef}
        {...({ closedby: 'any' } as any)}
        aria-labelledby={msDialogTitleId}
        onClose={() => setIsMsSimModalOpen(false)}
        className="paa-dialog w-[94vw] max-w-md rounded-[4px] overflow-hidden"
      >
        <div className="bg-key-blanco text-key-tinta">
          <div className="px-6 py-4 border-b-[0.8px] border-key-gris flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MicrosoftLogoSvg className="w-5 h-5" />
              <span
                id={msDialogTitleId}
                className="font-semibold text-base"
              >
                Iniciar sesión con Microsoft
              </span>
            </div>
            <button
              type="button"
              onClick={() => msDialogRef.current?.close()}
              aria-label="Cerrar ventana de Microsoft"
              className="p-1.5 rounded-full text-key-texto-suave hover:text-key-tinta cursor-pointer focus-visible:outline-2 focus-visible:outline-key-azul"
            >
              <X aria-hidden="true" className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSimulatedMsSubmit} className="p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <label htmlFor={simEmailId} className="block text-sm font-medium text-key-tinta mb-1.5">
                  Correo Microsoft (Personal o Institucional)
                </label>
                <input
                  id={simEmailId}
                  type="email"
                  required
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  placeholder="usuario@keyinstitute.edu.sv o usuario@outlook.com"
                  className="w-full h-10 px-3 rounded-none border-[0.8px] border-key-negro text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-key-azul"
                />
              </div>

              <div>
                <label htmlFor={simNameId} className="block text-sm font-medium text-key-tinta mb-1.5">
                  Nombre Completo
                </label>
                <input
                  id={simNameId}
                  type="text"
                  required
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  placeholder="Nombre y Apellido"
                  className="w-full h-10 px-3 rounded-none border-[0.8px] border-key-negro text-base focus-visible:outline-2 focus-visible:outline-offset-1 focus-visible:outline-key-azul"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => msDialogRef.current?.close()}
                className="h-11 px-5 rounded-full border-[0.8px] border-key-negro text-sm font-semibold cursor-pointer hover:bg-key-gris-claro focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loadingMs}
                className="h-11 px-6 rounded-full bg-key-azul hover:bg-key-azul-hover text-key-blanco text-sm font-semibold cursor-pointer disabled:opacity-60 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
              >
                Entrar
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};
