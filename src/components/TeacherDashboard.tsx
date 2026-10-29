import React, { useState } from 'react';
import {
  BookOpenCheck,
  Users,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Eye,
  LogOut,
  Database,
  CheckCircle2,
  Filter,
  Sparkles,
  BookOpen,
  Calculator,
  Clock,
  Save,
  X,
} from 'lucide-react';
import {
  SectionType,
  StudyMaterial,
  TestAttemptRecord,
  TestMode,
  UserRecord,
} from '../types/exam';
import { TeacherUser } from '../models/UserClasses';
import { LatexRenderer } from './LatexRenderer';

interface TeacherDashboardProps {
  teacher: TeacherUser;
  users: UserRecord[];
  materials: StudyMaterial[];
  attempts: TestAttemptRecord[];
  onCreateMaterial: (payload: {
    title: string;
    section: SectionType;
    category: string;
    summary: string;
    content: string;
    readingTimeMinutes: number;
    authorId: string;
    authorName: string;
  }) => Promise<void>;
  onUpdateMaterial: (
    id: string,
    payload: {
      title: string;
      section: SectionType;
      category: string;
      summary: string;
      content: string;
      readingTimeMinutes: number;
    }
  ) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
  onInspectAttempt: (attempt: TestAttemptRecord) => void;
  onLogout: () => void;
}

type TeacherTab = 'cross_results' | 'materials_crud';

export const TeacherDashboard: React.FC<TeacherDashboardProps> = ({
  teacher,
  users,
  materials,
  attempts,
  onCreateMaterial,
  onUpdateMaterial,
  onDeleteMaterial,
  onInspectAttempt,
  onLogout,
}) => {
  const [activeTab, setActiveTab] = useState<TeacherTab>('cross_results');

  // Cross-reference filters
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [selectedMode, setSelectedMode] = useState<'all' | TestMode>('all');

  // Study Material Form State (Create / Edit)
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [showMaterialForm, setShowMaterialForm] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [section, setSection] = useState<SectionType>('math');
  const [category, setCategory] = useState('Geometría y Volúmenes');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [readingTimeMinutes, setReadingTimeMinutes] = useState<number>(6);
  const [savingMaterial, setSavingMaterial] = useState(false);

  const students = users.filter((u) => u.role === 'student');

  // Filtered cross-referenced attempts
  const filteredAttempts = attempts.filter((att) => {
    if (selectedStudentId !== 'all' && att.userId !== selectedStudentId) {
      return false;
    }
    if (selectedMode !== 'all' && att.mode !== selectedMode) {
      return false;
    }
    return true;
  });

  const globalAvgPercentage =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
        )
      : 0;

  const simulacrosCount = attempts.filter((a) => a.mode === 'simulacro').length;
  const sprintsCount = attempts.filter((a) => a.mode !== 'simulacro').length;

  const openNewMaterialForm = () => {
    setEditingMaterialId(null);
    setTitle('');
    setSection('math');
    setCategory('Álgebra y Geometría PAA');
    setSummary('');
    setContent(
      'Escribe aquí la guía para los estudiantes. Puedes incluir fórmulas en LaTeX como $A = \\pi r^2$ o bloques:\n$$V = \\frac{1}{3}\\pi r^2 h$$'
    );
    setReadingTimeMinutes(6);
    setShowMaterialForm(true);
  };

  const openEditMaterialForm = (mat: StudyMaterial) => {
    setEditingMaterialId(mat.id);
    setTitle(mat.title);
    setSection(mat.section);
    setCategory(mat.category);
    setSummary(mat.summary);
    setContent(mat.content);
    setReadingTimeMinutes(mat.readingTimeMinutes);
    setShowMaterialForm(true);
  };

  const handleSaveMaterial = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!title.trim() || !summary.trim() || !content.trim()) return;
    try {
      setSavingMaterial(true);
      if (editingMaterialId) {
        await onUpdateMaterial(editingMaterialId, {
          title,
          section,
          category,
          summary,
          content,
          readingTimeMinutes,
        });
      } else {
        await onCreateMaterial({
          title,
          section,
          category,
          summary,
          content,
          readingTimeMinutes,
          authorId: teacher.id,
          authorName: teacher.name,
        });
      }
      setShowMaterialForm(false);
      setEditingMaterialId(null);
    } finally {
      setSavingMaterial(false);
    }
  };

  return (
    <div className="min-h-dvh flex flex-col bg-[#F8FAFC] text-[#0A1128]">
      {/* Top Institutional Teacher Header */}
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
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/30">
                  <BookOpenCheck className="w-3 h-3" />
                  Panel Docente
                </span>
              </div>
              <div className="text-xs text-slate-300 truncate">
                {teacher.name} · <span className="text-slate-400">{teacher.cohort}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
            <span className="hidden md:inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium bg-emerald-500/15 text-emerald-300 border border-emerald-400/30">
              <Database className="w-3.5 h-3.5 text-emerald-400" />
              SQLite Activo
            </span>

            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-white/10 hover:bg-white/15 border border-white/15 text-xs font-semibold text-white transition-colors cursor-pointer"
            >
              <LogOut className="w-3.5 h-3.5 text-[#00D2FF]" />
              <span>Cambiar usuario</span>
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        {/* Executive Teacher Hero & KPIs */}
        <section className="rounded-2xl bg-[#0A1128] text-white p-5 sm:p-7 shadow-lg border border-slate-800 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-60 h-60 rounded-full bg-[#0052FF]/20 blur-3xl pointer-events-none" />
          <div className="relative z-10 flex flex-col lg:flex-row lg:items-center justify-between gap-6">
            <div>
              <div className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#00D2FF] uppercase tracking-wider mb-1">
                <Sparkles className="w-3.5 h-3.5" />
                {teacher.getRoleBadgeLabel()}
              </div>
              <h1 className="font-display text-xl sm:text-2xl font-extrabold">
                Centro de Control Académico y Analítica PAA
              </h1>
              <p className="text-xs sm:text-sm text-slate-300 mt-1 max-w-xl">
                Cruza el desempeño de cada estudiante en Simulacros y Sprints, y administra los Materiales de Estudio en la base de datos.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-2.5">
                <div className="text-[11px] text-slate-300">Estudiantes</div>
                <div className="font-display font-extrabold text-lg sm:text-xl font-mono-num text-white">
                  {students.length}
                </div>
              </div>
              <div className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-2.5">
                <div className="text-[11px] text-slate-300">Simulacros / Sprints</div>
                <div className="font-display font-extrabold text-lg sm:text-xl font-mono-num text-[#00D2FF]">
                  {simulacrosCount} / {sprintsCount}
                </div>
              </div>
              <div className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-2.5">
                <div className="text-[11px] text-slate-300">Precisión Global</div>
                <div className="font-display font-extrabold text-lg sm:text-xl font-mono-num text-emerald-400">
                  {globalAvgPercentage}%
                </div>
              </div>
              <div className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-2.5">
                <div className="text-[11px] text-slate-300">Materiales DB</div>
                <div className="font-display font-extrabold text-lg sm:text-xl font-mono-num text-white">
                  {materials.length}
                </div>
              </div>
            </div>
          </div>

          {/* Teacher Navigation Tabs */}
          <div className="relative z-10 mt-6 pt-5 border-t border-white/10 flex flex-wrap gap-2">
            <button
              type="button"
              onClick={() => setActiveTab('cross_results')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'cross_results'
                  ? 'bg-[#0052FF] text-white shadow-md shadow-[#0052FF]/30'
                  : 'bg-white/8 text-slate-200 hover:bg-white/15'
              }`}
            >
              <BarChart3 className="w-4 h-4" />
              <span>Cruce de Estudiantes × Resultados ({attempts.length})</span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('materials_crud')}
              className={`inline-flex items-center gap-2 px-4 py-2.5 rounded-xl text-xs sm:text-sm font-bold transition-all cursor-pointer ${
                activeTab === 'materials_crud'
                  ? 'bg-[#0052FF] text-white shadow-md shadow-[#0052FF]/30'
                  : 'bg-white/8 text-slate-200 hover:bg-white/15'
              }`}
            >
              <BookOpen className="w-4 h-4" />
              <span>Base de Datos de Materiales de Estudio ({materials.length})</span>
            </button>
          </div>
        </section>

        {/* TAB 1: CRUCE DE ESTUDIANTES X RESULTADOS */}
        {activeTab === 'cross_results' && (
          <div className="space-y-6">
            {/* Student Summary Matrix Cards */}
            <div>
              <div className="flex items-center justify-between mb-3">
                <h2 className="font-display text-base sm:text-lg font-bold text-[#0A1128] flex items-center gap-2">
                  <Users className="w-5 h-5 text-[#0052FF]" />
                  Resumen por Estudiante (Haz clic en un alumno para filtrar sus pruebas)
                </h2>
                {selectedStudentId !== 'all' && (
                  <button
                    type="button"
                    onClick={() => setSelectedStudentId('all')}
                    className="text-xs font-bold text-[#0052FF] hover:underline cursor-pointer"
                  >
                    Mostrar todos los estudiantes
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {students.map((stu) => {
                  const stuAttempts = attempts.filter((a) => a.userId === stu.id);
                  const stuSimulacros = stuAttempts.filter(
                    (a) => a.mode === 'simulacro'
                  ).length;
                  const stuSprints = stuAttempts.filter(
                    (a) => a.mode !== 'simulacro'
                  ).length;
                  const stuAvg =
                    stuAttempts.length > 0
                      ? Math.round(
                          stuAttempts.reduce((acc, a) => acc + a.percentage, 0) /
                            stuAttempts.length
                        )
                      : 0;
                  const isSelected = selectedStudentId === stu.id;

                  return (
                    <button
                      key={stu.id}
                      type="button"
                      onClick={() =>
                        setSelectedStudentId(isSelected ? 'all' : stu.id)
                      }
                      className={`text-left p-4 sm:p-5 rounded-2xl border-2 transition-all cursor-pointer ${
                        isSelected
                          ? 'border-[#0052FF] bg-[#0052FF]/5 shadow-sm'
                          : 'border-slate-200 bg-white hover:border-slate-300'
                      }`}
                    >
                      <div className="flex items-start justify-between gap-2 mb-2">
                        <div>
                          <div className="font-display font-bold text-sm sm:text-base text-[#0A1128]">
                            {stu.name}
                          </div>
                          <div className="text-[11px] text-slate-500 truncate">
                            {stu.email}
                          </div>
                        </div>
                        <span className="px-2 py-0.5 rounded-md bg-[#0A1128] text-[#00D2FF] font-mono-num text-xs font-bold">
                          {stuAvg}% prom.
                        </span>
                      </div>

                      <div className="text-[11px] text-slate-500 mb-3 truncate">
                        {stu.cohort}
                      </div>

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-slate-100 text-xs">
                        <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                          <span className="text-slate-500">Simulacros:</span>{' '}
                          <strong className="font-mono-num text-[#0A1128]">
                            {stuSimulacros}
                          </strong>
                        </div>
                        <div className="bg-slate-50 rounded-lg px-2.5 py-1.5">
                          <span className="text-slate-500">Sprints:</span>{' '}
                          <strong className="font-mono-num text-[#0A1128]">
                            {stuSprints}
                          </strong>
                        </div>
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Detailed Cross-Reference Table (Student x Test Mode x Section Scores) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h3 className="font-display font-bold text-base text-[#0A1128] flex items-center gap-2">
                    <Filter className="w-4 h-4 text-[#0052FF]" />
                    Matriz Cruzada: Usuario × Prueba × Desempeño ({filteredAttempts.length})
                  </h3>
                  <p className="text-xs text-slate-500">
                    Filtra por estudiante o tipo de evaluación e inspecciona la hoja de respuestas de cualquier intento.
                  </p>
                </div>

                <div className="flex flex-wrap items-center gap-2">
                  <select
                    value={selectedStudentId}
                    onChange={(e) => setSelectedStudentId(e.target.value)}
                    aria-label="Filtrar por estudiante"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-[#0A1128]"
                  >
                    <option value="all">Todos los estudiantes ({students.length})</option>
                    {students.map((s) => (
                      <option key={s.id} value={s.id}>
                        {s.name}
                      </option>
                    ))}
                  </select>

                  <select
                    value={selectedMode}
                    onChange={(e) => setSelectedMode(e.target.value as 'all' | TestMode)}
                    aria-label="Filtrar por tipo de prueba"
                    className="px-3 py-1.5 rounded-lg border border-slate-300 bg-white text-xs font-semibold text-[#0A1128]"
                  >
                    <option value="all">Todas las pruebas</option>
                    <option value="simulacro">Simulacro Completo</option>
                    <option value="sprint_reading">Sprint Lectura y Redacción</option>
                    <option value="sprint_math">Sprint Matemáticas</option>
                  </select>
                </div>
              </div>

              {filteredAttempts.length === 0 ? (
                <div className="p-8 text-center text-sm text-slate-500">
                  No se encontraron registros para los filtros seleccionados.
                </div>
              ) : (
                <div className="overflow-x-auto">
                  <table className="w-full text-left border-collapse text-xs sm:text-sm">
                    <thead>
                      <tr className="border-b border-slate-200 bg-slate-50/60 text-[11px] uppercase tracking-wider text-slate-500 font-semibold">
                        <th className="py-3 px-4">Estudiante</th>
                        <th className="py-3 px-4">Tipo de Prueba</th>
                        <th className="py-3 px-4 text-center">Lectura</th>
                        <th className="py-3 px-4 text-center">Matemáticas</th>
                        <th className="py-3 px-4 text-center">Precisión / Escala</th>
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80">
                      {filteredAttempts.map((att) => (
                        <tr key={att.id} className="hover:bg-slate-50/80 transition-colors">
                          <td className="py-3.5 px-4">
                            <div className="font-bold text-[#0A1128]">{att.userName}</div>
                            <div className="text-[11px] text-slate-500">{att.userEmail}</div>
                          </td>
                          <td className="py-3.5 px-4">
                            <span
                              className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                                att.mode === 'simulacro'
                                  ? 'bg-[#0052FF]/12 text-[#0052FF]'
                                  : 'bg-amber-500/15 text-amber-800'
                              }`}
                            >
                              {att.mode === 'simulacro' ? 'Simulacro Completo' : 'Sprint Corto'}
                            </span>
                            <div className="text-xs font-medium text-slate-700">
                              {att.modeTitle}
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono-num">
                            {att.readingTotal > 0 ? (
                              <span className="font-semibold text-[#0A1128]">
                                {att.readingCorrect}/{att.readingTotal}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono-num">
                            {att.mathTotal > 0 ? (
                              <span className="font-semibold text-[#0A1128]">
                                {att.mathCorrect}/{att.mathTotal}
                              </span>
                            ) : (
                              <span className="text-slate-400">—</span>
                            )}
                          </td>
                          <td className="py-3.5 px-4 text-center font-mono-num">
                            <span className="font-extrabold text-[#0052FF]">
                              {att.percentage}%
                            </span>
                            <div className="text-[11px] text-slate-500">
                              {att.scaledScore} pts
                            </div>
                          </td>
                          <td className="py-3.5 px-4 text-xs text-slate-500">
                            {new Date(att.completedAt).toLocaleString('es-SV', {
                              dateStyle: 'short',
                              timeStyle: 'short',
                            })}
                          </td>
                          <td className="py-3.5 px-4 text-right">
                            <button
                              type="button"
                              onClick={() => onInspectAttempt(att)}
                              className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-[#0A1128] text-slate-700 hover:text-white text-xs font-bold transition-colors cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              <span>Ver detalle</span>
                            </button>
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GESTIÓN DE MATERIALES DE ESTUDIO EN BASE DE DATOS */}
        {activeTab === 'materials_crud' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0A1128]">
                  Repositorio de Materiales de Estudio en SQLite
                </h2>
                <p className="text-xs text-slate-500">
                  Los materiales creados o actualizados aquí están disponibles de inmediato en el portal de todos los estudiantes.
                </p>
              </div>

              {!showMaterialForm && (
                <button
                  type="button"
                  onClick={openNewMaterialForm}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0052FF]/25 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Material de Estudio</span>
                </button>
              )}
            </div>

            {showMaterialForm && (
              <form
                onSubmit={handleSaveMaterial}
                className="bg-white rounded-2xl border-2 border-[#0052FF]/30 p-5 sm:p-6 shadow-md space-y-4"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-display font-bold text-base text-[#0A1128]">
                    {editingMaterialId
                      ? 'Editar Material de Estudio'
                      : 'Publicar Nuevo Material de Estudio en Base de Datos'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowMaterialForm(false)}
                    className="p-1.5 rounded-lg text-slate-400 hover:text-slate-700 cursor-pointer"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Título del Material
                    </label>
                    <input
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej. Guía de Geometría Analítica y Pendientes"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0052FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Sección PAA
                    </label>
                    <select
                      value={section}
                      onChange={(e) => setSection(e.target.value as SectionType)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm bg-white focus:outline-none focus:border-[#0052FF]"
                    >
                      <option value="math">Matemáticas (con soporte KaTeX)</option>
                      <option value="reading">Lectura y Redacción</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Categoría / Tema
                    </label>
                    <input
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0052FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Tiempo de lectura (minutos)
                    </label>
                    <input
                      type="number"
                      min={1}
                      max={60}
                      required
                      value={readingTimeMinutes}
                      onChange={(e) => setReadingTimeMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0052FF]"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Autor Registrado
                    </label>
                    <input
                      type="text"
                       disabled
                      value={teacher.name}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-semibold text-slate-700 mb-1">
                    Resumen Ejecutivo
                  </label>
                  <input
                    type="text"
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Breve descripción del objetivo de aprendizaje..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0052FF]"
                  />
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-semibold text-slate-700 mb-1">
                      Contenido (Soporta LaTeX inline <code>$...$</code> y bloques <code>$$...$$</code>)
                    </label>
                    <textarea
                      rows={8}
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full p-3.5 rounded-xl border border-slate-300 text-xs sm:text-sm font-mono focus:outline-none focus:border-[#0052FF]"
                    />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-slate-700 mb-1">
                      Vista Previa en Vivo (Renderizado KaTeX)
                    </div>
                    <div className="h-[196px] overflow-y-auto custom-scrollbar p-3.5 rounded-xl bg-slate-50 border border-slate-200 text-xs sm:text-sm text-[#0A1128] leading-relaxed">
                      <LatexRenderer content={content} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMaterialForm(false)}
                    className="px-4 py-2 rounded-xl border border-slate-300 text-xs font-semibold text-slate-700 cursor-pointer"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingMaterial}
                    className="inline-flex items-center gap-1.5 px-5 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0052FF]/25 cursor-pointer"
                  >
                    <Save className="w-4 h-4" />
                    <span>
                      {savingMaterial
                        ? 'Guardando en SQLite...'
                        : editingMaterialId
                        ? 'Actualizar Material'
                        : 'Publicar en Base de Datos'}
                    </span>
                  </button>
                </div>
              </form>
            )}

            {/* Existing Materials List */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className={`px-2.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider ${
                          mat.section === 'math'
                            ? 'bg-[#0A1128] text-[#00D2FF]'
                            : 'bg-[#0052FF]/10 text-[#0052FF]'
                        }`}
                      >
                        {mat.section === 'math' ? 'Matemáticas' : 'Lectura y Redacción'} ·{' '}
                        {mat.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-slate-400 font-mono-num">
                        <Clock className="w-3.5 h-3.5" />
                        {mat.readingTimeMinutes} min
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base text-[#0A1128] mb-1">
                      {mat.title}
                    </h3>
                    <p className="text-xs text-slate-600 mb-3">{mat.summary}</p>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/70 text-xs text-slate-700 max-h-36 overflow-y-auto custom-scrollbar">
                      <LatexRenderer content={mat.content} />
                    </div>
                  </div>

                  <div className="pt-3 border-t border-slate-100 flex items-center justify-between gap-2">
                    <span className="text-[11px] text-slate-400">
                      Autor: <strong>{mat.authorName}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditMaterialForm(mat)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-slate-200 hover:border-[#0052FF] text-xs font-semibold text-slate-700 hover:text-[#0052FF] transition-colors cursor-pointer"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteMaterial(mat.id)}
                        className="inline-flex items-center gap-1 px-3 py-1.5 rounded-lg border border-red-200 hover:bg-red-50 text-xs font-semibold text-red-600 transition-colors cursor-pointer"
                      >
                        <Trash2 className="w-3.5 h-3.5" />
                        <span>Eliminar</span>
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};
