import React from 'react';
import { SPRINTS_CATALOG } from '../../data/sprintsCatalog';
import { useEmpezarExamen } from '../../estado/useEmpezarExamen';
import { BloqueSimulacro, EncabezadoBloque, FilaSprint, TituloPagina } from '../../components/estudiante/piezas';
import { MATERIA } from '../../components/estudiante/formato';
import type { SectionType } from '../../types/exam';

/**
 * Pruebas (/inicio/pruebas): el simulacro completo arriba y todos los sprints agrupados
 * por materia, en dos columnas dentro del marco de líneas (ADR marca/0003).
 */
const MATERIAS: SectionType[] = ['reading', 'math'];

export const PaginaPruebas: React.FC = () => {
  const empezar = useEmpezarExamen();

  return (
    <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10 py-8 lg:py-10">
      <TituloPagina titulo="Pruebas" apoyo="Un simulacro completo o un sprint corto de una sola materia." />

      <div className="mt-6 border-[0.8px] border-key-negro">
        <BloqueSimulacro onEmpezar={() => empezar('simulacro')} />

        <div className="grid grid-cols-1 lg:grid-cols-2">
          {MATERIAS.map((materia, i) => {
            const sprints = SPRINTS_CATALOG.filter((s) => s.section === materia);
            return (
              <section
                key={materia}
                aria-labelledby={`sprints-${materia}`}
                className={`min-w-0 px-6 sm:px-9 py-6 ${i > 0 ? 'max-lg:border-t-[0.8px] lg:border-l-[0.8px] border-key-negro' : ''}`}
              >
                <EncabezadoBloque id={`sprints-${materia}`} titulo={`Sprints de ${MATERIA[materia]}`} />
                <p className="mt-1 text-sm text-key-texto-suave">
                  <span className="font-mono-num">{sprints.length}</span> sprints
                </p>
                <ul className="mt-2">
                  {sprints.map((sprint) => (
                    <FilaSprint
                      key={sprint.id}
                      sprint={sprint}
                      detalle
                      onEmpezar={() => empezar(sprint.mode, sprint)}
                    />
                  ))}
                </ul>
              </section>
            );
          })}
        </div>
      </div>
    </div>
  );
};
