import React from 'react';
import { Flag, Lightbulb, Strikethrough } from 'lucide-react';
import type { ExamQuestion, OptionId } from '../../types/exam';
import { LatexRenderer } from '../LatexRenderer';

/**
 * Piezas del examen con el estilo de líneas de Key (ADR examen/0002): sin íconos decorativos
 * ni etiquetas repetidas. Las usan las preguntas de lectura y de matemáticas.
 */

const foco = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul';

/** Número de la pregunta, tema y herramientas (Pista y Marcar). */
export const BarraPregunta: React.FC<{
  question: ExamQuestion;
  pistaAbierta: boolean;
  onPista: () => void;
  isFlagged: boolean;
  onToggleFlag: () => void;
}> = ({ question, pistaAbierta, onPista, isFlagged, onToggleFlag }) => (
  <div className="flex flex-wrap items-center justify-between gap-x-4 gap-y-3">
    <div className="flex items-center gap-3 min-w-0">
      <span className="w-9 h-9 shrink-0 border-[0.8px] border-key-negro flex items-center justify-center font-mono-num font-semibold text-key-tinta">
        {question.numberInSection}
      </span>
      <span className="text-sm text-key-texto-suave truncate">{question.category}</span>
    </div>
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={onPista}
        aria-expanded={pistaAbierta}
        className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border-[0.8px] border-key-negro text-sm font-semibold transition-colors cursor-pointer ${foco} ${
          pistaAbierta ? 'bg-key-gris-claro text-key-tinta' : 'bg-key-blanco text-key-tinta hover:bg-key-gris-claro'
        }`}
      >
        <Lightbulb aria-hidden="true" className="w-4 h-4" />
        Pista
      </button>
      <button
        type="button"
        onClick={onToggleFlag}
        aria-pressed={isFlagged}
        className={`inline-flex items-center gap-1.5 h-9 px-3.5 rounded-full border-[0.8px] text-sm font-semibold transition-colors cursor-pointer ${foco} ${
          isFlagged
            ? 'bg-estado-alerta-fondo border-estado-alerta text-estado-alerta'
            : 'bg-key-blanco border-key-negro text-key-tinta hover:bg-key-gris-claro'
        }`}
      >
        <Flag aria-hidden="true" className={`w-4 h-4 ${isFlagged ? 'fill-estado-alerta' : ''}`} />
        {isFlagged ? 'Marcada' : 'Marcar'}
      </button>
    </div>
  </div>
);

/** La pista: gris claro con la línea azul a la izquierda, como la solución del solucionario. */
export const Pista: React.FC<{ children: React.ReactNode }> = ({ children }) => (
  <div role="note" className="bg-key-gris-claro border-l-2 border-key-azul px-4 py-3 text-key-texto">
    <p className="text-sm font-semibold text-key-tinta mb-0.5">Pista</p>
    <p className="text-sm leading-relaxed">{children}</p>
  </div>
);

/**
 * Opciones A–D: celdas que se tocan, la letra en su propia celda. La elegida se pinta con la
 * letra en azul y una línea azul por dentro; descartar tacha el texto (sin mover nada).
 */
export const Opciones: React.FC<{
  question: ExamQuestion;
  selectedOption?: OptionId;
  tachadas: Record<string, boolean>;
  onSelectOption: (id: OptionId) => void;
  onTachar: (id: OptionId) => void;
  columnas?: 1 | 2;
  etiqueta: string;
}> = ({ question, selectedOption, tachadas, onSelectOption, onTachar, columnas = 1, etiqueta }) => (
  <div
    role="radiogroup"
    aria-label={etiqueta}
    className={`grid border-t-[0.8px] border-l-[0.8px] border-key-negro ${columnas === 2 ? 'sm:grid-cols-2' : ''}`}
  >
    {question.options.map((opcion) => {
      const elegida = selectedOption === opcion.id;
      const tachada = Boolean(tachadas[opcion.id]);
      return (
        <div
          key={opcion.id}
          className={`flex items-stretch border-r-[0.8px] border-b-[0.8px] border-key-negro transition-colors ${
            elegida ? 'bg-key-gris-claro ring-2 ring-inset ring-key-azul' : 'bg-key-blanco hover:bg-key-gris-claro'
          }`}
        >
          <button
            type="button"
            role="radio"
            aria-checked={elegida}
            onClick={() => onSelectOption(opcion.id)}
            className="flex-1 min-w-0 flex items-center gap-4 p-4 text-left cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul"
          >
            <span
              className={`w-9 h-9 shrink-0 flex items-center justify-center font-semibold border-[0.8px] ${
                elegida ? 'bg-key-azul border-key-azul text-key-blanco' : 'border-key-negro text-key-tinta'
              }`}
            >
              {opcion.id}
            </span>
            <span
              className={`flex-1 min-w-0 overflow-x-auto text-base leading-relaxed ${
                tachada ? 'line-through text-key-texto-suave' : 'text-key-tinta'
              } ${elegida ? 'font-semibold' : ''}`}
            >
              <LatexRenderer content={opcion.text} />
            </span>
          </button>
          <button
            type="button"
            onClick={() => onTachar(opcion.id)}
            aria-label={tachada ? `Restaurar opción ${opcion.id}` : `Descartar opción ${opcion.id}`}
            title={tachada ? 'Restaurar' : 'Descartar'}
            aria-pressed={tachada}
            className={`w-12 shrink-0 flex items-center justify-center border-l-[0.8px] border-key-negro cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul ${
              tachada ? 'bg-key-tinta text-key-blanco' : 'text-key-texto-suave hover:text-key-tinta hover:bg-key-gris'
            }`}
          >
            <Strikethrough aria-hidden="true" className="w-4 h-4" />
          </button>
        </div>
      );
    })}
  </div>
);
