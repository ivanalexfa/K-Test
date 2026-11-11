import React, { useEffect, useId, useRef, useState } from 'react';
import { Link, useLocation } from 'react-router';
import { Paperclip, Pencil, Plus, Trash2 } from 'lucide-react';
import { useSesion } from '../../estado/useSesion';
import { rutas } from '../../rutas';
import { TituloPagina, Vacio } from '../../components/estudiante/piezas';
import { MATERIA } from '../../components/estudiante/formato';
import { BotonPastilla } from '../../components/landing/BotonPastilla';
import type { StudyMaterial } from '../../types/exam';

const foco = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul';

/**
 * Material (/docente/material): la lista con líneas finas y «Publicar material» como la acción
 * protagonista. Editar abre su propia página; eliminar pide confirmación. ADR docente/0002.
 */
export const PaginaMaterialDocente: React.FC = () => {
  const { materiales, eliminarMaterial } = useSesion();
  const [porEliminar, setPorEliminar] = useState<StudyMaterial | null>(null);
  const aviso = (useLocation().state as { aviso?: string } | null)?.aviso;

  return (
    <>
      <TituloPagina
        titulo="Material"
        apoyo="Guías con fórmulas y archivos para tus estudiantes."
        accion={
          <BotonPastilla to={rutas.materialNuevo}>
            <Plus aria-hidden="true" className="w-5 h-5 mr-1.5" />
            Publicar material
          </BotonPastilla>
        }
      />

      {aviso && (
        <p role="status" className="mt-6 bg-estado-exito-fondo text-estado-exito px-4 py-3 text-sm font-semibold">
          {aviso}
        </p>
      )}

      <div className="mt-8">
        {materiales.length === 0 ? (
          <Vacio
            texto="Todavía no has publicado material. Empieza con una guía corta de un tema."
            accion={<BotonPastilla to={rutas.materialNuevo}>Publicar material</BotonPastilla>}
          />
        ) : (
          <ul aria-label="Material publicado" className="border-[0.8px] border-key-negro">
            {materiales.map((m) => (
              <li
                key={m.id}
                className="border-b-[0.8px] border-key-negro last:border-b-0 px-5 sm:px-6 py-4 flex flex-col md:flex-row md:items-center gap-3 md:gap-6"
              >
                <div className="min-w-0 flex-1">
                  <Link
                    to={rutas.editarMaterial(m.id)}
                    className={`text-lg font-semibold text-key-tinta hover:underline underline-offset-4 ${foco}`}
                  >
                    {m.title}
                  </Link>
                  <p className="text-sm text-key-texto-suave">
                    {MATERIA[m.section]} · {m.category} · <span className="font-mono-num">{m.readingTimeMinutes} min</span>{' '}
                    · {m.authorName}
                  </p>
                  {m.attachmentName && (
                    <p className="mt-1 inline-flex items-center gap-1.5 text-sm text-key-texto">
                      <Paperclip aria-hidden="true" className="w-4 h-4 text-key-texto-suave" />
                      {m.attachmentName}
                    </p>
                  )}
                </div>
                <div className="flex gap-2 shrink-0">
                  <Link
                    to={rutas.editarMaterial(m.id)}
                    className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-full border-[0.8px] border-key-negro text-sm font-semibold text-key-tinta hover:bg-key-gris-claro transition-colors ${foco}`}
                  >
                    <Pencil aria-hidden="true" className="w-4 h-4" />
                    Editar
                  </Link>
                  <button
                    type="button"
                    onClick={() => setPorEliminar(m)}
                    aria-label={`Eliminar ${m.title}`}
                    className={`inline-flex items-center gap-1.5 h-10 px-4 rounded-full border-[0.8px] border-estado-error text-sm font-semibold text-estado-error hover:bg-estado-error-fondo transition-colors cursor-pointer ${foco}`}
                  >
                    <Trash2 aria-hidden="true" className="w-4 h-4" />
                    Eliminar
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>

      <ConfirmarEliminar
        material={porEliminar}
        onCancelar={() => setPorEliminar(null)}
        onConfirmar={async () => {
          if (porEliminar) await eliminarMaterial(porEliminar.id);
          setPorEliminar(null);
        }}
      />
    </>
  );
};

/** Confirmación antes de borrar: el borrado no se puede deshacer. */
const ConfirmarEliminar: React.FC<{
  material: StudyMaterial | null;
  onCancelar: () => void;
  onConfirmar: () => Promise<void>;
}> = ({ material, onCancelar, onConfirmar }) => {
  const ref = useRef<HTMLDialogElement>(null);
  const titulo = useId();
  const [borrando, setBorrando] = useState(false);

  useEffect(() => {
    const d = ref.current;
    if (!d) return;
    if (material && !d.open) d.showModal();
    if (!material && d.open) d.close();
  }, [material]);

  return (
    <dialog ref={ref} aria-labelledby={titulo} onClose={onCancelar} className="paa-dialog w-[92vw] max-w-md">
      <div className="bg-key-blanco border-[0.8px] border-key-negro p-6">
        <h2 id={titulo} className="text-xl font-semibold text-key-tinta">
          ¿Eliminar este material?
        </h2>
        <p className="mt-2 text-key-texto">
          «{material?.title}» dejará de verse para tus estudiantes. No se puede deshacer.
        </p>
        <div className="mt-6 flex flex-col-reverse sm:flex-row justify-end gap-2">
          <button
            type="button"
            onClick={() => ref.current?.close()}
            className={`h-10 px-5 rounded-full border-[0.8px] border-key-negro text-sm font-semibold text-key-tinta hover:bg-key-gris-claro cursor-pointer ${foco}`}
          >
            Cancelar
          </button>
          <button
            type="button"
            disabled={borrando}
            onClick={async () => {
              setBorrando(true);
              try {
                await onConfirmar();
              } finally {
                setBorrando(false);
              }
            }}
            className={`h-10 px-5 rounded-full bg-estado-error text-sm font-semibold text-key-blanco hover:opacity-90 cursor-pointer disabled:opacity-60 ${foco}`}
          >
            {borrando ? 'Eliminando…' : 'Eliminar'}
          </button>
        </div>
      </div>
    </dialog>
  );
};
