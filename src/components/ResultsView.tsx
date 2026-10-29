import React, { useState } from 'react';
import {
  Award,
  BookOpen,
  Calculator,
  CheckCircle2,
  XCircle,
  ArrowLeft,
  Sparkles,
  Check,
  X,
  Database,
} from 'lucide-react';
import {
  ExamQuestion,
  MockPaaExamData,
  OptionId,
  TestAttemptRecord,
  TestMode,
} from '../types/exam';
import { LatexRenderer } from './LatexRenderer';
import { KTestLogo } from './brand/KTestLogo';
import { MathPAAIcon, VerbalPAAIcon } from './brand/KTestIcons';

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
    <div className="min-h-dvh bg-[#F8FAFC] text-[#0A1128] pb-16">
      {/* Top Institutional Header */}
      <header className="sticky top-0 z-30 bg-[#0A1128] text-white border-b border-white/10 shadow-md">
        <div className="max-w-5xl mx-auto px-4 sm:px-6 h-16 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <KTestLogo theme="dark" variant="full" />
            {attemptRecord && (
              <div className="hidden sm:block pl-3 border-l border-white/15 text-[11px] text-[#00D2FF]">
                Alumno: {attemptRecord.userName} ({attemptRecord.userEmail})
              </div>
            )}
          </div>

          <button
            type="button"
            onClick={onBackToPortal}
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-xs sm:text-sm font-bold text-white transition-colors cursor-pointer"
          >
            <ArrowLeft className="w-4 h-4" />
            <span>Volver al Portal</span>
          </button>
        </div>
      </header>

      <main className="max-w-5xl mx-auto px-4 sm:px-6 pt-8 space-y-8">
        {/* Executive Score Summary Card */}
        <section className="rounded-2xl bg-[#0A1128] text-white p-6 sm:p-8 shadow-xl border border-slate-800 relative overflow-hidden">
          <div className="absolute -right-12 -top-12 w-64 h-64 rounded-full bg-[#0052FF]/20 blur-3xl pointer-events-none" />

          <div className="relative z-10 flex flex-col md:flex-row md:items-center justify-between gap-6">
            <div>
              <div className="flex flex-wrap items-center gap-2 mb-3">
                <span className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-[#0052FF]/25 border border-[#00D2FF]/30 text-[#00D2FF] text-xs font-semibold uppercase tracking-wider">
                  <Award className="w-3.5 h-3.5" />
                  {testMode === 'simulacro'
                    ? 'Simulacro Completo PAA'
                    : testMode === 'sprint_reading'
                    ? 'Sprint Corto · Lectura y Redacción'
                    : 'Sprint Corto · Matemáticas'}
                </span>
                <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/15 border border-emerald-400/30 text-emerald-300 text-xs font-medium">
                  <Database className="w-3 h-3" />
                  Guardado en SQLite
                </span>
              </div>

              <h1 className="font-display text-2xl sm:text-3xl font-extrabold mb-2">
                {attemptRecord ? attemptRecord.modeTitle : 'Resultados de la Evaluación'}
              </h1>
              <p className="text-slate-300 text-xs sm:text-sm max-w-xl">
                {attemptRecord
                  ? `Evaluación de ${attemptRecord.userName} (${new Date(
                      attemptRecord.completedAt
                    ).toLocaleString('es-SV')}).`
                  : 'Revisa tu desempeño por área académica y estudia el solucionario paso a paso.'}
              </p>
            </div>

            <div className="flex items-center gap-5 bg-white/6 border border-white/12 rounded-2xl p-4 sm:px-6 shrink-0">
              <div>
                <div className="text-xs text-slate-300 uppercase tracking-wider font-medium">
                  Precisión Global
                </div>
                <div className="font-display text-3xl sm:text-4xl font-extrabold text-[#00D2FF] font-mono-num">
                  {totalPercentage}%
                </div>
                <div className="text-xs text-slate-300 mt-0.5 font-mono-num">
                  {totalCorrect}/{activeQuestions.length} aciertos ·{' '}
                  <strong>{totalScaled} pts PAA</strong>
                </div>
              </div>
            </div>
          </div>

          {/* Section Breakdown Cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mt-6 pt-6 border-t border-white/10">
            {readingQuestions.length > 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                    <VerbalPAAIcon size={22} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-300">Módulo</div>
                    <div className="font-display font-bold text-sm sm:text-base">
                      Lectura y Redacción
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono-num">
                  <div className="text-lg font-bold text-white">
                    {readingCorrect}/{readingQuestions.length}
                  </div>
                  <div className="text-[11px] text-[#00D2FF]">
                    ~{readingScaled} pts PAA
                  </div>
                </div>
              </div>
            )}

            {mathQuestions.length > 0 && (
              <div className="rounded-xl bg-white/5 border border-white/10 p-4 flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-white/10 border border-white/15 flex items-center justify-center">
                    <MathPAAIcon size={22} />
                  </div>
                  <div>
                    <div className="text-xs text-slate-300">Módulo</div>
                    <div className="font-display font-bold text-sm sm:text-base">
                      Matemáticas
                    </div>
                  </div>
                </div>
                <div className="text-right font-mono-num">
                  <div className="text-lg font-bold text-white">
                    {mathCorrect}/{mathQuestions.length}
                  </div>
                  <div className="text-[11px] text-[#00D2FF]">
                    ~{mathScaled} pts PAA
                  </div>
                </div>
              </div>
            )}
          </div>
        </section>

        {/* Detailed Question-by-Question Review & Explanations */}
        <section className="space-y-4">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <h2 className="font-display text-lg sm:text-xl font-bold text-[#0A1128] flex items-center gap-2">
              <Sparkles className="w-5 h-5 text-[#0052FF]" />
              Retroalimentación y Solucionario Paso a Paso
            </h2>

            {/* Filter Pills */}
            <div className="flex flex-wrap gap-2">
              <button
                type="button"
                onClick={() => setFilter('all')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'all'
                    ? 'bg-[#0A1128] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                Todas ({activeQuestions.length})
              </button>
              {readingQuestions.length > 0 && mathQuestions.length > 0 && (
                <>
                  <button
                    type="button"
                    onClick={() => setFilter('reading')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filter === 'reading'
                        ? 'bg-[#0A1128] text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    Lectura ({readingQuestions.length})
                  </button>
                  <button
                    type="button"
                    onClick={() => setFilter('math')}
                    className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                      filter === 'math'
                        ? 'bg-[#0A1128] text-white'
                        : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                    }`}
                  >
                    Matemáticas ({mathQuestions.length})
                  </button>
                </>
              )}
              <button
                type="button"
                onClick={() => setFilter('incorrect')}
                className={`px-3 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer ${
                  filter === 'incorrect'
                    ? 'bg-[#0A1128] text-white'
                    : 'bg-white text-slate-600 border border-slate-200 hover:border-slate-300'
                }`}
              >
                Por reforzar ({activeQuestions.length - totalCorrect})
              </button>
            </div>
          </div>

          {filteredQuestions.length === 0 ? (
            <div className="bg-white rounded-2xl border border-slate-200 p-8 text-center text-sm text-slate-500">
              ¡Excelente trabajo! No tienes preguntas incorrectas en este filtro.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q) => {
                const userAnswer = answers[q.id];
                const isCorrect = userAnswer === q.correctOption;

                return (
                  <article
                    key={q.id}
                    className="bg-white rounded-2xl border border-slate-200 shadow-2xs overflow-hidden"
                  >
                    {/* Review Item Header */}
                    <div className="px-5 py-3.5 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <span className="px-2.5 py-0.5 rounded-md bg-[#0A1128] text-white font-mono-num text-xs font-bold">
                          {q.section === 'reading' ? 'Lectura' : 'Matemáticas'} #
                          {q.numberInSection}
                        </span>
                        <span className="text-xs font-medium text-slate-600">
                          {q.category}
                        </span>
                      </div>

                      <div className="flex items-center gap-2">
                        {isCorrect ? (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-50 text-emerald-700 border border-emerald-200 text-xs font-bold">
                            <CheckCircle2 className="w-3.5 h-3.5" />
                            Correcta ({q.correctOption})
                          </span>
                        ) : (
                          <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-red-50 text-red-700 border border-red-200 text-xs font-bold">
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
                      <div className="text-sm sm:text-base font-medium text-[#0A1128] leading-relaxed">
                        <LatexRenderer content={q.prompt} />
                      </div>

                      {q.mathEquationBlock && (
                        <div className="rounded-xl bg-slate-50 border border-slate-200/80 p-3 text-center">
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
                              className={`p-3 rounded-xl border text-xs sm:text-sm flex items-start gap-2.5 ${
                                isThisCorrect
                                  ? 'border-emerald-500 bg-emerald-50/60 text-emerald-950 font-semibold'
                                  : isThisUser
                                  ? 'border-red-400 bg-red-50/60 text-red-950'
                                  : 'border-slate-200 bg-white text-slate-600'
                              }`}
                            >
                              <span
                                className={`w-6 h-6 rounded-md font-mono-num font-bold text-xs flex items-center justify-center shrink-0 ${
                                  isThisCorrect
                                    ? 'bg-emerald-600 text-white'
                                    : isThisUser
                                    ? 'bg-red-600 text-white'
                                    : 'bg-slate-100 text-slate-600'
                                }`}
                              >
                                {opt.id}
                              </span>
                              <div className="flex-1 pt-0.5">
                                <LatexRenderer content={opt.text} />
                              </div>
                              {isThisCorrect && (
                                <Check className="w-4 h-4 text-emerald-600 shrink-0 mt-0.5" />
                              )}
                              {!isThisCorrect && isThisUser && (
                                <X className="w-4 h-4 text-red-600 shrink-0 mt-0.5" />
                              )}
                            </div>
                          );
                        })}
                      </div>

                      {/* Step-by-Step Explanation Box with KaTeX */}
                      <div className="rounded-xl bg-[#0052FF]/6 border border-[#0052FF]/20 p-4 text-xs sm:text-sm text-[#0A1128] leading-relaxed">
                        <div className="font-display font-bold text-[#0052FF] text-xs uppercase tracking-wider mb-1.5">
                          Justificación y Solución Paso a Paso
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
