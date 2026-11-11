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
      className="paa-dialog w-[92vw] max-w-lg overflow-hidden"
    >
      <div className="bg-key-blanco text-key-tinta border-[0.8px] border-key-negro overflow-hidden">
        {/* Header */}
        <div className="bg-key-blanco text-key-tinta px-5 py-4 border-b-[0.8px] border-key-negro flex items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <LayoutGrid className="w-5 h-5 text-key-azul" />
            <div>
              <h2 id={titleId} className="font-display font-bold text-base">
                Mapa de preguntas
              </h2>
              <p className="text-sm text-key-texto-suave">{sectionTitle}</p>
            </div>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar mapa de preguntas"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-key-tinta transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* Status Legend */}
        <div className="px-5 py-3 border-b-[0.8px] border-key-negro flex flex-wrap items-center justify-between gap-2 text-xs text-key-texto-suave">
          <div className="flex items-center gap-1.5">
            <CheckCircle2 className="w-4 h-4 text-key-azul" />
            <span>
              Respondidas: <strong>{answeredCount}</strong>/{questions.length}
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Circle className="w-4 h-4 text-key-texto-suave" />
            <span>
              Pendientes: <strong>{questions.length - answeredCount}</strong>
            </span>
          </div>
          <div className="flex items-center gap-1.5">
            <Flag className="w-4 h-4 fill-estado-alerta text-estado-alerta" />
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
                  className={`relative h-14 border-[0.8px] flex flex-col items-center justify-center transition-all cursor-pointer ${
                    isCurrent
                      ? 'border-key-azul bg-key-azul text-key-blanco'
                      : selectedOpt
                      ? 'border-key-negro bg-key-gris-claro text-key-tinta'
                      : 'border-key-negro bg-key-blanco hover:border-key-negro text-key-texto'
                  }`}
                >
                  {isFlagged && (
                    <span className="absolute -top-1.5 -right-1.5 w-4 h-4 rounded-full bg-estado-alerta text-key-blanco flex items-center justify-center">
                      <Flag className="w-2.5 h-2.5 fill-key-blanco" />
                    </span>
                  )}
                  <span className="font-mono-num text-sm font-bold">{q.numberInSection}</span>
                  <span
                    className={`text-xs font-semibold ${
                      isCurrent
                        ? 'text-key-blanco'
                        : selectedOpt
                        ? 'text-key-azul'
                        : 'text-key-texto-suave'
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
        <div className="px-5 py-3.5 bg-key-blanco border-t-[0.8px] border-key-negro flex items-center justify-between gap-3">
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-sm font-semibold text-key-tinta transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
          >
            Seguir respondiendo
          </button>

          <button
            type="button"
            onClick={() => {
              dialogRef.current?.close();
              onRequestFinishSection();
            }}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-key-azul hover:bg-key-azul-hover text-sm font-semibold text-key-blanco transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
          >
            Finalizar esta sección
          </button>
        </div>
      </div>
    </dialog>
  );
};
