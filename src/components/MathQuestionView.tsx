import React from 'react';
import { ExamQuestion, OptionId } from '../types/exam';
import { LatexRenderer } from './LatexRenderer';
import { BarraPregunta, Opciones, Pista } from './examen/piezas';
import { useEstadoPregunta } from './examen/useEstadoPregunta';

interface MathQuestionViewProps {
  question: ExamQuestion;
  selectedOption?: OptionId;
  isFlagged: boolean;
  onSelectOption: (optionId: OptionId) => void;
  onToggleFlag: () => void;
  onOpenFormulaModal: () => void;
}

/**
 * Pregunta de matemáticas (ADR examen/0002): una sola columna de lectura, sin tarjeta alrededor.
 * Arriba el número, el tema, Pista y Marcar; luego el enunciado, la expresión si la hay y las
 * cuatro opciones en celdas que se tocan. «Fórmulas» vive en el encabezado del examen.
 */
export const MathQuestionView: React.FC<MathQuestionViewProps> = ({
  question,
  selectedOption,
  isFlagged,
  onSelectOption,
  onToggleFlag,
  onOpenFormulaModal,
}) => {
  const { tachadas, tachar, pista, alternarPista } = useEstadoPregunta(question.id);

  return (
    <div className="flex-1 w-full max-w-3xl mx-auto px-5 sm:px-8 pt-6 sm:pt-8 pb-28 sm:pb-12">
      <BarraPregunta
        question={question}
        pistaAbierta={pista}
        onPista={alternarPista}
        isFlagged={isFlagged}
        onToggleFlag={onToggleFlag}
      />

      <div className="mt-5 pt-6 border-t-[0.8px] border-key-negro space-y-6">
        {pista && (
          <Pista>
            Ubica los datos y las unidades del enunciado. Si necesitas un área o un volumen,{' '}
            <button
              type="button"
              onClick={onOpenFormulaModal}
              className="font-semibold text-key-tinta underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-key-azul"
            >
              abre las fórmulas
            </button>
            . Descarta las opciones cuyo tamaño no tenga sentido.
          </Pista>
        )}

        <div className="text-lg leading-relaxed text-key-tinta">
          <LatexRenderer content={question.prompt} />
        </div>

        {question.mathEquationBlock && (
          <div className="border-[0.8px] border-key-negro px-4 py-5 text-center text-lg text-key-tinta overflow-x-auto">
            <LatexRenderer content={question.mathEquationBlock} blockMode />
          </div>
        )}

        <Opciones
          question={question}
          selectedOption={selectedOption}
          tachadas={tachadas}
          onSelectOption={onSelectOption}
          onTachar={tachar}
          columnas={2}
          etiqueta="Opciones de respuesta"
        />
      </div>
    </div>
  );
};
