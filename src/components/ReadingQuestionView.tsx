import React, { useEffect, useRef, useState } from 'react';
import { ExamQuestion, OptionId, ReadingPassage } from '../types/exam';
import { LatexRenderer } from './LatexRenderer';
import { BarraPregunta, Opciones, Pista } from './examen/piezas';
import { useEstadoPregunta } from './examen/useEstadoPregunta';

interface ReadingQuestionViewProps {
  question: ExamQuestion;
  passage: ReadingPassage;
  selectedOption?: OptionId;
  isFlagged: boolean;
  onSelectOption: (optionId: OptionId) => void;
  onToggleFlag: () => void;
  totalQuestionsInSection: number;
}

/**
 * Pregunta de lectura (ADR examen/0002): pasaje y pregunta lado a lado dentro de un solo marco,
 * como en la prueba real. Las líneas se numeran de 5 en 5 y las líneas citadas se marcan con
 * gris claro y la línea azul. En celular, «Pasaje · Pregunta» son dos celdas.
 */
export const ReadingQuestionView: React.FC<ReadingQuestionViewProps> = ({
  question,
  passage,
  selectedOption,
  isFlagged,
  onSelectOption,
  onToggleFlag,
  totalQuestionsInSection,
}) => {
  const [vista, setVista] = useState<'pasaje' | 'pregunta'>('pregunta');
  const { tachadas, tachar, pista, alternarPista } = useEstadoPregunta(question.id);
  const lineas = useRef<Record<number, HTMLDivElement | null>>({});

  const citadas = new Set(question.referencedLines ?? []);
  const primera = question.referencedLines?.[0];

  const irALineas = () => {
    if (!primera) return;
    lineas.current[primera]?.scrollIntoView({ behavior: 'smooth', block: 'center' });
  };

  // Al cambiar de pregunta (o de vista en celular), lleva el pasaje a las líneas citadas.
  useEffect(() => {
    const t = setTimeout(() => {
      if (primera) lineas.current[primera]?.scrollIntoView({ block: 'center' });
    }, 100);
    return () => clearTimeout(t);
  }, [question.id, vista, primera]);

  const celda = (activa: boolean) =>
    `h-11 border-[0.8px] border-key-negro -ml-[0.8px] first:ml-0 text-sm cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul ${
      activa ? 'bg-key-azul text-key-blanco font-semibold' : 'bg-key-blanco text-key-tinta hover:bg-key-gris-claro'
    }`;

  return (
    <div className="flex-1 flex flex-col w-full max-w-7xl mx-auto px-0 sm:px-6 lg:pt-6 pb-24 lg:pb-6 lg:h-[calc(100dvh-8.5rem)]">
      {/* Celular: Pasaje · Pregunta */}
      <div role="group" aria-label="Ver" className="lg:hidden sticky top-[57px] z-20 bg-key-blanco grid grid-cols-2 px-5 sm:px-0 py-3">
        <button type="button" aria-pressed={vista === 'pasaje'} onClick={() => setVista('pasaje')} className={celda(vista === 'pasaje')}>
          Pasaje
        </button>
        <button type="button" aria-pressed={vista === 'pregunta'} onClick={() => setVista('pregunta')} className={celda(vista === 'pregunta')}>
          Pregunta {question.numberInSection} de {totalQuestionsInSection}
        </button>
      </div>

      <div className="flex-1 grid grid-cols-1 lg:grid-cols-[minmax(0,1.2fr)_minmax(0,1fr)] lg:min-h-0 lg:border-[0.8px] border-key-negro">
        {/* Pasaje */}
        <section
          aria-labelledby="pasaje-titulo"
          className={`min-w-0 flex-col lg:min-h-0 lg:border-r-[0.8px] border-key-negro ${vista === 'pasaje' ? 'flex' : 'hidden lg:flex'}`}
        >
          <div className="px-5 sm:px-7 py-5 border-b-[0.8px] border-key-negro shrink-0">
            <p className="text-sm text-key-texto-suave">{passage.tag}</p>
            <h2 id="pasaje-titulo" className="mt-1 text-lg font-semibold text-key-tinta text-balance">
              {passage.title}
            </h2>
            <p className="text-sm text-key-texto-suave">{passage.authorOrSource}</p>
          </div>

          <div className="flex-1 lg:overflow-y-auto custom-scrollbar px-4 sm:px-6 py-6">
            {passage.preamble && <p className="text-key-texto-suave mb-6 leading-relaxed">{passage.preamble}</p>}
            <div className="text-[15px] leading-[1.85] text-key-texto">
              {passage.lines.map((linea) => {
                const citada = citadas.has(linea.lineNumber);
                const numerada = citada || linea.lineNumber % 5 === 0;
                return (
                  <div
                    key={linea.lineNumber}
                    ref={(el) => {
                      lineas.current[linea.lineNumber] = el;
                    }}
                    className={`flex gap-3 pr-1 ${linea.isParagraphStart && linea.lineNumber > 1 ? 'mt-4' : ''} ${
                      citada ? 'bg-key-gris-claro border-l-2 border-key-azul text-key-tinta' : 'border-l-2 border-transparent'
                    }`}
                  >
                    <span
                      aria-hidden={!numerada}
                      className={`w-7 shrink-0 text-right font-mono-num text-xs leading-[1.75rem] select-none ${
                        citada ? 'text-key-tinta font-semibold' : 'text-key-texto-suave'
                      }`}
                    >
                      {numerada ? linea.lineNumber : ''}
                    </span>
                    <span className="flex-1">
                      {linea.isParagraphStart && <span className="inline-block w-4" aria-hidden="true" />}
                      {linea.text}
                    </span>
                  </div>
                );
              })}
            </div>
          </div>
        </section>

        {/* Pregunta */}
        <section
          aria-label={`Pregunta ${question.numberInSection}`}
          className={`min-w-0 flex-col lg:min-h-0 ${vista === 'pregunta' ? 'flex' : 'hidden lg:flex'}`}
        >
          <div className="px-5 sm:px-7 py-4 border-b-[0.8px] border-key-negro shrink-0">
            <BarraPregunta
              question={question}
              pistaAbierta={pista}
              onPista={alternarPista}
              isFlagged={isFlagged}
              onToggleFlag={onToggleFlag}
            />
          </div>

          <div className="flex-1 lg:overflow-y-auto custom-scrollbar px-5 sm:px-7 py-6 space-y-6">
            {pista && (
              <Pista>
                {question.referencedLinesLabel
                  ? `Lee primero ${question.referencedLinesLabel} y la oración de antes y de después. Luego descarta las opciones que cambien el sentido.`
                  : 'Busca la idea principal del autor y descarta las opciones que el texto no respalda.'}
              </Pista>
            )}

            {question.referencedLinesLabel && (
              <button
                type="button"
                onClick={() => (vista === 'pregunta' && window.matchMedia('(max-width: 1023px)').matches ? setVista('pasaje') : irALineas())}
                className="text-sm font-semibold text-key-tinta underline underline-offset-4 cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
              >
                Ver {question.referencedLinesLabel.toLowerCase()} en el pasaje
              </button>
            )}

            <div className="text-lg leading-relaxed text-key-tinta">
              <LatexRenderer content={question.prompt} />
            </div>

            <Opciones
              question={question}
              selectedOption={selectedOption}
              tachadas={tachadas}
              onSelectOption={onSelectOption}
              onTachar={tachar}
              etiqueta="Opciones de respuesta"
            />
          </div>
        </section>
      </div>
    </div>
  );
};
