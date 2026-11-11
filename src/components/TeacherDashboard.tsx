import React, { useState, useMemo } from 'react';
import {
  BookOpenCheck,
  Users,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Eye,
  LogOut,
  Sparkles,
  BookOpen,
  Clock,
  Save,
  X,
  Upload,
  Paperclip,
  Download,
  Search,
  GraduationCap,
  Award,
  CheckCircle2,
} from 'lucide-react';
import {
  SectionType,
  StudyMaterial,
  TestAttemptRecord,
  UserRecord,
} from '../types/exam';
import { TeacherUser } from '../models/UserClasses';
import { SPRINTS_CATALOG } from '../data/sprintsCatalog';
import { KEY_ADMISSION_COHORTS } from '../data/cohortsCatalog';
import { KTestLogo } from './brand/KTestLogo';
import {
  TeacherDiagnosticIcon,
} from './brand/KTestIcons';
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
    attachmentName?: string | null;
    attachmentMime?: string | null;
    attachmentSize?: number | null;
    attachmentDataBase64?: string | null;
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
      attachmentName?: string | null;
      attachmentMime?: string | null;
      attachmentSize?: number | null;
      attachmentDataBase64?: string | null;
      removeAttachment?: boolean;
    }
  ) => Promise<void>;
  onDeleteMaterial: (id: string) => Promise<void>;
  onInspectAttempt: (attempt: TestAttemptRecord) => void;
  onLogout: () => void;
}

type TeacherTab = 'cross_results' | 'materials_crud';

const ALLOWED_FILE_EXTENSIONS =
  '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.gif,.svg,.csv,.txt';

function formatFileSize(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(2)} MB`;
}

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

  // Scalable Search & Multi-Criteria Filters for dozens/hundreds of students
  const [studentSearchQuery, setStudentSearchQuery] = useState<string>('');
  const [showAutocompleteDropdown, setShowAutocompleteDropdown] =
    useState<boolean>(false);
  const [selectedStudentId, setSelectedStudentId] = useState<string>('all');
  const [selectedCohort, setSelectedCohort] = useState<string>('all');
  const [selectedEvaluationFilter, setSelectedEvaluationFilter] =
    useState<string>('all');
  const [selectedPerformanceLevel, setSelectedPerformanceLevel] = useState<
    'all' | 'high' | 'medium' | 'low'
  >('all');

  // Study Material Form State (Create / Edit + File Upload)
  const [editingMaterialId, setEditingMaterialId] = useState<string | null>(null);
  const [showMaterialForm, setShowMaterialForm] = useState<boolean>(false);
  const [title, setTitle] = useState('');
  const [section, setSection] = useState<SectionType>('math');
  const [category, setCategory] = useState('Geometría y Volúmenes');
  const [summary, setSummary] = useState('');
  const [content, setContent] = useState('');
  const [readingTimeMinutes, setReadingTimeMinutes] = useState<number>(6);

  // Attachment state
  const [attachmentName, setAttachmentName] = useState<string | null>(null);
  const [attachmentMime, setAttachmentMime] = useState<string | null>(null);
  const [attachmentSize, setAttachmentSize] = useState<number | null>(null);
  const [attachmentDataBase64, setAttachmentDataBase64] = useState<string | null>(
    null
  );
  const [, setExistingAttachmentUrl] = useState<string | null>(
    null
  );
  const [removeAttachment, setRemoveAttachment] = useState<boolean>(false);
  const [fileError, setFileError] = useState<string | null>(null);

  const [savingMaterial, setSavingMaterial] = useState(false);

  const students = useMemo(
    () => users.filter((u) => u.role === 'student'),
    [users]
  );

  const studentByIdMap = useMemo(() => {
    const map = new Map<string, UserRecord>();
    students.forEach((s) => map.set(s.id, s));
    return map;
  }, [students]);

  // All available cohorts (official Key Institute cohorts + any custom cohort present in DB)
  const availableCohorts = useMemo(() => {
    const officialLabels = [...KEY_ADMISSION_COHORTS];
    const dbCohorts = students
      .map((s) => s.cohort)
      .filter((c): c is string => Boolean(c && !officialLabels.includes(c)));
    return Array.from(new Set([...officialLabels, ...dbCohorts]));
  }, [students]);

  // Autocomplete matching students when typing in the search bar
  const matchingStudentsForAutocomplete = useMemo(() => {
    const q = studentSearchQuery.trim().toLowerCase();
    return students.filter((s) => {
      if (selectedCohort !== 'all' && s.cohort !== selectedCohort) return false;
      if (!q) return true;
      return (
        s.name.toLowerCase().includes(q) ||
        s.email.toLowerCase().includes(q) ||
        s.cohort.toLowerCase().includes(q)
      );
    });
  }, [students, studentSearchQuery, selectedCohort]);

  // Currently selected student object for the Expandable Student Profile Card ("Ficha Desplegable")
  const selectedStudentRecord =
    selectedStudentId !== 'all'
      ? studentByIdMap.get(selectedStudentId) ?? null
      : null;

  // Filtered cross-referenced attempts across all criteria
  const filteredAttempts = useMemo(() => {
    const q = studentSearchQuery.trim().toLowerCase();

    return attempts.filter((att) => {
      const stu = studentByIdMap.get(att.userId);
      const stuCohort = stu?.cohort || att.userCohort || '';

      // 1. Specific selected student filter
      if (selectedStudentId !== 'all' && att.userId !== selectedStudentId) {
        return false;
      }

      // 2. Free-text search query filter (when no single student is locked in, or matching name/email/cohort)
      if (selectedStudentId === 'all' && q) {
        const matchesText =
          att.userName.toLowerCase().includes(q) ||
          att.userEmail.toLowerCase().includes(q) ||
          stuCohort.toLowerCase().includes(q) ||
          att.modeTitle.toLowerCase().includes(q);
        if (!matchesText) return false;
      }

      // 3. Admission Cohort filter
      if (selectedCohort !== 'all' && stuCohort !== selectedCohort) {
        return false;
      }

      // 4. Evaluation / Specific Sprint filter
      if (selectedEvaluationFilter !== 'all') {
        if (selectedEvaluationFilter === 'simulacro') {
          if (att.mode !== 'simulacro') return false;
        } else if (selectedEvaluationFilter === 'sprint_reading') {
          if (att.mode !== 'sprint_reading') return false;
        } else if (selectedEvaluationFilter === 'sprint_math') {
          if (att.mode !== 'sprint_math') return false;
        } else if (selectedEvaluationFilter.startsWith('code:')) {
          const sprintCode = selectedEvaluationFilter.replace('code:', '');
          if (!att.modeTitle.startsWith(sprintCode)) return false;
        }
      }

      // 5. Performance level filter
      if (selectedPerformanceLevel === 'high' && att.percentage < 85) {
        return false;
      }
      if (
        selectedPerformanceLevel === 'medium' &&
        (att.percentage < 60 || att.percentage >= 85)
      ) {
        return false;
      }
      if (selectedPerformanceLevel === 'low' && att.percentage >= 60) {
        return false;
      }

      return true;
    });
  }, [
    attempts,
    studentByIdMap,
    selectedStudentId,
    studentSearchQuery,
    selectedCohort,
    selectedEvaluationFilter,
    selectedPerformanceLevel,
  ]);

  const globalAvgPercentage =
    attempts.length > 0
      ? Math.round(
          attempts.reduce((sum, a) => sum + a.percentage, 0) / attempts.length
        )
      : 0;

  const simulacrosCount = attempts.filter((a) => a.mode === 'simulacro').length;
  const sprintsCount = attempts.filter((a) => a.mode !== 'simulacro').length;

  const resetAttachmentState = () => {
    setAttachmentName(null);
    setAttachmentMime(null);
    setAttachmentSize(null);
    setAttachmentDataBase64(null);
    setExistingAttachmentUrl(null);
    setRemoveAttachment(false);
    setFileError(null);
  };

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
    resetAttachmentState();
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
    setAttachmentName(mat.attachmentName ?? null);
    setAttachmentMime(mat.attachmentMime ?? null);
    setAttachmentSize(mat.attachmentSize ?? null);
    setAttachmentDataBase64(null);
    setExistingAttachmentUrl(mat.attachmentUrl ?? null);
    setRemoveAttachment(false);
    setFileError(null);
    setShowMaterialForm(true);
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setFileError(null);
    const file = e.target.files?.[0];
    if (!file) return;

    // Limit to 15 MB per file
    if (file.size > 15 * 1024 * 1024) {
      setFileError('El archivo supera el límite máximo permitido de 15 MB.');
      return;
    }

    const reader = new FileReader();
    reader.onload = () => {
      const result = typeof reader.result === 'string' ? reader.result : '';
      setAttachmentName(file.name);
      setAttachmentMime(file.type || 'application/octet-stream');
      setAttachmentSize(file.size);
      setAttachmentDataBase64(result);
      setRemoveAttachment(false);
    };
    reader.onerror = () => {
      setFileError('No se pudo leer el archivo seleccionado.');
    };
    reader.readAsDataURL(file);
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
          attachmentName,
          attachmentMime,
          attachmentSize,
          attachmentDataBase64,
          removeAttachment,
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
          attachmentName,
          attachmentMime,
          attachmentSize,
          attachmentDataBase64,
        });
      }
      setShowMaterialForm(false);
      setEditingMaterialId(null);
      resetAttachmentState();
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
            <KTestLogo theme="dark" variant="full" />
            <div className="hidden md:block h-6 w-px bg-white/15" />
            <div className="hidden md:block min-w-0">
              <div className="flex items-center gap-2">
                <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-[10px] font-bold uppercase tracking-wider bg-[#00D2FF]/20 text-[#00D2FF] border border-[#00D2FF]/30">
                  <BookOpenCheck className="w-3 h-3" />
                  Panel Docente
                </span>
              </div>
              <div className="text-xs text-slate-300 truncate mt-0.5">
                {teacher.name} · <span className="text-slate-400">{teacher.cohort}</span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2.5">
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
                Cruza el desempeño de cada estudiante en Simulacros y Sprints, y publica Materiales de Estudio.
              </p>
            </div>

            <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 shrink-0">
              <div className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-2.5 text-center">
                <div className="text-[11px] text-slate-300">Estudiantes</div>
                <div className="font-display font-extrabold text-lg sm:text-xl font-mono-num text-white">
                  {students.length}
                </div>
              </div>
              <div className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-2.5 text-center">
                <div className="text-[11px] text-slate-300">Simulacros / Sprints</div>
                <div className="font-display font-extrabold text-lg sm:text-xl font-mono-num text-[#00D2FF]">
                  {simulacrosCount} / {sprintsCount}
                </div>
              </div>
              <div className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-2.5 text-center">
                <div className="text-[11px] text-slate-300">Precisión Global</div>
                <div className="font-display font-extrabold text-lg sm:text-xl font-mono-num text-emerald-400">
                  {globalAvgPercentage}%
                </div>
              </div>
              <div className="rounded-xl bg-white/6 border border-white/10 px-3.5 py-2.5 text-center">
                <div className="text-[11px] text-slate-300">Materiales DB</div>
                <div className="font-display font-extrabold text-lg sm:text-xl font-mono-num text-white">
                  {materials.length}
                </div>
              </div>
            </div>
          </div>

          {/* Symmetrical 2-Column Teacher Navigation Tabs */}
          <div className="relative z-10 mt-6 pt-5 border-t border-white/10 grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              onClick={() => setActiveTab('cross_results')}
              className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTab === 'cross_results'
                  ? 'bg-[#0052FF] border-[#00D2FF]/50 text-white shadow-md shadow-[#0052FF]/30'
                  : 'bg-white/6 border-white/10 text-slate-200 hover:bg-white/12'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeTab === 'cross_results'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-[#00D2FF]'
                  }`}
                >
                  <BarChart3 className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm">
                    Cruce de Estudiantes × Resultados
                  </div>
                  <div
                    className={`text-[11px] ${
                      activeTab === 'cross_results' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    Matriz de desempeño en Simulacros y Sprints
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-white/15 font-mono-num text-xs font-bold">
                {attempts.length}
              </span>
            </button>

            <button
              type="button"
              onClick={() => setActiveTab('materials_crud')}
              className={`p-3.5 rounded-xl border text-left flex items-center justify-between gap-3 transition-all cursor-pointer ${
                activeTab === 'materials_crud'
                  ? 'bg-[#0052FF] border-[#00D2FF]/50 text-white shadow-md shadow-[#0052FF]/30'
                  : 'bg-white/6 border-white/10 text-slate-200 hover:bg-white/12'
              }`}
            >
              <div className="flex items-center gap-3">
                <div
                  className={`w-10 h-10 rounded-lg flex items-center justify-center ${
                    activeTab === 'materials_crud'
                      ? 'bg-white/20 text-white'
                      : 'bg-white/10 text-[#00D2FF]'
                  }`}
                >
                  <BookOpen className="w-5 h-5" />
                </div>
                <div>
                  <div className="font-display font-bold text-sm">
                    Gestión de Materiales y Archivos
                  </div>
                  <div
                    className={`text-[11px] ${
                      activeTab === 'materials_crud' ? 'text-blue-100' : 'text-slate-400'
                    }`}
                  >
                    Subir PDF, Word, PPT, Excel, Imágenes y LaTeX
                  </div>
                </div>
              </div>
              <span className="px-2.5 py-0.5 rounded-md bg-white/15 font-mono-num text-xs font-bold">
                {materials.length}
              </span>
            </button>
          </div>
        </section>

        {/* TAB 1: CRUCE ESCALABLE DE ESTUDIANTES X RESULTADOS */}
        {activeTab === 'cross_results' && (
          <div className="space-y-6">
            {/* Search & Multi-Criteria Filter Bar (Designed for dozens/hundreds of students) */}
            <div className="bg-white rounded-2xl border border-slate-200 p-4 sm:p-6 shadow-2xs space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center shrink-0">
                    <TeacherDiagnosticIcon size={24} />
                  </div>
                  <div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-[#0A1128]">
                      Diagnóstico del Profesor · Buscador y Filtros de Evaluaciones
                    </h2>
                    <p className="text-xs text-slate-500">
                      Busca un alumno específico para desplegar su ficha académica o filtra la matriz por Cohorte de Admisión, Sprint específico o Nivel de Desempeño.
                    </p>
                  </div>
                </div>

                {(selectedStudentId !== 'all' ||
                  studentSearchQuery.trim() !== '' ||
                  selectedCohort !== 'all' ||
                  selectedEvaluationFilter !== 'all' ||
                  selectedPerformanceLevel !== 'all') && (
                  <button
                    type="button"
                    onClick={() => {
                      setSelectedStudentId('all');
                      setStudentSearchQuery('');
                      setSelectedCohort('all');
                      setSelectedEvaluationFilter('all');
                      setSelectedPerformanceLevel('all');
                    }}
                    className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0052FF] transition-colors cursor-pointer self-start sm:self-auto shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Limpiar todos los filtros</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* 1. Autocomplete Student Search Bar */}
                <div className="md:col-span-5 relative">
                  <label className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Buscar Estudiante ({students.length} registrados)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-slate-400 absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
                    <input
                      type="text"
                      value={studentSearchQuery}
                      onFocus={() => setShowAutocompleteDropdown(true)}
                      onBlur={() => {
                        setTimeout(() => setShowAutocompleteDropdown(false), 180);
                      }}
                      onChange={(e) => {
                        setStudentSearchQuery(e.target.value);
                        if (selectedStudentId !== 'all') {
                          setSelectedStudentId('all');
                        }
                        setShowAutocompleteDropdown(true);
                      }}
                      placeholder="Escribe nombre, correo o cohorte del estudiante..."
                      className="w-full pl-9 pr-8 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm text-[#0A1128] focus:outline-none focus:border-[#0052FF]"
                    />
                    {(studentSearchQuery || selectedStudentId !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setStudentSearchQuery('');
                          setSelectedStudentId('all');
                        }}
                        aria-label="Limpiar búsqueda de estudiante"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-slate-400 hover:text-slate-700 cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown Suggestions */}
                  {showAutocompleteDropdown && (
                    <div className="absolute z-30 left-0 right-0 mt-1.5 bg-white rounded-xl border border-slate-200 shadow-xl max-h-64 overflow-y-auto divide-y divide-slate-100">
                      <button
                        type="button"
                        onMouseDown={() => {
                          setSelectedStudentId('all');
                          setStudentSearchQuery('');
                          setShowAutocompleteDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-slate-50 cursor-pointer ${
                          selectedStudentId === 'all'
                            ? 'bg-[#0052FF]/5 font-bold text-[#0052FF]'
                            : 'text-slate-700'
                        }`}
                      >
                        <span>Ver todos los estudiantes ({students.length})</span>
                        <span className="text-[11px] font-mono-num text-slate-400">
                          {attempts.length} pruebas
                        </span>
                      </button>

                      {matchingStudentsForAutocomplete.length === 0 ? (
                        <div className="px-3.5 py-3 text-xs text-slate-400 text-center">
                          No hay estudiantes que coincidan con "{studentSearchQuery}"
                        </div>
                      ) : (
                        matchingStudentsForAutocomplete.map((stu) => {
                          const stuCount = attempts.filter(
                            (a) => a.userId === stu.id
                          ).length;
                          const isSelected = selectedStudentId === stu.id;
                          return (
                            <button
                              key={stu.id}
                              type="button"
                              onMouseDown={() => {
                                setSelectedStudentId(stu.id);
                                setStudentSearchQuery(stu.name);
                                setShowAutocompleteDropdown(false);
                              }}
                              className={`w-full text-left px-3.5 py-2.5 hover:bg-slate-50 transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                isSelected ? 'bg-[#0052FF]/8' : ''
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-[#0A1128] truncate">
                                  {stu.name}
                                </div>
                                <div className="text-[11px] text-slate-500 truncate">
                                  {stu.email} ·{' '}
                                  <span className="text-[#0052FF] font-medium">
                                    {stu.cohort}
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 rounded bg-slate-100 text-[#0A1128] font-mono-num text-[11px] font-semibold shrink-0">
                                {stuCount} {stuCount === 1 ? 'prueba' : 'pruebas'}
                              </span>
                            </button>
                          );
                        })
                      )}
                    </div>
                  )}
                </div>

                {/* 2. Filter by Admission Cohort */}
                <div className="md:col-span-3">
                  <label htmlFor="docente-filtro-cohorte" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Cohorte de Admisión
                  </label>
                  <select
                    id="docente-filtro-cohorte"
                    value={selectedCohort}
                    onChange={(e) => setSelectedCohort(e.target.value)}
                    aria-label="Filtrar por cohorte de admisión"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-[#0A1128] focus:outline-none focus:border-[#0052FF]"
                  >
                    <option value="all">Todas las cohortes ({availableCohorts.length})</option>
                    {availableCohorts.map((cohortName) => (
                      <option key={cohortName} value={cohortName}>
                        {cohortName}
                      </option>
                    ))}
                  </select>
                </div>

                {/* 3. Filter by Test Mode or Specific Sprint */}
                <div className="md:col-span-2">
                  <label htmlFor="docente-filtro-evaluacion" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Prueba / Sprint Realizado
                  </label>
                  <select
                    id="docente-filtro-evaluacion"
                    value={selectedEvaluationFilter}
                    onChange={(e) => setSelectedEvaluationFilter(e.target.value)}
                    aria-label="Filtrar por prueba o sprint específico"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-[#0A1128] focus:outline-none focus:border-[#0052FF]"
                  >
                    <option value="all">Todas las evaluaciones</option>
                    <option value="simulacro">Simulacro Completo PAA</option>
                    <option value="sprint_reading">Todos Sprints Lectura</option>
                    <option value="sprint_math">Todos Sprints Matemáticas</option>
                    <optgroup label="Sprints Específicos">
                      {SPRINTS_CATALOG.map((sp) => (
                        <option key={sp.id} value={`code:${sp.code}`}>
                          {sp.code} — {sp.title}
                        </option>
                      ))}
                    </optgroup>
                  </select>
                </div>

                {/* 4. Filter by Performance Level */}
                <div className="md:col-span-2">
                  <label htmlFor="docente-filtro-desempeno" className="block text-[11px] font-bold uppercase tracking-wider text-slate-500 mb-1">
                    Nivel de Desempeño
                  </label>
                  <select
                    id="docente-filtro-desempeno"
                    value={selectedPerformanceLevel}
                    onChange={(e) =>
                      setSelectedPerformanceLevel(
                        e.target.value as 'all' | 'high' | 'medium' | 'low'
                      )
                    }
                    aria-label="Filtrar por nivel de desempeño"
                    className="w-full px-3 py-2 rounded-xl border border-slate-300 bg-white text-xs sm:text-sm font-semibold text-[#0A1128] focus:outline-none focus:border-[#0052FF]"
                  >
                    <option value="all">Todos los niveles</option>
                    <option value="high">Sobresaliente (≥ 85%)</option>
                    <option value="medium">En progreso (60% – 84%)</option>
                    <option value="low">Requiere refuerzo (&lt; 60%)</option>
                  </select>
                </div>
              </div>
            </div>

            {/* Expandable Student Profile Card ("Ficha Desplegable del Estudiante") - ONLY shown when a student is selected */}
            {selectedStudentRecord && (() => {
              const stuAttempts = attempts.filter(
                (a) => a.userId === selectedStudentRecord.id
              );
              const stuSimulacros = stuAttempts.filter(
                (a) => a.mode === 'simulacro'
              );
              const stuSprints = stuAttempts.filter(
                (a) => a.mode !== 'simulacro'
              );
              const stuAvgAccuracy =
                stuAttempts.length > 0
                  ? Math.round(
                      stuAttempts.reduce((acc, a) => acc + a.percentage, 0) /
                        stuAttempts.length
                    )
                  : 0;
              const bestSimulacroScore =
                stuSimulacros.length > 0
                  ? Math.max(...stuSimulacros.map((s) => s.scaledScore))
                  : null;

              const readingAttempts = stuAttempts.filter((a) => a.readingTotal > 0);
              const readingAvgPct =
                readingAttempts.length > 0
                  ? Math.round(
                      readingAttempts.reduce(
                        (acc, a) => acc + (a.readingCorrect / a.readingTotal) * 100,
                        0
                      ) / readingAttempts.length
                    )
                  : null;

              const mathAttempts = stuAttempts.filter((a) => a.mathTotal > 0);
              const mathAvgPct =
                mathAttempts.length > 0
                  ? Math.round(
                      mathAttempts.reduce(
                        (acc, a) => acc + (a.mathCorrect / a.mathTotal) * 100,
                        0
                      ) / mathAttempts.length
                    )
                  : null;

              return (
                <div className="rounded-2xl bg-white border-2 border-[#0052FF] p-5 sm:p-6 shadow-md relative overflow-hidden">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b border-slate-200">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 rounded-2xl bg-[#0A1128] text-[#00D2FF] flex items-center justify-center font-display font-extrabold text-lg shrink-0">
                        {selectedStudentRecord.name
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 rounded bg-[#0052FF]/10 text-[#0052FF] text-[10px] font-extrabold uppercase tracking-wider">
                            Ficha Individual del Estudiante
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-slate-100 text-[#0A1128] text-xs font-semibold">
                            <GraduationCap className="w-3.5 h-3.5 text-[#0052FF]" />
                            {selectedStudentRecord.cohort}
                          </span>
                        </div>
                        <h3 className="font-display text-lg sm:text-xl font-extrabold text-[#0A1128] mt-1">
                          {selectedStudentRecord.name}
                        </h3>
                        <p className="text-xs text-slate-500">
                          {selectedStudentRecord.email}
                        </p>
                      </div>
                    </div>

                    <button
                      type="button"
                      onClick={() => {
                        setSelectedStudentId('all');
                        setStudentSearchQuery('');
                      }}
                      className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-slate-100 hover:bg-slate-200 text-xs font-bold text-[#0A1128] transition-colors cursor-pointer self-start lg:self-center"
                    >
                      <X className="w-4 h-4" />
                      <span>Cerrar ficha individual</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[11px] text-slate-500">Total Evaluaciones</div>
                      <div className="font-display font-extrabold text-lg font-mono-num text-[#0A1128]">
                        {stuAttempts.length}{' '}
                        <span className="text-xs font-normal text-slate-500">
                          ({stuSimulacros.length} Sim / {stuSprints.length} Spr)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[11px] text-slate-500">Precisión General</div>
                      <div className="font-display font-extrabold text-lg font-mono-num text-[#0052FF]">
                        {stuAvgAccuracy}%
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[11px] text-slate-500">Dominio Lectura</div>
                      <div className="font-display font-extrabold text-lg font-mono-num text-[#0A1128]">
                        {readingAvgPct !== null ? `${readingAvgPct}%` : '—'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-slate-50 border border-slate-200/80">
                      <div className="text-[11px] text-slate-500">Dominio Matemáticas</div>
                      <div className="font-display font-extrabold text-lg font-mono-num text-[#0A1128]">
                        {mathAvgPct !== null ? `${mathAvgPct}%` : '—'}
                      </div>
                    </div>

                    <div className="p-3 rounded-xl bg-[#0A1128] text-white col-span-2 sm:col-span-1">
                      <div className="text-[11px] text-slate-300 flex items-center gap-1">
                        <Award className="w-3.5 h-3.5 text-[#00D2FF]" />
                        Mejor Simulacro
                      </div>
                      <div className="font-display font-extrabold text-lg font-mono-num text-[#00D2FF]">
                        {bestSimulacroScore ? `${bestSimulacroScore} pts` : 'Sin simulacro'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Detailed Cross-Reference Table (Student x Cohort x Test/Sprint x Section Scores) */}
            <div className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden">
              <div className="p-4 sm:p-5 bg-slate-50 border-b border-slate-200 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-base text-[#0A1128] flex items-center gap-2">
                    <Users className="w-4 h-4 text-[#0052FF]" />
                    Matriz de Resultados Filtrados ({filteredAttempts.length}{' '}
                    {filteredAttempts.length === 1 ? 'registro' : 'registros'})
                  </h3>
                  
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-slate-600">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-lg bg-white border border-slate-200 font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-emerald-600" />
                    Mostrando {filteredAttempts.length} de {attempts.length} intentos totales
                  </span>
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
                        <th className="py-3 px-4">Estudiante / Cohorte</th>
                        <th className="py-3 px-4">Evaluación / Sprint</th>
                        <th className="py-3 px-4 text-center">Lectura</th>
                        <th className="py-3 px-4 text-center">Matemáticas</th>
                        <th className="py-3 px-4 text-center">Precisión / Escala</th>
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-slate-200/80">
                      {filteredAttempts.map((att) => {
                        const stu = studentByIdMap.get(att.userId);
                        const cohortLabel =
                          stu?.cohort || att.userCohort || 'Cohorte General';
                        const isThisStudentSelected =
                          selectedStudentId === att.userId;

                        return (
                          <tr
                            key={att.id}
                            className={`hover:bg-slate-50/80 transition-colors ${
                              isThisStudentSelected ? 'bg-[#0052FF]/4' : ''
                            }`}
                          >
                            <td className="py-3.5 px-4">
                              <button
                                type="button"
                                onClick={() => {
                                  if (isThisStudentSelected) {
                                    setSelectedStudentId('all');
                                    setStudentSearchQuery('');
                                  } else {
                                    setSelectedStudentId(att.userId);
                                    setStudentSearchQuery(att.userName);
                                  }
                                }}
                                className="text-left group cursor-pointer"
                              >
                                <div className="font-bold text-[#0A1128] group-hover:text-[#0052FF] transition-colors flex items-center gap-1.5">
                                  <span>{att.userName}</span>
                                  <span className="text-[10px] font-semibold text-[#0052FF] opacity-0 group-hover:opacity-100 transition-opacity">
                                    (Ver ficha)
                                  </span>
                                </div>
                                <div className="text-[11px] text-slate-500">
                                  {att.userEmail}
                                </div>
                                <div className="inline-block mt-1 px-2 py-0.5 rounded bg-slate-100 text-slate-700 text-[10px] font-semibold">
                                  {cohortLabel}
                                </div>
                              </button>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider mb-0.5 ${
                                  att.mode === 'simulacro'
                                    ? 'bg-[#0052FF]/12 text-[#0052FF]'
                                    : 'bg-amber-500/15 text-amber-800'
                                }`}
                              >
                                {att.mode === 'simulacro'
                                  ? 'Simulacro Completo'
                                  : 'Sprint Corto'}
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
                              <span
                                className={`inline-block px-2 py-0.5 rounded font-extrabold ${
                                  att.percentage >= 85
                                    ? 'bg-emerald-50 text-emerald-700'
                                    : att.percentage >= 60
                                    ? 'bg-blue-50 text-[#0052FF]'
                                    : 'bg-amber-50 text-amber-700'
                                }`}
                              >
                                {att.percentage}%
                              </span>
                              <div className="text-[11px] text-slate-500 mt-0.5">
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
                        );
                      })}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          </div>
        )}

        {/* TAB 2: GESTIÓN DE MATERIALES DE ESTUDIO Y ARCHIVOS ADJUNTOS EN BASE DE DATOS */}
        {activeTab === 'materials_crud' && (
          <div className="space-y-6">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
              <div>
                <h2 className="font-display text-lg font-bold text-[#0A1128]">
                  Repositorio de Materiales de Estudio y Archivos en SQLite
                </h2>
                <p className="text-xs text-slate-500">
                  Sube documentos adjuntos (PDF, DOCX, PPTX, XLSX, PNG, JPG) junto con notas en LaTeX para todos los estudiantes.
                </p>
              </div>

              {!showMaterialForm && (
                <button
                  type="button"
                  onClick={openNewMaterialForm}
                  className="inline-flex items-center gap-2 px-4 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0052FF]/25 cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  <span>Nuevo Material / Subir Archivo</span>
                </button>
              )}
            </div>

            {showMaterialForm && (
              <form
                onSubmit={handleSaveMaterial}
                className="bg-white rounded-2xl border-2 border-[#0052FF]/30 p-5 sm:p-6 shadow-md space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-200 pb-3">
                  <h3 className="font-display font-bold text-base text-[#0A1128]">
                    {editingMaterialId
                      ? 'Editar Material de Estudio y Archivo Adjunto'
                      : 'Publicar Nuevo Material de Estudio y Archivo Adjunto'}
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
                    <label htmlFor="material-titulo" className="block text-xs font-semibold text-slate-700 mb-1">
                      Título del Material
                    </label>
                    <input
                      id="material-titulo"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej. Formulario Oficial y Ejercicios de Geometría Analítica"
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0052FF]"
                    />
                  </div>

                  <div>
                    <label htmlFor="material-seccion" className="block text-xs font-semibold text-slate-700 mb-1">
                      Sección PAA
                    </label>
                    <select
                      id="material-seccion"
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
                    <label htmlFor="material-categoria" className="block text-xs font-semibold text-slate-700 mb-1">
                      Categoría / Tema
                    </label>
                    <input
                      id="material-categoria"
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0052FF]"
                    />
                  </div>

                  <div>
                    <label htmlFor="material-minutos" className="block text-xs font-semibold text-slate-700 mb-1">
                      Tiempo estimado de estudio (minutos)
                    </label>
                    <input
                      id="material-minutos"
                      type="number"
                      min={1}
                      max={120}
                      required
                      value={readingTimeMinutes}
                      onChange={(e) => setReadingTimeMinutes(Number(e.target.value))}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0052FF]"
                    />
                  </div>

                  <div>
                    <label htmlFor="material-autor" className="block text-xs font-semibold text-slate-700 mb-1">
                      Autor Registrado
                    </label>
                    <input
                      id="material-autor"
                      type="text"
                      disabled
                      value={teacher.name}
                      className="w-full px-3.5 py-2 rounded-xl border border-slate-200 bg-slate-100 text-slate-600 text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="material-resumen" className="block text-xs font-semibold text-slate-700 mb-1">
                    Resumen Ejecutivo
                  </label>
                  <input
                    id="material-resumen"
                    type="text"
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Breve descripción del documento o guía de estudio..."
                    className="w-full px-3.5 py-2 rounded-xl border border-slate-300 text-sm focus:outline-none focus:border-[#0052FF]"
                  />
                </div>

                {/* File Upload Zone (PDF, DOCX, PPTX, XLSX, PNG, JPG, etc.) */}
                <div className="p-4 rounded-xl bg-slate-50 border-2 border-dashed border-slate-300 space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-[#0A1128] flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-[#0052FF]" />
                        Adjuntar Archivo de Estudio (Opcional)
                      </div>
                      <p className="text-[11px] text-slate-500">
                        Formatos soportados: <strong>PDF, DOCX, PPTX, XLSX, PNG, JPG, WEBP, CSV, TXT</strong> (hasta 15 MB).
                      </p>
                    </div>

                    <label className="inline-flex items-center justify-center gap-1.5 px-3.5 py-2 rounded-lg bg-[#0A1128] hover:bg-slate-800 text-white text-xs font-bold cursor-pointer shrink-0">
                      <Paperclip className="w-3.5 h-3.5 text-[#00D2FF]" />
                      <span>Seleccionar archivo</span>
                      <input
                        type="file"
                        accept={ALLOWED_FILE_EXTENSIONS}
                        onChange={handleFileChange}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {fileError && (
                    <div className="text-xs text-red-600 font-semibold">{fileError}</div>
                  )}

                  {attachmentName && !removeAttachment && (
                    <div className="flex items-center justify-between gap-3 p-2.5 rounded-lg bg-white border border-slate-200">
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="w-4 h-4 text-[#0052FF] shrink-0" />
                        <span className="text-xs font-bold text-[#0A1128] truncate">
                          {attachmentName}
                        </span>
                        {attachmentSize && (
                          <span className="text-[11px] font-mono-num text-slate-500 shrink-0">
                            ({formatFileSize(attachmentSize)})
                          </span>
                        )}
                        {attachmentDataBase64 && (
                          <span className="px-2 py-0.5 rounded bg-emerald-100 text-emerald-800 text-[10px] font-bold">
                            Listo para subir
                          </span>
                        )}
                      </div>

                      <button
                        type="button"
                        onClick={() => {
                          setAttachmentName(null);
                          setAttachmentDataBase64(null);
                          setRemoveAttachment(true);
                        }}
                        className="text-xs font-semibold text-red-600 hover:underline shrink-0 cursor-pointer"
                      >
                        Quitar archivo
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="material-notas" className="block text-xs font-semibold text-slate-700 mb-1">
                      Notas / Contenido Explicativo (Soporta LaTeX <code>$...$</code> y <code>$$...$$</code>)
                    </label>
                    <textarea
                      id="material-notas"
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

                    {mat.attachmentUrl && mat.attachmentName && (
                      <div className="mb-3 p-2.5 rounded-xl bg-[#0052FF]/6 border border-[#0052FF]/20 flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="w-4 h-4 text-[#0052FF] shrink-0" />
                          <span className="text-xs font-bold text-[#0A1128] truncate">
                            {mat.attachmentName}
                          </span>
                          {mat.attachmentSize && (
                            <span className="text-[10px] font-mono-num text-slate-500 shrink-0">
                              ({formatFileSize(mat.attachmentSize)})
                            </span>
                          )}
                        </div>
                        <a
                          href={mat.attachmentUrl}
                          download={mat.attachmentName}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-[#0052FF] hover:underline shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descargar</span>
                        </a>
                      </div>
                    )}

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
                        <span>Editar / Archivo</span>
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
