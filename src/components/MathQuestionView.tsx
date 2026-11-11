import React, { useState } from 'react';
import { Flag, Sigma, Check, Sparkles } from 'lucide-react';
import { ExamQuestion, OptionId } from '../types/exam';
import { LatexRenderer } from './LatexRenderer';
import {
  MathPAAIcon,
  StrikeOptionIcon,
  KeyHintIcon,
} from './brand/KTestIcons';

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
  const [struckOptions, setStruckOptions] = useState<Record<string, boolean>>({});
  const [showKeyHint, setShowKeyHint] = useState<boolean>(false);

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

  return (
    <div className="flex-1 max-w-4xl w-full mx-auto px-3 sm:px-6 pt-4 pb-24 sm:pb-10 flex flex-col justify-start">
      {/* Main Math Problem Card */}
      <div className="bg-key-blanco border-[0.8px] border-key-negro overflow-hidden">
        {/* Card Header */}
        <div className="px-4 sm:px-7 py-4 bg-key-blanco border-b-[0.8px] border-key-negro flex flex-wrap items-center justify-between gap-2">
          <div className="flex items-center gap-2.5">
            <span className="w-8 h-8 border-[0.8px] border-key-negro text-key-tinta font-mono-num font-bold text-sm flex items-center justify-center">
              {question.numberInSection}
            </span>
            <span className="inline-flex items-center gap-1.5 text-sm font-semibold text-key-tinta">
              <MathPAAIcon size={16} />
              {question.category}
            </span>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            {/* Guided Hint Trigger */}
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

            {/* Quick Formula Sheet Trigger inside Card */}
            <button
              type="button"
              onClick={onOpenFormulaModal}
              className="inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full text-sm font-semibold bg-key-blanco hover:bg-key-gris-claro text-key-tinta border-[0.8px] border-key-negro transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
            >
              <Sigma aria-hidden="true" className="w-4 h-4 text-key-azul" />
              <span>Fórmulas</span>
            </button>

            <button
              type="button"
              onClick={onToggleFlag}
              aria-label={isFlagged ? 'Marcada para revisión' : 'Marcar para revisión'}
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
              <span className="hidden sm:inline">
                {isFlagged ? 'Marcada para revisión' : 'Marcar'}
              </span>
            </button>
          </div>
        </div>

        {/* Question Body */}
        <div className="p-5 sm:p-8 space-y-6">
          {/* Guided Key Hint Callout */}
          {showKeyHint && (
            <div className="p-3.5 bg-estado-alerta-fondo border-[0.8px] border-estado-alerta/40 text-xs sm:text-sm text-estado-alerta flex items-start gap-3">
              <KeyHintIcon size={20} className="shrink-0 mt-0.5" />
              <div>
                <div className="font-display font-bold text-xs text-estado-alerta mb-0.5">
                  Pista de Key ({question.category})
                </div>
                <p className="text-xs leading-relaxed text-estado-alerta">
                  Identifica las variables y unidades clave del planteamiento, consulta el botón de <strong>Fórmulas</strong> si requieres identidades de área/volumen y descarta opciones cuyos órdenes de magnitud no sean coherentes.
                </p>
              </div>
            </div>
          )}

          {/* Problem Statement with Inline LaTeX */}
          <div className="text-base sm:text-lg font-medium text-key-tinta leading-relaxed">
            <LatexRenderer content={question.prompt} />
          </div>

          {/* Highlighted Mathematical Expression / Equation Block */}
          {question.mathEquationBlock && (
            <div className="bg-key-blanco border-[0.8px] border-key-negro px-4 py-4 sm:py-5 text-center">
              <div className="text-sm text-key-texto-suave mb-1 flex items-center justify-center gap-1">
                <Sparkles className="w-3 h-3 text-key-azul" />
                Expresión
              </div>
              <div className="text-base sm:text-lg text-key-tinta">
                <LatexRenderer content={question.mathEquationBlock} blockMode />
              </div>
            </div>
          )}

          {/* 4 Multiple Choice Options (A, B, C, D) with KaTeX */}
          <div>
            <div className="text-sm font-medium text-key-texto-suave mb-3">
              Elige una opción
            </div>

            <div
              className="grid grid-cols-1 sm:grid-cols-2 gap-3.5"
              role="radiogroup"
              aria-label="Opciones de respuesta matemática"
            >
              {question.options.map((option) => {
                const isSelected = selectedOption === option.id;
                const isStruck = Boolean(struckOptions[option.id]);
                return (
                  <div
                    key={option.id}
                    className={`border-[0.8px] transition-colors flex items-center gap-2 pr-2.5 ${
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
                      className="flex-1 text-left p-4 sm:p-5 flex items-center gap-3.5 cursor-pointer group min-w-0"
                    >
                      <span
                        className={`w-9 h-9 font-display font-bold text-sm flex items-center justify-center shrink-0 transition-colors ${
                          isSelected
                            ? 'bg-key-azul text-key-blanco'
                            : 'border-[0.8px] border-key-negro text-key-tinta'
                        }`}
                      >
                        {option.id}
                      </span>

                      <div
                        className={`flex-1 text-sm sm:text-base overflow-x-auto ${
                          isStruck ? 'line-through text-key-texto-suave' : ''
                        } ${
                          isSelected ? 'text-key-tinta font-semibold' : 'text-key-texto'
                        }`}
                      >
                        <LatexRenderer content={option.text} />
                      </div>

                      {isSelected && (
                        <span className="w-5 h-5 rounded-full bg-key-azul text-key-blanco flex items-center justify-center shrink-0">
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
        </div>
      </div>
    </div>
  );
};
