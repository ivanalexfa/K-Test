import React, { useState } from 'react';
import { Link, Navigate, useLocation, useParams } from 'react-router';
import { ArrowLeft, Pencil } from 'lucide-react';
import { useSesion } from '../../estado/useSesion';
import { rutas } from '../../rutas';
import { Vacio } from '../../components/estudiante/piezas';
import { formatoFecha } from '../../components/estudiante/formato';
import { iniciales, resumirEstudiante } from '../../components/docente/datos';
import { ModalEditarEstudiante } from '../../components/docente/ModalEditarEstudiante';

/**
 * Ficha de un estudiante (/docente/estudiantes/<id>): una pantalla propia, no un bloque sobre
 * la lista. Arriba, «Todos los estudiantes» para volver (con los filtros que había); el estudiante
 * en el bloque azul; sus cifras en celdas y solo sus intentos. ADR docente/0002.
 */
export const PaginaFichaEstudiante: React.FC = () => {
  const { id = '' } = useParams();
  const { state } = useLocation() as { state: { desde?: string } | null };
  const { usuarios, intentos, actualizarEstudiante } = useSesion();
  const [modalAbierto, setModalAbierto] = useState(false);
  const [mensajeExito, setMensajeExito] = useState<string | null>(null);

  const estudiante = usuarios.find((u) => u.id === id && u.role === 'student');
  if (!estudiante) return <Navigate to={rutas.docente} replace />;

  const r = resumirEstudiante(estudiante, intentos);
  const pct = (v: number | null) => (v === null ? '—' : `${v}%`);
  const simulacros = r.intentos.filter((a) => a.mode === 'simulacro').length;

  const handleGuardar = async (datos: { cohort: string; name?: string }) => {
    await actualizarEstudiante(estudiante.id, datos);
    setMensajeExito('Información actualizada');
    setTimeout(() => setMensajeExito(null), 3500);
  };

  return (
    <>
      <Link
        to={`${rutas.docente}${state?.desde ?? ''}`}
        className="inline-flex items-center gap-1.5 text-sm font-semibold text-key-tinta hover:underline underline-offset-4 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
      >
        <ArrowLeft aria-hidden="true" className="w-4 h-4" />
        Todos los estudiantes
      </Link>

      <section aria-labelledby="ficha-nombre" className="mt-4 border-[0.8px] border-key-negro">
        <div className="bg-key-azul text-key-blanco px-6 sm:px-9 py-7 flex flex-col sm:flex-row sm:items-center gap-5">
          <span
            aria-hidden="true"
            className="w-16 h-16 shrink-0 border-[0.8px] border-key-blanco flex items-center justify-center text-2xl font-semibold"
          >
            {iniciales(estudiante.name)}
          </span>
          <div className="min-w-0 flex-1">
            <p className="text-sm">Ficha del estudiante</p>
            <h1 id="ficha-nombre" className="text-[28px] leading-9 sm:text-[32px] sm:leading-10 font-semibold text-balance">
              {estudiante.name}
            </h1>
            <p className="mt-1 text-sm break-all">
              {estudiante.email}
              {estudiante.cohort ? ` · ${estudiante.cohort}` : ' · Sin ciclo asignado'}
            </p>
            <div className="mt-3 flex items-center gap-2.5">
              <button
                type="button"
                onClick={() => setModalAbierto(true)}
                className="inline-flex items-center gap-1.5 h-8 px-3.5 rounded-full border-[0.8px] border-key-blanco text-xs font-semibold text-key-blanco hover:bg-white/10 transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-blanco"
              >
                <Pencil aria-hidden="true" className="w-3.5 h-3.5" />
                Editar información
              </button>
              {mensajeExito && (
                <span className="text-xs bg-white/20 text-key-blanco px-2.5 py-1 rounded-full font-medium" role="status">
                  {mensajeExito}
                </span>
              )}
            </div>
          </div>
          <div className="shrink-0 sm:text-right">
            <p className="text-sm">Precisión general</p>
            <p className="font-mono-num text-5xl font-bold leading-none mt-1">{pct(r.precision)}</p>
          </div>
        </div>

        <dl className="grid grid-cols-2 lg:grid-cols-4">
          {[
            ['Pruebas', `${r.intentos.length}`, `${simulacros} ${simulacros === 1 ? 'simulacro' : 'simulacros'} · ${r.intentos.length - simulacros} ${r.intentos.length - simulacros === 1 ? 'sprint' : 'sprints'}`],
            ['Lectura y Redacción', pct(r.lectura), 'Promedio de aciertos'],
            ['Matemáticas', pct(r.matematicas), 'Promedio de aciertos'],
            ['Mejor simulacro', r.mejorSimulacro ? `${r.mejorSimulacro}` : '—', 'Puntaje de 400 a 1600'],
          ].map(([termino, valor, apoyo], i) => (
            <div
              key={termino}
              className={`px-6 py-4 border-t-[0.8px] border-key-negro ${i % 2 === 1 ? 'border-l-[0.8px]' : ''} ${
                i === 2 ? 'lg:border-l-[0.8px]' : ''
              }`}
            >
              <dt className="text-sm text-key-texto-suave">{termino}</dt>
              <dd className="mt-1 text-2xl font-semibold text-key-tinta font-mono-num">{valor}</dd>
              <dd className="text-xs text-key-texto-suave">{apoyo}</dd>
            </div>
          ))}
        </dl>
      </section>

      <section aria-labelledby="ficha-intentos" className="mt-10">
        <h2 id="ficha-intentos" className="text-xl font-semibold text-key-tinta">
          Sus intentos
        </h2>
        <div className="mt-3">
          {r.intentos.length === 0 ? (
            <Vacio texto="Este estudiante todavía no ha hecho pruebas." />
          ) : (
            <div className="border-[0.8px] border-key-negro">
              <table className="w-full text-left text-base">
                <caption className="sr-only">Intentos de {estudiante.name}</caption>
                <thead className="max-md:hidden">
                  <tr className="border-b-[0.8px] border-key-negro text-sm text-key-texto-suave">
                    <th scope="col" className="px-6 py-3 font-medium">Prueba</th>
                    <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                    <th scope="col" className="px-4 py-3 font-medium text-right">Lectura</th>
                    <th scope="col" className="px-4 py-3 font-medium text-right">Matemáticas</th>
                    <th scope="col" className="px-4 py-3 font-medium text-right">Precisión</th>
                    <th scope="col" className="px-4 py-3 font-medium text-right">Puntaje</th>
                    <th scope="col" className="px-6 py-3"><span className="sr-only">Solucionario</span></th>
                  </tr>
                </thead>
                <tbody>
                  {r.intentos.map((a) => (
                    <tr
                      key={a.id}
                      className="border-b-[0.8px] border-key-negro last:border-b-0 max-md:grid max-md:grid-cols-2 max-md:gap-x-4 max-md:gap-y-1 max-md:px-5 max-md:py-4"
                    >
                      <th scope="row" className="md:px-6 md:py-4 font-medium text-key-tinta max-md:col-span-2">
                        {a.modeTitle}
                      </th>
                      <td className="md:px-4 md:py-4 text-key-texto max-md:text-sm max-md:col-span-2">
                        {formatoFecha.format(new Date(a.completedAt))}
                      </td>
                      <td className="md:px-4 md:py-4 md:text-right font-mono-num max-md:text-sm">
                        <span className="md:hidden text-key-texto-suave font-sans">Lectura </span>
                        {a.readingTotal ? `${a.readingCorrect}/${a.readingTotal}` : '—'}
                      </td>
                      <td className="md:px-4 md:py-4 md:text-right font-mono-num max-md:text-sm">
                        <span className="md:hidden text-key-texto-suave font-sans">Matemáticas </span>
                        {a.mathTotal ? `${a.mathCorrect}/${a.mathTotal}` : '—'}
                      </td>
                      <td className="md:px-4 md:py-4 md:text-right font-mono-num font-semibold max-md:text-sm">
                        <span className="md:hidden text-key-texto-suave font-sans font-normal">Precisión </span>
                        {a.percentage}%
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
        </div>
      </section>

      <ModalEditarEstudiante
        isOpen={modalAbierto}
        onClose={() => setModalAbierto(false)}
        estudiante={estudiante}
        onGuardar={handleGuardar}
      />
    </>
  );
};
