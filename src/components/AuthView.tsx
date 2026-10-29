import React, { useState } from 'react';
import {
  GraduationCap,
  BookOpenCheck,
  Database,
  ArrowRight,
  UserPlus,
  Sparkles,
  ShieldCheck,
  CheckCircle2,
} from 'lucide-react';
import { UserRecord, UserRole } from '../types/exam';
import { instantiateUserClass } from '../models/UserClasses';

interface AuthViewProps {
  users: UserRecord[];
  onSelectUser: (user: UserRecord) => void;
  onRegisterUser: (payload: {
    name: string;
    email: string;
    password?: string;
    role: UserRole;
    cohort: string;
  }) => Promise<void>;
}

export const AuthView: React.FC<AuthViewProps> = ({
  users,
  onSelectUser,
  onRegisterUser,
}) => {
  const [roleTab, setRoleTab] = useState<UserRole>('student');
  const [showRegisterForm, setShowRegisterForm] = useState(false);

  // New user form state
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [role, setRole] = useState<UserRole>('student');
  const [cohort, setCohort] = useState('Cohorte Admisión Ingeniería 2027 · Grupo A');
  const [error, setError] = useState<string | null>(null);
  const [submitting, setSubmitting] = useState(false);

  const students = users.filter((u) => u.role === 'student');
  const teachers = users.filter((u) => u.role === 'teacher');
  const displayedUsers = roleTab === 'student' ? students : teachers;

  const handleCreateAccount = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);
    if (!name.trim() || !email.trim()) {
      setError('Por favor completa tu nombre y correo institucional.');
      return;
    }
    try {
      setSubmitting(true);
      await onRegisterUser({
        name,
        email,
        role,
        cohort,
      });
      setName('');
      setEmail('');
      setShowRegisterForm(false);
    } catch (err: any) {
      setError(err?.message || 'No se pudo registrar el usuario');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#F8FAFC] text-[#0A1128]">
      {/* Top Institutional Navbar */}
      <header className="bg-[#0A1128] text-white border-b border-white/10">
        <div className="max-w-6xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 rounded-xl bg-[#0052FF] flex items-center justify-center font-display font-extrabold text-base text-white shadow-md shadow-[#0052FF]/30">
              K
            </div>
            <div>
              <div className="font-display font-bold text-sm tracking-wider uppercase">
                KEY INSTITUTE
              </div>
              <div className="text-[11px] text-[#00D2FF] tracking-wide">
                Plataforma Académica PAA · Estudiantes y Docentes
              </div>
            </div>
          </div>

          <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
            <Database className="w-3.5 h-3.5 text-emerald-400" />
            SQLite Conectado ({users.length} usuarios)
          </span>
        </div>
      </header>

      <main className="flex-1 max-w-6xl w-full mx-auto px-4 sm:px-6 py-8 sm:py-10 grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
        {/* Left Column: Platform Architecture & Role Overview */}
        <div className="lg:col-span-5 space-y-6">
          <div className="rounded-2xl bg-[#0A1128] text-white p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
            <div className="absolute -right-14 -top-14 w-56 h-56 rounded-full bg-[#0052FF]/25 blur-3xl pointer-events-none" />
            <div className="relative z-10">
              <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0052FF]/25 border border-[#00D2FF]/30 text-[#00D2FF] text-xs font-semibold uppercase tracking-wider mb-4">
                <Sparkles className="w-3.5 h-3.5" />
                Powering Engineers for Life
              </div>
              <h1 className="font-display text-2xl sm:text-3xl font-extrabold leading-tight mb-3">
                Ecosistema de Preparación y Evaluación PAA
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm leading-relaxed mb-6">
                Selecciona un perfil de <strong>Estudiante</strong> o{' '}
                <strong>Docente</strong> para acceder a la plataforma conectada a la
                base de datos local SQLite (`data/paa_platform.sqlite`).
              </p>

              <div className="space-y-3 pt-4 border-t border-white/10 text-xs sm:text-sm">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#0052FF]/25 text-[#00D2FF] flex items-center justify-center shrink-0 mt-0.5">
                    <GraduationCap className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Clase Estudiante (`StudentUser`)</div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Acceso a Materiales de Estudio, Simulacros Completos (Lectura + Matemáticas), Sprints cortos por área e historial propio de resultados.
                    </p>
                  </div>
                </div>

                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-lg bg-[#00D2FF]/20 text-[#00D2FF] flex items-center justify-center shrink-0 mt-0.5">
                    <BookOpenCheck className="w-4 h-4" />
                  </div>
                  <div>
                    <div className="font-bold text-white">Clase Docente (`TeacherUser`)</div>
                    <p className="text-slate-300 text-xs leading-relaxed">
                      Administración de Materiales de Estudio en la base de datos y matriz analítica cruzada de Estudiantes × Resultados (Simulacros y Sprints).
                    </p>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs text-xs text-slate-600 space-y-2">
            <div className="flex items-center gap-2 font-bold text-[#0A1128] text-sm">
              <ShieldCheck className="w-4 h-4 text-[#0052FF]" />
              Persistencia Real en Base de Datos
            </div>
            <p className="leading-relaxed">
              Cada Simulacro o Sprint completado por un alumno se guarda automáticamente en la tabla <code>test_attempts</code> y se cruza en tiempo real con el panel del docente.
            </p>
          </div>
        </div>

        {/* Right Column: Role Selector & Account Cards */}
        <div className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
          {/* Role Switcher Tabs */}
          <div className="p-4 sm:p-6 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
            <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-200/80 border border-slate-300/70 w-full sm:w-auto">
              <button
                type="button"
                onClick={() => {
                  setRoleTab('student');
                  setShowRegisterForm(false);
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  roleTab === 'student'
                    ? 'bg-[#0052FF] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0A1128]'
                }`}
              >
                <GraduationCap className="w-4 h-4" />
                <span>Estudiantes ({students.length})</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setRoleTab('teacher');
                  setShowRegisterForm(false);
                }}
                className={`flex items-center justify-center gap-2 px-4 py-2 rounded-lg text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                  roleTab === 'teacher'
                    ? 'bg-[#0A1128] text-white shadow-xs'
                    : 'text-slate-600 hover:text-[#0A1128]'
                }`}
              >
                <BookOpenCheck className="w-4 h-4 text-[#00D2FF]" />
                <span>Docentes ({teachers.length})</span>
              </button>
            </div>

            <button
              type="button"
              onClick={() => {
                setRole(roleTab);
                setCohort(
                  roleTab === 'teacher'
                    ? 'Departamento de Ciencias e Ingeniería'
                    : 'Cohorte Admisión Ingeniería 2027 · Grupo A'
                );
                setShowRegisterForm((v) => !v);
              }}
              className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-[#0A1128] transition-colors cursor-pointer"
            >
              <UserPlus className="w-3.5 h-3.5 text-[#0052FF]" />
              <span>{showRegisterForm ? 'Ver cuentas existentes' : 'Crear nuevo usuario'}</span>
            </button>
          </div>

          {showRegisterForm ? (
            <form onSubmit={handleCreateAccount} className="p-6 space-y-4">
              <div>
                <h2 className="font-display font-bold text-lg text-[#0A1128]">
                  Registrar nuevo usuario en SQLite
                </h2>
                <p className="text-xs text-slate-500">
                  El usuario quedará almacenado permanentemente en <code>paa_platform.sqlite</code>.
                </p>
              </div>

              {error && (
                <div className="p-3 rounded-xl bg-red-50 border border-red-200 text-xs text-red-700 font-medium">
                  {error}
                </div>
              )}

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Clase de Usuario
                  </label>
                  <select
                    value={role}
                    onChange={(e) => {
                      const nextRole = e.target.value as UserRole;
                      setRole(nextRole);
                      setCohort(
                        nextRole === 'teacher'
                          ? 'Departamento de Matemáticas y Física'
                          : 'Cohorte Admisión Ingeniería 2027 · Grupo A'
                      );
                    }}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-[#0052FF]"
                  >
                    <option value="student">Clase Estudiante (StudentUser)</option>
                    <option value="teacher">Clase Docente (TeacherUser)</option>
                  </select>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Nombre Completo
                  </label>
                  <input
                    type="text"
                    required
                    value={name}
                    onChange={(e) => setName(e.target.value)}
                    placeholder="Ej. Andrea Castellanos"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0052FF]"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Correo Institucional
                  </label>
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="usuario@keyinstitute.edu.sv"
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0052FF]"
                  />
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Cohorte / Departamento
                  </label>
                  <input
                    type="text"
                    required
                    value={cohort}
                    onChange={(e) => setCohort(e.target.value)}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0052FF]"
                  />
                </div>
              </div>

              <div className="pt-2 flex items-center justify-end gap-3">
                <button
                  type="button"
                  onClick={() => setShowRegisterForm(false)}
                  className="px-4 py-2.5 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
                >
                  Cancelar
                </button>
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-5 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0052FF]/25 cursor-pointer"
                >
                  {submitting ? 'Guardando...' : 'Crear y Acceder'}
                </button>
              </div>
            </form>
          ) : (
            <div className="p-5 sm:p-6 space-y-4">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="font-display font-bold text-base sm:text-lg text-[#0A1128]">
                    {roleTab === 'student'
                      ? 'Ingresa como Estudiante'
                      : 'Ingresa como Docente'}
                  </h2>
                  <p className="text-xs text-slate-500">
                    Haz clic en una cuenta para iniciar sesión con sus permisos y datos asociados.
                  </p>
                </div>
              </div>

              <div className="space-y-3">
                {displayedUsers.map((u) => {
                  const userInstance = instantiateUserClass(u);
                  return (
                    <button
                      key={u.id}
                      type="button"
                      onClick={() => onSelectUser(u)}
                      className="w-full text-left p-4 rounded-xl border-2 border-slate-200 hover:border-[#0052FF] bg-white hover:bg-[#0052FF]/3 transition-all flex items-center justify-between gap-4 group cursor-pointer"
                    >
                      <div className="flex items-center gap-3.5 min-w-0">
                        <div
                          className={`w-11 h-11 rounded-xl font-display font-extrabold text-sm flex items-center justify-center shrink-0 ${
                            u.role === 'teacher'
                              ? 'bg-[#0A1128] text-[#00D2FF]'
                              : 'bg-[#0052FF]/12 text-[#0052FF]'
                          }`}
                        >
                          {userInstance.getInitials()}
                        </div>
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <span className="font-display font-bold text-sm sm:text-base text-[#0A1128] truncate">
                              {u.name}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                                u.role === 'teacher'
                                  ? 'bg-[#0A1128] text-[#00D2FF]'
                                  : 'bg-[#0052FF]/10 text-[#0052FF]'
                              }`}
                            >
                              {userInstance.getRoleBadgeLabel()}
                            </span>
                          </div>
                          <div className="text-xs text-slate-500 truncate mt-0.5">
                            {u.email} · {u.cohort}
                          </div>
                        </div>
                      </div>

                      <div className="shrink-0 inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-slate-100 group-hover:bg-[#0052FF] text-slate-700 group-hover:text-white text-xs font-bold transition-colors">
                        <span>Acceder</span>
                        <ArrowRight className="w-3.5 h-3.5" />
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>
          )}
        </div>
      </main>
    </div>
  );
};
