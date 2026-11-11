import React, { useEffect, useId, useRef } from 'react';
import { AlertTriangle, ArrowRight, CheckCircle2, Flag } from 'lucide-react';
import { SectionType, TestMode } from '../types/exam';

interface SectionTransitionModalProps {
  isOpen: boolean;
  onClose: () => void;
  testMode: TestMode;
  currentSection: SectionType;
  sectionTitle: string;
  totalQuestions: number;
  answeredCount: number;
  flaggedCount: number;
  onConfirmAdvance: () => void;
}

export const SectionTransitionModal: React.FC<SectionTransitionModalProps> = ({
  isOpen,
  onClose,
  testMode,
  currentSection,
  sectionTitle,
  totalQuestions,
  answeredCount,
  flaggedCount,
  onConfirmAdvance,
}) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const unansweredCount = totalQuestions - answeredCount;
  const isAdvancingToMath = testMode === 'simulacro' && currentSection === 'reading';

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

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as any)}
      aria-labelledby={titleId}
      onClose={onClose}
      className="paa-dialog w-[92vw] max-w-md overflow-hidden"
    >
      <div className="bg-key-blanco text-key-tinta border-[0.8px] border-key-negro overflow-hidden">
        <div className="p-6">
          <div className="mb-4" aria-hidden="true">
            {unansweredCount > 0 ? (
              <AlertTriangle className="w-8 h-8 text-estado-alerta" />
            ) : (
              <CheckCircle2 className="w-8 h-8 text-key-azul" />
            )}
          </div>

          <h2 id={titleId} className="font-display font-bold text-lg text-key-tinta mb-1">
            {isAdvancingToMath
              ? '¿Terminar Lectura y Redacción?'
              : '¿Entregar y guardar tus resultados?'}
          </h2>
          <p className="text-xs sm:text-sm text-key-texto-suave leading-relaxed mb-5">
            {isAdvancingToMath
              ? 'Como en la PAA, al pasar a Matemáticas ya no podrás volver a cambiar tus respuestas de Lectura y Redacción.'
              : 'Tus respuestas y tu puntaje se guardan en tu historial para que veas el solucionario.'}
          </p>

          {/* Summary Stats */}
          <div className="border-[0.8px] border-key-negro p-4 space-y-2.5 text-xs sm:text-sm mb-6">
            <div className="flex items-center justify-between">
              <span className="text-key-texto-suave">Sección actual:</span>
              <span className="font-semibold text-key-tinta">{sectionTitle}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-key-texto-suave">Preguntas respondidas:</span>
              <span className="font-mono-num font-bold text-key-azul">
                {answeredCount} / {totalQuestions}
              </span>
            </div>
            {unansweredCount > 0 && (
              <div className="flex items-center justify-between text-estado-alerta font-medium">
                <span>Preguntas sin responder:</span>
                <span className="font-mono-num font-bold">{unansweredCount}</span>
              </div>
            )}
            {flaggedCount > 0 && (
              <div className="flex items-center justify-between text-estado-alerta">
                <span className="flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 fill-estado-alerta" />
                  Marcadas para revisión:
                </span>
                <span className="font-mono-num font-bold">{flaggedCount}</span>
              </div>
            )}
          </div>

          <div className="flex flex-col-reverse sm:flex-row items-center justify-end gap-2.5">
            <button
              type="button"
              onClick={() => dialogRef.current?.close()}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-sm font-semibold text-key-tinta transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
            >
              Volver y revisar
            </button>

            <button
              type="button"
              onClick={() => {
                dialogRef.current?.close();
                onConfirmAdvance();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-key-azul hover:bg-key-azul-hover text-sm font-semibold text-key-blanco transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
            >
              <span>
                {isAdvancingToMath
                  ? 'Avanzar a Matemáticas'
                  : 'Guardar y Ver Resultados'}
              </span>
              <ArrowRight className="w-4 h-4" />
            </button>
          </div>
        </div>
      </div>
    </dialog>
  );
};
