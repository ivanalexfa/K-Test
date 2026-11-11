import React, {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';
import { useNavigate } from 'react-router';
import type {
  ExamQuestion,
  OptionId,
  SectionType,
  SprintConfig,
  TestAttemptRecord,
  TestMode,
} from '../types/exam';
import { apiSaveTestAttempt } from '../services/api';
import { useSesion } from './useSesion';
import { ExamenContexto } from './contextos';
import { rutas } from '../rutas';
import { claveDeExamen, examData, type ClaveExamen } from './examenes';

export interface UltimoResultado {
  intentoId: string | null;
  modo: TestMode;
  sprint: SprintConfig | null;
  respuestas: Record<string, OptionId>;
  intento: TestAttemptRecord | null;
}

export interface ExamenValor {
  /** Clave del examen en curso, o null si no hay ninguno. */
  enCurso: ClaveExamen | null;
  modo: TestMode;
  sprint: SprintConfig | null;
  seccion: SectionType;
  preguntas: ExamQuestion[];
  indice: number;
  pregunta: ExamQuestion;
  respuestas: Record<string, OptionId>;
  marcadas: Record<string, boolean>;
  segundosRestantes: number;
  /** Lo que ve ResultsView justo después de entregar. */
  ultimoResultado: UltimoResultado | null;
  iniciar: (modo: TestMode, sprint?: SprintConfig | null) => void;
  irAPregunta: (indice: number) => void;
  responder: (opcion: OptionId) => void;
  alternarMarca: () => void;
  /** Pasa a Matemáticas (simulacro) o entrega y abre los resultados. */
  avanzarSeccion: () => Promise<void>;
}


/**
 * Estado del examen en curso (simulacro o sprint): sección, pregunta, respuestas,
 * marcas, cronómetro y cierre. La lógica de puntaje y tiempos es la que tenía App.tsx;
 * ver docs/general/decisiones/0005-react-router-y-estado.md.
 */
export const ExamenProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const navigate = useNavigate();
  const { usuario, actualizarIntentos } = useSesion();

  const [enCurso, setEnCurso] = useState<ClaveExamen | null>(null);
  const [modo, setModo] = useState<TestMode>('simulacro');
  const [sprint, setSprint] = useState<SprintConfig | null>(null);
  const [seccion, setSeccion] = useState<SectionType>('reading');
  const [indice, setIndice] = useState(0);
  const [respuestas, setRespuestas] = useState<Record<string, OptionId>>({});
  const [marcadas, setMarcadas] = useState<Record<string, boolean>>({});
  const [segundosRestantes, setSegundosRestantes] = useState(600);
  const [ultimoResultado, setUltimoResultado] = useState<UltimoResultado | null>(null);
  // Se fija al iniciar; Date.now() no se llama durante el render.
  const inicioRef = useRef(0);

  const configSeccion = examData.sections[seccion];

  const preguntas: ExamQuestion[] = useMemo(() => {
    const base = configSeccion.questions;
    if (!sprint) return base;
    const ids = new Set(sprint.questionIds);
    const filtradas = base.filter((q) => ids.has(q.id));
    if (filtradas.length === 0) return base;
    return filtradas.map((q, i) => ({ ...q, numberInSection: i + 1 }));
  }, [configSeccion.questions, sprint]);

  const pregunta = preguntas[indice] || preguntas[0];

  const iniciar = useCallback((nuevoModo: TestMode, nuevoSprint: SprintConfig | null = null) => {
    setModo(nuevoModo);
    setSprint(nuevoSprint);
    setRespuestas({});
    setMarcadas({});
    setIndice(0);
    inicioRef.current = Date.now();

    if (nuevoSprint) {
      setSeccion(nuevoSprint.section);
      setSegundosRestantes(nuevoSprint.durationMinutes * 60);
    } else if (nuevoModo === 'simulacro') {
      setSeccion('reading');
      setSegundosRestantes(examData.sections.reading.durationMinutes * 60);
    } else if (nuevoModo === 'sprint_reading') {
      setSeccion('reading');
      setSegundosRestantes(5 * 60);
    } else {
      setSeccion('math');
      setSegundosRestantes(6 * 60);
    }
    setEnCurso(claveDeExamen(nuevoModo, nuevoSprint));
  }, []);

  const guardarIntento = useCallback(
    async (finales: Record<string, OptionId>): Promise<TestAttemptRecord | null> => {
      if (!usuario) return null;

      const todasLectura = examData.sections.reading.questions;
      const todasMate = examData.sections.math.questions;

      const lectura = sprint
        ? sprint.section === 'reading'
          ? todasLectura.filter((q) => sprint.questionIds.includes(q.id))
          : []
        : modo === 'sprint_math'
          ? []
          : todasLectura;

      const mate = sprint
        ? sprint.section === 'math'
          ? todasMate.filter((q) => sprint.questionIds.includes(q.id))
          : []
        : modo === 'sprint_reading'
          ? []
          : todasMate;

      const readingCorrect = lectura.filter((q) => finales[q.id] === q.correctOption).length;
      const mathCorrect = mate.filter((q) => finales[q.id] === q.correctOption).length;
      const totalCorrect = readingCorrect + mathCorrect;
      const totalQuestions = lectura.length + mate.length;
      const percentage = totalQuestions > 0 ? Math.round((totalCorrect / totalQuestions) * 100) : 0;

      const readingScaled =
        lectura.length > 0 ? Math.round(200 + (readingCorrect / lectura.length) * 600) : 0;
      const mathScaled = mate.length > 0 ? Math.round(200 + (mathCorrect / mate.length) * 600) : 0;
      const scaledScore =
        modo === 'simulacro'
          ? readingScaled + mathScaled
          : modo === 'sprint_reading'
            ? readingScaled
            : mathScaled;

      const modeTitle = sprint
        ? `${sprint.code}: ${sprint.title}`
        : modo === 'simulacro'
          ? 'Simulacro Oficial PAA (Test Completo)'
          : modo === 'sprint_reading'
            ? 'Sprint de Lectura y Redacción (Test Corto)'
            : 'Sprint de Matemáticas (Test Corto)';

      const durationSeconds = Math.max(10, Math.round((Date.now() - inicioRef.current) / 1000));

      try {
        const guardado = await apiSaveTestAttempt({
          userId: usuario.id,
          mode: modo,
          modeTitle,
          readingCorrect,
          readingTotal: lectura.length,
          mathCorrect,
          mathTotal: mate.length,
          totalCorrect,
          totalQuestions,
          percentage,
          scaledScore,
          durationSeconds,
          answers: finales,
        });
        actualizarIntentos(guardado.attempts);
        return guardado.attempt;
      } catch (error) {
        console.error('Error guardando el intento:', error);
        return null;
      }
    },
    [usuario, sprint, modo, actualizarIntentos],
  );

  const avanzarSeccion = useCallback(async () => {
    if (modo === 'simulacro' && seccion === 'reading') {
      setSeccion('math');
      setIndice(0);
      setSegundosRestantes(examData.sections.math.durationMinutes * 60);
      window.scrollTo({ top: 0, behavior: 'smooth' });
      return;
    }
    const intento = await guardarIntento(respuestas);
    setUltimoResultado({ intentoId: intento?.id ?? null, modo, sprint, respuestas, intento });
    setEnCurso(null);
    navigate(rutas.resultados(intento?.id ?? 'ultimo'), { replace: true });
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }, [modo, seccion, sprint, respuestas, guardarIntento, navigate]);

  // Cronómetro de la sección mientras hay un examen en curso.
  useEffect(() => {
    if (!enCurso) return;
    const intervalo = setInterval(() => {
      setSegundosRestantes((prev) => {
        if (prev <= 1) {
          clearInterval(intervalo);
          void avanzarSeccion();
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(intervalo);
  }, [enCurso, seccion, avanzarSeccion]);

  const valor: ExamenValor = {
    enCurso,
    modo,
    sprint,
    seccion,
    preguntas,
    indice,
    pregunta,
    respuestas,
    marcadas,
    segundosRestantes,
    ultimoResultado,
    iniciar,
    irAPregunta: setIndice,
    responder: (opcion) => {
      if (!pregunta) return;
      setRespuestas((prev) => ({ ...prev, [pregunta.id]: opcion }));
    },
    alternarMarca: () => {
      if (!pregunta) return;
      setMarcadas((prev) => ({ ...prev, [pregunta.id]: !prev[pregunta.id] }));
    },
    avanzarSeccion,
  };

  return <ExamenContexto.Provider value={valor}>{children}</ExamenContexto.Provider>;
};
