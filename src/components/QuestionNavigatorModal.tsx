import React, { useEffect, useId, useRef } from 'react';
import { X, LayoutGrid, Flag, CheckCircle2, Circle } from 'lucide-react';
import { ExamQuestion, OptionId } from '../types/exam';

interface QuestionNavigatorModalProps {
  isOpen: boolean;
  onClose: () => void;
  sectionTitle: string;
  questions: ExamQuestion[];
  currentQuestionIndex: number;
  answers: Record<string, OptionId>;
  flaggedQuestions: Record<string, boolean>;
  onSelectQuestionIndex: (index: number) => void;
  onRequestFinishSection: () => void;
}

export const QuestionNavigatorModal: React.FC<QuestionNavigatorModalProps> = ({
  isOpen,
  onClose,
  sectionTitle,
  questions,
  currentQuestionIndex,
  answers,
  flaggedQuestions,
  onSelectQuestionIndex,
  onRequestFinishSection,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      };

      dialog.addEventListener('click', handleBackdropClick);
      return () => dialog.removeEventListener('click', handleBackdropClick);
    }
  }, []);

  const answeredCount = questions.filter((q) => Boolean(answers[q.id])).length;
  const flaggedCount = questions.filter((q) => Boolean(flaggedQuestions[q.id])).length;

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as any)}
      aria-labelledby={titleId}
      onClose={onClose}
      className="paa-dialog w-[92vw] max-w-lg rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="bg-white text-[#0A1128] rounded-2xl border border-slate-200 overflow-hidden">
        {/* Header */}
        <div className="bg-[#0A1128] text-white px-5 py-4 flex items-center justify-between">
          <div className="flex items-center gap-2.5">
            <LayoutGrid className="w-5 h-5 text-[#00D2FF]" />
            <div>
              <h2 id={titleId} className="font-display font-bold text-base">
                Mapa de Preguntas
              </h2>
              <p className="text-xs text-slate-300">{sectionTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar mapa de preguntas"
            className="p-1.5 rounded-lg bg-white/10 hover:bg-white/20 text-white cursor-pointer"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Legend */}
        <div className="px-5 py-3 bg-slate-50 border-b border-slate-200 flex flex-wrap items-center justify-between gap-2 text-xs text-slate-600">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-[#0052FF]" />
            <span>
              Respondidas: <strong>{answeredCount}</strong>/{questions.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Circle className="w-4 h-4 text-slate-400" />
            <span>
              Pendientes: <strong>{questions.length - answeredCount}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flag className="w-4 h-4 fill-amber-400 text-amber-500" />
            <span>
              Con bandera: <strong>{flaggedCount}</strong>
            </span>
          </div>
        </div>

        {/* Grid of Questions */}
        <div className="p-5">
          <div className="grid grid-cols-5 gap-3">
            {questions.map((q, idx) => {
              const isCurrent = idx === currentQuestionIndex;
              const selectedOpt = answers[q.id];
              const isFlagged = Boolean(flaggedQuestions[q.id]);

              return (
                <button
                  key={q.id}
                  type="button"
                  onClick={() => {
                    onSelectQuestionIndex(idx);
                    dialogRef.current?.close();
                  }}
                  className={`relative h-14 rounded-xl border-2 flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-[#0A1128] bg-[#0A1128] text-white shadow-sm'
                      : selectedOpt
                      ? 'border-[#0052FF] bg-[#0052FF]/8 text-[#0A1128]'
                      : 'border-slate-200 bg-white hover:border-slate-300 text-slate-700'
                  }`}
                >
                  {isFlagged && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-amber-400 text-[#0A1128] flex items-center justify-center shadow-2xs">
                      <Flag className="w-2.5 h-2.5 fill-[#0A1128]" />
                    </span>
                  )}
                  <span className="font-mono-num text-sm font-bold">{q.numberInSection}</span>
                  <span
                    className={`text-[10px] font-semibold uppercase ${
                      isCurrent
                        ? 'text-[#00D2FF]'
                        : selectedOpt
                        ? 'text-[#0052FF]'
                        : 'text-slate-400'
                    }`}
                  >
                    {selectedOpt ? `Op. ${selectedOpt}` : '—'}
                  </span>
                </button>
              );
            })}
          </div>
        </div>

        {/* Footer Actions */}
        <div className="px-5 py-3.5 bg-slate-50 border-t border-slate-200 flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="px-4 py-2 rounded-lg border border-slate-300 bg-white hover:bg-slate-50 text-xs font-semibold text-slate-700 cursor-pointer"
          >
            Seguir respondiendo
          </button>

          <button
            type="button"
            onClick={() => {
              dialogRef.current?.close();
              onRequestFinishSection();
            }}
            className="px-4 py-2 rounded-lg bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs font-semibold cursor-pointer"
          >
            Finalizar esta sección
          </button>
        </div>
      </div>
    </dialog>
  );
};
