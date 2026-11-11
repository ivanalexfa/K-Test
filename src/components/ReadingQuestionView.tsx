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
      <div className="lg:hidden sticky top-15 z-20 bg-key-blanco pb-3 pt-1">
        <div className="grid grid-cols-2 border-[0.8px] border-key-negro">
          <button
            type="button"
            onClick={() => setMobileTab('passage')}
            className={`flex items-center justify-center gap-2 h-11 px-3 text-sm font-semibold transition-all cursor-pointer ${
              mobileTab === 'passage'
                ? 'bg-key-azul text-key-blanco'
                : 'bg-key-blanco text-key-tinta hover:bg-key-gris-claro'
            }`}
          >
            <BookOpen aria-hidden="true" className="w-4 h-4" />
            <span>Pasaje</span>
            {question.referencedLinesLabel && (
              <span className="w-2 h-2 rounded-full bg-estado-alerta" />
            )}
          </button>

          <button
            type="button"
            onClick={() => setMobileTab('question')}
            className={`flex items-center justify-center gap-2 h-11 px-3 text-sm font-semibold transition-all cursor-pointer ${
              mobileTab === 'question'
                ? 'bg-key-azul text-key-blanco'
                : 'bg-key-blanco text-key-tinta hover:bg-key-gris-claro'
            }`}
          >
            <HelpCircle aria-hidden="true" className="w-4 h-4" />
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
          className={`lg:col-span-6 bg-key-blanco border-[0.8px] border-key-negro flex flex-col lg:h-full lg:overflow-hidden ${
            mobileTab === 'passage' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Passage Header */}
          <div className="px-4 sm:px-6 py-4 bg-key-blanco border-b-[0.8px] border-key-negro shrink-0">
            <div className="flex flex-wrap items-center justify-between gap-2 mb-1.5">
              <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-key-tinta [&>svg]:text-key-azul">
                <FileText className="w-3 h-3" />
                {passage.tag}
              </span>

              {question.referencedLinesLabel && (
                <button
                  type="button"
                  onClick={scrollToReferencedLines}
                  className="inline-flex items-center gap-1 text-xs font-semibold text-key-azul bg-key-gris-claro hover:bg-key-gris-claro px-2.5 py-1 transition-colors cursor-pointer"
                >
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Enfoque: {question.referencedLinesLabel}</span>
                </button>
              )}
            </div>

            <h2 className="font-display text-base sm:text-lg font-bold text-key-tinta leading-snug">
              {passage.title}
            </h2>
            <p className="text-xs text-key-texto-suave mt-0.5">{passage.authorOrSource}</p>
          </div>

          {/* Passage Scrollable Body with Line Numbers (every 5 lines: 5, 10, 15...) */}
          <div className="flex-1 overflow-y-auto custom-scrollbar px-3 sm:px-6 py-5">
            {/* Preamble */}
            <p className="text-xs sm:text-sm italic text-key-texto-suave bg-key-gris-claro p-3.5 border-[0.8px] border-key-negro mb-5 leading-relaxed">
              {passage.preamble}
            </p>

            {/* Column Header for Line Numbers */}
            <div className="flex items-center gap-3 pb-2 mb-3 border-b-[0.8px] border-key-gris text-xs font-mono-num text-key-texto-suave">
              <span className="w-9 text-right shrink-0">Línea</span>
              <span>Texto del pasaje</span>
            </div>

            {/* Numbered Lines List */}
            <div className="space-y-0.5 text-sm sm:text-[15px] leading-relaxed text-key-texto">
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
                    className={`group flex items-baseline gap-3 py-1 px-2 transition-colors ${
                      line.isParagraphStart && line.lineNumber > 1 ? 'mt-3' : ''
                    } ${
                      isReferenced
                        ? 'bg-estado-alerta-fondo border-l-4 border-key-azul text-key-tinta font-medium'
                        : 'hover:bg-key-gris-claro'
                    }`}
                  >
                    {/* Line Number Margin (Every 5 lines per PAA standard, or if actively referenced) */}
                    <span
                      className={`w-8 text-right font-mono-num text-xs shrink-0 select-none ${
                        isReferenced
                          ? 'text-key-azul font-bold'
                          : isMultipleOfFive
                          ? 'text-key-texto-suave font-semibold'
                          : 'text-transparent group-hover:text-key-texto-suave'
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
                        <span className="ml-2 inline-flex items-center px-1.5 py-0.5 text-xs font-bold bg-key-azul text-key-blanco align-middle">
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
          className={`lg:col-span-6 bg-key-blanco border-[0.8px] border-key-negro flex flex-col lg:h-full lg:overflow-hidden ${
            mobileTab === 'question' ? 'flex' : 'hidden lg:flex'
          }`}
        >
          {/* Question Top Bar */}
          <div className="px-4 sm:px-6 py-4 bg-key-blanco border-b-[0.8px] border-key-negro flex flex-wrap items-center justify-between gap-2 shrink-0">
            <div className="flex items-center gap-2.5">
              <span className="w-7 h-7 border-[0.8px] border-key-negro text-key-tinta font-mono-num font-bold text-xs flex items-center justify-center">
                {question.numberInSection}
              </span>
              <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-key-texto-suave">
                <VerbalPAAIcon size={15} />
                {question.category}
              </span>
            </div>

            <div className="flex items-center gap-2">
              <button
                type="button"
                onClick={() => setShowKeyHint((v) => !v)}
                title="Mostrar pista o asistencia guiada"
                className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-sm font-semibold border-[0.8px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul ${
                  showKeyHint
                    ? 'bg-estado-alerta-fondo border-estado-alerta text-estado-alerta'
                    : 'bg-key-blanco border-key-negro text-key-tinta hover:bg-key-gris-claro'
                }`}
              >
                <KeyHintIcon size={16} />
                <span>Pista</span>
              </button>

              <button
                type="button"
                onClick={onToggleFlag}
                className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-sm font-semibold border-[0.8px] transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul ${
                  isFlagged
                    ? 'bg-estado-alerta-fondo border-estado-alerta text-estado-alerta'
                    : 'bg-key-blanco border-key-negro text-key-tinta hover:bg-key-gris-claro'
                }`}
              >
                <Flag
                  className={`w-3.5 h-3.5 ${
                    isFlagged ? 'fill-estado-alerta text-estado-alerta' : 'text-key-texto-suave'
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
              <div className="p-3.5 bg-estado-alerta-fondo border-[0.8px] border-estado-alerta/40 text-xs sm:text-sm text-estado-alerta flex items-start gap-3">
                <KeyHintIcon size={20} className="shrink-0 mt-0.5" />
                <div>
                  <div className="font-display font-bold text-xs text-estado-alerta mb-0.5">
                    Pista de Key ({question.category})
                  </div>
                  <p className="text-xs leading-relaxed text-estado-alerta">
                    {question.referencedLinesLabel
                      ? `Ubica primero ${question.referencedLinesLabel} en el pasaje e identifica la idea principal del párrafo antes de comparar los distractores.`
                      : 'Analiza el tono global del autor y utiliza el botón de descarte en las opciones que contradigan la evidencia textual.'}
                  </p>
                </div>
              </div>
            )}

            {/* Referenced Lines Chip */}
            {question.referencedLinesLabel && (
              <div className="flex items-center justify-between gap-2 p-3 bg-key-gris-claro border-[0.8px] border-key-azul">
                <div className="flex items-center gap-2 text-xs font-semibold text-key-azul">
                  <Sparkles className="w-4 h-4 shrink-0" />
                  <span>
                    Referencia directa en el texto:{' '}
                    <strong>{question.referencedLinesLabel}</strong>
                  </span>
                </div>

                <button
                  type="button"
                  onClick={handleJumpToPassageLines}
                  className="inline-flex items-center gap-1 text-xs font-bold text-key-tinta hover:text-key-azul underline underline-offset-2 cursor-pointer"
                >
                  <span>Localizar en pasaje</span>
                  <ArrowUpRight className="w-3.5 h-3.5" />
                </button>
              </div>
            )}

            {/* Question Prompt */}
            <div className="text-base sm:text-[17px] font-medium text-key-tinta leading-relaxed">
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
                    className={`w-full border-[0.8px] transition-colors flex items-center gap-2 pr-2.5 ${
                      isSelected
                        ? 'border-key-azul bg-key-gris-claro ring-1 ring-inset ring-key-azul'
                        : isStruck
                        ? 'border-key-negro bg-key-gris-claro opacity-60'
                        : 'border-key-negro bg-key-blanco hover:bg-key-gris-claro'
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
                        className={`w-8 h-8 font-display font-bold text-sm flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-key-azul text-key-blanco'
                            : 'border-[0.8px] border-key-negro text-key-tinta'
                        }`}
                      >
                        {option.id}
                      </span>

                      <span
                        className={`flex-1 text-sm sm:text-[15px] leading-relaxed pt-0.5 ${
                          isStruck ? 'line-through text-key-texto-suave' : ''
                        } ${
                          isSelected ? 'text-key-tinta font-semibold' : 'text-key-texto'
                        }`}
                      >
                        <LatexRenderer content={option.text} />
                      </span>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-key-azul text-key-blanco flex items-center justify-center shrink-0 mt-1">
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
                      className={`p-2 rounded-full border-[0.8px] transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-key-azul ${
                        isStruck
                          ? 'bg-estado-error-fondo border-estado-error text-estado-error'
                          : 'bg-key-blanco border-transparent hover:border-key-negro text-key-texto-suave hover:text-key-texto'
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
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-key-blanco text-key-tinta text-sm font-semibold border-[0.8px] border-key-negro cursor-pointer motion-safe:active:scale-[0.97]"
          >
            <BookOpen aria-hidden="true" className="w-4 h-4 text-key-azul" />
            <span>
              {question.referencedLinesLabel
                ? `Ver ${question.referencedLinesLabel}`
                : 'Ver pasaje'}
            </span>
          </button>
        ) : (
          <button
            type="button"
            onClick={() => setMobileTab('question')}
            className="flex items-center gap-2 px-4 py-2.5 rounded-full bg-key-azul text-key-blanco text-sm font-semibold cursor-pointer motion-safe:active:scale-[0.97]"
          >
            <HelpCircle className="w-3.5 h-3.5 text-key-blanco" />
            <span>Responder pregunta {question.numberInSection}</span>
          </button>
        )}
      </div>
    </div>
  );
};
