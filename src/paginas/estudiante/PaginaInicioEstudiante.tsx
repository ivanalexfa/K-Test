import React from 'react';
import { FileText } from 'lucide-react';
import { Link } from 'react-router';
import { instantiateUserClass, StudentUser } from '../../models/UserClasses';
import { SPRINTS_CATALOG } from '../../data/sprintsCatalog';
import { useSesion } from '../../estado/useSesion';
import { useEmpezarExamen } from '../../estado/useEmpezarExamen';
import { rutas } from '../../rutas';
import {
  BloqueSimulacro,
  DatosEstudiante,
  EncabezadoBloque,
  FilaIntento,
  FilaSprint,
  TituloPagina,
  Vacio,
} from '../../components/estudiante/piezas';
import { MATERIA } from '../../components/estudiante/formato';

/**
 * Inicio del estudiante (/inicio), versión A1 (ADR estudiante/0001):
 * el simulacro completo es la acción protagonista; los sprints, los resultados y el
 * material acompañan. Todo dentro de un marco con bordes negros finos (ADR marca/0003).
 * En escritorio cabe sin scroll en 1440×900; en celular se apila.
 */
export const PaginaInicioEstudiante: React.FC = () => {
  const { usuario, materiales, intentos } = useSesion();
  const empezar = useEmpezarExamen();

  const estudiante = usuario ? instantiateUserClass(usuario) : null;
  if (!(estudiante instanceof StudentUser)) return null;

  const mios = [...estudiante.getMyAttempts(intentos)].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  );

  return (
    <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10 py-8 lg:pt-7 lg:pb-6">
      <TituloPagina titulo={`Hola, ${estudiante.name.split(' ')[0]}`} />

      <div className="mt-5 grid grid-cols-1 lg:grid-cols-[minmax(0,1.7fr)_minmax(0,1fr)] border-[0.8px] border-key-negro">
        {/* Izquierda: la acción protagonista y los sprints */}
        <div className="min-w-0 lg:border-r-[0.8px] border-key-negro">
          <BloqueSimulacro onEmpezar={() => empezar('simulacro')} />
          <section aria-labelledby="inicio-sprints" className="px-6 sm:px-9 py-5">
            <EncabezadoBloque
              id="inicio-sprints"
              titulo="Sprints por materia"
              enlace={{ texto: 'Ver todos', ruta: rutas.pruebas }}
            />
            <ul className="mt-2">
              {SPRINTS_CATALOG.slice(0, 4).map((sprint) => (
                <FilaSprint key={sprint.id} sprint={sprint} onEmpezar={() => empezar(sprint.mode, sprint)} />
              ))}
            </ul>
          </section>
        </div>

        {/* Derecha: lo que acompaña */}
        <div className="min-w-0 max-lg:border-t-[0.8px] border-key-negro">
          <section aria-labelledby="inicio-resultados" className="px-6 sm:px-7 py-6 border-b-[0.8px] border-key-negro">
            <EncabezadoBloque
              id="inicio-resultados"
              titulo="Mis resultados"
              enlace={{ texto: 'Ver historial', ruta: rutas.misResultados }}
            />
            <div className="mt-4">
              <DatosEstudiante
                pruebas={mios.length}
                precision={estudiante.getAverageAccuracy(intentos)}
                mejorSimulacro={estudiante.getBestSimulacroScore(intentos)}
              />
            </div>
            {mios.length === 0 ? (
              <div className="mt-4">
                <Vacio texto="Todavía no tienes resultados. Empieza con un sprint de pocos minutos." />
              </div>
            ) : (
              <ul className="mt-2">
                {mios.slice(0, 2).map((a) => (
                  <FilaIntento key={a.id} intento={a} />
                ))}
              </ul>
            )}
          </section>

          <section aria-labelledby="inicio-material" className="px-6 sm:px-7 py-6">
            <EncabezadoBloque id="inicio-material" titulo="Material" enlace={{ texto: 'Ver todo', ruta: rutas.material }} />
            {materiales.length === 0 ? (
              <div className="mt-4">
                <Vacio texto="Tus docentes todavía no han publicado material." />
              </div>
            ) : (
              <ul className="mt-2">
                {materiales.slice(0, 3).map((m) => (
                  <li key={m.id} className="border-b-[0.8px] border-key-negro last:border-b-0">
                    <Link
                      to={rutas.materialDe(m.id)}
                      className="group py-3 flex items-start gap-3 hover:bg-key-gris-claro focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
                    >
                      <FileText aria-hidden="true" strokeWidth={1.5} className="mt-0.5 h-5 w-5 shrink-0 text-key-azul" />
                      <span className="min-w-0">
                        <span className="block truncate text-base font-medium text-key-tinta group-hover:underline underline-offset-4">
                          {m.title}
                        </span>
                        <span className="block text-sm text-key-texto-suave">
                          {MATERIA[m.section]} · <span className="font-mono-num">{m.readingTimeMinutes} min</span>
                        </span>
                      </span>
                    </Link>
                  </li>
                ))}
              </ul>
            )}
          </section>
        </div>
      </div>
    </div>
  );
};
