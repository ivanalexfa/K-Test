import React, { useState, useMemo } from 'react';
import {
  Users,
  BarChart3,
  Plus,
  Pencil,
  Trash2,
  Eye,
  LogOut,
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
import { LogoKey } from './brand/LogoKey';
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

/** «Dr. Roberto Méndez» → «Dr. Roberto»; «Ana López» → «Ana». */
const saludo = (nombre: string) => {
  const partes = nombre.split(' ');
  return partes[0].endsWith('.') ? partes.slice(0, 2).join(' ') : partes[0];
};

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
    <div className="min-h-dvh flex flex-col bg-key-blanco text-key-tinta">
      {/* Encabezado del docente: blanco y fijo, como el del estudiante (ADR docente/0001) */}
      <header className="sticky top-0 z-30 bg-key-blanco border-b-[0.8px] border-key-negro">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 h-16 lg:h-20 flex items-center justify-between gap-4">
          <div className="flex items-center gap-4 min-w-0 max-[379px]:[&_img]:h-7">
            <span className="hidden md:inline-flex">
              <LogoKey theme="light" variant="full" />
            </span>
            <span className="md:hidden inline-flex">
              <LogoKey theme="light" variant="mark-only" />
            </span>
          </div>

          <div className="flex items-center gap-4 min-w-0">
            <div className="hidden md:block text-right min-w-0">
              <p className="text-sm font-semibold text-key-tinta truncate max-w-[240px]">{teacher.name}</p>
              <p className="text-xs text-key-texto-suave truncate max-w-[240px]">Docente</p>
            </div>
            <button
              type="button"
              onClick={onLogout}
              className="inline-flex items-center gap-2 h-10 px-4 rounded-full border-[0.8px] border-key-negro text-sm font-semibold text-key-tinta hover:bg-key-gris-claro transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
            >
              <LogOut aria-hidden="true" className="h-4 w-4" />
              Salir
            </button>
          </div>
        </div>
      </header>

      <main className="flex-1 max-w-7xl w-full mx-auto px-4 sm:px-6 py-6 sm:py-8 space-y-6">
        <div>
          <h1 className="font-display text-3xl sm:text-4xl font-bold text-key-tinta text-balance">
            Hola, {saludo(teacher.name)}
          </h1>
          <p className="mt-1 text-key-texto-suave">
            Revisa cómo van tus estudiantes en simulacros y sprints, y publica material de estudio.
          </p>
        </div>

        {/* Datos y menú de celdas: un marco con líneas finas */}
        <section aria-label="Resumen" className="border-[0.8px] border-key-negro">
          <dl className="grid grid-cols-2 lg:grid-cols-4 [&>div]:px-5 [&>div]:py-4 [&>div]:border-key-negro">
            <div className="border-r-[0.8px] border-b-[0.8px] lg:border-b-0">
              <dt className="text-sm text-key-texto-suave">Estudiantes</dt>
              <dd className="font-mono-num text-2xl font-semibold mt-1">{students.length}</dd>
            </div>
            <div className="border-b-[0.8px] lg:border-b-0 lg:border-r-[0.8px]">
              <dt className="text-sm text-key-texto-suave">Simulacros / sprints</dt>
              <dd className="font-mono-num text-2xl font-semibold mt-1">
                {simulacrosCount} / {sprintsCount}
              </dd>
            </div>
            <div className="border-r-[0.8px]">
              <dt className="text-sm text-key-texto-suave">Precisión global</dt>
              <dd className="font-mono-num text-2xl font-semibold mt-1">{globalAvgPercentage}%</dd>
            </div>
            <div>
              <dt className="text-sm text-key-texto-suave">Materiales</dt>
              <dd className="font-mono-num text-2xl font-semibold mt-1">{materials.length}</dd>
            </div>
          </dl>

          <nav aria-label="Portal del docente" className="grid grid-cols-2 border-t-[0.8px] border-key-negro">
            {(
              [
                { id: 'cross_results', texto: 'Resultados', icono: BarChart3, cuenta: attempts.length },
                { id: 'materials_crud', texto: 'Material', icono: BookOpen, cuenta: materials.length },
              ] as const
            ).map(({ id, texto, icono: Icono, cuenta }) => {
              const activa = activeTab === id;
              return (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  aria-current={activa ? 'page' : undefined}
                  className={`h-12 px-4 flex items-center justify-center gap-2 text-sm sm:text-base cursor-pointer transition-colors first:border-r-[0.8px] border-key-negro focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul ${
                    activa ? 'bg-key-azul text-key-blanco font-semibold' : 'bg-key-blanco text-key-tinta hover:bg-key-gris-claro'
                  }`}
                >
                  <Icono aria-hidden="true" className="w-4 h-4" />
                  {texto}
                  <span className="font-mono-num text-sm">({cuenta})</span>
                </button>
              );
            })}
          </nav>
        </section>

        {/* TAB 1: CRUCE ESCALABLE DE ESTUDIANTES X RESULTADOS */}
        {activeTab === 'cross_results' && (
          <div className="space-y-6">
            {/* Search & Multi-Criteria Filter Bar (Designed for dozens/hundreds of students) */}
            <div className="bg-key-blanco border-[0.8px] border-key-negro p-4 sm:p-6 space-y-4">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="flex items-center gap-3">
                  <div className="shrink-0" aria-hidden="true">
                    <TeacherDiagnosticIcon size={24} />
                  </div>
                  <div>
                    <h2 className="font-display text-base sm:text-lg font-bold text-key-tinta">
                      Buscar y filtrar resultados
                    </h2>
                    <p className="text-sm text-key-texto-suave">
                      Busca a un estudiante para ver su ficha, o filtra por ciclo, prueba o nivel de desempeño.
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
                    className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-sm font-semibold text-key-tinta transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul self-start sm:self-auto shrink-0"
                  >
                    <X className="w-3.5 h-3.5" />
                    <span>Limpiar filtros</span>
                  </button>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-12 gap-3">
                {/* 1. Autocomplete Student Search Bar */}
                <div className="md:col-span-5 relative">
                  <label className="block text-sm font-medium text-key-tinta mb-1">
                    Buscar Estudiante ({students.length} registrados)
                  </label>
                  <div className="relative">
                    <Search className="w-4 h-4 text-key-texto-suave absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none" />
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
                      className="w-full pl-9 pr-8 py-2 border-[0.8px] border-key-negro bg-key-blanco text-xs sm:text-sm text-key-tinta focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
                    />
                    {(studentSearchQuery || selectedStudentId !== 'all') && (
                      <button
                        type="button"
                        onClick={() => {
                          setStudentSearchQuery('');
                          setSelectedStudentId('all');
                        }}
                        aria-label="Limpiar búsqueda de estudiante"
                        className="absolute right-2.5 top-1/2 -translate-y-1/2 p-1 text-key-texto-suave hover:text-key-texto cursor-pointer"
                      >
                        <X className="w-3.5 h-3.5" />
                      </button>
                    )}
                  </div>

                  {/* Autocomplete Dropdown Suggestions */}
                  {showAutocompleteDropdown && (
                    <div className="absolute z-30 left-0 right-0 mt-1.5 bg-key-blanco border-[0.8px] border-key-negro max-h-64 overflow-y-auto divide-y divide-key-gris">
                      <button
                        type="button"
                        onMouseDown={() => {
                          setSelectedStudentId('all');
                          setStudentSearchQuery('');
                          setShowAutocompleteDropdown(false);
                        }}
                        className={`w-full text-left px-3.5 py-2.5 text-xs flex items-center justify-between hover:bg-key-gris-claro cursor-pointer ${
                          selectedStudentId === 'all'
                            ? 'bg-key-gris-claro font-bold text-key-azul'
                            : 'text-key-texto'
                        }`}
                      >
                        <span>Ver todos los estudiantes ({students.length})</span>
                        <span className="text-xs font-mono-num text-key-texto-suave">
                          {attempts.length} pruebas
                        </span>
                      </button>

                      {matchingStudentsForAutocomplete.length === 0 ? (
                        <div className="px-3.5 py-3 text-xs text-key-texto-suave text-center">
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
                              className={`w-full text-left px-3.5 py-2.5 hover:bg-key-gris-claro transition-colors flex items-center justify-between gap-2 cursor-pointer ${
                                isSelected ? 'bg-key-gris-claro' : ''
                              }`}
                            >
                              <div className="min-w-0">
                                <div className="text-xs font-bold text-key-tinta truncate">
                                  {stu.name}
                                </div>
                                <div className="text-xs text-key-texto-suave truncate">
                                  {stu.email} ·{' '}
                                  <span className="text-key-azul font-medium">
                                    {stu.cohort}
                                  </span>
                                </div>
                              </div>
                              <span className="px-2 py-0.5 bg-key-gris text-key-tinta font-mono-num text-xs font-semibold shrink-0">
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
                  <label htmlFor="docente-filtro-cohorte" className="block text-sm font-medium text-key-tinta mb-1">
                    Cohorte de Admisión
                  </label>
                  <select
                    id="docente-filtro-cohorte"
                    value={selectedCohort}
                    onChange={(e) => setSelectedCohort(e.target.value)}
                    aria-label="Filtrar por cohorte de admisión"
                    className="w-full px-3 py-2 border-[0.8px] border-key-negro bg-key-blanco text-xs sm:text-sm font-semibold text-key-tinta focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
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
                  <label htmlFor="docente-filtro-evaluacion" className="block text-sm font-medium text-key-tinta mb-1">
                    Prueba / Sprint Realizado
                  </label>
                  <select
                    id="docente-filtro-evaluacion"
                    value={selectedEvaluationFilter}
                    onChange={(e) => setSelectedEvaluationFilter(e.target.value)}
                    aria-label="Filtrar por prueba o sprint específico"
                    className="w-full px-3 py-2 border-[0.8px] border-key-negro bg-key-blanco text-xs sm:text-sm font-semibold text-key-tinta focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
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
                  <label htmlFor="docente-filtro-desempeno" className="block text-sm font-medium text-key-tinta mb-1">
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
                    className="w-full px-3 py-2 border-[0.8px] border-key-negro bg-key-blanco text-xs sm:text-sm font-semibold text-key-tinta focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
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
                <div className="bg-key-blanco border-[0.8px] border-key-negro p-5 sm:p-6">
                  <div className="flex flex-col lg:flex-row lg:items-center justify-between gap-4 pb-4 border-b-[0.8px] border-key-negro">
                    <div className="flex items-start gap-3.5">
                      <div className="w-12 h-12 bg-key-azul text-key-blanco flex items-center justify-center font-bold text-lg shrink-0">
                        {selectedStudentRecord.name
                          .split(' ')
                          .slice(0, 2)
                          .map((n) => n[0])
                          .join('')}
                      </div>
                      <div>
                        <div className="flex flex-wrap items-center gap-2">
                          <span className="px-2 py-0.5 bg-key-gris-claro text-key-azul text-xs font-bold">
                            Ficha del estudiante
                          </span>
                          <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full bg-key-gris text-key-tinta text-xs font-semibold">
                            <GraduationCap className="w-3.5 h-3.5 text-key-azul" />
                            {selectedStudentRecord.cohort}
                          </span>
                        </div>
                        <h3 className="font-display text-lg sm:text-xl font-bold text-key-tinta mt-1">
                          {selectedStudentRecord.name}
                        </h3>
                        <p className="text-sm text-key-texto-suave">
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
                      className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-sm font-semibold text-key-tinta transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul self-start lg:self-center"
                    >
                      <X className="w-4 h-4" />
                      <span>Cerrar ficha</span>
                    </button>
                  </div>

                  <div className="grid grid-cols-2 sm:grid-cols-5 gap-3 pt-4">
                    <div className="p-3 border-[0.8px] border-key-negro">
                      <div className="text-xs text-key-texto-suave">Total Evaluaciones</div>
                      <div className="font-bold text-lg font-mono-num text-key-tinta">
                        {stuAttempts.length}{' '}
                        <span className="text-xs font-normal text-key-texto-suave">
                          ({stuSimulacros.length} Sim / {stuSprints.length} Spr)
                        </span>
                      </div>
                    </div>

                    <div className="p-3 border-[0.8px] border-key-negro">
                      <div className="text-xs text-key-texto-suave">Precisión General</div>
                      <div className="font-bold text-lg font-mono-num text-key-azul">
                        {stuAvgAccuracy}%
                      </div>
                    </div>

                    <div className="p-3 border-[0.8px] border-key-negro">
                      <div className="text-xs text-key-texto-suave">Dominio Lectura</div>
                      <div className="font-bold text-lg font-mono-num text-key-tinta">
                        {readingAvgPct !== null ? `${readingAvgPct}%` : '—'}
                      </div>
                    </div>

                    <div className="p-3 border-[0.8px] border-key-negro">
                      <div className="text-xs text-key-texto-suave">Dominio Matemáticas</div>
                      <div className="font-bold text-lg font-mono-num text-key-tinta">
                        {mathAvgPct !== null ? `${mathAvgPct}%` : '—'}
                      </div>
                    </div>

                    <div className="p-3 bg-key-azul text-key-blanco col-span-2 sm:col-span-1">
                      <div className="text-xs flex items-center gap-1">
                        <Award aria-hidden="true" className="w-3.5 h-3.5" />
                        Mejor simulacro
                      </div>
                      <div className="font-bold text-lg font-mono-num">
                        {bestSimulacroScore ? `${bestSimulacroScore} pts` : 'Sin simulacro'}
                      </div>
                    </div>
                  </div>
                </div>
              );
            })()}

            {/* Detailed Cross-Reference Table (Student x Cohort x Test/Sprint x Section Scores) */}
            <div className="bg-key-blanco border-[0.8px] border-key-negro overflow-hidden">
              <div className="p-4 sm:p-5 border-b-[0.8px] border-key-negro flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div>
                  <h3 className="font-display font-bold text-base text-key-tinta flex items-center gap-2">
                    <Users className="w-4 h-4 text-key-azul" />
                    Resultados ({filteredAttempts.length}{' '}
                    {filteredAttempts.length === 1 ? 'registro' : 'registros'})
                  </h3>
                  
                </div>

                <div className="flex flex-wrap items-center gap-2 text-xs text-key-texto-suave">
                  <span className="inline-flex items-center gap-1 px-2.5 py-1 bg-key-blanco border-[0.8px] border-key-negro font-medium">
                    <CheckCircle2 className="w-3.5 h-3.5 text-estado-exito" />
                    Mostrando {filteredAttempts.length} de {attempts.length} intentos totales
                  </span>
                </div>
              </div>

              {filteredAttempts.length === 0 ? (
                <div className="p-8 text-center text-sm text-key-texto-suave">
                  No se encontraron registros para los filtros seleccionados.
                </div>
              ) : (
                <div className="md:overflow-x-auto">
                  {/* En celular cada fila se apila como bloque (ADR marca/0003, regla 5) */}
                  <table className="w-full text-left border-collapse text-sm max-md:block max-md:[&_thead]:hidden max-md:[&_tbody]:block max-md:[&_tr]:block max-md:[&_tr]:py-2 max-md:[&_td]:block max-md:[&_td]:py-1.5 max-md:[&_td]:text-left">
                    <thead>
                      <tr className="border-b-[0.8px] border-key-negro text-sm text-key-tinta font-semibold">
                        <th className="py-3 px-4">Estudiante / Cohorte</th>
                        <th className="py-3 px-4">Evaluación / Sprint</th>
                        <th className="py-3 px-4 text-center">Lectura</th>
                        <th className="py-3 px-4 text-center">Matemáticas</th>
                        <th className="py-3 px-4 text-center">Precisión / Escala</th>
                        <th className="py-3 px-4">Fecha</th>
                        <th className="py-3 px-4 text-right">Acción</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-key-negro">
                      {filteredAttempts.map((att) => {
                        const stu = studentByIdMap.get(att.userId);
                        const cohortLabel =
                          stu?.cohort || att.userCohort || 'Cohorte General';
                        const isThisStudentSelected =
                          selectedStudentId === att.userId;

                        return (
                          <tr
                            key={att.id}
                            className={`hover:bg-key-gris-claro transition-colors ${
                              isThisStudentSelected ? 'bg-key-gris-claro' : ''
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
                                <div className="font-bold text-key-tinta group-hover:text-key-azul transition-colors flex items-center gap-1.5">
                                  <span>{att.userName}</span>
                                  <span className="text-xs font-semibold text-key-azul opacity-0 group-hover:opacity-100 transition-opacity">
                                    (Ver ficha)
                                  </span>
                                </div>
                                <div className="text-xs text-key-texto-suave">
                                  {att.userEmail}
                                </div>
                                <div className="inline-block mt-1 px-2 py-0.5 bg-key-gris text-key-texto text-xs font-semibold">
                                  {cohortLabel}
                                </div>
                              </button>
                            </td>
                            <td className="py-3.5 px-4">
                              <span
                                className={`inline-block px-2 py-0.5 text-xs font-bold mb-0.5 ${
                                  att.mode === 'simulacro'
                                    ? 'bg-key-gris-claro text-key-azul'
                                    : 'bg-estado-alerta-fondo text-estado-alerta'
                                }`}
                              >
                                {att.mode === 'simulacro'
                                  ? 'Simulacro Completo'
                                  : 'Sprint Corto'}
                              </span>
                              <div className="text-xs font-medium text-key-texto">
                                {att.modeTitle}
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono-num max-md:flex max-md:gap-2"><span className="md:hidden font-sans text-key-texto-suave">Lectura</span>
                              {att.readingTotal > 0 ? (
                                <span className="font-semibold text-key-tinta">
                                  {att.readingCorrect}/{att.readingTotal}
                                </span>
                              ) : (
                                <span className="text-key-texto-suave">—</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono-num max-md:flex max-md:gap-2"><span className="md:hidden font-sans text-key-texto-suave">Matemáticas</span>
                              {att.mathTotal > 0 ? (
                                <span className="font-semibold text-key-tinta">
                                  {att.mathCorrect}/{att.mathTotal}
                                </span>
                              ) : (
                                <span className="text-key-texto-suave">—</span>
                              )}
                            </td>
                            <td className="py-3.5 px-4 text-center font-mono-num max-md:flex max-md:items-center max-md:gap-2"><span className="md:hidden font-sans text-key-texto-suave">Precisión</span>
                              <span
                                className={`inline-block px-2 py-0.5 font-bold ${
                                  att.percentage >= 85
                                    ? 'bg-estado-exito-fondo text-estado-exito'
                                    : att.percentage >= 60
                                    ? 'bg-key-gris-claro text-key-azul'
                                    : 'bg-estado-alerta-fondo text-estado-alerta'
                                }`}
                              >
                                {att.percentage}%
                              </span>
                              <div className="text-xs text-key-texto-suave mt-0.5">
                                {att.scaledScore} pts
                              </div>
                            </td>
                            <td className="py-3.5 px-4 text-xs text-key-texto-suave">
                              {new Date(att.completedAt).toLocaleString('es-SV', {
                                dateStyle: 'short',
                                timeStyle: 'short',
                              })}
                            </td>
                            <td className="py-3.5 px-4 text-right">
                              <button
                                type="button"
                                onClick={() => onInspectAttempt(att)}
                                className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-sm font-semibold text-key-tinta transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul whitespace-nowrap"
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
                <h2 className="font-display text-lg font-bold text-key-tinta">
                  Material de estudio
                </h2>
                <p className="text-sm text-key-texto-suave">
                  Publica guías con fórmulas en LaTeX y archivos (PDF, Word, PowerPoint, Excel o imágenes) para tus estudiantes.
                </p>
              </div>

              {!showMaterialForm && (
                <button
                  type="button"
                  onClick={openNewMaterialForm}
                  className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-key-azul hover:bg-key-azul-hover text-sm font-semibold text-key-blanco transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
                >
                  <Plus className="w-4 h-4" />
                  <span>Publicar material</span>
                </button>
              )}
            </div>

            {showMaterialForm && (
              <form
                onSubmit={handleSaveMaterial}
                className="bg-key-blanco border-[0.8px] border-key-negro p-5 sm:p-6 space-y-5"
              >
                <div className="flex items-center justify-between border-b-[0.8px] border-key-negro pb-3">
                  <h3 className="font-display font-bold text-base text-key-tinta">
                    {editingMaterialId
                      ? 'Editar Material de Estudio y Archivo Adjunto'
                      : 'Publicar Nuevo Material de Estudio y Archivo Adjunto'}
                  </h3>
                  <button
                    type="button"
                    onClick={() => setShowMaterialForm(false)}
                    className="inline-flex items-center justify-center w-10 h-10 rounded-full border-[0.8px] border-key-negro hover:bg-key-gris-claro text-key-tinta cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
                  >
                    <X className="w-4 h-4" />
                  </button>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label htmlFor="material-titulo" className="block text-xs font-semibold text-key-texto mb-1">
                      Título del Material
                    </label>
                    <input
                      id="material-titulo"
                      type="text"
                      required
                      value={title}
                      onChange={(e) => setTitle(e.target.value)}
                      placeholder="Ej. Formulario Oficial y Ejercicios de Geometría Analítica"
                      className="w-full px-3.5 py-2 border-[0.8px] border-key-negro text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
                    />
                  </div>

                  <div>
                    <label htmlFor="material-seccion" className="block text-xs font-semibold text-key-texto mb-1">
                      Sección PAA
                    </label>
                    <select
                      id="material-seccion"
                      value={section}
                      onChange={(e) => setSection(e.target.value as SectionType)}
                      className="w-full px-3.5 py-2 border-[0.8px] border-key-negro text-sm bg-key-blanco focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
                    >
                      <option value="math">Matemáticas (con soporte KaTeX)</option>
                      <option value="reading">Lectura y Redacción</option>
                    </select>
                  </div>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label htmlFor="material-categoria" className="block text-xs font-semibold text-key-texto mb-1">
                      Categoría / Tema
                    </label>
                    <input
                      id="material-categoria"
                      type="text"
                      required
                      value={category}
                      onChange={(e) => setCategory(e.target.value)}
                      className="w-full px-3.5 py-2 border-[0.8px] border-key-negro text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
                    />
                  </div>

                  <div>
                    <label htmlFor="material-minutos" className="block text-xs font-semibold text-key-texto mb-1">
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
                      className="w-full px-3.5 py-2 border-[0.8px] border-key-negro text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
                    />
                  </div>

                  <div>
                    <label htmlFor="material-autor" className="block text-xs font-semibold text-key-texto mb-1">
                      Autor Registrado
                    </label>
                    <input
                      id="material-autor"
                      type="text"
                      disabled
                      value={teacher.name}
                      className="w-full px-3.5 py-2 border-[0.8px] border-key-negro bg-key-gris text-key-texto-suave text-sm"
                    />
                  </div>
                </div>

                <div>
                  <label htmlFor="material-resumen" className="block text-xs font-semibold text-key-texto mb-1">
                    Resumen Ejecutivo
                  </label>
                  <input
                    id="material-resumen"
                    type="text"
                    required
                    value={summary}
                    onChange={(e) => setSummary(e.target.value)}
                    placeholder="Breve descripción del documento o guía de estudio..."
                    className="w-full px-3.5 py-2 border-[0.8px] border-key-negro text-sm focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
                  />
                </div>

                {/* File Upload Zone (PDF, DOCX, PPTX, XLSX, PNG, JPG, etc.) */}
                <div className="p-4 bg-key-gris-claro border-[0.8px] border-dashed border-key-negro space-y-2.5">
                  <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                    <div>
                      <div className="text-xs font-bold text-key-tinta flex items-center gap-1.5">
                        <Upload className="w-4 h-4 text-key-azul" />
                        Adjuntar Archivo de Estudio (Opcional)
                      </div>
                      <p className="text-sm text-key-texto-suave">
                        Formatos soportados: <strong>PDF, DOCX, PPTX, XLSX, PNG, JPG, WEBP, CSV, TXT</strong> (hasta 15 MB).
                      </p>
                    </div>

                    <label className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-sm font-semibold text-key-tinta transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul shrink-0 focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-key-azul">
                      <Paperclip aria-hidden="true" className="w-4 h-4 text-key-azul" />
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
                    <div className="text-xs text-estado-error font-semibold">{fileError}</div>
                  )}

                  {attachmentName && !removeAttachment && (
                    <div className="flex items-center justify-between gap-3 p-2.5 bg-key-blanco border-[0.8px] border-key-negro">
                      <div className="flex items-center gap-2 min-w-0">
                        <Paperclip className="w-4 h-4 text-key-azul shrink-0" />
                        <span className="text-xs font-bold text-key-tinta truncate">
                          {attachmentName}
                        </span>
                        {attachmentSize && (
                          <span className="text-xs font-mono-num text-key-texto-suave shrink-0">
                            ({formatFileSize(attachmentSize)})
                          </span>
                        )}
                        {attachmentDataBase64 && (
                          <span className="px-2 py-0.5 bg-estado-exito-fondo text-estado-exito text-xs font-bold">
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
                        className="text-xs font-semibold text-estado-error hover:underline shrink-0 cursor-pointer"
                      >
                        Quitar archivo
                      </button>
                    </div>
                  )}
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                  <div>
                    <label htmlFor="material-notas" className="block text-xs font-semibold text-key-texto mb-1">
                      Notas / Contenido Explicativo (Soporta LaTeX <code>$...$</code> y <code>$$...$$</code>)
                    </label>
                    <textarea
                      id="material-notas"
                      rows={8}
                      required
                      value={content}
                      onChange={(e) => setContent(e.target.value)}
                      className="w-full p-3.5 border-[0.8px] border-key-negro text-xs sm:text-sm font-mono focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
                    />
                  </div>

                  <div>
                    <div className="text-xs font-semibold text-key-texto mb-1">
                      Vista Previa en Vivo (Renderizado KaTeX)
                    </div>
                    <div className="h-[196px] overflow-y-auto custom-scrollbar p-3.5 bg-key-gris-claro border-[0.8px] border-key-negro text-xs sm:text-sm text-key-tinta leading-relaxed">
                      <LatexRenderer content={content} />
                    </div>
                  </div>
                </div>

                <div className="flex items-center justify-end gap-3 pt-2">
                  <button
                    type="button"
                    onClick={() => setShowMaterialForm(false)}
                    className="inline-flex items-center justify-center gap-1.5 h-10 px-4 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-sm font-semibold text-key-tinta transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
                  >
                    Cancelar
                  </button>
                  <button
                    type="submit"
                    disabled={savingMaterial}
                    className="inline-flex items-center justify-center gap-2 h-11 px-5 rounded-full bg-key-azul hover:bg-key-azul-hover text-sm font-semibold text-key-blanco transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
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
            <div className="grid grid-cols-1 md:grid-cols-2 border-t-[0.8px] border-l-[0.8px] border-key-negro">
              {materials.map((mat) => (
                <div
                  key={mat.id}
                  className="bg-key-blanco border-r-[0.8px] border-b-[0.8px] border-key-negro p-5 flex flex-col justify-between gap-4"
                >
                  <div>
                    <div className="flex items-center justify-between gap-2 mb-2">
                      <span
                        className="text-sm text-key-texto-suave"
                      >
                        {mat.section === 'math' ? 'Matemáticas' : 'Lectura y Redacción'} ·{' '}
                        {mat.category}
                      </span>
                      <span className="inline-flex items-center gap-1 text-xs text-key-texto-suave font-mono-num">
                        <Clock className="w-3.5 h-3.5" />
                        {mat.readingTimeMinutes} min
                      </span>
                    </div>

                    <h3 className="font-display font-bold text-base text-key-tinta mb-1">
                      {mat.title}
                    </h3>
                    <p className="text-xs text-key-texto-suave mb-3">{mat.summary}</p>

                    {mat.attachmentUrl && mat.attachmentName && (
                      <div className="mb-3 p-2.5 bg-key-gris-claro border-[0.8px] border-key-azul flex items-center justify-between gap-2">
                        <div className="flex items-center gap-2 min-w-0">
                          <Paperclip className="w-4 h-4 text-key-azul shrink-0" />
                          <span className="text-xs font-bold text-key-tinta truncate">
                            {mat.attachmentName}
                          </span>
                          {mat.attachmentSize && (
                            <span className="text-xs font-mono-num text-key-texto-suave shrink-0">
                              ({formatFileSize(mat.attachmentSize)})
                            </span>
                          )}
                        </div>
                        <a
                          href={mat.attachmentUrl}
                          download={mat.attachmentName}
                          target="_blank"
                          rel="noreferrer"
                          className="inline-flex items-center gap-1 text-xs font-bold text-key-azul hover:underline shrink-0"
                        >
                          <Download className="w-3.5 h-3.5" />
                          <span>Descargar</span>
                        </a>
                      </div>
                    )}

                    <div className="p-3 bg-key-gris-claro border-[0.8px] border-key-negro text-xs text-key-texto max-h-36 overflow-y-auto custom-scrollbar">
                      <LatexRenderer content={mat.content} />
                    </div>
                  </div>

                  <div className="pt-3 border-t-[0.8px] border-key-gris flex items-center justify-between gap-2">
                    <span className="text-xs text-key-texto-suave">
                      Autor: <strong>{mat.authorName}</strong>
                    </span>

                    <div className="flex items-center gap-2">
                      <button
                        type="button"
                        onClick={() => openEditMaterialForm(mat)}
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-sm font-semibold text-key-tinta transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
                      >
                        <Pencil className="w-3.5 h-3.5" />
                        <span>Editar / Archivo</span>
                      </button>

                      <button
                        type="button"
                        onClick={() => onDeleteMaterial(mat.id)}
                        className="inline-flex items-center justify-center gap-1.5 h-9 px-3.5 rounded-full border-[0.8px] border-estado-error bg-key-blanco hover:bg-estado-error-fondo text-sm font-semibold text-estado-error transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
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
