import React, { useEffect, useId, useRef } from 'react';
import { Flag, X } from 'lucide-react';
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
          <div className="min-w-0">
            <h2 id={titleId} className="text-xl font-semibold text-key-tinta">
              Mapa de preguntas
            </h2>
            <p className="text-sm text-key-texto-suave truncate">{sectionTitle}</p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar mapa de preguntas"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-key-tinta transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        <p className="px-5 py-3 border-b-[0.8px] border-key-negro text-sm text-key-texto">
          <span className="font-mono-num">{answeredCount}</span> de <span className="font-mono-num">{questions.length}</span>{' '}
          respondidas
          {flaggedCount > 0 && (
            <>
              {' '}· <span className="font-mono-num">{flaggedCount}</span> {flaggedCount === 1 ? 'marcada' : 'marcadas'} para revisar
            </>
          )}
        </p>

        {/* Grid of Questions */}
        <div className="p-5">
          <div className="grid grid-cols-5 pt-[0.8px] pl-[0.8px]">
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
                  className={`relative h-16 -mt-[0.8px] -ml-[0.8px] border-[0.8px] border-key-negro flex flex-col items-center justify-center cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul ${
                    isCurrent
                      ? 'bg-key-azul text-key-blanco'
                      : selectedOpt
                      ? 'bg-key-gris-claro text-key-tinta'
                      : 'bg-key-blanco text-key-tinta hover:bg-key-gris-claro'
                  }`}
                >
                  {isFlagged && (
                    <Flag
                      aria-label="Marcada"
                      className={`absolute top-1.5 right-1.5 w-3.5 h-3.5 ${isCurrent ? 'fill-key-blanco text-key-blanco' : 'fill-estado-alerta text-estado-alerta'}`}
                    />
                  )}
                  <span className="font-mono-num font-semibold">{q.numberInSection}</span>
                  <span className={`text-xs ${isCurrent ? 'text-key-blanco' : 'text-key-texto-suave'}`}>
                    {selectedOpt ?? 'Sin responder'}
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
