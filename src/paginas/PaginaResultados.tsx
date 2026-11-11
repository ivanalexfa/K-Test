import React from 'react';
import { Link, useNavigate, useParams, useLocation } from 'react-router';
import { ResultsView } from '../components/ResultsView';
import { useSesion } from '../estado/useSesion';
import { useExamen } from '../estado/useExamen';
import { examData } from '../estado/examenes';
import { rutas } from '../rutas';
import type { ExamQuestion, TestAttemptRecord } from '../types/exam';

/**
 * Resultados y solucionario de un intento: /resultados/<id>.
 * Justo después de entregar se usa lo que dejó el examen (incluye las preguntas del
 * sprint); al abrir un intento del historial se arma desde lo guardado, como antes.
 * `/resultados/ultimo` muestra el examen recién entregado si no se pudo guardar.
 */
export const PaginaResultados: React.FC = () => {
  const { intentoId = '' } = useParams();
  const { usuario, intentos } = useSesion();
  const { ultimoResultado } = useExamen();
  const navigate = useNavigate();

  const { key } = useLocation();
  // El docente llega desde una ficha o desde Intentos: vuelve a donde estaba.
  const volver = () => {
    if (usuario?.role === 'teacher') {
      if (key !== 'default') navigate(-1);
      else navigate(rutas.docente);
    } else navigate(rutas.misResultados);
  };

  const esElUltimo =
    ultimoResultado &&
    (intentoId === 'ultimo' || (ultimoResultado.intentoId && ultimoResultado.intentoId === intentoId));

  if (esElUltimo && ultimoResultado) {
    const preguntasSprint = ultimoResultado.sprint
      ? examData.sections[ultimoResultado.sprint.section].questions
          .filter((q) => ultimoResultado.sprint!.questionIds.includes(q.id))
          .map((q, i) => ({ ...q, numberInSection: i + 1 }))
      : null;
    return (
      <ResultsView
        examData={examData}
        testMode={ultimoResultado.modo}
        customQuestions={preguntasSprint}
        answers={ultimoResultado.respuestas}
        attemptRecord={ultimoResultado.intento}
        onBackToPortal={volver}
      />
    );
  }

  const intento = intentos.find((a) => a.id === intentoId);
  const puedeVerlo =
    intento && usuario && (usuario.role === 'teacher' || intento.userId === usuario.id);

  if (!intento || !puedeVerlo) {
    return (
      <main className="min-h-dvh flex items-center justify-center bg-key-blanco px-5">
        <div className="w-full max-w-md bg-key-blanco border-[0.8px] border-key-negro p-8 space-y-5 text-center">
          <h1 className="text-2xl font-semibold text-key-tinta">No encontramos este resultado</h1>
          <p className="text-key-texto">El enlace no corresponde a ninguno de tus intentos.</p>
          <Link
            to={usuario?.role === 'teacher' ? rutas.docente : rutas.misResultados}
            className="h-12 inline-flex w-full items-center justify-center rounded-full bg-key-azul hover:bg-key-azul-hover text-key-blanco font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
          >
            Ver mis resultados
          </Link>
        </div>
      </main>
    );
  }

  return (
    <ResultsView
      examData={examData}
      testMode={intento.mode}
      customQuestions={preguntasDeIntento(intento)}
      answers={intento.answers || {}}
      attemptRecord={intento}
      onBackToPortal={volver}
    />
  );
};

/** Igual que App.tsx antes del router: los sprints se reconstruyen con lo que se respondió. */
function preguntasDeIntento(intento: TestAttemptRecord): ExamQuestion[] | null {
  if (intento.mode === 'simulacro') return null;
  return [...examData.sections.reading.questions, ...examData.sections.math.questions].filter(
    (q) =>
      q.id in (intento.answers || {}) ||
      (intento.mode === 'sprint_reading' && q.section === 'reading') ||
      (intento.mode === 'sprint_math' && q.section === 'math'),
  );
}
