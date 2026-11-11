import React, { useEffect, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router';
import { ArrowLeft, Paperclip, Upload, X } from 'lucide-react';
import { useSesion } from '../../estado/useSesion';
import { rutas } from '../../rutas';
import { LatexRenderer } from '../../components/LatexRenderer';
import { MATERIA } from '../../components/estudiante/formato';
import { claseCampo, tamanoArchivo } from '../../components/docente/datos';
import type { SectionType } from '../../types/exam';

const EXTENSIONES = '.pdf,.doc,.docx,.ppt,.pptx,.xls,.xlsx,.png,.jpg,.jpeg,.webp,.gif,.svg,.csv,.txt';
const LIMITE = 15 * 1024 * 1024;
const MAX_RESUMEN = 200;
const foco = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul';

/** Atajos para escribir fórmulas sin saber LaTeX: se insertan donde está el cursor. */
const ATAJOS = [
  { texto: 'Fórmula', fragmento: '$ $', cursor: 2 },
  { texto: 'Fracción', fragmento: '\\frac{a}{b}', cursor: 6 },
  { texto: 'Raíz', fragmento: '\\sqrt{x}', cursor: 6 },
  { texto: 'Potencia', fragmento: '^{2}', cursor: 2 },
  { texto: 'π', fragmento: '\\pi', cursor: 3 },
];

type Errores = Partial<Record<'titulo' | 'tema' | 'resumen' | 'contenido', string>>;

/**
 * Publicar o editar material (/docente/material/nuevo y /docente/material/<id>): una página
 * propia con los campos en tres secciones (lo básico, contenido y archivo) y, al lado, la vista
 * previa como la verá el estudiante. «Publicar» es la única acción azul. ADR docente/0002.
 */
export const PaginaFormularioMaterial: React.FC = () => {
  const { id } = useParams();
  const { usuario, materiales, crearMaterial, editarMaterial } = useSesion();
  const navigate = useNavigate();
  const existente = id ? materiales.find((m) => m.id === id) : undefined;

  const [titulo, setTitulo] = useState(existente?.title ?? '');
  const [materia, setMateria] = useState<SectionType>(existente?.section ?? 'math');
  const [tema, setTema] = useState(existente?.category ?? '');
  const [minutos, setMinutos] = useState(existente?.readingTimeMinutes ?? 6);
  const [resumen, setResumen] = useState(existente?.summary ?? '');
  const [contenido, setContenido] = useState(existente?.content ?? '');
  const [archivo, setArchivo] = useState<{ nombre: string; tipo: string; tamano: number; datos: string | null } | null>(
    existente?.attachmentName
      ? {
          nombre: existente.attachmentName,
          tipo: existente.attachmentMime ?? '',
          tamano: existente.attachmentSize ?? 0,
          datos: null,
        }
      : null,
  );
  const [quitarArchivo, setQuitarArchivo] = useState(false);
  const [errorArchivo, setErrorArchivo] = useState<string | null>(null);
  const [errores, setErrores] = useState<Errores>({});
  const [arrastrando, setArrastrando] = useState(false);
  const [guardando, setGuardando] = useState(false);
  const [vista, setVista] = useState<'editar' | 'previa'>('editar');
  const [cambios, setCambios] = useState(false);
  const areaRef = useRef<HTMLTextAreaElement>(null);
  const tituloRef = useRef<HTMLHeadingElement>(null);

  // Avisa antes de cerrar o recargar la pestaña con cambios sin guardar.
  useEffect(() => {
    if (!cambios) return;
    const avisar = (e: BeforeUnloadEvent) => e.preventDefault();
    window.addEventListener('beforeunload', avisar);
    return () => window.removeEventListener('beforeunload', avisar);
  }, [cambios]);

  if (id && !existente) return <Navigate to={rutas.materialDocente} replace />;
  if (!usuario) return null;

  const marcar = <T,>(set: (v: T) => void) => (v: T) => {
    set(v);
    setCambios(true);
  };

  const leerArchivo = (file: File | undefined) => {
    setErrorArchivo(null);
    if (!file) return;
    if (file.size > LIMITE) {
      setErrorArchivo('El archivo pesa más de 15 MB. Comprímelo o súbelo en partes.');
      return;
    }
    const lector = new FileReader();
    lector.onload = () => {
      setArchivo({
        nombre: file.name,
        tipo: file.type || 'application/octet-stream',
        tamano: file.size,
        datos: typeof lector.result === 'string' ? lector.result : null,
      });
      setQuitarArchivo(false);
      setCambios(true);
    };
    lector.onerror = () => setErrorArchivo('No se pudo leer el archivo. Intenta con otro.');
    lector.readAsDataURL(file);
  };

  const insertar = (fragmento: string, cursor: number) => {
    const area = areaRef.current;
    const inicio = area?.selectionStart ?? contenido.length;
    const fin = area?.selectionEnd ?? contenido.length;
    const nuevo = contenido.slice(0, inicio) + fragmento + contenido.slice(fin);
    setContenido(nuevo);
    setCambios(true);
    requestAnimationFrame(() => {
      area?.focus();
      area?.setSelectionRange(inicio + cursor, inicio + cursor);
    });
  };

  const validar = (): Errores => {
    const e: Errores = {};
    if (!titulo.trim()) e.titulo = 'Escribe un título.';
    if (!tema.trim()) e.tema = 'Escribe el tema, por ejemplo «Geometría».';
    if (!resumen.trim()) e.resumen = 'Escribe en una línea qué aprenderá el estudiante.';
    if (!contenido.trim()) e.contenido = 'Escribe el contenido de la guía.';
    return e;
  };

  const guardar = async (ev: React.FormEvent) => {
    ev.preventDefault();
    const e = validar();
    setErrores(e);
    const primero = (['titulo', 'tema', 'resumen', 'contenido'] as const).find((k) => e[k]);
    if (primero) {
      setVista('editar');
      requestAnimationFrame(() => document.getElementById(`material-${primero}`)?.focus());
      return;
    }
    setGuardando(true);
    try {
      const adjunto = {
        attachmentName: archivo?.nombre ?? null,
        attachmentMime: archivo?.tipo ?? null,
        attachmentSize: archivo?.tamano ?? null,
        attachmentDataBase64: archivo?.datos ?? null,
      };
      const base = {
        title: titulo.trim(),
        section: materia,
        category: tema.trim(),
        summary: resumen.trim(),
        content: contenido,
        readingTimeMinutes: minutos,
      };
      if (existente) {
        await editarMaterial(existente.id, { ...base, ...adjunto, removeAttachment: quitarArchivo });
      } else {
        await crearMaterial({ ...base, ...adjunto, authorId: usuario.id, authorName: usuario.name });
      }
      setCambios(false);
      navigate(rutas.materialDocente, {
        state: { aviso: existente ? 'Cambios guardados' : 'Material publicado' },
      });
    } finally {
      setGuardando(false);
    }
  };

  const salir = () => {
    if (cambios && !window.confirm('Tienes cambios sin guardar. ¿Salir de todos modos?')) return;
    navigate(rutas.materialDocente);
  };

  const errorDe = (k: keyof Errores) =>
    errores[k] ? (
      <p id={`error-${k}`} className="mt-1.5 text-sm text-estado-error">
        {errores[k]}
      </p>
    ) : null;
  const campo = (k: keyof Errores) =>
    `${claseCampo} ${errores[k] ? 'border-estado-error' : ''}`;

  const etiqueta = 'block text-sm font-medium text-key-tinta mb-1.5';

  return (
    <form onSubmit={guardar} noValidate>
      <Link
        to={rutas.materialDocente}
        onClick={(e) => {
          e.preventDefault();
          salir();
        }}
        className={`inline-flex items-center gap-1.5 text-sm font-semibold text-key-tinta hover:underline underline-offset-4 ${foco}`}
      >
        <ArrowLeft aria-hidden="true" className="w-4 h-4" />
        Material
      </Link>

      <div className="mt-3 flex flex-wrap items-end justify-between gap-4">
        <h1
          ref={tituloRef}
          className="text-key-tinta font-semibold text-[28px] leading-9 sm:text-[32px] sm:leading-10 tracking-[-0.01em]"
        >
          {existente ? 'Editar material' : 'Publicar material'}
        </h1>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={salir}
            className={`h-[49px] px-6 rounded-full border-[0.8px] border-key-negro text-base font-semibold text-key-tinta hover:bg-key-gris-claro cursor-pointer ${foco}`}
          >
            Cancelar
          </button>
          <button
            type="submit"
            disabled={guardando}
            className={`h-[49px] px-7 rounded-full bg-key-azul hover:bg-key-azul-hover text-base font-semibold text-key-blanco cursor-pointer disabled:opacity-60 ${foco}`}
          >
            {guardando ? 'Guardando…' : existente ? 'Guardar cambios' : 'Publicar'}
          </button>
        </div>
      </div>

      {Object.keys(errores).length > 0 && (
        <p role="alert" className="mt-4 bg-estado-error-fondo text-estado-error px-4 py-3 text-sm">
          Revisa los campos marcados antes de {existente ? 'guardar' : 'publicar'}.
        </p>
      )}

      {/* Celular: Editar · Vista previa en dos celdas */}
      <div role="group" aria-label="Vista" className="mt-6 lg:hidden grid grid-cols-2">
        {(['editar', 'previa'] as const).map((v) => (
          <button
            key={v}
            type="button"
            aria-pressed={vista === v}
            onClick={() => setVista(v)}
            className={`h-11 border-[0.8px] border-key-negro -ml-[0.8px] first:ml-0 text-sm cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul ${
              vista === v ? 'bg-key-azul text-key-blanco font-semibold' : 'bg-key-blanco text-key-tinta hover:bg-key-gris-claro'
            }`}
          >
            {v === 'editar' ? 'Editar' : 'Vista previa'}
          </button>
        ))}
      </div>

      <div className="mt-6 max-lg:mt-0 max-lg:border-t-0 grid grid-cols-1 lg:grid-cols-[minmax(0,1.35fr)_minmax(0,1fr)] border-[0.8px] border-key-negro">
        {/* Campos */}
        <div className={`min-w-0 lg:border-r-[0.8px] border-key-negro ${vista === 'previa' ? 'max-lg:hidden' : ''}`}>
          <fieldset className="px-5 sm:px-7 py-6">
            <legend className="sr-only">Lo básico</legend>
            <h2 aria-hidden="true" className="text-lg font-semibold text-key-tinta mb-4">
              1 · Lo básico
            </h2>
            <label htmlFor="material-titulo" className={etiqueta}>
              Título
            </label>
            <input
              id="material-titulo"
              value={titulo}
              onChange={(e) => marcar(setTitulo)(e.target.value)}
              placeholder="Fórmulas de volumen: cilindro y cono"
              aria-invalid={Boolean(errores.titulo)}
              aria-describedby={errores.titulo ? 'error-titulo' : undefined}
              className={campo('titulo')}
            />
            {errorDe('titulo')}

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <span id="material-materia" className={etiqueta}>
                  Materia
                </span>
                <div role="radiogroup" aria-labelledby="material-materia" className="grid grid-cols-2">
                  {(['math', 'reading'] as const).map((m) => (
                    <button
                      key={m}
                      type="button"
                      role="radio"
                      aria-checked={materia === m}
                      onClick={() => marcar(setMateria)(m)}
                      className={`h-11 px-2 border-[0.8px] border-key-negro -ml-[0.8px] first:ml-0 text-sm cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul ${
                        materia === m ? 'bg-key-azul text-key-blanco font-semibold' : 'bg-key-blanco text-key-tinta hover:bg-key-gris-claro'
                      }`}
                    >
                      {m === 'math' ? 'Matemáticas' : 'Lectura'}
                    </button>
                  ))}
                </div>
              </div>
              <div>
                <label htmlFor="material-tema" className={etiqueta}>
                  Tema
                </label>
                <input
                  id="material-tema"
                  value={tema}
                  onChange={(e) => marcar(setTema)(e.target.value)}
                  placeholder={materia === 'math' ? 'Geometría' : 'Comprensión de lectura'}
                  list="temas-usados"
                  aria-invalid={Boolean(errores.tema)}
                  aria-describedby={errores.tema ? 'error-tema' : undefined}
                  className={campo('tema')}
                />
                <datalist id="temas-usados">
                  {Array.from(new Set(materiales.map((m) => m.category))).map((t) => (
                    <option key={t} value={t} />
                  ))}
                </datalist>
                {errorDe('tema')}
              </div>
            </div>

            <div className="mt-5 grid grid-cols-1 sm:grid-cols-[8rem_minmax(0,1fr)] gap-4">
              <div>
                <label htmlFor="material-minutos" className={etiqueta}>
                  Minutos
                </label>
                <input
                  id="material-minutos"
                  type="number"
                  inputMode="numeric"
                  min={1}
                  max={120}
                  value={minutos}
                  onChange={(e) => marcar(setMinutos)(Math.min(120, Math.max(1, Number(e.target.value) || 1)))}
                  className={`${claseCampo} font-mono-num`}
                />
              </div>
              <div>
                <div className="flex items-baseline justify-between">
                  <label htmlFor="material-resumen" className={etiqueta}>
                    Resumen
                  </label>
                  <span className="text-xs text-key-texto-suave font-mono-num" aria-hidden="true">
                    {resumen.length}/{MAX_RESUMEN}
                  </span>
                </div>
                <input
                  id="material-resumen"
                  value={resumen}
                  maxLength={MAX_RESUMEN}
                  onChange={(e) => marcar(setResumen)(e.target.value)}
                  placeholder="Qué aprenderá el estudiante con esta guía"
                  aria-invalid={Boolean(errores.resumen)}
                  aria-describedby={errores.resumen ? 'error-resumen' : undefined}
                  className={campo('resumen')}
                />
                {errorDe('resumen')}
              </div>
            </div>
          </fieldset>

          <fieldset className="px-5 sm:px-7 py-6 border-t-[0.8px] border-key-negro">
            <legend className="sr-only">Contenido</legend>
            <h2 aria-hidden="true" className="text-lg font-semibold text-key-tinta mb-4">
              2 · Contenido
            </h2>
            <label htmlFor="material-contenido" className={etiqueta}>
              Guía para el estudiante
            </label>
            <div role="toolbar" aria-label="Insertar en la guía" className="flex flex-wrap border-[0.8px] border-b-0 border-key-negro">
              {ATAJOS.map((a) => (
                <button
                  key={a.texto}
                  type="button"
                  onClick={() => insertar(a.fragmento, a.cursor)}
                  className="h-9 px-3 border-r-[0.8px] border-key-negro text-sm text-key-tinta hover:bg-key-gris-claro cursor-pointer focus-visible:outline-2 focus-visible:-outline-offset-2 focus-visible:outline-key-azul"
                >
                  {a.texto}
                </button>
              ))}
            </div>
            <textarea
              id="material-contenido"
              ref={areaRef}
              rows={10}
              value={contenido}
              onChange={(e) => marcar(setContenido)(e.target.value)}
              placeholder={'Explica el tema paso a paso. Las fórmulas van entre signos de dólar: $A = \\pi r^2$'}
              aria-invalid={Boolean(errores.contenido)}
              aria-describedby={`ayuda-contenido${errores.contenido ? ' error-contenido' : ''}`}
              className={`${campo('contenido')} h-auto py-3 font-mono text-sm leading-relaxed`}
            />
            <p id="ayuda-contenido" className="mt-1.5 text-sm text-key-texto-suave">
              Una fórmula en la línea va entre <code className="font-mono">$…$</code>; una fórmula sola, entre{' '}
              <code className="font-mono">$$…$$</code>.
            </p>
            {errorDe('contenido')}
          </fieldset>

          <fieldset className="px-5 sm:px-7 py-6 border-t-[0.8px] border-key-negro">
            <legend className="sr-only">Archivo</legend>
            <h2 aria-hidden="true" className="text-lg font-semibold text-key-tinta mb-4">
              3 · Archivo <span className="font-normal text-key-texto-suave">(opcional)</span>
            </h2>
            {archivo && !quitarArchivo ? (
              <div className="flex items-center justify-between gap-3 border-[0.8px] border-key-negro px-4 py-3">
                <span className="flex items-center gap-2 min-w-0">
                  <Paperclip aria-hidden="true" className="w-4 h-4 text-key-texto-suave shrink-0" />
                  <span className="truncate text-key-tinta">{archivo.nombre}</span>
                  {archivo.tamano > 0 && (
                    <span className="text-sm text-key-texto-suave font-mono-num shrink-0">
                      {tamanoArchivo(archivo.tamano)}
                    </span>
                  )}
                </span>
                <button
                  type="button"
                  onClick={() => {
                    setQuitarArchivo(true);
                    setArchivo(null);
                    setCambios(true);
                  }}
                  className={`inline-flex items-center gap-1 h-9 px-3.5 rounded-full border-[0.8px] border-key-negro text-sm font-semibold text-key-tinta hover:bg-key-gris-claro cursor-pointer shrink-0 ${foco}`}
                >
                  <X aria-hidden="true" className="w-4 h-4" />
                  Quitar
                </button>
              </div>
            ) : (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setArrastrando(true);
                }}
                onDragLeave={() => setArrastrando(false)}
                onDrop={(e) => {
                  e.preventDefault();
                  setArrastrando(false);
                  leerArchivo(e.dataTransfer.files?.[0]);
                }}
                className={`flex flex-col items-center justify-center gap-1 px-4 py-8 border-[0.8px] border-dashed border-key-negro text-center cursor-pointer focus-within:outline-2 focus-within:outline-offset-2 focus-within:outline-key-azul ${
                  arrastrando ? 'bg-key-gris-claro' : 'hover:bg-key-gris-claro'
                }`}
              >
                <Upload aria-hidden="true" className="w-5 h-5 text-key-azul" />
                <span className="font-semibold text-key-tinta">Arrastra un archivo o elígelo</span>
                <span className="text-sm text-key-texto-suave">PDF, Word, PowerPoint, Excel o imagen, hasta 15 MB</span>
                <input type="file" accept={EXTENSIONES} onChange={(e) => leerArchivo(e.target.files?.[0])} className="sr-only" />
              </label>
            )}
            {errorArchivo && (
              <p role="alert" className="mt-1.5 text-sm text-estado-error">
                {errorArchivo}
              </p>
            )}
          </fieldset>
        </div>

        {/* Vista previa: como la verá el estudiante en Material */}
        <aside
          aria-label="Vista previa"
          className={`min-w-0 bg-key-gris-claro ${vista === 'editar' ? 'max-lg:hidden' : ''}`}
        >
          <div className="lg:sticky lg:top-24">
            <p className="px-5 sm:px-7 py-4 border-b-[0.8px] border-key-negro font-semibold text-key-tinta">
              Así lo verá el estudiante
            </p>
            <article className="px-5 sm:px-7 py-6">
              <p className="text-sm text-key-texto-suave">
                {MATERIA[materia]}
                {tema ? ` · ${tema}` : ''} · <span className="font-mono-num">{minutos} min</span>
              </p>
              <h2 className="mt-1 text-2xl font-semibold text-key-tinta text-balance">
                {titulo || 'Título del material'}
              </h2>
              <p className="mt-2 text-key-texto">{resumen || 'El resumen aparece aquí.'}</p>
              <div className="mt-5 text-key-tinta leading-relaxed">
                {contenido.trim() ? (
                  <LatexRenderer content={contenido} />
                ) : (
                  <p className="text-key-texto-suave">El contenido aparece aquí mientras escribes.</p>
                )}
              </div>
              {archivo && !quitarArchivo && (
                <p className="mt-5 inline-flex items-center gap-1.5 text-sm text-key-tinta">
                  <Paperclip aria-hidden="true" className="w-4 h-4" />
                  {archivo.nombre}
                </p>
              )}
            </article>
          </div>
        </aside>
      </div>
    </form>
  );
};
