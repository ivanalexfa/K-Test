import React, { useState } from 'react';
import {
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Check,
  X,
} from 'lucide-react';
import {
  ExamQuestion,
  MockPaaExamData,
  OptionId,
  TestAttemptRecord,
  TestMode,
} from '../types/exam';
import { LatexRenderer } from './LatexRenderer';
import { LogoKey } from './brand/LogoKey';

interface ResultsViewProps {
  examData: MockPaaExamData;
  testMode: TestMode;
  customQuestions?: ExamQuestion[] | null;
  answers: Record<string, OptionId>;
  attemptRecord?: TestAttemptRecord | null;
  onBackToPortal: () => void;
}

type FilterMode = 'all' | 'reading' | 'math' | 'incorrect';

export const ResultsView: React.FC<ResultsViewProps> = ({
  examData,
  testMode,
  customQuestions,
  answers,
  attemptRecord,
  onBackToPortal,
}) => {
  const [filter, setFilter] = useState<FilterMode>('all');

  const allSectionReading = examData.sections.reading.questions;
  const allSectionMath = examData.sections.math.questions;

  const readingQuestions = customQuestions
    ? customQuestions.filter((q) => q.section === 'reading')
    : testMode === 'sprint_math'
    ? []
    : allSectionReading;

  const mathQuestions = customQuestions
    ? customQuestions.filter((q) => q.section === 'math')
    : testMode === 'sprint_reading'
    ? []
    : allSectionMath;

  const activeQuestions: ExamQuestion[] = [...readingQuestions, ...mathQuestions];

  const readingCorrect = readingQuestions.filter(
    (q) => answers[q.id] === q.correctOption
  ).length;
  const mathCorrect = mathQuestions.filter(
    (q) => answers[q.id] === q.correctOption
  ).length;
  const totalCorrect = readingCorrect + mathCorrect;
  const totalPercentage =
    activeQuestions.length > 0
      ? Math.round((totalCorrect / activeQuestions.length) * 100)
      : 0;

  const readingScaled =
    readingQuestions.length > 0
      ? Math.round(200 + (readingCorrect / readingQuestions.length) * 600)
      : 0;
  const mathScaled =
    mathQuestions.length > 0
      ? Math.round(200 + (mathCorrect / mathQuestions.length) * 600)
      : 0;
  const totalScaled =
    attemptRecord?.scaledScore ??
    (testMode === 'simulacro'
      ? readingScaled + mathScaled
      : testMode === 'sprint_reading'
      ? readingScaled
      : mathScaled);

  const filteredQuestions = activeQuestions.filter((q) => {
    if (filter === 'reading') return q.section === 'reading';
    if (filter === 'math') return q.section === 'math';
    if (filter === 'incorrect') return answers[q.id] !== q.correctOption;
    return true;
  });

  return (
    <div className="min-h-dvh bg-key-blanco text-key-tinta pb-16">
      {/* Encabezado blanco con línea fina, como el portal del estudiante */}
      <header className="sticky top-0 z-30 bg-key-blanco border-b-[0.8px] border-key-negro">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0 max-[379px]:[&_img]:h-7">
            <span className="hidden sm:inline-flex">
              <LogoKey theme="light" variant="full" />
            </span>
            <span className="sm:hidden inline-flex">
              <LogoKey theme="light" variant="mark-only" />
            </span>
          </div>

          <button
            type="button"
            onClick={onBackToPortal}
            className="inline-flex items-center gap-1.5 h-10 px-4 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-sm font-semibold text-key-tinta whitespace-nowrap transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
          >
            <ArrowLeft aria-hidden="true" className="w-4 h-4" />
            <span>Volver al Portal</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Resumen: el puntaje es el protagonista, en el bloque azul plano */}
        <section aria-labelledby="resultado-titulo" className="border-[0.8px] border-key-negro">
          <div className="bg-key-azul text-key-blanco px-6 sm:px-9 py-7 flex flex-col md:flex-row md:items-end justify-between gap-6">
            <div className="min-w-0">
              <p className="text-sm font-medium">
                {testMode === 'simulacro'
                  ? 'Simulacro completo PAA'
                  : testMode === 'sprint_reading'
                  ? 'Sprint corto · Lectura y Redacción'
                  : 'Sprint corto · Matemáticas'}
              </p>
              <h1 id="resultado-titulo" className="font-display text-2xl sm:text-3xl font-bold mt-2 text-balance">
                {attemptRecord ? attemptRecord.modeTitle : 'Resultados de la evaluación'}
              </h1>
              <p className="text-sm mt-2 max-w-xl">
                {attemptRecord
                  ? `${attemptRecord.userName} · ${new Date(attemptRecord.completedAt).toLocaleString('es-SV')}`
                  : 'Revisa tu desempeño por materia y estudia el solucionario paso a paso.'}
              </p>
            </div>

            <div className="shrink-0">
              <div className="text-sm font-medium">Precisión global</div>
              <div className="font-mono-num text-5xl font-bold leading-none mt-1">{totalPercentage}%</div>
              <div className="text-sm mt-2 font-mono-num">
                {totalCorrect}/{activeQuestions.length} aciertos · <strong>{totalScaled} pts PAA</strong>
              </div>
            </div>
          </div>

          {/* Desglose por materia: celdas con línea fina */}
          <div className={`grid grid-cols-1 border-t-[0.8px] border-key-negro ${readingQuestions.length > 0 && mathQuestions.length > 0 ? 'sm:grid-cols-2' : ''}`}>
            {readingQuestions.length > 0 && (
              <div className="px-6 sm:px-9 py-5 flex items-center justify-between gap-4 max-sm:[&+div]:border-t-[0.8px] sm:[&+div]:border-l-[0.8px] border-key-negro">
                <div className="font-semibold">Lectura y Redacción</div>
                <div className="text-right font-mono-num">
                  <div className="text-lg font-bold">
                    {readingCorrect}/{readingQuestions.length}
                  </div>
                  <div className="text-xs text-key-texto-suave">~{readingScaled} pts PAA</div>
                </div>
              </div>
            )}

            {mathQuestions.length > 0 && (
              <div className="px-6 sm:px-9 py-5 flex items-center justify-between gap-4 border-key-negro">
                <div className="font-semibold">Matemáticas</div>
                <div className="text-right font-mono-num">
                  <div className="text-lg font-bold">
                    {mathCorrect}/{mathQuestions.length}
                  </div>
                  <div className="text-xs text-key-texto-suave">~{mathScaled} pts PAA</div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Detailed Question-by-Question Review & Explanations */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-lg sm:text-xl font-bold text-key-tinta flex items-center gap-2">
              Solucionario paso a paso
            </h2>

            {/* Filter Pills */}
            <div role="group" aria-label="Filtrar preguntas" className="flex flex-wrap">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`h-10 px-3.5 -ml-[0.8px] first:ml-0 border-[0.8px] text-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul ${
                  filter === 'all'
                    ? 'bg-key-azul text-key-blanco border-key-azul'
                    : 'bg-key-blanco text-key-tinta border-key-negro hover:bg-key-gris-claro'
                }`}
              >
                Todas ({activeQuestions.length})
              </button>
              {readingQuestions.length > 0 && mathQuestions.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setFilter('reading')}
                    className={`h-10 px-3.5 -ml-[0.8px] first:ml-0 border-[0.8px] text-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul ${
                      filter === 'reading'
                        ? 'bg-key-azul text-key-blanco border-key-azul'
                        : 'bg-key-blanco text-key-tinta border-key-negro hover:bg-key-gris-claro'
                    }`}
                  >
                    Lectura ({readingQuestions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('math')}
                    className={`h-10 px-3.5 -ml-[0.8px] first:ml-0 border-[0.8px] text-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul ${
                      filter === 'math'
                        ? 'bg-key-azul text-key-blanco border-key-azul'
                        : 'bg-key-blanco text-key-tinta border-key-negro hover:bg-key-gris-claro'
                    }`}
                  >
                    Matemáticas ({mathQuestions.length})
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setFilter('incorrect')}
                className={`h-10 px-3.5 -ml-[0.8px] first:ml-0 border-[0.8px] text-sm transition-colors cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul ${
                  filter === 'incorrect'
                    ? 'bg-key-azul text-key-blanco border-key-azul'
                    : 'bg-key-blanco text-key-tinta border-key-negro hover:bg-key-gris-claro'
                }`}
              >
                Por reforzar ({activeQuestions.length - totalCorrect})
              </button>
            </div>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="bg-key-blanco border-[0.8px] border-key-negro p-8 text-center text-sm text-key-texto-suave">
              ¡Excelente trabajo! No tienes preguntas incorrectas en este filtro.
            </div>
          ) : (
            <div className="border-[0.8px] border-key-negro">
              {filteredQuestions.map((q) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctOption;

                return (
                  <article
                    key={q.id}
                    className="bg-key-blanco border-t-[0.8px] border-key-negro first:border-t-0 overflow-hidden"
                  >
                    {/* Review Item Header */}
                    <div className="px-5 py-3.5 border-b-[0.8px] border-key-negro flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="font-mono-num text-sm font-semibold text-key-tinta">
                          {q.section === 'reading' ? 'Lectura' : 'Matemáticas'} #
                          {q.numberInSection}
                        </span>
                        <span className="text-xs font-medium text-key-texto-suave">
                          {q.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-estado-exito-fondo text-estado-exito border-[0.8px] border-estado-exito text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Correcta ({q.correctOption})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-estado-error-fondo text-estado-error border-[0.8px] border-estado-error text-xs font-bold">
                            <XCircle className="w-3.5 h-3.5" />
                            {userAnswer
                              ? `Eligió ${userAnswer} · Correcta: ${q.correctOption}`
                              : `Sin responder · Correcta: ${q.correctOption}`}
                          </span>
                        )}
                      </div>
                    </div>

                    {/* Question & Explanation Body */}
                    <div className="p-5 sm:p-6 space-y-4">
                      <div className="text-sm sm:text-base font-medium text-key-tinta leading-relaxed">
                        <LatexRenderer content={q.prompt} />
                      </div>

                      {q.mathEquationBlock && (
                        <div className="bg-key-gris-claro border-[0.8px] border-key-negro p-3 text-center">
                          <LatexRenderer content={q.mathEquationBlock} blockMode />
                        </div>
                      )}

                      {/* Options Summary */}
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                        {q.options.map((opt) => {
                          const isThisCorrect = opt.id === q.correctOption;
                          const isThisUser = opt.id === userAnswer;

                          return (
                            <div
                              key={opt.id}
                              className={`p-3 border-[0.8px] text-xs sm:text-sm flex items-start gap-2.5 ${
                                isThisCorrect
                                  ? 'border-estado-exito bg-estado-exito-fondo text-estado-exito font-semibold'
                                  : isThisUser
                                  ? 'border-estado-error bg-estado-error-fondo text-estado-error'
                                  : 'border-key-negro bg-key-blanco text-key-texto-suave'
                              }`}
                            >
                              <span
                                className={`w-6 h-6 font-mono-num font-bold text-xs flex items-center justify-center shrink-0 ${
                                  isThisCorrect
                                    ? 'bg-estado-exito text-key-blanco'
                                    : isThisUser
                                    ? 'bg-estado-error text-key-blanco'
                                    : 'bg-key-gris text-key-texto-suave'
                                }`}
                              >
                                {opt.id}
                              </span>
                              <div className="flex-1 pt-0.5">
                                <LatexRenderer content={opt.text} />
                              </div>
                              {isThisCorrect && (
                                <Check className="w-4 h-4 text-estado-exito shrink-0 mt-0.5" />
                              )}
                              {!isThisCorrect && isThisUser && (
                                <X className="w-4 h-4 text-estado-error shrink-0 mt-0.5" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Step-by-Step Explanation Box with KaTeX */}
                      <div className="bg-key-gris-claro border-l-2 border-key-azul p-4 text-xs sm:text-sm text-key-tinta leading-relaxed">
                        <div className="font-semibold text-key-tinta text-sm mb-1.5">
                          Solución paso a paso
                        </div>
                        <LatexRenderer content={q.explanation} />
                      </div>
                    </div>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
};
