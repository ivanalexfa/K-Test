import React, { useState } from 'react';
import {
  BookOpen,
  Clock,
  Layers,
  History,
  LogOut,
  ArrowRight,
  ArrowLeft,
  Sigma,
  FileText,
  Sparkles,
  Eye,
  GraduationCap,
  Paperclip,
  Download,
} from 'lucide-react';
import {
  MockPaaExamData,
  SectionType,
  SprintConfig,
  StudyMaterial,
  TestAttemptRecord,
  TestMode,
} from '../types/exam';
import { StudentUser } from '../models/UserClasses';
import { SPRINTS_CATALOG } from '../data/sprintsCatalog';
import { KTestLogo } from './brand/KTestLogo';
import {
  SimulacroEngineIcon,
  AsyncTrainerIcon,
  MathPAAIcon,
  VerbalPAAIcon,
} from './brand/KTestIcons';
import { LatexRenderer } from './LatexRenderer';

interface StudentDashboardProps {
  student: StudentUser;
  examData: MockPaaExamData;
  materials: StudyMaterial[];
  allAttempts: TestAttemptRecord[];
  onStartTest: (mode: TestMode, sprintConfig?: SprintConfig) => void;
  onInspectAttempt: (attempt: TestAttemptRecord) => void;
  onUpdateCohort?: (newCohort: string) => Promise<void>;
  onLogout: () => void;
}

type StudentTab = 'tests' | 'materials' | 'history';

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

function getFileFormatBadge(fileName?: string | null): {
  ext: string;
  colorClass: string;
} {
  if (!fileName) return { ext: 'ARCHIVO', colorClass: 'bg-slate-200 text-slate-700' };
  const ext = (fileName.split('.').pop() || 'FILE').toUpperCase();
  if (ext === 'PDF') return { ext: 'PDF', colorClass: 'bg-red-100 text-red-700 border-red-200' };
  if (['DOC', 'DOCX'].includes(ext))
    return { ext, colorClass: 'bg-blue-100 text-blue-700 border-blue-200' };
  if (['PPT', 'PPTX'].includes(ext))
    return { ext, colorClass: 'bg-orange-100 text-orange-700 border-orange-200' };
  if (['XLS', 'XLSX', 'CSV'].includes(ext))
    return { ext, colorClass: 'bg-emerald-100 text-emerald-700 border-emerald-200' };
  if (['PNG', 'JPG', 'JPEG', 'WEBP', 'GIF', 'SVG'].includes(ext))
    return { ext, colorClass: 'bg-purple-100 text-purple-700 border-purple-200' };
  return { ext, colorClass: 'bg-slate-100 text-slate-700 border-slate-200' };
}

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  examData,
  materials,
  allAttempts,
  onStartTest,
  onInspectAttempt,
  onUpdateCohort: _onUpdateCohort,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<StudentTab>('tests');
  // Active sprint hub subject ('reading' | 'math' | null)
  const [selectedSprintSubject, setSelectedSprintSubject] =
    useState<SectionType | null>(null);

  const [materialFilter, setMaterialFilter] = useState<'all' | SectionType>('all');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    materials[0]?.id ?? null
  );

  const myAttempts = student.getMyAttempts(allAttempts);
  const avgAccuracy = student.getAverageAccuracy(allAttempts);
  const bestSimulacro = student.getBestSimulacroScore(allAttempts);

  const readingSprints = SPRINTS_CATALOG.filter((s) => s.section === 'reading');
  const mathSprints = SPRINTS_CATALOG.filter((s) => s.section === 'math');

  const filteredMaterials =
    materialFilter === 'all'
      ? materials
      : materials.filter((m) => m.section === materialFilter);

  const activeMaterial =
    filteredMaterials.find((m) => m.id === selectedMaterialId) ??
    filteredMaterials[0] ??
    null;

  const { reading, math } = examData.sections;

  return (
    <div className="min-h-dvh flex flex-col bg-[#F8FAFC] text-[#0A1128]">
      {/* Top Institutional Student Navbar */}
      <header className="sticky top-0 z-30 bg-[#0A1128] text-white border-b border-white/10 shadow-md">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-4">
          <div className="flex items-center gap-3 min-w-0">
            <KTestLogo theme="dark" variant="full" />
            <div className="hidden md:block h-6 w-px bg-white/15" />
            <div className="hidden md:block min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0052FF]/30 text-[#00D2FF] border border-[#00D2FF]/30">
                  <GraduationCap className="w-3 h-3" />
                  Portal Estudiante
                </span>
              </div>
              <div className="text-xs text-slate-300 truncate mt-0.5">
                {student.name} · <span className="text-slate-400">{student.cohort}</span>
              </div>
            </div>
          </div>

          <button
            type="button"
            onClick={onLogout}
            className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-colors cursor-pointer shrink-0"
          >
            <LogOut className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span>Cambiar usuario</span>
          </button>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Student Summary Banner & Symmetrical 3-Column Section Selector */}
        <section className="rounded-2xl bg-[#0A1128] text-white p-5 sm:p-7 shadow-lg border border-slate-800 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-60 h-60 rounded-full bg-[#0052FF]/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D2FF] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                {student.getRoleBadgeLabel()}
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold">
                Hola, {student.name.split(' ')[0]}
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Accede a tus pruebas de práctica, consulta guías y archivos subidos por tus docentes, o revisa tus resultados históricos.
              </p>

              {/* Ciclo de Admisión Key Institute (Fijo / Inmutable) */}
              <div className="mt-3.5 inline-flex items-center gap-2 bg-white/10 border border-white/15 rounded-xl px-3 py-1.5 text-xs text-white">
                <span className="text-[11px] font-bold text-[#00D2FF] uppercase tracking-wider">
                  Ciclo de Admisión:
                </span>
                <span className="font-semibold text-white">
                  {student.cohort || 'Sin ciclo asignado'}
                </span>
              </div>
            </div>

            {/* Quick Student Metrics */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
              <div className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-2.5 text-center">
                <div className="text-[11px] text-slate-300">Pruebas hechas</div>
                <div className="font-display font-extrabold text-lg sm:text-xl font-mono-num text-white">
                  {myAttempts.length}
                </div>
              </div>
              <div className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-2.5 text-center">
                <div className="text-[11px] text-slate-300">Precisión prom.</div>
                <div className="font-display font-extrabold text-lg sm:text-xl font-mono-num text-[#00D2FF]">
                  {avgAccuracy}%
                </div>
              </div>
              <div className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-2.5 text-center">
                <div className="text-[11px] text-slate-300">Mejor Simulacro</div>
                <div className="font-display font-extrabold text-lg sm:text-xl font-mono-num text-emerald-400">
                  {bestSimulacro ? `${bestSimulacro} pts` : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Symmetrical 3-Column Navigation Selector (Pruebas | Materiales | Resultados) */}
          <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-3 gap-3">
            <button
              type="button"
              onClick={() => {
                setActiveTab('tests');
                setSelectedSprintSubject(null);
              }}
              className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTab === 'tests'
                  ? 'bg-[#0052FF] border-[#00D2FF]/50 text-white shadow-md shadow-[#0052FF]/30'
                  : 'bg-white/6 border-white/10 text-slate-200 hover:bg-white/12'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    activeTab === 'tests' ? 'bg-white/20 text-white' : 'bg-white/10 text-[#00D2FF]'
                  }`}
                >
                  <Layers className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-sm truncate">
                    Apartado de Pruebas
                  </div>
                  <div
                    className={`text-[11px] truncate ${
                      activeTab === 'tests' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    Simulacro y {SPRINTS_CATALOG.length} Sprints
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md font-mono-num text-xs font-bold shrink-0 ${
                  activeTab === 'tests' ? 'bg-white/20 text-white' : 'bg-white/10 text-slate-300'
                }`}
              >
                {1 + SPRINTS_CATALOG.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('materials')}
              className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTab === 'materials'
                  ? 'bg-[#0052FF] border-[#00D2FF]/50 text-white shadow-md shadow-[#0052FF]/30'
                  : 'bg-white/6 border-white/10 text-slate-200 hover:bg-white/12'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    activeTab === 'materials'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-[#00D2FF]'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-sm truncate">
                    Materiales de Estudio
                  </div>
                  <div
                    className={`text-[11px] truncate ${
                      activeTab === 'materials' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    Guías y archivos adjuntos
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md font-mono-num text-xs font-bold shrink-0 ${
                  activeTab === 'materials'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-slate-300'
                }`}
              >
                {materials.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#0052FF] border-[#00D2FF]/50 text-white shadow-md shadow-[#0052FF]/30'
                  : 'bg-white/6 border-white/10 text-slate-200 hover:bg-white/12'
              }`}
            >
              <div className="flex items-center gap-3 min-w-0">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center shrink-0 ${
                    activeTab === 'history'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-[#00D2FF]'
                  }`}
                >
                  <History className="w-5 h-5" />
                </div>
                <div className="min-w-0">
                  <div className="font-display font-bold text-sm truncate">
                    Mis Resultados
                  </div>
                  <div
                    className={`text-[11px] truncate ${
                      activeTab === 'history' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    Historial y solucionario
                  </div>
                </div>
              </div>
              <span
                className={`px-2 py-0.5 rounded-md font-mono-num text-xs font-bold shrink-0 ${
                  activeTab === 'history'
                    ? 'bg-white/20 text-white'
                    : 'bg-white/10 text-slate-300'
                }`}
              >
                {myAttempts.length}
              </span>
            </button>
          </div>
        </section>

        {/* TAB 1: APARTADO DE PRUEBAS (SIMULACRO COMPLETO + HUBS DE SPRINTS POR MATERIA) */}
        {activeTab === 'tests' && (
          <div className="space-y-8">
            {/* Full Simulacro Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-[#0052FF]/10 border border-[#0052FF]/20 flex items-center justify-center shrink-0">
                    <SimulacroEngineIcon size={24} />
                  </div>
                  <h2 className="font-display text-lg font-bold text-[#0A1128]">
                    Prueba de Simulacro (Test Completo Secuencial)
                  </h2>
                </div>
                <span className="text-xs font-semibold text-slate-500">
                  Escala PAA 400–1600 pts
                </span>
              </div>

              <div className="bg-white rounded-2xl border-2 border-[#0052FF]/30 p-6 sm:p-7 shadow-xs flex flex-col lg:flex-row items-start lg:items-center justify-between gap-6 relative overflow-hidden">
                <div className="absolute top-0 left-0 w-2 h-full bg-[#0052FF]" />
                <div className="space-y-3 max-w-2xl pl-2">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="px-2.5 py-1 rounded-md bg-[#0052FF] text-white text-xs font-bold uppercase tracking-wider">
                      Simulacro Completo PAA
                    </span>
                    <span className="inline-flex items-center gap-1 text-xs font-mono-num font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                      <Clock className="w-3.5 h-3.5 text-slate-500" />
                      {reading.durationMinutes + math.durationMinutes} min totales ·{' '}
                      {reading.questions.length + math.questions.length} preguntas
                    </span>
                  </div>

                  <h3 className="font-display text-xl font-extrabold text-[#0A1128]">
                    Simulacro Oficial PAA: Lectura y Redacción + Matemáticas
                  </h3>
                  <p className="text-xs sm:text-sm text-slate-600 leading-relaxed">
                    Simulacro oficial en 2 módulos cronometrados: Lectura y Redacción + Matemáticas.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-600">
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-medium">
                      <VerbalPAAIcon size={16} />
                      1. Lectura y Redacción ({reading.questions.length} pregs · {reading.durationMinutes} min)
                    </span>
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-medium">
                      <MathPAAIcon size={16} />
                      2. Matemáticas ({math.questions.length} pregs · {math.durationMinutes} min)
                    </span>
                  </div>
                </div>

                <button
                  type="button"
                  onClick={() => onStartTest('simulacro')}
                  className="w-full lg:w-auto shrink-0 inline-flex items-center justify-center gap-2.5 px-6 py-4 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white font-display font-bold text-sm sm:text-base shadow-lg shadow-[#0052FF]/25 transition-all cursor-pointer"
                >
                  <span>Iniciar Simulacro Completo</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              </div>
            </div>

            {/* Sprints Section: Either Subject Hub Cards OR Expanded Sprint Catalog for Selected Subject */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-lg bg-[#ECFDF5] border border-[#10B981]/20 flex items-center justify-center shrink-0">
                    <AsyncTrainerIcon size={24} />
                  </div>
                  <h2 className="font-display text-lg font-bold text-[#0A1128]">
                    Sprints PAA por Materia (Práctica Asíncrona / Entrenador Activo)
                  </h2>
                </div>
                {selectedSprintSubject ? (
                  <button
                    type="button"
                    onClick={() => setSelectedSprintSubject(null)}
                    className="inline-flex items-center gap-1.5 text-xs font-bold text-[#0052FF] hover:underline cursor-pointer"
                  >
                    <ArrowLeft className="w-3.5 h-3.5" />
                    <span>Volver a las dos materias</span>
                  </button>
                ) : (
                  <span className="text-xs font-semibold text-slate-500">
                    Selecciona un área para ver sus Sprints disponibles
                  </span>
                )}
              </div>

              {!selectedSprintSubject ? (
                /* Two Symmetrical Subject Hub Cards (Reading Sprints Hub vs Math Sprints Hub) */
                <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                  {/* Reading & Writing Sprints Hub Card */}
                  <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-[#0052FF]/50 p-6 shadow-2xs flex flex-col justify-between transition-all">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-purple-50 text-purple-900 border border-purple-200/70 text-xs font-bold uppercase tracking-wider">
                          <VerbalPAAIcon size={18} />
                          Área de Lenguaje y Redacción
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-mono-num font-bold text-[#0052FF] bg-[#0052FF]/10 px-2.5 py-1 rounded-md">
                          {readingSprints.length} Sprints disponibles
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-extrabold text-[#0A1128] mb-1.5">
                        Sprints de Lectura y Redacción
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                        Accede a la colección de tests cortos de comprensión lectora científica, vocabulario en contexto y redacción indirecta con líneas numeradas.
                      </p>

                      </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="text-xs text-slate-500 font-medium">
                        Pantalla dividida · Escala 200–800
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedSprintSubject('reading')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A1128] hover:bg-[#0052FF] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                      >
                        <span>Ver Sprints de Lectura ({readingSprints.length})</span>
                        <ArrowRight className="w-4 h-4 text-[#00D2FF]" />
                      </button>
                    </div>
                  </div>

                  {/* Mathematics Sprints Hub Card */}
                  <div className="bg-white rounded-2xl border-2 border-slate-200 hover:border-[#0052FF]/50 p-6 shadow-2xs flex flex-col justify-between transition-all">
                    <div>
                      <div className="flex items-center justify-between gap-2 mb-3">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0052FF]/8 text-[#0A1128] border border-[#0052FF]/20 text-xs font-bold uppercase tracking-wider">
                          <MathPAAIcon size={18} />
                          Área Cuantitativa · Matemáticas
                        </span>
                        <span className="inline-flex items-center gap-1 text-xs font-mono-num font-bold text-[#0052FF] bg-[#0052FF]/10 px-2.5 py-1 rounded-md">
                          {mathSprints.length} Sprints disponibles
                        </span>
                      </div>

                      <h3 className="font-display text-lg font-extrabold text-[#0A1128] mb-1.5">
                        Sprints de Matemáticas
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                        Accede a los entrenamientos cortos de geometría espacial, triángulos especiales, sistemas algebraicos y funciones con KaTeX y formulario PAA.
                      </p>

                      </div>

                    <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                      <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                        <Sigma className="w-3.5 h-3.5 text-[#0052FF]" />
                        Incluye Fórmulas PAA
                      </span>
                      <button
                        type="button"
                        onClick={() => setSelectedSprintSubject('math')}
                        className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0A1128] hover:bg-[#0052FF] text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                      >
                        <span>Ver Sprints de Matemáticas ({mathSprints.length})</span>
                        <ArrowRight className="w-4 h-4 text-[#00D2FF]" />
                      </button>
                    </div>
                  </div>
                </div>
              ) : (
                /* Expanded Sprint List for the Selected Subject ('reading' or 'math') */
                <div className="bg-white rounded-2xl border-2 border-[#0052FF]/25 p-5 sm:p-6 shadow-xs space-y-5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 border-b border-slate-200">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-slate-50 border border-slate-200 flex items-center justify-center">
                        {selectedSprintSubject === 'reading' ? (
                          <VerbalPAAIcon size={22} />
                        ) : (
                          <MathPAAIcon size={22} />
                        )}
                      </div>
                      <div>
                        <h3 className="font-display font-extrabold text-base sm:text-lg text-[#0A1128]">
                          {selectedSprintSubject === 'reading'
                            ? 'Catálogo de Sprints: Lectura y Redacción'
                            : 'Catálogo de Sprints: Matemáticas'}
                        </h3>
                        <p className="text-xs text-slate-500">
                          Elige el Sprint específico que deseas practicar hoy.
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() =>
                          setSelectedSprintSubject(
                            selectedSprintSubject === 'reading' ? 'math' : 'reading'
                          )
                        }
                        className="px-3 py-1.5 rounded-lg border border-slate-200 hover:border-slate-300 text-xs font-semibold text-slate-600 cursor-pointer"
                      >
                        Cambiar a{' '}
                        {selectedSprintSubject === 'reading' ? 'Matemáticas' : 'Lectura'}
                      </button>
                      <button
                        type="button"
                        onClick={() => setSelectedSprintSubject(null)}
                        className="px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0A1128] cursor-pointer"
                      >
                        Cerrar catálogo
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {(selectedSprintSubject === 'reading'
                      ? readingSprints
                      : mathSprints
                    ).map((sprint) => (
                      <div
                        key={sprint.id}
                        className="rounded-xl border border-slate-200 hover:border-[#0052FF] p-5 flex flex-col justify-between bg-[#F8FAFC]/60 hover:bg-white transition-all shadow-2xs"
                      >
                        <div>
                          <div className="flex items-center justify-between gap-2 mb-2.5">
                            <span className="px-2.5 py-0.5 rounded-md bg-[#0A1128] text-[#00D2FF] font-mono-num text-xs font-bold">
                              {sprint.code}
                            </span>
                            <span
                              className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase ${
                                sprint.difficulty === 'Avanzado'
                                  ? 'bg-purple-100 text-purple-800'
                                  : sprint.difficulty === 'Intermedio'
                                  ? 'bg-blue-100 text-blue-800'
                                  : 'bg-emerald-100 text-emerald-800'
                              }`}
                            >
                              {sprint.difficulty}
                            </span>
                          </div>

                          <h4 className="font-display font-bold text-base text-[#0A1128] mb-1.5">
                            {sprint.title}
                          </h4>
                          <p className="text-xs text-slate-600 leading-relaxed mb-4">
                            {sprint.description}
                          </p>

                          <div className="flex flex-wrap gap-1.5 mb-4">
                            {sprint.topics.map((t) => (
                              <span
                                key={t}
                                className="px-2 py-0.5 rounded bg-white border border-slate-200 text-[11px] text-slate-600 font-medium"
                              >
                                {t}
                              </span>
                            ))}
                          </div>
                        </div>

                        <div className="pt-3 border-t border-slate-200/80 flex items-center justify-between gap-2">
                          <span className="inline-flex items-center gap-1 text-xs font-mono-num font-semibold text-slate-600">
                            <Clock className="w-3.5 h-3.5 text-[#0052FF]" />
                            {sprint.durationMinutes} min · {sprint.questionIds.length} pregs
                          </span>

                          <button
                            type="button"
                            onClick={() => onStartTest(sprint.mode, sprint)}
                            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs font-bold shadow-xs cursor-pointer"
                          >
                            <span>Iniciar</span>
                            <ArrowRight className="w-3.5 h-3.5" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: MATERIALES DE ESTUDIO (CON SOPORTE DE ARCHIVOS ADJUNTOS PDF, DOCX, PPTX, XLSX, PNG, JPG) */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0A1128]">
                  Biblioteca de Materiales de Estudio y Recursos Descargables
                </h2>
                
              </div>

              <div className="flex flex-wrap gap-2">
                {(
                  [
                    { id: 'all', label: `Todos (${materials.length})` },
                    {
                      id: 'reading',
                      label: `Lectura y Redacción (${
                        materials.filter((m) => m.section === 'reading').length
                      })`,
                    },
                    {
                      id: 'math',
                      label: `Matemáticas (${
                        materials.filter((m) => m.section === 'math').length
                      })`,
                    },
                  ] as { id: 'all' | SectionType; label: string }[]
                ).map((f) => (
                  <button
                    key={f.id}
                    type="button"
                    onClick={() => {
                      setMaterialFilter(f.id);
                      const nextList =
                        f.id === 'all'
                          ? materials
                          : materials.filter((m) => m.section === f.id);
                      if (nextList[0]) setSelectedMaterialId(nextList[0].id);
                    }}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      materialFilter === f.id
                        ? 'bg-[#0A1128] text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    {f.label}
                  </button>
                ))}
              </div>
            </div>

            {filteredMaterials.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
                No hay materiales registrados en esta categoría todavía.
              </div>
            ) : (
              <div className="grid grid-cols-1 lg:grid-cols-12 gap-6 items-start">
                {/* Left List of Materials */}
                <div className="lg:col-span-5 space-y-3">
                  {filteredMaterials.map((mat) => {
                    const isSelected = activeMaterial?.id === mat.id;
                    const badge = mat.attachmentName
                      ? getFileFormatBadge(mat.attachmentName)
                      : null;

                    return (
                      <button
                        key={mat.id}
                        type="button"
                        onClick={() => setSelectedMaterialId(mat.id)}
                        className={`w-full text-left p-4 rounded-xl border-2 transition-all cursor-pointer ${
                          isSelected
                            ? 'border-[#0052FF] bg-white shadow-sm'
                            : 'border-slate-200 bg-white/80 hover:border-slate-300'
                        }`}
                      >
                        <div className="flex items-center justify-between gap-2 mb-1.5">
                          <span
                            className={`px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                              mat.section === 'math'
                                ? 'bg-[#0A1128] text-[#00D2FF]'
                                : 'bg-[#0052FF]/10 text-[#0052FF]'
                            }`}
                          >
                            {mat.section === 'math' ? 'Matemáticas' : 'Lectura y Redacción'} ·{' '}
                            {mat.category}
                          </span>
                          <span className="text-[11px] font-mono-num text-slate-400">
                            {mat.readingTimeMinutes} min
                          </span>
                        </div>
                        <h3 className="font-display font-bold text-sm text-[#0A1128] mb-1">
                          {mat.title}
                        </h3>
                        <p className="text-xs text-slate-500 line-clamp-2">{mat.summary}</p>
                        <div className="flex items-center justify-between gap-2 mt-2.5 pt-2 border-t border-slate-100">
                          <span className="text-[11px] text-slate-400">
                            Por {mat.authorName}
                          </span>
                          {badge && (
                            <span
                              className={`inline-flex items-center gap-1 px-2 py-0.5 rounded border text-[10px] font-bold ${badge.colorClass}`}
                            >
                              <Paperclip className="w-3 h-3" />
                              {badge.ext} adjunto
                            </span>
                          )}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Right Reader Pane with KaTeX + Attached File Viewer/Downloader */}
                {activeMaterial && (
                  <article className="lg:col-span-7 bg-white rounded-2xl border border-slate-200 shadow-xs overflow-hidden">
                    <div className="p-5 sm:p-7 bg-slate-50 border-b border-slate-200">
                      <div className="flex flex-wrap items-center justify-between gap-2 mb-2">
                        <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0A1128] text-[#00D2FF] text-xs font-bold uppercase tracking-wider">
                          <FileText className="w-3.5 h-3.5" />
                          {activeMaterial.category}
                        </span>
                        <span className="text-xs text-slate-500">
                          Autor: <strong>{activeMaterial.authorName}</strong> · Lectura de{' '}
                          {activeMaterial.readingTimeMinutes} min
                        </span>
                      </div>
                      <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#0A1128]">
                        {activeMaterial.title}
                      </h3>
                      <p className="text-xs sm:text-sm text-slate-600 mt-1">
                        {activeMaterial.summary}
                      </p>

                      {/* Attached File Download & Preview Card */}
                      {activeMaterial.attachmentUrl && activeMaterial.attachmentName && (
                        <div className="mt-4 p-3.5 rounded-xl bg-white border border-slate-200/90 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-2xs">
                          <div className="flex items-center gap-3 min-w-0">
                            <span
                              className={`px-2.5 py-1 rounded-lg border text-xs font-extrabold shrink-0 ${
                                getFileFormatBadge(activeMaterial.attachmentName).colorClass
                              }`}
                            >
                              {getFileFormatBadge(activeMaterial.attachmentName).ext}
                            </span>
                            <div className="min-w-0">
                              <div className="font-bold text-xs sm:text-sm text-[#0A1128] truncate">
                                {activeMaterial.attachmentName}
                              </div>
                              <div className="text-[11px] text-slate-500">
                                Archivo adjunto del docente{' '}
                                {activeMaterial.attachmentSize
                                  ? `· ${formatFileSize(activeMaterial.attachmentSize)}`
                                  : ''}
                              </div>
                            </div>
                          </div>

                          <a
                            href={activeMaterial.attachmentUrl}
                            download={activeMaterial.attachmentName}
                            target="_blank"
                            rel="noreferrer"
                            className="inline-flex items-center justify-center gap-1.5 px-4 py-2 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs font-bold shadow-xs transition-colors shrink-0"
                          >
                            <Download className="w-3.5 h-3.5" />
                            <span>Descargar / Abrir</span>
                          </a>
                        </div>
                      )}
                    </div>

                    {/* Inline Preview for Image or PDF Attachments */}
                    {activeMaterial.attachmentUrl &&
                      activeMaterial.attachmentMime?.startsWith('image/') && (
                        <div className="p-4 bg-slate-100/70 border-b border-slate-200 flex justify-center">
                          <img
                            src={activeMaterial.attachmentUrl}
                            alt={activeMaterial.attachmentName || 'Imagen adjunta'}
                            className="max-h-96 rounded-xl border border-slate-200 shadow-xs object-contain"
                          />
                        </div>
                      )}

                    {activeMaterial.attachmentUrl &&
                      activeMaterial.attachmentMime === 'application/pdf' && (
                        <div className="p-4 bg-slate-100/70 border-b border-slate-200">
                          <iframe
                            src={activeMaterial.attachmentUrl}
                            title={activeMaterial.attachmentName || 'Vista previa PDF'}
                            className="w-full h-96 rounded-xl border border-slate-200 bg-white"
                          />
                        </div>
                      )}

                    <div className="p-5 sm:p-7 text-sm sm:text-[15px] text-slate-800 leading-relaxed space-y-3">
                      <LatexRenderer content={activeMaterial.content} />
                    </div>
                  </article>
                )}
              </div>
            )}
          </div>
        )}

        {/* TAB 3: MIS RESULTADOS E HISTORIAL */}
        {activeTab === 'history' && (
          <div className="space-y-4">
            <div>
              <h2 className="font-display text-lg font-bold text-[#0A1128]">
                Historial de Pruebas Guardadas ({myAttempts.length})
              </h2>
              
            </div>

            {myAttempts.length === 0 ? (
              <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center space-y-3">
                <p className="text-sm text-slate-600">
                  Aún no has registrado ningún Simulacro ni Sprint con esta cuenta.
                </p>
                <button
                  type="button"
                  onClick={() => setActiveTab('tests')}
                  className="px-4 py-2 rounded-xl bg-[#0052FF] text-white text-xs font-bold cursor-pointer"
                >
                  Ir al Apartado de Pruebas
                </button>
              </div>
            ) : (
              <div className="space-y-3">
                {myAttempts.map((att) => (
                  <div
                    key={att.id}
                    className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4 shadow-2xs"
                  >
                    <div className="space-y-1">
                      <div className="flex flex-wrap items-center gap-2">
                        <span
                          className={`px-2.5 py-0.5 rounded text-[11px] font-bold uppercase tracking-wider ${
                            att.mode === 'simulacro'
                              ? 'bg-[#0052FF] text-white'
                              : 'bg-amber-500/15 text-amber-800'
                          }`}
                        >
                          {att.mode === 'simulacro' ? 'Simulacro Completo' : 'Sprint Corto'}
                        </span>
                        <span className="font-display font-bold text-sm sm:text-base text-[#0A1128]">
                          {att.modeTitle}
                        </span>
                      </div>

                      <div className="flex flex-wrap items-center gap-3 text-xs text-slate-500">
                        <span>
                          Fecha:{' '}
                          {new Date(att.completedAt).toLocaleString('es-SV', {
                            dateStyle: 'medium',
                            timeStyle: 'short',
                          })}
                        </span>
                        {att.readingTotal > 0 && (
                          <span>
                            Lectura:{' '}
                            <strong className="font-mono-num text-[#0A1128]">
                              {att.readingCorrect}/{att.readingTotal}
                            </strong>
                          </span>
                        )}
                        {att.mathTotal > 0 && (
                          <span>
                            Matemáticas:{' '}
                            <strong className="font-mono-num text-[#0A1128]">
                              {att.mathCorrect}/{att.mathTotal}
                            </strong>
                          </span>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center justify-between sm:justify-end gap-4 pt-3 sm:pt-0 border-t sm:border-t-0 border-slate-100">
                      <div className="text-right font-mono-num">
                        <div className="text-sm font-extrabold text-[#0052FF]">
                          {att.percentage}% ({att.totalCorrect}/{att.totalQuestions})
                        </div>
                        <div className="text-xs text-slate-500">
                          Puntaje est.: <strong>{att.scaledScore} pts</strong>
                        </div>
                      </div>

                      <button
                        type="button"
                        onClick={() => onInspectAttempt(att)}
                        className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-[#0A1128] text-slate-700 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                      >
                        <Eye className="w-3.5 h-3.5" />
                        <span>Solucionario</span>
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        )}
      </main>
    </div>
  );
};
