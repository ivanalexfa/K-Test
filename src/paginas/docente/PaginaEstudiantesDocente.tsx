import React, { useMemo } from 'react';
import { Link, useLocation, useSearchParams } from 'react-router';
import { Search, X } from 'lucide-react';
import { useSesion } from '../../estado/useSesion';
import { rutas } from '../../rutas';
import { TituloPagina, Vacio } from '../../components/estudiante/piezas';
import { formatoFecha } from '../../components/estudiante/formato';
import {
  NIVELES,
  claseCampo,
  enNivel,
  resumirEstudiante,
  saludo,
  type Nivel,
} from '../../components/docente/datos';
import { KEY_ADMISSION_COHORTS } from '../../data/cohortsCatalog';

/**
 * Estudiantes (/docente): una fila por estudiante, con sus cifras y «Ver ficha».
 * Los filtros viven en la URL (?q, ?ciclo, ?nivel), así que volver desde una ficha
 * conserva la búsqueda. ADR docente/0002.
 */
export const PaginaEstudiantesDocente: React.FC = () => {
  const { usuario, usuarios, intentos } = useSesion();
  const [parametros, setParametros] = useSearchParams();
  const { search } = useLocation();
  const q = parametros.get('q') ?? '';
  const ciclo = parametros.get('ciclo') ?? 'all';
  const nivel = (parametros.get('nivel') ?? 'all') as Nivel;

  const cambiar = (clave: string, valor: string) => {
    const nuevos = new URLSearchParams(parametros);
    if (!valor || valor === 'all') nuevos.delete(clave);
    else nuevos.set(clave, valor);
    setParametros(nuevos, { replace: true });
  };

  const resumenes = useMemo(
    () =>
      usuarios
        .filter((u) => u.role === 'student')
        .map((e) => resumirEstudiante(e, intentos))
        .sort((a, b) => a.estudiante.name.localeCompare(b.estudiante.name, 'es')),
    [usuarios, intentos],
  );

  const ciclos = useMemo(
    () =>
      Array.from(
        new Set([...KEY_ADMISSION_COHORTS, ...resumenes.map((r) => r.estudiante.cohort).filter(Boolean)]),
      ),
    [resumenes],
  );

  const texto = q.trim().toLowerCase();
  const visibles = resumenes.filter(
    (r) =>
      (!texto ||
        r.estudiante.name.toLowerCase().includes(texto) ||
        r.estudiante.email.toLowerCase().includes(texto)) &&
      (ciclo === 'all' ||
        (ciclo === 'sin-ciclo'
          ? !r.estudiante.cohort || r.estudiante.cohort.trim() === ''
          : r.estudiante.cohort === ciclo)) &&
      enNivel(r.precision, nivel),
  );
  const hayFiltros = Boolean(texto) || ciclo !== 'all' || nivel !== 'all';

  const conIntentos = resumenes.filter((r) => r.precision !== null);
  const precisionGeneral = conIntentos.length
    ? Math.round(conIntentos.reduce((s, r) => s + (r.precision ?? 0), 0) / conIntentos.length)
    : null;
  const refuerzo = conIntentos.filter((r) => (r.precision ?? 100) < 60).length;

  return (
    <>
      <TituloPagina
        titulo={`Hola, ${saludo(usuario?.name ?? '')}`}
        apoyo="Así van tus estudiantes en simulacros y sprints."
      />

      <dl className="mt-6 grid grid-cols-2 lg:grid-cols-4 border-[0.8px] border-key-negro">
        {[
          ['Estudiantes', String(resumenes.length)],
          ['Intentos', String(intentos.length)],
          ['Precisión promedio', precisionGeneral === null ? '—' : `${precisionGeneral}%`],
          ['Necesitan refuerzo', String(refuerzo)],
        ].map(([termino, valor], i) => (
          <div
            key={termino}
            className={`px-5 py-4 border-key-negro ${i % 2 === 1 ? 'border-l-[0.8px]' : ''} ${
              i >= 2 ? 'max-lg:border-t-[0.8px]' : ''
            } ${i === 2 ? 'lg:border-l-[0.8px]' : ''}`}
          >
            <dt className="text-sm text-key-texto-suave">{termino}</dt>
            <dd className="mt-1 text-2xl font-semibold text-key-tinta font-mono-num">{valor}</dd>
          </div>
        ))}
      </dl>

      {/* Búsqueda y filtros: una sola fila de campos rectos */}
      <section role="search" aria-label="Buscar estudiantes" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1fr)_minmax(0,1fr)_auto] gap-3 items-end">
          <div>
            <label htmlFor="docente-buscar" className="block text-sm font-medium text-key-tinta mb-1.5">
              Buscar
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="w-4 h-4 text-key-texto-suave absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                id="docente-buscar"
                type="search"
                value={q}
                onChange={(e) => cambiar('q', e.target.value)}
                placeholder="Nombre o correo"
                className={`${claseCampo} pl-10`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="docente-ciclo" className="block text-sm font-medium text-key-tinta mb-1.5">
              Ciclo de admisión
            </label>
            <select id="docente-ciclo" value={ciclo} onChange={(e) => cambiar('ciclo', e.target.value)} className={claseCampo}>
              <option value="all">Todos los ciclos</option>
              <option value="sin-ciclo">Sin ciclo asignado</option>
              {ciclos.map((c) => (
                <option key={c} value={c}>
                  {c}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label htmlFor="docente-nivel" className="block text-sm font-medium text-key-tinta mb-1.5">
              Desempeño
            </label>
            <select id="docente-nivel" value={nivel} onChange={(e) => cambiar('nivel', e.target.value)} className={claseCampo}>
              {NIVELES.map((n) => (
                <option key={n.id} value={n.id}>
                  {n.texto}
                </option>
              ))}
            </select>
          </div>
          {hayFiltros && (
            <button
              type="button"
              onClick={() => setParametros({}, { replace: true })}
              className="inline-flex items-center justify-center gap-1.5 h-11 px-4 rounded-full border-[0.8px] border-key-negro text-sm font-semibold text-key-tinta hover:bg-key-gris-claro cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
            >
              <X aria-hidden="true" className="w-4 h-4" />
              Limpiar
            </button>
          )}
        </div>
      </section>

      <p className="mt-6 mb-2 text-sm text-key-texto-suave" aria-live="polite">
        {hayFiltros ? `${visibles.length} de ${resumenes.length} estudiantes` : `${resumenes.length} estudiantes`}
      </p>

      {visibles.length === 0 ? (
        <Vacio texto="Ningún estudiante coincide con la búsqueda. Prueba con otro nombre o quita los filtros." />
      ) : (
        <div className="border-[0.8px] border-key-negro">
          <table className="w-full text-left text-base">
            <caption className="sr-only">Estudiantes y su desempeño</caption>
            <thead className="max-md:hidden">
              <tr className="border-b-[0.8px] border-key-negro text-sm text-key-texto-suave">
                <th scope="col" className="px-6 py-3 font-medium">Estudiante</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Pruebas</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Precisión</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Lectura</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Matemáticas</th>
                <th scope="col" className="px-4 py-3 font-medium">Última prueba</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Ficha</span></th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((r) => {
                const pct = (v: number | null) => (v === null ? '—' : `${v}%`);
                return (
                  <tr
                    key={r.estudiante.id}
                    className="border-b-[0.8px] border-key-negro last:border-b-0 hover:bg-key-gris-claro max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-1 max-md:px-5 max-md:py-4"
                  >
                    <th scope="row" className="md:px-6 md:py-4 font-normal max-md:col-span-2 min-w-0">
                      <Link
                        to={rutas.fichaEstudiante(r.estudiante.id)}
                        state={{ desde: search }}
                        className="block font-semibold text-key-tinta hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-key-azul"
                      >
                        {r.estudiante.name}
                      </Link>
                      <span className="block text-sm text-key-texto-suave truncate">
                        {r.estudiante.cohort || 'Sin ciclo'}
                      </span>
                    </th>
                    <td className="md:px-4 md:py-4 md:text-right font-mono-num max-md:text-sm">
                      <span className="md:hidden text-key-texto-suave font-sans">Pruebas </span>
                      {r.intentos.length}
                    </td>
                    <td className="md:px-4 md:py-4 md:text-right font-mono-num font-semibold max-md:text-sm">
                      <span className="md:hidden text-key-texto-suave font-sans font-normal">Precisión </span>
                      <span className={r.precision !== null && r.precision < 60 ? 'text-estado-error' : ''}>
                        {pct(r.precision)}
                      </span>
                    </td>
                    <td className="md:px-4 md:py-4 md:text-right font-mono-num max-md:text-sm">
                      <span className="md:hidden text-key-texto-suave font-sans">Lectura </span>
                      {pct(r.lectura)}
                    </td>
                    <td className="md:px-4 md:py-4 md:text-right font-mono-num max-md:text-sm">
                      <span className="md:hidden text-key-texto-suave font-sans">Matemáticas </span>
                      {pct(r.matematicas)}
                    </td>
                    <td className="md:px-4 md:py-4 text-key-texto max-md:text-sm max-md:col-span-2">
                      <span className="md:hidden text-key-texto-suave">Última prueba </span>
                      {r.ultimo ? formatoFecha.format(new Date(r.ultimo)) : 'Sin pruebas'}
                    </td>
                    <td className="md:px-6 md:py-4 md:text-right max-md:col-span-2 max-md:pt-2">
                      <Link
                        to={rutas.fichaEstudiante(r.estudiante.id)}
                        state={{ desde: search }}
                        aria-label={`Ver ficha de ${r.estudiante.name}`}
                        className="inline-flex items-center justify-center h-10 px-5 rounded-full border-[0.8px] border-key-negro bg-key-blanco text-sm font-semibold text-key-tinta hover:bg-key-gris-claro whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
                      >
                        Ver ficha
                      </Link>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
