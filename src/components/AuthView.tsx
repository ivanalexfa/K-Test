import React, { useEffect, useId, useRef, useState } from 'react';
import {
  GraduationCap,
  BookOpenCheck,
  ArrowRight,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,

  X,
  Layers,
  Zap,
  BookOpen,
  Compass,
} from 'lucide-react';
import { UserRecord, UserRole } from '../types/exam';
import { instantiateUserClass } from '../models/UserClasses';
import { KEY_ADMISSION_COHORTS } from '../data/cohortsCatalog';
import { KTestLogo } from './brand/KTestLogo';
import {
  SimulacroEngineIcon,
  AsyncTrainerIcon,
  TeacherDiagnosticIcon,
} from './brand/KTestIcons';
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
  const [roleTab, setRoleTab] = useState<UserRole>('student');
  const [selectedCohort, setSelectedCohort] = useState<string>(
    KEY_ADMISSION_COHORTS[0]
  );


  const [error, setError] = useState<string | null>(null);
  const [loadingMs, setLoadingMs] = useState<boolean>(false);
  const [loadingGoogle, setLoadingGoogle] = useState<boolean>(false);

  // Fallback Simulator Modal (Google)
  const [isGoogleSimModalOpen, setIsGoogleSimModalOpen] = useState<boolean>(false);
  const googleDialogRef = useRef<HTMLDialogElement | null>(null);
  const googleDialogTitleId = useId();
  const realGoogleActive = isRealGoogleConfigured();

  // Collapsible Developer / Demo Accounts section
  const [demoPanelOpen, setDemoPanelOpen] = useState<boolean>(false);

  // Fallback Simulator Modal (only if VITE_MSAL_CLIENT_ID is empty)
  const [isMsSimModalOpen, setIsMsSimModalOpen] = useState<boolean>(false);
  const [simEmail, setSimEmail] = useState<string>('');
  const [simName, setSimName] = useState<string>('');

  const msDialogRef = useRef<HTMLDialogElement | null>(null);
  const msDialogTitleId = useId();

  const realMsalActive = isRealMsalConfigured();
  const showDemoSection = isDemoAccountsEnabled();

  const students = users.filter((u) => u.role === 'student');
  const teachers = users.filter((u) => u.role === 'teacher');

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


    if (roleTab === 'teacher') {
      setError(
        'Los docentes deben ingresar exclusivamente mediante su cuenta institucional Microsoft (@keyinstitute.edu.sv).'
      );
      setIsGoogleSimModalOpen(false);
      return;
    }

    setLoadingGoogle(true);
    try {
      await onGoogleLogin({
        name: identity.name,
        email: identity.email,
        googleId: identity.googleId,
        idToken: identity.idToken,
        accessToken: identity.accessToken,
        requestedRole: roleTab,

        cohort:
          roleTab === 'student'
            ? selectedCohort
            : 'Cátedra Académica Key Institute',
      });
      setIsGoogleSimModalOpen(false);
    } catch (err: any) {
      setError(
        err?.message || 'No se pudo completar el inicio de sesión con Google.'
      );
      setIsGoogleSimModalOpen(false);
    } finally {
      setLoadingGoogle(false);
    }
  };

  const handleClickGoogleLogin = async () => {
    setError(null);

    if (roleTab === 'teacher') {
      setError(
        'Los docentes deben ingresar exclusivamente mediante su cuenta institucional Microsoft (@keyinstitute.edu.sv).'
      );
      return;
    }

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
      const defaultAcc =
        roleTab === 'student'
          ? students[0] || {
              name: 'Sofía Martínez',
              email: 'sofia.martinez@gmail.com',
            }
          : teachers[0] || {
              name: 'Dr. Roberto Méndez',
              email: 'roberto.mendez@keyinstitute.edu.sv',
            };
      setSimName(defaultAcc.name);
      setSimEmail(defaultAcc.email);
      setIsGoogleSimModalOpen(true);
    }
  };

  const handleSimulatedGoogleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!simEmail.trim()) return;
    await completeBackendGoogleHandshake({
      name: simName.trim() || simEmail.split('@')[0],
      email: simEmail.trim().toLowerCase(),
      googleId: `google-sim-${simEmail.trim().toLowerCase()}`,
    });
  };

  const completeBackendMicrosoftHandshake = async (
    identity: MicrosoftIdentityPayload
  ) => {
    setError(null);


    if (roleTab === 'teacher' && !isInstitutionalTeacherEmail(identity.email)) {
      setError(
        `Acceso restringido: Los docentes solo pueden ingresar con su correo institucional (${INSTITUTIONAL_TEACHER_DOMAINS.map(
          (d) => `@${d}`
        ).join(' o ')}).`
      );
      setIsMsSimModalOpen(false);
      return;
    }

    setLoadingMs(true);
    try {
      await onMicrosoftLogin({
        name: identity.name,
        email: identity.email,
        microsoftOid: identity.microsoftOid,
        idToken: identity.idToken,
        accessToken: identity.accessToken,
        requestedRole: roleTab,

        cohort:
          roleTab === 'student'
            ? selectedCohort
            : 'Cátedra Académica Key Institute',
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
      const defaultAcc =
        roleTab === 'student'
          ? students[0] || {
              name: 'Sofía Martínez',
              email: 'sofia.martinez@keyinstitute.edu.sv',
            }
          : teachers[0] || {
              name: 'Dr. Roberto Méndez',
              email: 'roberto.mendez@keyinstitute.edu.sv',
            };
      setSimName(defaultAcc.name);
      setSimEmail(defaultAcc.email);
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

  return (
    <div className="min-h-dvh flex flex-col bg-[#0A1128] text-white">
      {/* Top Institutional Bar */}
      <header className="bg-[#0A1128] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <KTestLogo theme="dark" variant="full" />

          
        </div>
      </header>

      {/* Hero Section with Centered Minimalist Login Card */}
      <section className="relative bg-[#0A1128] text-white pt-10 pb-20 sm:pt-14 sm:pb-24 px-4 sm:px-6 overflow-hidden">
        {/* Ambient Key Institute Glows */}
        <div className="absolute top-0 left-1/2 -translate-x-1/2 w-[650px] h-[300px] bg-[#0052FF]/25 blur-[120px] pointer-events-none" />
        <div className="absolute bottom-0 right-10 w-80 h-80 bg-[#00D2FF]/10 blur-[100px] pointer-events-none" />

        <div className="relative z-10 max-w-3xl mx-auto text-center mb-8 sm:mb-10">
          <div className="inline-flex items-center gap-2 px-3.5 py-1 rounded-full bg-[#0052FF]/25 border border-[#00D2FF]/35 text-[#00D2FF] text-xs font-bold uppercase tracking-wider mb-4">
            Plataforma de Preparación y Diagnóstico PAA
          </div>
          <h1 className="font-display text-3xl sm:text-5xl font-extrabold tracking-tight leading-tight mb-3">
            Entrena tu mente para la ingeniería del futuro
          </h1>
          
        </div>

        {/* Centered Login Card */}
        <div className="relative z-10 max-w-md mx-auto bg-white text-[#0A1128] rounded-2xl shadow-2xl border border-white/15 overflow-hidden">
          {/* Role Switcher Tabs */}
          <div className="p-2 bg-slate-100 border-b border-slate-200 grid grid-cols-2 gap-1.5">
            <button
              type="button"
              onClick={() => {
                setRoleTab('student');
                setError(null);
            
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                roleTab === 'student'
                  ? 'bg-[#0052FF] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0A1128]'
              }`}
            >
              <GraduationCap className="w-4 h-4" />
              <span>Soy Estudiante</span>
            </button>

            <button
              type="button"
              onClick={() => {
                setRoleTab('teacher');
                setError(null);
              }}
              className={`flex items-center justify-center gap-2 py-2.5 px-3 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                roleTab === 'teacher'
                  ? 'bg-[#0A1128] text-white shadow-xs'
                  : 'text-slate-600 hover:text-[#0A1128]'
              }`}
            >
              <BookOpenCheck className="w-4 h-4 text-[#00D2FF]" />
              <span>Soy Docente</span>
            </button>
          </div>

          <div className="p-6 sm:p-7 space-y-5">
            <div className="text-center">
              <h2 className="font-display font-extrabold text-lg sm:text-xl text-[#0A1128]">
                {roleTab === 'student'
                  ? 'Ingresa al Portal de Estudiantes'
                  : 'Ingresa al Panel de Cátedra'}
              </h2>
              
            </div>

            {error && (
              <div className="p-3.5 rounded-xl bg-red-50 border border-red-200 flex items-start gap-2.5 text-xs text-red-800">
                <AlertCircle className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                <div className="flex-1 font-medium">{error}</div>
              </div>
            )}

            {/* Student Target Cohort Selector */}
            {roleTab === 'student' && (
              <div>
                <label className="block text-xs font-bold text-slate-700 mb-1.5">
                  Carrera / Cohorte de Admisión a la que aspiras
                </label>
                <select
                  value={selectedCohort}
                  onChange={(e) => setSelectedCohort(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 bg-slate-50/70 text-xs sm:text-sm font-medium text-[#0A1128] focus:outline-none focus:border-[#0052FF]"
                >
                  {KEY_ADMISSION_COHORTS.map((c) => (
                    <option key={c} value={c}>
                      {c}
                    </option>
                  ))}
                </select>
              </div>
            )}

            {/* Teacher Institutional Notice */}
            {roleTab === 'teacher' && (
              <div className="flex items-center justify-center gap-2 py-2 px-3 rounded-xl bg-slate-100 text-slate-600 text-xs text-center border border-slate-200/80">
                <span className="w-1.5 h-1.5 rounded-full bg-[#0052FF] shrink-0" />
                <span>Acceso exclusivo con correo institucional (<strong>@keyinstitute.edu.sv</strong>)</span>
              </div>
            )}

            {/* Login Buttons: Google is student-only, Microsoft is institutional & for both */}
            <div className="space-y-3 pt-1">
              {roleTab === 'student' && (
                <>
                  <button
                    type="button"
                    disabled={loadingGoogle || loadingMs}
                    onClick={handleClickGoogleLogin}
                    className="w-full py-3.5 px-5 rounded-xl bg-white hover:bg-slate-50 text-[#0A1128] border-2 border-slate-200 hover:border-[#0052FF]/40 font-display font-bold text-sm sm:text-base shadow-xs grid grid-cols-[20px_1fr_20px] items-center gap-3 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60"
                  >
                    <GoogleLogoSvg className="w-5 h-5 shrink-0" />
                    <span className="text-center">
                      {loadingGoogle
                        ? 'Conectando con Google...'
                        : 'Continuar con Google'}
                    </span>
                    <ArrowRight className="w-4 h-4 text-[#0052FF] justify-self-end" />
                  </button>

                  <div className="flex items-center gap-3.5 py-1" role="separator">
                    <div className="h-px flex-1 bg-slate-200" />
                    <span className="text-[11px] font-bold text-slate-400 uppercase tracking-widest select-none leading-none">
                      o bien
                    </span>
                    <div className="h-px flex-1 bg-slate-200" />
                  </div>
                </>
              )}

              <button
                type="button"
                disabled={loadingGoogle || loadingMs}
                onClick={handleClickMicrosoftLogin}
                className="w-full py-3.5 px-5 rounded-xl bg-[#0A1128] hover:bg-[#0052FF] text-white border-2 border-[#0A1128] hover:border-[#0052FF] font-display font-bold text-sm sm:text-base shadow-lg grid grid-cols-[20px_1fr_20px] items-center gap-3 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60"
              >
                <MicrosoftLogoSvg className="w-5 h-5 shrink-0" />
                <span className="text-center">
                  {loadingMs
                    ? 'Conectando con Microsoft...'
                    : 'Continuar con Microsoft'}
                </span>
                <ArrowRight className="w-4 h-4 text-[#00D2FF] justify-self-end" />
              </button>
            </div>
          </div>
        </div>
      </section>

      {/* Welcome Landing Showcase Section: What Awaits Inside */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 -mt-10 pb-14 relative z-20 space-y-10">
        {/* 3 Symmetrical Pillars of the Platform (Compact: Icon + Title) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Pillar 1: Full PAA Simulacro */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#0052FF]/10 border border-[#0052FF]/20 flex items-center justify-center shrink-0">
              <SimulacroEngineIcon size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0052FF] block">
                Experiencia Oficial
              </span>
              <h3 className="font-display text-sm sm:text-base font-extrabold text-[#0A1128]">
                Simulacros Completos PAA
              </h3>
            </div>
          </div>

          {/* Pillar 2: Focused Sprints / Práctica Asíncrona */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#ECFDF5] border border-[#10B981]/20 flex items-center justify-center shrink-0">
              <AsyncTrainerIcon size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 block">
                Entrenamiento Diario Ágil
              </span>
              <h3 className="font-display text-sm sm:text-base font-extrabold text-[#0A1128]">
                Sprints Cortos por Materia
              </h3>
            </div>
          </div>

          {/* Pillar 3: Teacher Diagnostic & Study Materials */}
          <div className="bg-white rounded-2xl p-5 border border-slate-200/90 shadow-sm flex items-center gap-3.5">
            <div className="w-10 h-10 rounded-xl bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center shrink-0">
              <TeacherDiagnosticIcon size={22} />
            </div>
            <div>
              <span className="text-[10px] font-bold uppercase tracking-wider text-[#0052FF] block">
                Diagnóstico y Acompañamiento
              </span>
              <h3 className="font-display text-sm sm:text-base font-extrabold text-[#0A1128]">
                Materiales y Solucionarios
              </h3>
            </div>
          </div>
        </div>

        {/* Discreet Collapsible Demo Quick-Access (Only visible in Dev when VITE_ENABLE_DEMO_ACCOUNTS=true) */}
        {showDemoSection && (
          <div className="max-w-2xl mx-auto bg-white rounded-xl border border-slate-200/80 overflow-hidden shadow-2xs">
            <button
              type="button"
              onClick={() => setDemoPanelOpen((v) => !v)}
              className="w-full px-4 py-2.5 bg-slate-50 hover:bg-slate-100/80 flex items-center justify-between text-xs font-semibold text-slate-500 transition-colors cursor-pointer"
            >
              <span>
                Acceso rápido de prueba ({roleTab === 'student' ? 'Estudiantes' : 'Docentes'})
              </span>
              {demoPanelOpen ? (
                <ChevronUp className="w-4 h-4" />
              ) : (
                <ChevronDown className="w-4 h-4" />
              )}
            </button>

            {demoPanelOpen && (
              <div className="p-4 grid grid-cols-1 sm:grid-cols-2 gap-2 border-t border-slate-200 max-h-60 overflow-y-auto custom-scrollbar">
                {(roleTab === 'student' ? students : teachers).map((u) => {
                  const inst = instantiateUserClass(u);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => onSelectUser(u)}
                      className="text-left p-2.5 rounded-lg border border-slate-200 hover:border-[#0052FF] bg-white hover:bg-slate-50 flex items-center justify-between gap-2 transition-all cursor-pointer"
                    >
                      <div className="flex items-center gap-2.5 min-w-0">
                        <div className="w-7 h-7 rounded-md bg-[#0A1128] text-[#00D2FF] font-display font-bold text-[11px] flex items-center justify-center shrink-0">
                          {inst.getInitials()}
                        </div>
                        <div className="min-w-0">
                          <div className="font-bold text-xs text-[#0A1128] truncate">
                            {u.name}
                          </div>
                          <div className="text-[10px] text-slate-500 truncate">
                            {u.cohort}
                          </div>
                        </div>
                      </div>
                      <span className="text-[11px] font-bold text-[#0052FF] shrink-0">
                        Entrar
                      </span>
                    </button>
                  );
                })}
              </div>
            )}
          </div>
        )}
      </main>

      {/* Fallback Microsoft SSO Simulator Modal (only if VITE_MSAL_CLIENT_ID is empty) */}
      <dialog
        ref={msDialogRef}
        {...({ closedby: 'any' } as any)}
        aria-labelledby={msDialogTitleId}
        onClose={() => setIsMsSimModalOpen(false)}
        className="paa-dialog w-[94vw] max-w-md rounded-2xl shadow-2xl overflow-hidden"
      >
        <div className="bg-white text-[#0A1128] rounded-2xl border border-slate-200 overflow-hidden">
          <div className="px-6 py-4 bg-slate-50 border-b border-slate-200 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MicrosoftLogoSvg className="w-5 h-5" />
              <span
                id={msDialogTitleId}
                className="font-semibold text-sm text-slate-800"
              >
                Iniciar sesión con Microsoft
              </span>
            </div>
            <button
              type="button"
              onClick={() => msDialogRef.current?.close()}
              aria-label="Cerrar ventana de Microsoft"
              className="p-1 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
            >
              <X className="w-4 h-4" />
            </button>
          </div>

          <form onSubmit={handleSimulatedMsSubmit} className="p-6 space-y-4">
            <div className="space-y-3">
              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Correo Institucional Microsoft
                </label>
                <input
                  type="email"
                  required
                  value={simEmail}
                  onChange={(e) => setSimEmail(e.target.value)}
                  placeholder="nombre.apellido@keyinstitute.edu.sv"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0052FF]"
                />
              </div>

              <div>
                <label className="block text-xs font-semibold text-slate-700 mb-1">
                  Nombre Completo
                </label>
                <input
                  type="text"
                  required
                  value={simName}
                  onChange={(e) => setSimName(e.target.value)}
                  placeholder="Nombre y Apellido"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0052FF]"
                />
              </div>
            </div>

            <div className="pt-2 flex items-center justify-end gap-2.5">
              <button
                type="button"
                onClick={() => msDialogRef.current?.close()}
                className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="submit"
                disabled={loadingMs}
                className="inline-flex items-center gap-2 px-5 py-2 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0052FF]/25 cursor-pointer"
              >
                <CheckCircle2 className="w-4 h-4" />
                <span>Continuar</span>
              </button>
            </div>
          </form>
        </div>
      </dialog>
    </div>
  );
};
