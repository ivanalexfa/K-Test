import React, { useEffect, useId, useRef, useState } from 'react';
import {
  GraduationCap,
  BookOpenCheck,
  ArrowRight,
  Sparkles,
  ChevronDown,
  ChevronUp,
  CheckCircle2,
  AlertCircle,
  Lock,
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

export const AuthView: React.FC<AuthViewProps> = ({
  users,
  onSelectUser,
  onMicrosoftLogin,
}) => {
  const [roleTab, setRoleTab] = useState<UserRole>('student');
  const [selectedCohort, setSelectedCohort] = useState<string>(
    KEY_ADMISSION_COHORTS[0]
  );
  const [teacherPin, setTeacherPin] = useState<string>('');
  const [pinRequiredHighlight, setPinRequiredHighlight] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const [loadingMs, setLoadingMs] = useState<boolean>(false);

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

  const completeBackendMicrosoftHandshake = async (
    identity: MicrosoftIdentityPayload
  ) => {
    setError(null);
    setPinRequiredHighlight(false);
    setLoadingMs(true);
    try {
      await onMicrosoftLogin({
        name: identity.name,
        email: identity.email,
        microsoftOid: identity.microsoftOid,
        idToken: identity.idToken,
        accessToken: identity.accessToken,
        requestedRole: roleTab,
        teacherPin: roleTab === 'teacher' ? teacherPin : undefined,
        cohort:
          roleTab === 'student'
            ? selectedCohort
            : 'Cátedra Académica Key Institute',
      });
      setIsMsSimModalOpen(false);
    } catch (err: any) {
      if (err?.code === 'PIN_REQUIRED' || err?.code === 'INVALID_PIN') {
        setPinRequiredHighlight(true);
      }
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
    setPinRequiredHighlight(false);

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
              email: 'roberto.mendez@keyinstitute.com',
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
    <div className="min-h-dvh flex flex-col bg-[#F8FAFC] text-[#0A1128]">
      {/* Top Institutional Bar */}
      <header className="bg-[#0A1128] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <KTestLogo theme="dark" variant="full" />

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-semibold bg-white/10 text-slate-200 border border-white/15">
            <Sparkles className="w-3.5 h-3.5 text-[#00D2FF]" />
            Powering Engineers for Life
          </span>
        </div>
      </header>

      {/* Hero Section with Centered Minimalist Login Card */}
      <section className="relative bg-[#0A1128] text-white pt-10 pb-20 sm:pt-14 sm:pb-24 px-4 sm:px-6 overflow-hidden border-b border-slate-800">
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
          <p className="text-slate-300 text-sm sm:text-base max-w-2xl mx-auto leading-relaxed">
            Domina las áreas de Lectura Crítica, Redacción Académica y Razonamiento
            Matemático con simulacros reales, sprints cortos y acompañamiento docente.
          </p>
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
                setPinRequiredHighlight(false);
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
              <p className="text-xs text-slate-500 mt-1">
                {roleTab === 'student'
                  ? 'Accede con tu cuenta de Microsoft para guardar tu progreso.'
                  : 'Accede con tu cuenta institucional de Microsoft.'}
              </p>
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

            {/* Teacher Access PIN Box */}
            {roleTab === 'teacher' && (
              <div
                className={`p-4 rounded-xl border transition-all ${
                  pinRequiredHighlight
                    ? 'border-amber-500 bg-amber-50/70'
                    : 'border-slate-200 bg-slate-50/80'
                }`}
              >
                <label className="flex items-center justify-between text-xs font-bold text-[#0A1128] mb-1.5">
                  <span className="flex items-center gap-1.5">
                    <Lock className="w-3.5 h-3.5 text-[#0052FF]" />
                    PIN de Cátedra Docente
                  </span>
                  <span className="text-[10px] font-normal text-slate-500">
                    1.er registro
                  </span>
                </label>
                <input
                  type="password"
                  value={teacherPin}
                  onChange={(e) => setTeacherPin(e.target.value)}
                  placeholder="Ingresa tu PIN de cátedra"
                  className="w-full px-3.5 py-2 rounded-xl border border-slate-300 bg-white text-sm font-mono focus:outline-none focus:border-[#0052FF]"
                />
              </div>
            )}

            {/* Primary Microsoft Login Button */}
            <button
              type="button"
              disabled={loadingMs}
              onClick={handleClickMicrosoftLogin}
              className="w-full py-3.5 px-5 rounded-xl bg-[#0A1128] hover:bg-[#0052FF] text-white font-display font-bold text-sm sm:text-base shadow-lg flex items-center justify-center gap-3 transition-all cursor-pointer active:scale-[0.99] disabled:opacity-60"
            >
              <MicrosoftLogoSvg className="w-5 h-5 shrink-0" />
              <span>
                {loadingMs ? 'Conectando...' : 'Continuar con Microsoft'}
              </span>
              <ArrowRight className="w-4 h-4 text-[#00D2FF]" />
            </button>
          </div>
        </div>
      </section>

      {/* Welcome Landing Showcase Section: What Awaits Inside */}
      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 -mt-10 pb-14 relative z-20 space-y-10">
        {/* 3 Symmetrical Pillars of the Platform */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
          {/* Pillar 1: Full PAA Simulacro */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-md flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#0052FF]/10 border border-[#0052FF]/20 flex items-center justify-center mb-4">
                <SimulacroEngineIcon size={24} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0052FF]">
                Experiencia Oficial College Board
              </span>
              <h3 className="font-display text-lg font-extrabold text-[#0A1128] mt-1 mb-2">
                Simulacros Completos PAA
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Practica bajo las mismas condiciones del examen real: vista dividida
                con pasajes de líneas numeradas en Lectura y módulo de Matemáticas
                con formulario geométrico interactivo.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Lectura + Matemáticas</span>
              <span className="font-mono-num text-[#0A1128]">Escala 400–1600</span>
            </div>
          </div>

          {/* Pillar 2: Focused Sprints / Práctica Asíncrona */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-md flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] border border-[#10B981]/20 flex items-center justify-center mb-4">
                <AsyncTrainerIcon size={24} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-emerald-600">
                Entrenamiento Diario Ágil
              </span>
              <h3 className="font-display text-lg font-extrabold text-[#0A1128] mt-1 mb-2">
                Sprints Cortos por Materia
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                ¿Tienes pocos minutos? Elige entre múltiples Sprints especializados
                en vocabulario contextual, redacción indirecta, volúmenes 3D,
                triángulos notables o modelos algebraicos.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Sesiones de 3 a 6 min</span>
              <span className="font-mono-num text-[#0A1128]">Por dificultad</span>
            </div>
          </div>

          {/* Pillar 3: Teacher Diagnostic & Study Materials */}
          <div className="bg-white rounded-2xl p-6 border border-slate-200/90 shadow-md flex flex-col justify-between">
            <div>
              <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center mb-4">
                <TeacherDiagnosticIcon size={24} />
              </div>
              <span className="text-[11px] font-bold uppercase tracking-wider text-[#0052FF]">
                Diagnóstico y Acompañamiento Docente
              </span>
              <h3 className="font-display text-lg font-extrabold text-[#0A1128] mt-1 mb-2">
                Materiales y Solucionarios
              </h3>
              <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                Consulta guías teóricas, descarga presentaciones y ejercicios
                subidos por tus profesores, y revisa la justificación matemática
                paso a paso de cada reactivo finalizado.
              </p>
            </div>
            <div className="mt-5 pt-3 border-t border-slate-100 flex items-center justify-between text-xs font-semibold text-slate-500">
              <span>Guías + Archivos Adjuntos</span>
              <span className="font-mono-num text-[#0A1128]">KaTeX / PDF / Office</span>
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
