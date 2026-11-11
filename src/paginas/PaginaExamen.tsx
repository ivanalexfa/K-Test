import React, { useState } from 'react';
import { Link, Navigate, useParams } from 'react-router';
import { ChevronLeft, ChevronRight, LayoutGrid, CheckCircle2 } from 'lucide-react';
import { Header } from '../components/Header';
import { ReadingQuestionView } from '../components/ReadingQuestionView';
import { MathQuestionView } from '../components/MathQuestionView';
import { FormulaModal } from '../components/FormulaModal';
import { QuestionNavigatorModal } from '../components/QuestionNavigatorModal';
import { SectionTransitionModal } from '../components/SectionTransitionModal';
import { useExamen } from '../estado/useExamen';
import { examData, examenDeClave, tituloDeExamen } from '../estado/examenes';
import { rutas } from '../rutas';

/**
 * Examen en curso: /examen/simulacro, /examen/lectura, /examen/matematicas o /examen/<id de sprint>.
 *
 * Si se llega a la URL sin un examen en curso (enlace directo o recarga a mitad del examen),
 * se muestra una pantalla para empezarlo: nunca se reinicia solo ni se pierden respuestas
 * sin avisar.
 */
export const PaginaExamen: React.FC = () => {
  const { clave = '' } = useParams();
  const examen = useExamen();
  const definicion = examenDeClave(clave);

  if (!definicion) return <Navigate to={rutas.pruebas} replace />;
  if (examen.enCurso !== clave) {
    return <EmpezarExamen titulo={tituloDeExamen(clave)} onEmpezar={() => examen.iniciar(definicion.modo, definicion.sprint)} />;
  }
  return <ExamenEnCurso />;
};

const EmpezarExamen: React.FC<{ titulo: string; onEmpezar: () => void }> = ({ titulo, onEmpezar }) => (
  <main className="min-h-dvh flex items-center justify-center bg-key-blanco px-5">
    <div className="w-full max-w-md bg-key-blanco border-[0.8px] border-key-negro p-8 space-y-6 text-center">
      <h1 className="text-2xl font-semibold text-key-tinta text-balance">{titulo}</h1>
      <p className="text-key-texto">
        Este examen no está en curso. Si recargaste la página a mitad del examen, tus respuestas
        no se guardaron: puedes empezarlo de nuevo.
      </p>
      <div className="flex flex-col gap-3">
        <button
          type="button"
          onClick={onEmpezar}
          className="h-12 rounded-full bg-key-azul hover:bg-key-azul-hover text-key-blanco font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
        >
          Empezar examen
        </button>
        <Link
          to={rutas.pruebas}
          className="h-12 inline-flex items-center justify-center rounded-full border-[0.8px] border-key-negro text-key-tinta font-semibold hover:bg-key-gris-claro transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
        >
          Volver a mis pruebas
        </Link>
      </div>
    </div>
  </main>
);

const ExamenEnCurso: React.FC = () => {
  const {
    modo,
    sprint,
    seccion,
    preguntas,
    indice,
    pregunta,
    respuestas,
    marcadas,
    segundosRestantes,
    irAPregunta,
    responder,
    alternarMarca,
    avanzarSeccion,
  } = useExamen();

  const [cronometroVisible, setCronometroVisible] = useState(true);
  const [formulasAbierto, setFormulasAbierto] = useState(false);
  const [navegadorAbierto, setNavegadorAbierto] = useState(false);
  const [transicionAbierta, setTransicionAbierta] = useState(false);

  const configSeccion = examData.sections[seccion];
  const respondidas = preguntas.filter((q) => Boolean(respuestas[q.id])).length;
  const marcadasCount = preguntas.filter((q) => Boolean(marcadas[q.id])).length;
  const esUltima = indice === preguntas.length - 1;
  const pasaje = pregunta.passageId ? examData.passages[pregunta.passageId] : undefined;

  const titulo = sprint
    ? `${sprint.code} · ${sprint.title}`
    : modo === 'simulacro'
      ? configSeccion.title
      : modo === 'sprint_reading'
        ? 'Sprint Corto · Lectura y Redacción'
        : 'Sprint Corto · Matemáticas';

  const confirmarAvance = async () => {
    setTransicionAbierta(false);
    await avanzarSeccion();
  };

  return (
    <div className="min-h-dvh flex flex-col bg-key-blanco text-key-tinta">
      <Header
        currentSection={seccion}
        sectionTitle={titulo}
        currentQuestionIndex={indice}
        totalQuestions={preguntas.length}
        secondsRemaining={segundosRestantes}
        timerVisible={cronometroVisible}
        onToggleTimer={() => setCronometroVisible((v) => !v)}
        onOpenFormulaModal={() => setFormulasAbierto(true)}
        onOpenNavigatorModal={() => setNavegadorAbierto(true)}
        answeredCount={respondidas}
        flaggedCount={marcadasCount}
      />

      <main className="flex-1 flex flex-col">
        {seccion === 'reading' && pasaje ? (
          <ReadingQuestionView
            question={pregunta}
            passage={pasaje}
            selectedOption={respuestas[pregunta.id]}
            isFlagged={Boolean(marcadas[pregunta.id])}
            onSelectOption={responder}
            onToggleFlag={alternarMarca}
            totalQuestionsInSection={preguntas.length}
          />
        ) : (
          <MathQuestionView
            question={pregunta}
            selectedOption={respuestas[pregunta.id]}
            isFlagged={Boolean(marcadas[pregunta.id])}
            onSelectOption={responder}
            onToggleFlag={alternarMarca}
            onOpenFormulaModal={() => setFormulasAbierto(true)}
          />
        )}
      </main>

      <footer className="sticky bottom-0 z-30 bg-key-blanco border-t-[0.8px] border-key-negro">
        <div className="max-w-7xl mx-auto px-3 sm:px-6 h-15 flex items-center justify-between gap-2">
          <button
            type="button"
            disabled={indice === 0}
            onClick={() => irAPregunta(Math.max(0, indice - 1))}
            className="inline-flex items-center gap-1.5 h-11 px-4 sm:px-5 rounded-full text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-key-tinta disabled:opacity-40 disabled:pointer-events-none"
          >
            <ChevronLeft aria-hidden="true" className="w-4 h-4" />
            <span className="max-[379px]:sr-only">Anterior</span>
          </button>

          <button
            type="button"
            onClick={() => setNavegadorAbierto(true)}
            className="inline-flex items-center gap-2 h-11 px-2 sm:px-4 text-sm text-key-tinta hover:underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-key-azul"
          >
            <LayoutGrid aria-hidden="true" className="w-4 h-4 text-key-azul" />
            <span>
              <span className="max-[379px]:hidden">Pregunta </span>
              <strong className="font-mono-num">{indice + 1}</strong> de{' '}
              <strong className="font-mono-num">{preguntas.length}</strong>
            </span>
          </button>

          {!esUltima ? (
            <button
              type="button"
              onClick={() => irAPregunta(Math.min(preguntas.length - 1, indice + 1))}
              className="inline-flex items-center gap-1.5 h-11 px-4 sm:px-5 rounded-full text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul bg-key-azul hover:bg-key-azul-hover text-key-blanco"
            >
              <span>Siguiente</span>
              <ChevronRight aria-hidden="true" className="w-4 h-4" />
            </button>
          ) : (
            <button
              type="button"
              onClick={() => setTransicionAbierta(true)}
              className="inline-flex items-center gap-1.5 h-11 px-4 sm:px-5 rounded-full text-sm font-semibold transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul bg-key-azul hover:bg-key-azul-hover text-key-blanco"
            >
              <CheckCircle2 aria-hidden="true" className="w-4 h-4" />
              <span>
                {modo === 'simulacro' && seccion === 'reading' ? 'Finalizar Sección 1' : 'Entregar y Guardar'}
              </span>
            </button>
          )}
        </div>
      </footer>

      <FormulaModal isOpen={formulasAbierto} onClose={() => setFormulasAbierto(false)} />

      <QuestionNavigatorModal
        isOpen={navegadorAbierto}
        onClose={() => setNavegadorAbierto(false)}
        sectionTitle={titulo}
        questions={preguntas}
        currentQuestionIndex={indice}
        answers={respuestas}
        flaggedQuestions={marcadas}
        onSelectQuestionIndex={irAPregunta}
        onRequestFinishSection={() => setTransicionAbierta(true)}
      />

      <SectionTransitionModal
        isOpen={transicionAbierta}
        onClose={() => setTransicionAbierta(false)}
        testMode={modo}
        currentSection={seccion}
        sectionTitle={titulo}
        totalQuestions={preguntas.length}
        answeredCount={respondidas}
        flaggedCount={marcadasCount}
        onConfirmAdvance={confirmarAvance}
      />
    </div>
  );
};
