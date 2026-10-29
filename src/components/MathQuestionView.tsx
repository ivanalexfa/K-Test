import React from 'react';
import { Flag, Sigma, Check, Calculator, Sparkles } from 'lucide-react';
import { ExamQuestion, OptionId } from '../types/exam';
import { LatexRenderer } from './LatexRenderer';

interface MathQuestionViewProps {
  question: ExamQuestion;
  selectedOption?: OptionId;
  isFlagged: boolean;
  onSelectOption: (optionId: OptionId) => void;
  onToggleFlag: () => void;
  onOpenFormulaModal: () => void;
}

export const MathQuestionView: React.FC<MathQuestionViewProps> = ({
  question,
  selectedOption,
  isFlagged,
  onSelectOption,
  onToggleFlag,
  onOpenFormulaModal,
}) => {
  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 pt-4 pb-24 sm:pb-10 flex flex-col justify-start">
      {/* Main Math Problem Card */}
      <div className="bg-white rounded-2xl border border-slate-200/90 shadow-xs overflow-hidden">
        {/* Card Header */}
        <div className="px-4 sm:px-7 py-4 bg-slate-50/90 border-b border-slate-200/80 flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 rounded-lg bg-[#0A1128] text-white font-mono-num font-bold text-sm flex items-center justify-center">
              {question.numberInSection}
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-semibold text-[#0A1128] bg-slate-200/80 px-2.5 py-1 rounded-md">
              <Calculator className="w-3.5 h-3.5 text-[#0052FF]" />
              {question.category}
            </span>
          </div>

          <div className="flex items-center gap-2">
            {/* Quick Formula Sheet Trigger inside Card */}
            <button
              type="button"
              onClick={onOpenFormulaModal}
              className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold bg-[#0052FF]/10 hover:bg-[#0052FF]/18 text-[#0052FF] border border-[#0052FF]/20 transition-colors cursor-pointer"
            >
              <Sigma className="w-3.5 h-3.5" />
              <span>Fórmulas Geométricas PAA</span>
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
              <span className="hidden sm:inline">
                {isFlagged ? 'Marcada para revisión' : 'Marcar'}
              </span>
            </button>
          </div>
        </div>

        {/* Question Body */}
        <div className="p-5 sm:p-8 space-y-6">
          {/* Problem Statement with Inline LaTeX */}
          <div className="text-base sm:text-lg font-medium text-[#0A1128] leading-relaxed">
            <LatexRenderer content={question.prompt} />
          </div>

          {/* Highlighted Mathematical Expression / Equation Block */}
          {question.mathEquationBlock && (
            <div className="rounded-xl bg-[#F8FAFC] border border-slate-200/90 px-4 py-4 sm:py-5 text-center shadow-2xs">
              <div className="text-[11px] font-mono-num uppercase tracking-wider text-slate-400 mb-1 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-[#0052FF]" />
                Expresión / Relación Matemática
              </div>
              <div className="text-base sm:text-lg text-[#0A1128]">
                <LatexRenderer content={question.mathEquationBlock} blockMode />
              </div>
            </div>
          )}

          {/* 4 Multiple Choice Options (A, B, C, D) with KaTeX */}
          <div>
            <div className="text-xs font-semibold uppercase tracking-wider text-slate-400 mb-3">
              Selecciona una opción (A, B, C o D):
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
              role="radiogroup"
              aria-label="Opciones de respuesta matemática"
            >
              {question.options.map((option) => {
                const isSelected = selectedOption === option.id;
                return (
                  <button
                    key={option.id}
                    type="button"
                    role="radio"
                    aria-checked={isSelected}
                    onClick={() => onSelectOption(option.id)}
                    className={`text-left p-4 sm:p-5 rounded-xl border-2 transition-all flex items-center gap-3.5 cursor-pointer group ${
                      isSelected
                        ? 'border-[#0052FF] bg-[#0052FF]/6 shadow-xs'
                        : 'border-slate-200 hover:border-slate-300 bg-white hover:bg-slate-50/70'
                    }`}
                  >
                    <span
                      className={`w-9 h-9 rounded-lg font-display font-bold text-sm flex items-center justify-center shrink-0 transition-colors ${
                        isSelected
                          ? 'bg-[#0052FF] text-white shadow-xs shadow-[#0052FF]/30'
                          : 'bg-slate-100 text-slate-700 group-hover:bg-slate-200'
                      }`}
                    >
                      {option.id}
                    </span>

                    <div
                      className={`flex-1 text-sm sm:text-base overflow-x-auto ${
                        isSelected ? 'text-[#0A1128] font-semibold' : 'text-slate-800'
                      }`}
                    >
                      <LatexRenderer content={option.text} />
                    </div>

                    {isSelected && (
                      <span className="w-5 h-5 rounded-full bg-[#0052FF] text-white flex items-center justify-center shrink-0">
                        <Check className="w-3 h-3 stroke-[3]" />
                      </span>
                    )}
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
