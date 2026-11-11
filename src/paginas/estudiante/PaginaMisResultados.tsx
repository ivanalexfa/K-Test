import React from 'react';
import { Link } from 'react-router';
import { instantiateUserClass, StudentUser } from '../../models/UserClasses';
import { useSesion } from '../../estado/useSesion';
import { rutas } from '../../rutas';
import { BotonPastilla } from '../../components/landing/BotonPastilla';
import { DatosEstudiante, TituloPagina, Vacio } from '../../components/estudiante/piezas';
import { formatoFecha } from '../../components/estudiante/formato';

/**
 * Mis resultados (/inicio/resultados): tres datos y el historial en una tabla de líneas
 * finas (en celular, filas apiladas). Cada intento abre su resultado y solucionario.
 */
function duracion(segundos: number): string {
  const m = Math.floor(segundos / 60);
  const s = segundos % 60;
  return m ? `${m} min ${s.toString().padStart(2, '0')} s` : `${s} s`;
}

export const PaginaMisResultados: React.FC = () => {
  const { usuario, intentos } = useSesion();
  const estudiante = usuario ? instantiateUserClass(usuario) : null;
  if (!(estudiante instanceof StudentUser)) return null;

  const mios = [...estudiante.getMyAttempts(intentos)].sort((a, b) =>
    b.completedAt.localeCompare(a.completedAt),
  );

  return (
    <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10 py-8 lg:py-10">
      <TituloPagina titulo="Mis resultados" apoyo="Cada intento guarda tus respuestas y su solucionario." />

      <div className="mt-6 max-w-[720px]">
        <DatosEstudiante
          pruebas={mios.length}
          precision={estudiante.getAverageAccuracy(intentos)}
          mejorSimulacro={estudiante.getBestSimulacroScore(intentos)}
        />
      </div>

      {mios.length === 0 ? (
        <div className="mt-6 max-w-[720px]">
          <Vacio
            texto="Todavía no tienes resultados. Haz un sprint de pocos minutos para ver cómo vas."
            accion={<BotonPastilla to={rutas.pruebas}>Ir a pruebas</BotonPastilla>}
          />
        </div>
      ) : (
        <div className="mt-6 border-[0.8px] border-key-negro">
          <table className="w-full text-left text-base">
            <caption className="sr-only">Historial de intentos</caption>
            <thead className="max-md:hidden">
              <tr className="border-b-[0.8px] border-key-negro text-sm text-key-texto-suave">
                <th scope="col" className="px-6 py-3 font-medium">Prueba</th>
                <th scope="col" className="px-4 py-3 font-medium">Fecha</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Correctas</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Precisión</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Puntaje</th>
                <th scope="col" className="px-4 py-3 font-medium text-right">Tiempo</th>
                <th scope="col" className="px-6 py-3"><span className="sr-only">Solucionario</span></th>
              </tr>
            </thead>
            <tbody>
              {mios.map((a) => (
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
                    <span className="md:hidden text-key-texto-suave font-sans">Correctas </span>
                    {a.totalCorrect}/{a.totalQuestions}
                  </td>
                  <td className="md:px-4 md:py-4 md:text-right font-mono-num font-semibold max-md:text-sm">
                    <span className="md:hidden text-key-texto-suave font-sans font-normal">Precisión </span>
                    {a.percentage}%
                  </td>
                  <td className="md:px-4 md:py-4 md:text-right font-mono-num max-md:text-sm">
                    <span className="md:hidden text-key-texto-suave font-sans">Puntaje </span>
                    {a.scaledScore}
                  </td>
                  <td className="md:px-4 md:py-4 md:text-right font-mono-num text-key-texto max-md:text-sm">
                    <span className="md:hidden text-key-texto-suave font-sans">Tiempo </span>
                    {duracion(a.durationSeconds)}
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
  );
};
