import React, { useState, useEffect, useRef } from 'react';
import {
  BookOpen,
  HelpCircle,
  Flag,
  Sparkles,
  ArrowUpRight,
  Check,
  FileText,
} from 'lucide-react';
import { ExamQuestion, OptionId, ReadingPassage } from '../types/exam';
import { LatexRenderer } from './LatexRenderer';
import {
  VerbalPAAIcon,
  StrikeOptionIcon,
  KeyHintIcon,
} from './brand/KTestIcons';

interface ReadingQuestionViewProps {
  question: ExamQuestion;
  passage: ReadingPassage;
  selectedOption?: OptionId;
  isFlagged: boolean;
  onSelectOption: (optionId: OptionId) => void;
  onToggleFlag: () => void;
  totalQuestionsInSection: number;
}

export const ReadingQuestionView: React.FC<ReadingQuestionViewProps> = ({
  question,
  passage,
  selectedOption,
  isFlagged,
  onSelectOption,
  onToggleFlag,
  totalQuestionsInSection,
}) => {
  // Mobile tab state: 'passage' | 'question'
  const [mobileTab, setMobileTab] = useState<'passage' | 'question'>('question');
  const [struckOptions, setStruckOptions] = useState<Record<string, boolean>>({});
  const [showKeyHint, setShowKeyHint] = useState<boolean>(false);
  const lineRefs = useRef<Record<number, HTMLDivElement | null>>({});

  const referencedSet = new Set(question.referencedLines ?? []);
  const firstReferencedLine = question.referencedLines?.[0];

  // Reset hint & struck options when switching questions (adjusted during render,
  // not in an effect: https://react.dev/learn/you-might-not-need-an-effect)
  const [shownQuestionId, setShownQuestionId] = useState(question.id);
  if (shownQuestionId !== question.id) {
    setShownQuestionId(question.id);
    setShowKeyHint(false);
    setStruckOptions({});
  }

  const toggleStrikeOption = (e: React.MouseEvent, optId: OptionId) => {
    e.stopPropagation();
    setStruckOptions((prev) => ({
      ...prev,
      [optId]: !prev[optId],
    }));
  };

  // Auto-scroll to referenced line in desktop or when switching to passage tab on mobile
  const scrollToReferencedLines = () => {
    if (!firstReferencedLine) return;
    const targetEl = lineRefs.current[firstReferencedLine];
    if (targetEl) {
      targetEl.scrollIntoView({ behavior: 'smooth', block: 'center' });
    }
  };

  useEffect(() => {
    // Slightly delay to ensure DOM is ready when question changes
    const timer = setTimeout(() => {
      scrollToReferencedLines();
    }, 120);
    return () => clearTimeout(timer);
  }, [question.id, mobileTab]);

  const handleJumpToPassageLines = () => {
    setMobileTab('passage');
    setTimeout(() => {
      scrollToReferencedLines();
    }, 80);
  };

  return (
    <div className="flex-1 flex flex-col max-w-7xl w-full mx-auto px-3 sm:px-6 pt-3 pb-24 lg:pb-6 lg:h-[calc(100dvh-8.5rem)] lg:overflow-hidden">
      {/* Mobile-First Segmented Tabs (< 1024px) */}
      <div className="lg:hidden sticky top-15 z-20 bg-[#F8FAFC]/95 backdrop-blur-xs pb-3 pt-1">
        <div className="grid grid-cols-2 p-1 rounded-xl bg-slate-200/80 border border-slate-300/70">
          <button
            type="button"
            onClick={() => setMobileTab('passage')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              mobileTab === 'passage'
                ? 'bg-[#0A1128] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0A1128]'
            }`}
          >
            <BookOpen className="w-4 h-4 text-[#00D2FF]" />
            <span>Pasaje de Lectura</span>
            {question.referencedLinesLabel && (
              <span className="w-2 h-2 rounded-full bg-amber-400" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('question')}
            className={`flex items-center justify-center gap-2 py-2 px-3 rounded-lg text-xs sm:text-sm font-semibold transition-all cursor-pointer ${
              mobileTab === 'question'
                ? 'bg-[#0A1128] text-white shadow-xs'
                : 'text-slate-600 hover:text-[#0A1128]'
            }`}
          >
            <HelpCircle className="w-4 h-4 text-[#00D2FF]" />
            <span>
              Pregunta ({question.numberInSection}/{totalQuestionsInSection})
            </span>
          </button>
        </div>
      </div>

      {/* Main Split-Screen Container (Desktop 2 Columns / Mobile Tabbed) */}
      <div className="flex-1 grid grid-cols-1 lg:grid-cols-12 gap-4 lg:gap-6 lg:min-h-0">
        {/* LEFT PANE: Reading Passage with Numbered Lines */}
        <section
          aria-label="Pasaje de lectura"
          className={`lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:h-full lg:overflow-hidden ${
            mobileTab === 'passage' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Passage Header */}
          <div className="px-4 sm:px-6 py-4 bg-slate-50/80 border-b border-slate-200/80 shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-md bg-[#0A1128] text-[#00D2FF] text-[11px] font-semibold tracking-wide uppercase">
                <FileText className="w-3 h-3" />
                {passage.tag}
              </span>

              {question.referencedLinesLabel && (
                <button
                  type="button"
                  onClick={scrollToReferencedLines}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-[#0052FF] bg-[#0052FF]/8 hover:bg-[#0052FF]/15 px-2.5 py-1 rounded-md transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Enfoque: {question.referencedLinesLabel}</span>
                </button>
              )}
            </div>

            <h2 className="font-display text-base sm:text-lg font-bold text-[#0A1128] leading-snug">
              {passage.title}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">{passage.authorOrSource}</p>
          </div>

          {/* Passage Scrollable Body with Line Numbers (every 5 lines: 5, 10, 15...) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-6 py-5">
            {/* Preamble */}
            <p className="text-xs sm:text-sm italic text-slate-600 bg-slate-50 p-3.5 rounded-xl border border-slate-200/60 mb-5 leading-relaxed">
              {passage.preamble}
            </p>

            {/* Column Header for Line Numbers */}
            <div className="flex items-center gap-3 pb-2 mb-3 border-b border-slate-100 text-[11px] font-mono-num uppercase tracking-wider text-slate-400">
              <span className="w-9 text-right shrink-0">Línea</span>
              <span>Texto del pasaje</span>
            </div>

            {/* Numbered Lines List */}
            <div className="space-y-0.5 text-sm sm:text-[15px] leading-relaxed text-slate-800">
              {passage.lines.map((line) => {
                const isMultipleOfFive = line.lineNumber % 5 === 0;
                const isReferenced = referencedSet.has(line.lineNumber);
                const isFirstReferenced = line.lineNumber === firstReferencedLine;

                return (
                  <div
                    key={line.lineNumber}
                    ref={(el) => {
                      lineRefs.current[line.lineNumber] = el;
                    }}
                    className={`group flex items-baseline gap-3 py-1 px-2 rounded-lg transition-colors ${
                      line.isParagraphStart && line.lineNumber > 1 ? 'mt-3' : ''
                    } ${
                      isReferenced
                        ? 'bg-amber-100/80 border-l-4 border-[#0052FF] text-[#0A1128] font-medium'
                        : 'hover:bg-slate-50'
                    }`}
                  >
                    {/* Line Number Margin (Every 5 lines per PAA standard, or if actively referenced) */}
                    <span
                      className={`w-8 text-right font-mono-num text-xs shrink-0 select-none ${
                        isReferenced
                          ? 'text-[#0052FF] font-bold'
                          : isMultipleOfFive
                          ? 'text-slate-400 font-semibold'
                          : 'text-transparent group-hover:text-slate-300'
                      }`}
                    >
                      {isMultipleOfFive || isReferenced ? `(${line.lineNumber})` : line.lineNumber}
                    </span>

                    {/* Line Text */}
                    <div className="flex-1">
                      {line.isParagraphStart && (
                        <span className="inline-block w-4" aria-hidden="true" />
                      )}
                      <span>{line.text}</span>
                      {isFirstReferenced && (
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-[#0052FF] text-white align-middle">
                          Pregunta {question.numberInSection}
                        </span>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* RIGHT PANE: Question & Multiple Choice Options (A, B, C, D) */}
        <section
          aria-label="Pregunta y opciones"
          className={`lg:col-span-6 bg-white rounded-2xl border border-slate-200/90 shadow-xs flex flex-col lg:h-full lg:overflow-hidden ${
            mobileTab === 'question' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Question Top Bar */}
          <div className="px-4 sm:px-6 py-4 bg-slate-50/80 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 rounded-lg bg-[#0A1128] text-white font-mono-num font-bold text-xs flex items-center justify-center">
                {question.numberInSection}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-slate-700 bg-slate-200/70 px-2.5 py-1 rounded-md">
                <VerbalPAAIcon size={15} />
                {question.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowKeyHint((v) => !v)}
                title="Mostrar pista o asistencia guiada"
                className={`inline-flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  showKeyHint
                    ? 'bg-amber-50 border-amber-400 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-amber-300 hover:text-[#0A1128]'
                }`}
              >
                <KeyHintIcon size={16} />
                <span>Pista Key</span>
              </button>

              <button
                type="button"
                onClick={onToggleFlag}
                className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all cursor-pointer ${
                  isFlagged
                    ? 'bg-amber-50 border-amber-400 text-amber-800'
                    : 'bg-white border-slate-200 text-slate-600 hover:border-slate-300 hover:text-[#0A1128]'
                }`}
              >
                <Flag
                  className={`w-3.5 h-3.5 ${
                    isFlagged ? 'fill-amber-400 text-amber-500' : 'text-slate-400'
                  }`}
                />
                <span>{isFlagged ? 'Marcada' : 'Marcar'}</span>
              </button>
            </div>
          </div>

          {/* Question Prompt & Options Scroll Container */}
          <div className="flex-1 overflow-y-auto custom-scrollbar p-4 sm:p-6 space-y-6">
            {/* Guided Key Hint Callout */}
            {showKeyHint && (
              <div className="p-3.5 rounded-xl bg-[#FFFBEB] border border-[#F59E0B]/40 text-xs sm:text-sm text-amber-950 flex items-start gap-3">
                <KeyHintIcon size={20} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-display font-bold text-xs uppercase tracking-wider text-amber-800 mb-0.5">
                    Asistencia Guiada K-Test ({question.category})
                  </div>
                  <p className="text-xs leading-relaxed text-amber-900">
                    {question.referencedLinesLabel
                      ? `Ubica primero ${question.referencedLinesLabel} en el pasaje e identifica la idea principal del párrafo antes de comparar los distractores.`
                      : 'Analiza el tono global del autor y utiliza el botón de descarte en las opciones que contradigan la evidencia textual.'}
                  </p>
                </div>
              </div>
            )}

            {/* Referenced Lines Chip */}
            {question.referencedLinesLabel && (
              <div className="flex items-center justify-between gap-2 p-3 rounded-xl bg-[#0052FF]/6 border border-[#0052FF]/20">
                <div className="flex items-center gap-2 text-xs font-semibold text-[#0052FF]">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>
                    Referencia directa en el texto:{' '}
                    <strong>{question.referencedLinesLabel}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleJumpToPassageLines}
                  className="inline-flex items-center gap-1 text-xs font-bold text-[#0A1128] hover:text-[#0052FF] underline underline-offset-2 cursor-pointer"
                >
                  <span>Localizar en pasaje</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Question Prompt */}
            <div className="text-base sm:text-[17px] font-medium text-[#0A1128] leading-relaxed">
              <LatexRenderer content={question.prompt} />
            </div>

            {/* Multiple Choice Options: A, B, C, D */}
            <div className="space-y-3" role="radiogroup" aria-label="Opciones de respuesta">
              {question.options.map((option) => {
                const isSelected = selectedOption === option.id;
                const isStruck = Boolean(struckOptions[option.id]);
                return (
                  <div
                    key={option.id}
                    className={`w-full rounded-xl border-2 transition-all flex items-center gap-2 pr-2.5 ${
                      isSelected
                        ? 'border-[#0052FF] bg-[#0052FF]/6 shadow-xs'
                        : isStruck
                        ? 'border-slate-200 bg-slate-50/70 opacity-60'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                    }`}
                  >
                    <button
                      type="button"
                      role="radio"
                      aria-checked={isSelected}
                      onClick={() => onSelectOption(option.id)}
                      className="flex-1 text-left p-4 flex items-start gap-3.5 cursor-pointer group"
                    >
                      <span
                        className={`w-8 h-8 rounded-lg font-display font-bold text-sm flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-[#0052FF] text-white shadow-xs shadow-[#0052FF]/30'
                            : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                        }`}
                      >
                        {option.id}
                      </span>

                      <span
                        className={`flex-1 text-sm sm:text-[15px] leading-relaxed pt-0.5 ${
                          isStruck ? 'line-through text-slate-400' : ''
                        } ${
                          isSelected ? 'text-[#0A1128] font-semibold' : 'text-slate-700'
                        }`}
                      >
                        <LatexRenderer content={option.text} />
                      </span>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-[#0052FF] text-white flex items-center justify-center shrink-0 mt-1">
                          <Check className="w-3 h-3 stroke-[3]" />
                        </span>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={(e) => toggleStrikeOption(e, option.id)}
                      title={
                        isStruck
                          ? `Restaurar opción ${option.id}`
                          : `Descartar / tachar opción ${option.id}`
                      }
                      aria-label={
                        isStruck
                          ? `Restaurar opción ${option.id}`
                          : `Descartar opción ${option.id}`
                      }
                      className={`p-2 rounded-lg border transition-colors cursor-pointer shrink-0 ${
                        isStruck
                          ? 'bg-red-50 border-red-200 text-red-600'
                          : 'bg-white border-transparent hover:border-slate-200 text-slate-400 hover:text-slate-700'
                      }`}
                    >
                      <StrikeOptionIcon size={18} />
                    </button>
                  </div>
                );
              })}
            </div>
          </div>
        </section>
      </div>

      {/* Floating Quick-Switch Pill on Mobile (< 1024px) */}
      <div className="lg:hidden fixed bottom-18 right-4 z-20">
        {mobileTab === 'question' ? (
          <button
            type="button"
            onClick={handleJumpToPassageLines}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0A1128] text-white text-xs font-semibold shadow-lg border border-white/15 cursor-pointer active:scale-95"
          >
            <BookOpen className="w-3.5 h-3.5 text-[#00D2FF]" />
            <span>
              {question.referencedLinesLabel
                ? `Ver ${question.referencedLinesLabel}`
                : 'Ver Pasaje'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMobileTab('question')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-[#0052FF] text-white text-xs font-semibold shadow-lg cursor-pointer active:scale-95"
          >
            <HelpCircle className="w-3.5 h-3.5 text-white" />
            <span>Responder Pregunta {question.numberInSection}</span>
          </button>
        )}
      </div>
    </div>
  );
};
