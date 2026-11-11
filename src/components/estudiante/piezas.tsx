import React from 'react';
import { Link } from 'react-router';
import { ArrowRight, Clock } from 'lucide-react';
import type { SprintConfig, TestAttemptRecord } from '../../types/exam';
import { formatoFecha, MATERIA } from './formato';
import { examData } from '../../estado/examenes';
import { rutas } from '../../rutas';

/**
 * Piezas del portal del estudiante con el estilo de Key para la plataforma interna
 * (ADR marca/0003): bordes negros finos de 0.8 px, formas rectas, botones en pastilla
 * y el azul Key solo para acciones. Las comparten Inicio, Pruebas, Material y Resultados.
 */

const anilloFoco =
  'focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-key-azul';

/** Botón en pastilla (acción en la misma pantalla). Para navegar, usar BotonPastilla de landing. */
export const Pastilla: React.FC<
  React.ButtonHTMLAttributes<HTMLButtonElement> & { variante?: 'azul' | 'blanca' | 'borde'; grande?: boolean }
> = ({ variante = 'azul', grande = false, className = '', children, ...resto }) => {
  const estilos = {
    azul: 'bg-key-azul text-key-blanco hover:bg-key-azul-hover',
    blanca: 'bg-key-blanco text-key-tinta hover:bg-key-gris-claro',
    borde: 'bg-key-blanco text-key-tinta border-[0.8px] border-key-negro hover:bg-key-gris-claro',
  }[variante];
  return (
    <button
      type="button"
      {...resto}
      className={`inline-flex items-center justify-center rounded-full font-semibold whitespace-nowrap cursor-pointer
        transition-[background-color,transform] duration-200 ease-key motion-safe:active:scale-[0.97]
        disabled:opacity-60 disabled:cursor-not-allowed ${grande ? 'h-[52px] px-8 text-[17px]' : 'h-10 px-5 text-sm'}
        ${estilos} ${anilloFoco} ${className}`}
    >
      {children}
    </button>
  );
};

/** Título de página del portal: grande y sobrio, con una línea de apoyo opcional. */
export const TituloPagina: React.FC<{ titulo: string; apoyo?: string; accion?: React.ReactNode }> = ({
  titulo,
  apoyo,
  accion,
}) => (
  <div className="flex flex-wrap items-end justify-between gap-4">
    <div>
      <h1 className="text-key-tinta font-semibold text-[28px] leading-9 sm:text-[32px] sm:leading-10 tracking-[-0.01em]">
        {titulo}
      </h1>
      {apoyo && <p className="mt-1 text-key-texto text-base sm:text-lg">{apoyo}</p>}
    </div>
    {accion}
  </div>
);

/** Encabezado de un bloque dentro del marco: título y enlace «Ver …». */
export const EncabezadoBloque: React.FC<{
  id: string;
  titulo: string;
  enlace?: { texto: string; ruta: string };
  nivel?: 'h2' | 'h3';
}> = ({ id, titulo, enlace, nivel = 'h2' }) => {
  const Titulo = nivel;
  return (
    <div className="flex items-baseline justify-between gap-3">
      <Titulo id={id} className="text-xl font-semibold text-key-tinta">
        {titulo}
      </Titulo>
      {enlace && (
        <Link
          to={enlace.ruta}
          className={`inline-flex items-center gap-1 text-sm font-semibold text-key-azul hover:underline underline-offset-4 rounded-sm ${anilloFoco}`}
        >
          {enlace.texto}
          <ArrowRight aria-hidden="true" className="h-4 w-4" />
        </Link>
      )}
    </div>
  );
};

/**
 * La acción protagonista: el simulacro completo en un bloque azul plano, a sangre dentro
 * del marco (sin radio), como los bloques azules de keyinstitute.com.
 */
export const BloqueSimulacro: React.FC<{ onEmpezar: () => void; titulo?: 'h2' | 'h1' }> = ({
  onEmpezar,
  titulo = 'h2',
}) => {
  const { reading, math } = examData.sections;
  const minutos = reading.durationMinutes + math.durationMinutes;
  const preguntas = reading.questions.length + math.questions.length;
  const Titulo = titulo;
  return (
    <section aria-labelledby="bloque-simulacro" className="bg-key-azul text-key-blanco px-6 py-8 sm:px-9 sm:py-9">
      <p className="text-base">Simulacro completo</p>
      <Titulo
        id="bloque-simulacro"
        className="mt-2 font-bold tracking-[-0.02em] text-balance text-[30px] leading-[34px] sm:text-[40px] sm:leading-[44px]"
      >
        Haz la prueba como el día del examen
      </Titulo>
      <p className="mt-3 text-base">
        {MATERIA.reading} y {MATERIA.math} ·{' '}
        <span className="font-mono-num">
          {minutos} min · {preguntas} preguntas
        </span>
      </p>
      <Pastilla variante="blanca" grande className="mt-6" onClick={onEmpezar}>
        Empezar simulacro
      </Pastilla>
    </section>
  );
};

/** Fila de un sprint: nombre, materia y minutos, con «Empezar» a un clic. */
export const FilaSprint: React.FC<{ sprint: SprintConfig; onEmpezar: () => void; detalle?: boolean }> = ({
  sprint,
  onEmpezar,
  detalle = false,
}) => (
  <li className="border-b-[0.8px] border-key-negro last:border-b-0">
    <button
      type="button"
      onClick={onEmpezar}
      className="group w-full py-3.5 flex items-center gap-4 text-left cursor-pointer hover:bg-key-gris-claro focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-medium text-key-tinta">{sprint.title}</span>
        {detalle && (
          <span className="mt-1 block text-sm text-key-texto line-clamp-2">{sprint.description}</span>
        )}
        <span className="mt-0.5 flex flex-wrap items-center gap-x-2 text-sm text-key-texto-suave">
          {!detalle && <span>{MATERIA[sprint.section]}</span>}
          {detalle && <span>{sprint.difficulty}</span>}
          <span aria-hidden="true">·</span>
          <span className="inline-flex items-center gap-1">
            <Clock aria-hidden="true" className="h-3.5 w-3.5" />
            <span className="font-mono-num">{sprint.durationMinutes} min</span>
          </span>
          <span aria-hidden="true">·</span>
          <span>
            <span className="font-mono-num">{sprint.questionIds.length}</span> preguntas
          </span>
        </span>
      </span>
      <span className="shrink-0 text-sm font-semibold text-key-azul group-hover:underline underline-offset-4">
        Empezar
      </span>
    </button>
  </li>
);

/** Tres datos del estudiante en celdas con borde (Pruebas · Precisión · Mejor simulacro). */
export const DatosEstudiante: React.FC<{ pruebas: number; precision: number; mejorSimulacro: number | null }> = ({
  pruebas,
  precision,
  mejorSimulacro,
}) => (
  <dl className="grid grid-cols-3 border-[0.8px] border-key-negro">
    {[
      ['Pruebas', String(pruebas)],
      ['Precisión', pruebas ? `${precision}%` : '—'],
      ['Mejor simulacro', mejorSimulacro ? String(mejorSimulacro) : '—'],
    ].map(([termino, valor]) => (
      <div key={termino} className="p-3 sm:p-4 border-l-[0.8px] border-key-negro first:border-l-0 min-w-0">
        <dt className="text-xs sm:text-sm text-key-texto-suave truncate">{termino}</dt>
        <dd className="mt-0.5 text-xl sm:text-2xl font-semibold text-key-tinta font-mono-num">{valor}</dd>
      </div>
    ))}
  </dl>
);

/** Fila de un intento: abre su resultado y solucionario. */
export const FilaIntento: React.FC<{ intento: TestAttemptRecord }> = ({ intento }) => (
  <li className="border-b-[0.8px] border-key-negro last:border-b-0">
    <Link
      to={rutas.resultados(intento.id)}
      className="group py-3 flex items-center gap-3 hover:bg-key-gris-claro focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-base font-medium text-key-tinta group-hover:underline underline-offset-4">
          {intento.modeTitle}
        </span>
        <span className="block text-sm text-key-texto-suave">
          {formatoFecha.format(new Date(intento.completedAt))} ·{' '}
          <span className="font-mono-num">
            {intento.totalCorrect}/{intento.totalQuestions}
          </span>{' '}
          correctas
        </span>
      </span>
      <span className="shrink-0 text-lg font-semibold text-key-tinta font-mono-num">{intento.percentage}%</span>
    </Link>
  </li>
);

/** Estado vacío dentro de un bloque: una invitación a actuar, no una disculpa. */
export const Vacio: React.FC<{ texto: string; accion?: React.ReactNode }> = ({ texto, accion }) => (
  <div className="bg-key-gris-claro p-5">
    <p className="text-base text-key-texto">{texto}</p>
    {accion && <div className="mt-4">{accion}</div>}
  </div>
);
