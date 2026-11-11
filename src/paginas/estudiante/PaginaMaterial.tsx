import React, { useState } from 'react';
import { useSearchParams } from 'react-router';
import { Download, Paperclip } from 'lucide-react';
import { useSesion } from '../../estado/useSesion';
import { LatexRenderer } from '../../components/LatexRenderer';
import { TituloPagina, Vacio } from '../../components/estudiante/piezas';
import { MATERIA } from '../../components/estudiante/formato';
import type { SectionType, StudyMaterial } from '../../types/exam';

/**
 * Material (/inicio/material): lista con filtro por materia y lector al lado, dentro del
 * marco de líneas (ADR marca/0003). El material abierto vive en la URL (?m=<id>), así un
 * enlace del inicio lo abre directo. Conserva los adjuntos: descarga y vista previa de
 * PDF e imágenes.
 */
type Filtro = 'all' | SectionType;

const FILTROS: { id: Filtro; texto: string }[] = [
  { id: 'all', texto: 'Todo' },
  { id: 'reading', texto: MATERIA.reading },
  { id: 'math', texto: MATERIA.math },
];

function extension(nombre: string): string {
  return (nombre.split('.').pop() || 'archivo').toUpperCase();
}

function tamano(bytes?: number | null): string {
  if (!bytes || bytes <= 0) return '';
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}

export const PaginaMaterial: React.FC = () => {
  const { materiales } = useSesion();
  const [parametros, setParametros] = useSearchParams();
  const [filtro, setFiltro] = useState<Filtro>('all');

  const visibles = filtro === 'all' ? materiales : materiales.filter((m) => m.section === filtro);
  const idAbierto = parametros.get('m');
  const abierto = visibles.find((m) => m.id === idAbierto) ?? visibles[0] ?? null;

  const abrir = (m: StudyMaterial) => {
    setParametros({ m: m.id }, { replace: true });
    // En celular el lector queda debajo de la lista: se lleva la vista hasta él.
    if (window.matchMedia('(max-width: 1023px)').matches) {
      document.getElementById('lector')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
  };

  return (
    <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10 py-8 lg:py-10">
      <TituloPagina titulo="Material" apoyo="Guías y explicaciones de tus docentes para cada materia." />

      <div role="group" aria-label="Filtrar por materia" className="mt-6 flex flex-wrap">
        {FILTROS.map((f) => {
          const n = f.id === 'all' ? materiales.length : materiales.filter((m) => m.section === f.id).length;
          const activo = filtro === f.id;
          return (
            <button
              key={f.id}
              type="button"
              aria-pressed={activo}
              onClick={() => setFiltro(f.id)}
              className={`h-11 px-4 sm:px-5 -ml-[0.8px] first:ml-0 border-[0.8px] border-key-negro text-sm sm:text-base cursor-pointer transition-colors
                focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul
                ${activo ? 'bg-key-azul text-key-blanco font-semibold' : 'bg-key-blanco text-key-tinta hover:bg-key-gris-claro'}`}
            >
              {f.texto} <span className="font-mono-num">({n})</span>
            </button>
          );
        })}
      </div>

      {visibles.length === 0 ? (
        <div className="mt-6">
          <Vacio texto="Todavía no hay material de esta materia." />
        </div>
      ) : (
        <div className="mt-6 grid grid-cols-1 lg:grid-cols-[minmax(0,1fr)_minmax(0,1.8fr)] border-[0.8px] border-key-negro">
          <ul aria-label="Materiales" className="min-w-0 lg:border-r-[0.8px] border-key-negro">
            {visibles.map((m) => {
              const activo = abierto?.id === m.id;
              return (
                <li key={m.id} className="border-b-[0.8px] border-key-negro last:border-b-0">
                  <button
                    type="button"
                    aria-current={activo ? 'true' : undefined}
                    onClick={() => abrir(m)}
                    className={`w-full text-left px-5 sm:px-6 py-4 cursor-pointer transition-colors border-l-4
                      focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul
                      ${activo ? 'bg-key-gris-claro border-key-azul' : 'border-transparent hover:bg-key-gris-claro'}`}
                  >
                    <span className="block text-sm text-key-texto-suave">
                      {MATERIA[m.section]} · {m.category}
                    </span>
                    <span className="mt-1 block text-base font-semibold text-key-tinta">{m.title}</span>
                    <span className="mt-1 block text-sm text-key-texto line-clamp-2">{m.summary}</span>
                    <span className="mt-2 flex flex-wrap items-center gap-x-3 text-sm text-key-texto-suave">
                      <span>
                        <span className="font-mono-num">{m.readingTimeMinutes} min</span> de lectura
                      </span>
                      {m.attachmentName && (
                        <span className="inline-flex items-center gap-1">
                          <Paperclip aria-hidden="true" className="h-3.5 w-3.5" />
                          {extension(m.attachmentName)}
                        </span>
                      )}
                    </span>
                  </button>
                </li>
              );
            })}
          </ul>

          {abierto && (
            <article
              id="lector"
              aria-labelledby="lector-titulo"
              className="min-w-0 max-lg:border-t-[0.8px] border-key-negro px-6 sm:px-9 py-7 scroll-mt-40"
            >
              <p className="text-sm text-key-texto-suave">
                {MATERIA[abierto.section]} · {abierto.category} · Por {abierto.authorName} ·{' '}
                <span className="font-mono-num">{abierto.readingTimeMinutes} min</span>
              </p>
              <h2 id="lector-titulo" className="mt-2 text-[26px] leading-8 sm:text-[30px] sm:leading-9 font-semibold text-key-tinta text-balance">
                {abierto.title}
              </h2>
              <p className="mt-3 text-lg leading-7 text-key-texto">{abierto.summary}</p>

              {abierto.attachmentUrl && abierto.attachmentName && (
                <div className="mt-6 flex flex-wrap items-center justify-between gap-4 border-[0.8px] border-key-negro p-4">
                  <div className="flex items-center gap-3 min-w-0">
                    <span className="shrink-0 border-[0.8px] border-key-negro px-2 py-1 text-xs font-bold font-mono-num">
                      {extension(abierto.attachmentName)}
                    </span>
                    <span className="min-w-0">
                      <span className="block truncate text-sm font-semibold text-key-tinta">{abierto.attachmentName}</span>
                      <span className="block text-sm text-key-texto-suave">
                        Archivo del docente{tamano(abierto.attachmentSize) && ` · ${tamano(abierto.attachmentSize)}`}
                      </span>
                    </span>
                  </div>
                  <a
                    href={abierto.attachmentUrl}
                    download={abierto.attachmentName}
                    target="_blank"
                    rel="noreferrer"
                    className="inline-flex items-center gap-2 h-10 px-5 rounded-full bg-key-azul hover:bg-key-azul-hover text-key-blanco text-sm font-semibold transition-colors focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-key-azul"
                  >
                    <Download aria-hidden="true" className="h-4 w-4" />
                    Descargar
                  </a>
                </div>
              )}

              {abierto.attachmentUrl && abierto.attachmentMime?.startsWith('image/') && (
                <img
                  src={abierto.attachmentUrl}
                  alt={abierto.attachmentName || 'Imagen adjunta del material'}
                  className="mt-6 w-full border-[0.8px] border-key-negro"
                />
              )}
              {abierto.attachmentUrl && abierto.attachmentMime === 'application/pdf' && (
                <iframe
                  src={abierto.attachmentUrl}
                  title={abierto.attachmentName || 'Vista previa del PDF'}
                  className="mt-6 w-full h-[520px] border-[0.8px] border-key-negro"
                />
              )}

              <div className="mt-7 border-t-[0.8px] border-key-negro pt-6 text-base leading-[28px] text-key-texto max-w-[72ch] whitespace-normal">
                <LatexRenderer content={abierto.content} />
              </div>
            </article>
          )}
        </div>
      )}
    </div>
  );
};
