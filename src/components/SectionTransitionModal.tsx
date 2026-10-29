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
      className="paa-dialog w-[92vw] max-w-md rounded-2xl shadow-2xl overflow-hidden"
    >
      <div className="bg-white text-[#0A1128] rounded-2xl border border-slate-200 overflow-hidden">
        <div className="p-6">
          <div className="w-11 h-11 rounded-xl bg-[#0A1128] text-[#00D2FF] flex items-center justify-center mb-4">
            {unansweredCount > 0 ? (
              <AlertTriangle className="w-6 h-6 text-amber-400" />
            ) : (
              <CheckCircle2 className="w-6 h-6 text-[#00D2FF]" />
            )}
          </div>

          <h2 id={titleId} className="font-display font-bold text-lg text-[#0A1128] mb-1">
            {isAdvancingToMath
              ? '¿Finalizar Sección de Lectura y Redacción?'
              : '¿Entregar y Guardar Resultados en Base de Datos?'}
          </h2>
          <p className="text-xs sm:text-sm text-slate-600 leading-relaxed mb-5">
            {isAdvancingToMath
              ? 'Por el flujo secuencial estricto de la PAA, una vez que avances a la Sección 2 (Matemáticas) no podrás regresar a modificar tus respuestas de Lectura y Redacción.'
              : 'Tus respuestas y tu puntaje se guardarán automáticamente en la base de datos SQLite asociados a tu usuario.'}
          </p>

          {/* Summary Stats */}
          <div className="rounded-xl bg-slate-50 border border-slate-200 p-4 space-y-2.5 text-xs sm:text-sm mb-6">
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Sección actual:</span>
              <span className="font-semibold text-[#0A1128]">{sectionTitle}</span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-600">Preguntas respondidas:</span>
              <span className="font-mono-num font-bold text-[#0052FF]">
                {answeredCount} / {totalQuestions}
              </span>
            </div>
            {unansweredCount > 0 && (
              <div className="flex items-center justify-between text-amber-700 font-medium">
                <span>Preguntas sin responder:</span>
                <span className="font-mono-num font-bold">{unansweredCount}</span>
              </div>
            )}
            {flaggedCount > 0 && (
              <div className="flex items-center justify-between text-amber-700">
                <span className="flex items-center gap-1">
                  <Flag className="w-3.5 h-3.5 fill-amber-400" />
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
              className="w-full sm:w-auto px-4 py-2.5 rounded-xl border border-slate-300 bg-white hover:bg-slate-50 text-xs sm:text-sm font-semibold text-slate-700 cursor-pointer"
            >
              Volver y revisar
            </button>

            <button
              type="button"
              onClick={() => {
                dialogRef.current?.close();
                onConfirmAdvance();
              }}
              className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-5 py-2.5 rounded-xl bg-[#0052FF] hover:bg-[#0045D8] text-white text-xs sm:text-sm font-bold shadow-md shadow-[#0052FF]/25 cursor-pointer"
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
