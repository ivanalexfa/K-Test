import React, { useMemo } from 'react';
import { Link, useSearchParams } from 'react-router';
import { Search, X } from 'lucide-react';
import { useSesion } from '../../estado/useSesion';
import { rutas } from '../../rutas';
import { SPRINTS_CATALOG } from '../../data/sprintsCatalog';
import { TituloPagina, Vacio } from '../../components/estudiante/piezas';
import { formatoFecha } from '../../components/estudiante/formato';
import { NIVELES, claseCampo, enNivel, type Nivel } from '../../components/docente/datos';

/**
 * Intentos (/docente/intentos): todas las pruebas entregadas, la más reciente primero, con
 * filtros por estudiante, prueba y desempeño (en la URL). Cada fila abre el solucionario y el
 * nombre lleva a la ficha del estudiante. ADR docente/0002.
 */
export const PaginaIntentosDocente: React.FC = () => {
  const { intentos } = useSesion();
  const [parametros, setParametros] = useSearchParams();
  const q = parametros.get('q') ?? '';
  const prueba = parametros.get('prueba') ?? 'all';
  const nivel = (parametros.get('nivel') ?? 'all') as Nivel;

  const cambiar = (clave: string, valor: string) => {
    const nuevos = new URLSearchParams(parametros);
    if (!valor || valor === 'all') nuevos.delete(clave);
    else nuevos.set(clave, valor);
    setParametros(nuevos, { replace: true });
  };

  const ordenados = useMemo(
    () => [...intentos].sort((a, b) => b.completedAt.localeCompare(a.completedAt)),
    [intentos],
  );

  const texto = q.trim().toLowerCase();
  const visibles = ordenados.filter((a) => {
    if (texto && !a.userName.toLowerCase().includes(texto) && !a.userEmail.toLowerCase().includes(texto)) return false;
    if (prueba.startsWith('code:')) {
      if (!a.modeTitle.startsWith(prueba.slice(5))) return false;
    } else if (prueba !== 'all' && a.mode !== prueba) return false;
    return enNivel(a.percentage, nivel);
  });
  const hayFiltros = Boolean(texto) || prueba !== 'all' || nivel !== 'all';

  return (
    <>
      <TituloPagina titulo="Intentos" apoyo="Cada prueba entregada, con su solucionario." />

      <section role="search" aria-label="Filtrar intentos" className="mt-8">
        <div className="grid grid-cols-1 md:grid-cols-[minmax(0,2fr)_minmax(0,1.3fr)_minmax(0,1fr)_auto] gap-3 items-end">
          <div>
            <label htmlFor="intentos-buscar" className="block text-sm font-medium text-key-tinta mb-1.5">
              Estudiante
            </label>
            <div className="relative">
              <Search
                aria-hidden="true"
                className="w-4 h-4 text-key-texto-suave absolute left-3.5 top-1/2 -translate-y-1/2 pointer-events-none"
              />
              <input
                id="intentos-buscar"
                type="search"
                value={q}
                onChange={(e) => cambiar('q', e.target.value)}
                placeholder="Nombre o correo"
                className={`${claseCampo} pl-10`}
              />
            </div>
          </div>
          <div>
            <label htmlFor="intentos-prueba" className="block text-sm font-medium text-key-tinta mb-1.5">
              Prueba
            </label>
            <select id="intentos-prueba" value={prueba} onChange={(e) => cambiar('prueba', e.target.value)} className={claseCampo}>
              <option value="all">Todas las pruebas</option>
              <option value="simulacro">Simulacro completo</option>
              <option value="sprint_reading">Sprints de Lectura y Redacción</option>
              <option value="sprint_math">Sprints de Matemáticas</option>
              <optgroup label="Un sprint">
                {SPRINTS_CATALOG.map((s) => (
                  <option key={s.id} value={`code:${s.code}`}>
                    {s.code} · {s.title}
                  </option>
                ))}
              </optgroup>
            </select>
          </div>
          <div>
            <label htmlFor="intentos-nivel" className="block text-sm font-medium text-key-tinta mb-1.5">
              Desempeño
            </label>
            <select id="intentos-nivel" value={nivel} onChange={(e) => cambiar('nivel', e.target.value)} className={claseCampo}>
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
        {hayFiltros ? `${visibles.length} de ${ordenados.length} intentos` : `${ordenados.length} intentos`}
      </p>

      {visibles.length === 0 ? (
        <Vacio texto="Ningún intento coincide con los filtros. Prueba con otra prueba o quita los filtros." />
      ) : (
        <div className="border-[0.8px] border-key-negro">
          <table className="w-full text-left text-base">
            <caption className="sr-only">Intentos de los estudiantes</caption>
            <thead className="max-md:hidden">
              <tr className="border-b-[0.8px] border-key-negro text-sm text-key-texto-suave">
                <th scope="col" className="px-6 py-3 font-medium">Estudiante</th>
                <th scope="col" className="px-4 py-3 font-medium">Prueba</th>
                <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Precisión</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Puntaje</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Solucionario</span></th>
              </tr>
            </thead>
            <tbody>
              {visibles.map((a) => (
                <tr
                  key={a.id}
                  className="border-b-[0.8px] border-key-negro last:border-b-0 max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-1 max-md:px-5 max-md:py-4"
                >
                  <th scope="row" className="md:px-6 md:py-4 font-normal max-md:col-span-2">
                    <Link
                      to={rutas.fichaEstudiante(a.userId)}
                      className="font-semibold text-key-tinta hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-key-azul"
                    >
                      {a.userName}
                    </Link>
                  </th>
                  <td className="md:px-4 md:py-4 text-key-texto max-md:col-span-2">
                    <span className="block">{a.modeTitle}</span>
                    <span className="block text-sm text-key-texto-suave">
                      {a.mode === 'simulacro' ? 'Simulacro completo' : 'Sprint'}
                    </span>
                  </td>
                  <td className="md:px-4 md:py-4 text-key-texto max-md:text-sm max-md:col-span-2">
                    {formatoFecha.format(new Date(a.completedAt))}
                  </td>
                  <td className="md:px-4 md:py-4 md:text-right font-mono-num font-semibold max-md:text-sm">
                    <span className="md:hidden text-key-texto-suave font-sans font-normal">Precisión </span>
                    <span className={a.percentage < 60 ? 'text-estado-error' : ''}>{a.percentage}%</span>
                  </td>
                  <td className="md:px-4 md:py-4 md:text-right font-mono-num max-md:text-sm">
                    <span className="md:hidden text-key-texto-suave font-sans">Puntaje </span>
                    {a.scaledScore}
                  </td>
                  <td className="md:px-6 md:py-4 md:text-right max-md:col-span-2 max-md:pt-2">
                    <Link
                      to={rutas.resultados(a.id)}
                      className="inline-flex items-center justify-center h-10 px-5 rounded-full border-[0.8px] border-key-negro text-sm font-semibold text-key-tinta hover:bg-key-gris-claro whitespace-nowrap transition-colors focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
                    >
                      Ver solucionario
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </>
  );
};
