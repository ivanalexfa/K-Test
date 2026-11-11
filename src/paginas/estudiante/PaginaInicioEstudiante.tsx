import React from 'react';
import { Link, useNavigate } from 'react-router';
import { ArrowRight, Clock, FileText } from 'lucide-react';
import { instantiateUserClass, StudentUser } from '../../models/UserClasses';
import { SPRINTS_CATALOG } from '../../data/sprintsCatalog';
import { useSesion } from '../../estado/useSesion';
import { useExamen } from '../../estado/useExamen';
import { claveDeExamen, examData } from '../../estado/examenes';
import { rutas } from '../../rutas';
import type { SprintConfig, TestAttemptRecord, TestMode } from '../../types/exam';

/**
 * Inicio del estudiante (/inicio): Pruebas, Material y Mis resultados a la vista.
 * En escritorio son tres columnas que se tocan y caben sin scroll (1440×900); en celular
 * se apilan. Cada fila es una acción a un clic. Ver docs/estudiante/decisiones/0001.
 */
const MATERIA = { reading: 'Lectura y Redacción', math: 'Matemáticas' } as const;

const fecha = new Intl.DateTimeFormat('es-SV', { day: 'numeric', month: 'short' });

export const PaginaInicioEstudiante: React.FC = () => {
  const { usuario, materiales, intentos } = useSesion();
  const { iniciar } = useExamen();
  const navigate = useNavigate();

  const estudiante = usuario ? instantiateUserClass(usuario) : null;
  if (!(estudiante instanceof StudentUser)) return null;

  const mios = [...estudiante.getMyAttempts(intentos)].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  );
  const precision = estudiante.getAverageAccuracy(intentos);
  const mejorSimulacro = estudiante.getBestSimulacroScore(intentos);
  const { reading, math } = examData.sections;
  const minutosSimulacro = reading.durationMinutes + math.durationMinutes;
  const preguntasSimulacro = reading.questions.length + math.questions.length;

  const empezar = (modo: TestMode, sprint: SprintConfig | null = null) => {
    iniciar(modo, sprint);
    navigate(rutas.examen(claveDeExamen(modo, sprint)));
  };

  return (
    <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10 py-8 lg:pt-7 lg:pb-6">
      <h1 className="text-key-tinta font-semibold text-[28px] leading-9 sm:text-[32px] sm:leading-10 tracking-[-0.01em]">
        Hola, {estudiante.name.split(' ')[0]}
      </h1>
      <p className="mt-1 text-key-texto text-base sm:text-lg">¿Qué practicamos hoy?</p>

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1.15fr)_minmax(0,1fr)_minmax(0,1fr)] border-[0.8px] border-key-negro">
        {/* 1 · Pruebas */}
        <section aria-labelledby="inicio-pruebas" className="p-6 lg:px-7 lg:py-6 flex flex-col">
          <EncabezadoColumna id="inicio-pruebas" titulo="Pruebas" ruta={rutas.pruebas} enlace="Ver todas" />

          <div className="mt-4 bg-key-gris-claro p-4">
            <h3 className="text-lg font-semibold text-key-tinta">Simulacro completo</h3>
            <p className="mt-1 text-sm text-key-texto">
              Lectura y Redacción y Matemáticas, como el día del examen.
            </p>
            <p className="mt-3 inline-flex items-center gap-1.5 text-sm text-key-texto-suave">
              <Clock aria-hidden="true" className="h-4 w-4" />
              <span className="font-mono-num">{minutosSimulacro} min</span> ·{' '}
              <span className="font-mono-num">{preguntasSimulacro}</span> preguntas
            </p>
            <button
              type="button"
              onClick={() => empezar('simulacro')}
              className="mt-3 w-full h-11 rounded-full bg-key-azul hover:bg-key-azul-hover text-key-blanco font-semibold transition-[background-color,transform] duration-200 ease-key motion-safe:active:scale-[0.98] cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-key-azul"
            >
              Empezar simulacro
            </button>
          </div>

          <h3 className="mt-5 text-sm font-semibold text-key-tinta">Sprints por materia</h3>
          <ul className="mt-2 divide-y-[0.8px] divide-key-gris border-y-[0.8px] border-key-gris">
            {SPRINTS_CATALOG.map((sprint) => (
              <li key={sprint.id}>
                <button
                  type="button"
                  onClick={() => empezar(sprint.mode, sprint)}
                  className="group w-full py-2 flex items-center gap-3 text-left cursor-pointer hover:bg-key-gris-claro focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
                >
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm font-medium text-key-tinta">{sprint.title}</span>
                    <span className="block text-xs text-key-texto-suave">
                      {MATERIA[sprint.section]} · <span className="font-mono-num">{sprint.durationMinutes} min</span>
                    </span>
                  </span>
                  <span className="shrink-0 text-xs font-semibold text-key-azul group-hover:underline underline-offset-4">
                    Empezar
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>

        {/* 2 · Material */}
        <section
          aria-labelledby="inicio-material"
          className="p-6 lg:px-7 lg:py-6 flex flex-col max-lg:border-t-[0.8px] lg:border-l-[0.8px] border-key-negro"
        >
          <EncabezadoColumna id="inicio-material" titulo="Material" ruta={rutas.material} enlace="Ver todo" />
          {materiales.length === 0 ? (
            <Vacio texto="Tus docentes todavía no han publicado material." />
          ) : (
            <ul className="mt-5 divide-y-[0.8px] divide-key-gris border-y-[0.8px] border-key-gris">
              {materiales.slice(0, 6).map((m) => (
                <li key={m.id}>
                  <Link
                    to={rutas.materialDe(m.id)}
                    className="group py-3 flex items-start gap-3 hover:bg-key-gris-claro focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
                  >
                    <FileText aria-hidden="true" strokeWidth={1.5} className="mt-0.5 h-5 w-5 shrink-0 text-key-azul" />
                    <span className="min-w-0">
                      <span className="block text-sm font-medium text-key-tinta line-clamp-2 group-hover:underline underline-offset-4">
                        {m.title}
                      </span>
                      <span className="block text-xs text-key-texto-suave">
                        {MATERIA[m.section]} · <span className="font-mono-num">{m.readingTimeMinutes} min</span> de lectura
                      </span>
                    </span>
                  </Link>
                </li>
              ))}
            </ul>
          )}
        </section>

        {/* 3 · Mis resultados */}
        <section
          aria-labelledby="inicio-resultados"
          className="p-6 lg:px-7 lg:py-6 flex flex-col max-lg:border-t-[0.8px] lg:border-l-[0.8px] border-key-negro"
        >
          <EncabezadoColumna id="inicio-resultados" titulo="Mis resultados" ruta={rutas.misResultados} enlace="Ver historial" />

          <dl className="mt-5 grid grid-cols-3 border-[0.8px] border-key-gris">
            <Dato termino="Pruebas" valor={String(mios.length)} />
            <Dato termino="Precisión" valor={mios.length ? `${precision}%` : '—'} />
            <Dato termino="Mejor simulacro" valor={mejorSimulacro ? String(mejorSimulacro) : '—'} />
          </dl>

          {mios.length === 0 ? (
            <Vacio texto="Todavía no tienes resultados. Empieza con un sprint de pocos minutos." />
          ) : (
            <>
              <h3 className="mt-6 text-sm font-semibold text-key-tinta">Últimos intentos</h3>
              <ul className="mt-2 divide-y-[0.8px] divide-key-gris border-y-[0.8px] border-key-gris">
                {mios.slice(0, 4).map((a) => (
                  <FilaIntento key={a.id} intento={a} />
                ))}
              </ul>
            </>
          )}
        </section>
      </div>
    </div>
  );
};

const EncabezadoColumna: React.FC<{ id: string; titulo: string; ruta: string; enlace: string }> = ({
  id,
  titulo,
  ruta,
  enlace,
}) => (
  <div className="flex items-baseline justify-between gap-3">
    <h2 id={id} className="text-xl sm:text-2xl font-semibold text-key-tinta">
      {titulo}
    </h2>
    <Link
      to={ruta}
      className="inline-flex items-center gap-1 text-sm font-semibold text-key-azul hover:underline underline-offset-4 rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
    >
      {enlace}
      <ArrowRight aria-hidden="true" className="h-4 w-4" />
    </Link>
  </div>
);

const Dato: React.FC<{ termino: string; valor: string }> = ({ termino, valor }) => (
  <div className="p-3 border-l-[0.8px] border-key-gris first:border-l-0">
    <dt className="text-xs text-key-texto-suave">{termino}</dt>
    <dd className="mt-0.5 text-xl font-semibold text-key-tinta font-mono-num">{valor}</dd>
  </div>
);

const Vacio: React.FC<{ texto: string }> = ({ texto }) => (
  <p className="mt-5 bg-key-gris-claro p-5 text-sm text-key-texto">{texto}</p>
);

const FilaIntento: React.FC<{ intento: TestAttemptRecord }> = ({ intento }) => (
  <li>
    <Link
      to={rutas.resultados(intento.id)}
      className="group py-2.5 flex items-center gap-3 hover:bg-key-gris-claro focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
    >
      <span className="min-w-0 flex-1">
        <span className="block truncate text-sm font-medium text-key-tinta group-hover:underline underline-offset-4">
          {intento.modeTitle}
        </span>
        <span className="block text-xs text-key-texto-suave">
          {fecha.format(new Date(intento.completedAt))} ·{' '}
          <span className="font-mono-num">
            {intento.totalCorrect}/{intento.totalQuestions}
          </span>{' '}
          correctas
        </span>
      </span>
      <span className="shrink-0 text-base font-semibold text-key-tinta font-mono-num">
        {intento.percentage}%
      </span>
    </Link>
  </li>
);
