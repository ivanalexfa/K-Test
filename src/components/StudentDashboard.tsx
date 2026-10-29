import React, { useState } from 'react';
import {
  BookOpen,
  Calculator,
  Clock,
  Layers,
  Zap,
  Award,
  History,
  LogOut,
  ArrowRight,
  Sigma,
  FileText,
  Sparkles,
  CheckCircle2,
  Eye,
  GraduationCap,
} from 'lucide-react';
import {
  MockPaaExamData,
  SectionType,
  StudyMaterial,
  TestAttemptRecord,
  TestMode,
} from '../types/exam';
import { StudentUser } from '../models/UserClasses';
import { LatexRenderer } from './LatexRenderer';

interface StudentDashboardProps {
  student: StudentUser;
  examData: MockPaaExamData;
  materials: StudyMaterial[];
  allAttempts: TestAttemptRecord[];
  onStartTest: (mode: TestMode) => void;
  onInspectAttempt: (attempt: TestAttemptRecord) => void;
  onLogout: () => void;
}

type StudentTab = 'tests' | 'materials' | 'history';

export const StudentDashboard: React.FC<StudentDashboardProps> = ({
  student,
  examData,
  materials,
  allAttempts,
  onStartTest,
  onInspectAttempt,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<StudentTab>('tests');
  const [materialFilter, setMaterialFilter] = useState<'all' | SectionType>('all');
  const [selectedMaterialId, setSelectedMaterialId] = useState<string | null>(
    materials[0]?.id ?? null
  );

  const myAttempts = student.getMyAttempts(allAttempts);
  const avgAccuracy = student.getAverageAccuracy(allAttempts);
  const bestSimulacro = student.getBestSimulacroScore(allAttempts);

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
            <div className="w-9 h-9 rounded-xl bg-[#0052FF] flex items-center justify-center font-display font-extrabold text-base text-white shrink-0">
              K
            </div>
            <div className="min-w-0">
              <div className="flex items-center gap-2">
                <span className="font-display font-bold text-sm tracking-wider uppercase">
                  KEY INSTITUTE
                </span>
                <span className="hidden sm:inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#0052FF]/30 text-[#00D2FF] border border-[#00D2FF]/30">
                  <GraduationCap className="w-3 h-3" />
                  Portal Estudiante
                </span>
              </div>
              <div className="text-xs text-slate-300 truncate">
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
        {/* Student Summary Banner & Navigation Tabs */}
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
                Estudia los materiales publicados por tus docentes, realiza{' '}
                <strong>Simulacros Completos</strong> o entrena con{' '}
                <strong>Sprints Cortos</strong>. Todos tus resultados se guardan en tu expediente.
              </p>
            </div>

            {/* Quick Student Metrics */}
            <div className="grid grid-cols-3 gap-3 sm:gap-4 shrink-0">
              <div className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-2.5">
                <div className="text-[11px] text-slate-300">Pruebas hechas</div>
                <div className="font-display font-extrabold text-lg sm:text-xl font-mono-num text-white">
                  {myAttempts.length}
                </div>
              </div>
              <div className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-2.5">
                <div className="text-[11px] text-slate-300">Precisión prom.</div>
                <div className="font-display font-extrabold text-lg sm:text-xl font-mono-num text-[#00D2FF]">
                  {avgAccuracy}%
                </div>
              </div>
              <div className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-2.5">
                <div className="text-[11px] text-slate-300">Mejor Simulacro</div>
                <div className="font-display font-extrabold text-lg sm:text-xl font-mono-num text-emerald-400">
                  {bestSimulacro ? `${bestSimulacro} pts` : '—'}
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Sub-tabs */}
          <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('tests')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'tests'
                  ? 'bg-[#0052FF] text-white shadow-md shadow-[#0052FF]/30'
                  : 'bg-white/8 text-slate-200 hover:bg-white/15'
              }`}
            >
              <Layers className="w-4 h-4" />
              <span>Apartado de Pruebas (Simulacro y Sprints)</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('materials')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'materials'
                  ? 'bg-[#0052FF] text-white shadow-md shadow-[#0052FF]/30'
                  : 'bg-white/8 text-slate-200 hover:bg-white/15'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Materiales de Estudio ({materials.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('history')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'history'
                  ? 'bg-[#0052FF] text-white shadow-md shadow-[#0052FF]/30'
                  : 'bg-white/8 text-slate-200 hover:bg-white/15'
              }`}
            >
              <History className="w-4 h-4" />
              <span>Mis Resultados ({myAttempts.length})</span>
            </button>
          </div>
        </section>

        {/* TAB 1: APARTADO DE PRUEBAS (SIMULACRO COMPLETO + SPRINTS CORTOS) */}
        {activeTab === 'tests' && (
          <div className="space-y-8">
            {/* Full Simulacro Section */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold text-[#0A1128] flex items-center gap-2">
                  <Layers className="w-5 h-5 text-[#0052FF]" />
                  Prueba de Simulacro (Test Completo Secuencial)
                </h2>
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
                    Recorre en orden secuencial estricto el <strong>Módulo 1 (Lectura y Redacción)</strong> con pantalla dividida y líneas numeradas, seguido del <strong>Módulo 2 (Matemáticas)</strong> con ecuaciones LaTeX y hoja oficial de fórmulas geométricas.
                  </p>

                  <div className="flex flex-wrap gap-2 pt-1 text-xs text-slate-600">
                    <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-medium">
                      1. Lectura y Redacción ({reading.questions.length} pregs · {reading.durationMinutes} min)
                    </span>
                    <span className="px-2.5 py-1 rounded-md bg-slate-50 border border-slate-200 font-medium">
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

            {/* Sprints Section (Short Focused Tests) */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-lg font-bold text-[#0A1128] flex items-center gap-2">
                  <Zap className="w-5 h-5 text-amber-500 fill-amber-400" />
                  Sprints PAA (Tests Cortos de Entrenamiento Ágil)
                </h2>
                <span className="text-xs font-semibold text-slate-500">
                  Enfoque por sección individual · Escala 200–800 pts
                </span>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                {/* Reading Sprint */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-amber-500/12 text-amber-800 text-xs font-bold uppercase tracking-wider">
                        <Zap className="w-3.5 h-3.5 text-amber-500 fill-amber-400" />
                        Sprint Lectura
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-mono-num font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />5 min ·{' '}
                        {reading.questions.length} preguntas
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-[#0A1128] mb-1.5">
                      Sprint de Lectura y Redacción
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      Entrena comprensión crítica de textos y redacción indirecta en una sesión corta de 5 minutos con vista dividida y líneas numeradas.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="text-xs text-slate-500 font-medium">
                      2 pasajes con citas de líneas
                    </span>
                    <button
                      type="button"
                      onClick={() => onStartTest('sprint_reading')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0A1128] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                    >
                      <span>Iniciar Sprint</span>
                      <ArrowRight className="w-4 h-4 text-[#00D2FF]" />
                    </button>
                  </div>
                </div>

                {/* Math Sprint */}
                <div className="bg-white rounded-2xl border border-slate-200 p-6 shadow-2xs flex flex-col justify-between">
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-3">
                      <span className="inline-flex items-center gap-1.5 px-2.5 py-1 rounded-md bg-[#0A1128] text-[#00D2FF] text-xs font-bold uppercase tracking-wider">
                        <Zap className="w-3.5 h-3.5 text-[#00D2FF]" />
                        Sprint Matemáticas
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs font-mono-num font-semibold text-slate-600 bg-slate-100 px-2.5 py-1 rounded-md">
                        <Clock className="w-3.5 h-3.5 text-slate-500" />6 min ·{' '}
                        {math.questions.length} preguntas
                      </span>
                    </div>

                    <h3 className="font-display text-lg font-bold text-[#0A1128] mb-1.5">
                      Sprint de Matemáticas Aplicadas
                    </h3>
                    <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-4">
                      Resuelve problemas de geometría, volúmenes, sistemas de ecuaciones y funciones cuadráticas con soporte KaTeX y modal de fórmulas PAA.
                    </p>
                  </div>

                  <div className="pt-4 border-t border-slate-100 flex items-center justify-between gap-3">
                    <span className="inline-flex items-center gap-1 text-xs text-slate-500 font-medium">
                      <Sigma className="w-3.5 h-3.5 text-[#0052FF]" />
                      Incluye Fórmulas PAA
                    </span>
                    <button
                      type="button"
                      onClick={() => onStartTest('sprint_math')}
                      className="inline-flex items-center gap-1.5 px-4 py-2.5 rounded-xl bg-[#0A1128] hover:bg-slate-800 text-white text-xs sm:text-sm font-bold transition-colors cursor-pointer"
                    >
                      <span>Iniciar Sprint</span>
                      <ArrowRight className="w-4 h-4 text-[#00D2FF]" />
                    </button>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {/* TAB 2: MATERIALES DE ESTUDIO */}
        {activeTab === 'materials' && (
          <div className="space-y-4">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0A1128]">
                  Biblioteca de Materiales de Estudio PAA
                </h2>
                <p className="text-xs text-slate-500">
                  Guías académicas y formulario comentado elaborados por los docentes de Key Institute.
                </p>
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
                        <div className="text-[11px] text-slate-400 mt-2">
                          Por {mat.authorName}
                        </div>
                      </button>
                    );
                  })}
                </div>

                {/* Right Reader Pane with KaTeX Support */}
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
                    </div>

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
              <p className="text-xs text-slate-500">
                Registro cruzado de tu usuario con todas las pruebas (Simulacros y Sprints) almacenadas en la base de datos SQLite.
              </p>
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
