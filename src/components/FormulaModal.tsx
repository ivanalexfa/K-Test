import React, { useEffect, useId, useRef, useState } from 'react';
import { X, Sigma, Info, Compass } from 'lucide-react';
import { LatexRenderer } from './LatexRenderer';

interface FormulaModalProps {
  isOpen: boolean;
  onClose: () => void;
}

type FormulaCategory = 'all' | 'areas' | 'triangles' | 'volumes';

interface FormulaItem {
  id: string;
  title: string;
  category: Exclude<FormulaCategory, 'all'>;
  formulas: string[];
  caption: string;
  svg: React.ReactNode;
}

const FORMULA_ITEMS: FormulaItem[] = [
  {
    id: 'circle',
    title: 'Círculo',
    category: 'areas',
    formulas: ['A = \\pi r^2', 'C = 2\\pi r'],
    caption: 'Donde r es el radio, A el área y C la circunferencia.',
    svg: (
      <svg viewBox="0 0 120 100" className="w-28 h-24 stroke-key-tinta fill-none">
        <circle cx="60" cy="50" r="36" strokeWidth="2.2" className="fill-key-azul/8" />
        <circle cx="60" cy="50" r="2.5" className="fill-key-azul stroke-none" />
        <line x1="60" y1="50" x2="96" y2="50" strokeWidth="2" className="stroke-key-azul" />
        <text x="75" y="44" className="fill-key-azul stroke-none text-[12px] font-bold italic">
          r
        </text>
      </svg>
    ),
  },
  {
    id: 'rectangle',
    title: 'Rectángulo',
    category: 'areas',
    formulas: ['A = \\ell w', 'P = 2\\ell + 2w'],
    caption: 'Donde ℓ es el largo y w es el ancho.',
    svg: (
      <svg viewBox="0 0 130 100" className="w-28 h-24 stroke-key-tinta fill-none">
        <rect
          x="22"
          y="25"
          width="82"
          height="50"
          strokeWidth="2.2"
          className="fill-key-azul/8"
        />
        <polyline points="22,33 30,33 30,25" strokeWidth="1.4" />
        <text x="60" y="20" className="fill-key-tinta stroke-none text-[12px] font-bold italic">
          ℓ
        </text>
        <text x="109" y="54" className="fill-key-azul stroke-none text-[12px] font-bold italic">
          w
        </text>
      </svg>
    ),
  },
  {
    id: 'triangle',
    title: 'Triángulo',
    category: 'areas',
    formulas: ['A = \\frac{1}{2}bh'],
    caption: 'Donde b es la base y h la altura perpendicular.',
    svg: (
      <svg viewBox="0 0 130 100" className="w-28 h-24 stroke-key-tinta fill-none">
        <polygon
          points="20,78 108,78 58,20"
          strokeWidth="2.2"
          className="fill-key-azul/8"
        />
        <line
          x1="58"
          y1="20"
          x2="58"
          y2="78"
          strokeWidth="1.8"
          strokeDasharray="3 3"
          className="stroke-key-azul"
        />
        <polyline points="58,70 66,70 66,78" strokeWidth="1.4" />
        <text x="63" y="55" className="fill-key-azul stroke-none text-[12px] font-bold italic">
          h
        </text>
        <text x="62" y="93" className="fill-key-tinta stroke-none text-[12px] font-bold italic">
          b
        </text>
      </svg>
    ),
  },
  {
    id: 'pythagoras',
    title: 'Teorema de Pitágoras',
    category: 'triangles',
    formulas: ['c^2 = a^2 + b^2'],
    caption: 'En todo triángulo rectángulo con catetos a, b e hipotenusa c.',
    svg: (
      <svg viewBox="0 0 130 100" className="w-28 h-24 stroke-key-tinta fill-none">
        <polygon
          points="26,78 102,78 26,22"
          strokeWidth="2.2"
          className="fill-key-azul/8"
        />
        <polyline points="26,69 35,69 35,78" strokeWidth="1.5" />
        <text x="14" y="54" className="fill-key-tinta stroke-none text-[12px] font-bold italic">
          a
        </text>
        <text x="62" y="92" className="fill-key-tinta stroke-none text-[12px] font-bold italic">
          b
        </text>
        <text x="68" y="45" className="fill-key-azul stroke-none text-[12px] font-bold italic">
          c
        </text>
      </svg>
    ),
  },
  {
    id: 'special-30-60-90',
    title: 'Triángulo Especial 30°–60°–90°',
    category: 'triangles',
    formulas: ['x : x\\sqrt{3} : 2x'],
    caption: 'Cateto opuesto a 30° = x, opuesto a 60° = x√3, hipotenusa = 2x.',
    svg: (
      <svg viewBox="0 0 140 100" className="w-32 h-24 stroke-key-tinta fill-none">
        <polygon
          points="24,78 114,78 24,24"
          strokeWidth="2.2"
          className="fill-key-azul/8"
        />
        <polyline points="24,69 33,69 33,78" strokeWidth="1.4" />
        <text x="30" y="43" className="fill-key-texto-suave stroke-none text-xs font-semibold">
          60°
        </text>
        <text x="86" y="74" className="fill-key-texto-suave stroke-none text-xs font-semibold">
          30°
        </text>
        <text x="12" y="55" className="fill-key-tinta stroke-none text-[12px] font-bold italic">
          x
        </text>
        <text x="58" y="93" className="fill-key-tinta stroke-none text-xs font-bold italic">
          x√3
        </text>
        <text x="72" y="44" className="fill-key-azul stroke-none text-[12px] font-bold italic">
          2x
        </text>
      </svg>
    ),
  },
  {
    id: 'special-45-45-90',
    title: 'Triángulo Especial 45°–45°–90°',
    category: 'triangles',
    formulas: ['s : s : s\\sqrt{2}'],
    caption: 'Triángulo rectángulo isósceles con catetos iguales s e hipotenusa s√2.',
    svg: (
      <svg viewBox="0 0 130 100" className="w-28 h-24 stroke-key-tinta fill-none">
        <polygon
          points="32,78 92,78 32,18"
          strokeWidth="2.2"
          className="fill-key-azul/8"
        />
        <polyline points="32,69 41,69 41,78" strokeWidth="1.4" />
        <text x="36" y="38" className="fill-key-texto-suave stroke-none text-xs font-semibold">
          45°
        </text>
        <text x="68" y="74" className="fill-key-texto-suave stroke-none text-xs font-semibold">
          45°
        </text>
        <text x="19" y="52" className="fill-key-tinta stroke-none text-[12px] font-bold italic">
          s
        </text>
        <text x="60" y="92" className="fill-key-tinta stroke-none text-[12px] font-bold italic">
          s
        </text>
        <text x="67" y="45" className="fill-key-azul stroke-none text-xs font-bold italic">
          s√2
        </text>
      </svg>
    ),
  },
  {
    id: 'cylinder',
    title: 'Cilindro Circular Recto',
    category: 'volumes',
    formulas: ['V = \\pi r^2 h', 'A_{\\text{total}} = 2\\pi rh + 2\\pi r^2'],
    caption: 'Donde r es el radio de la base circular y h es la altura.',
    svg: (
      <svg viewBox="0 0 130 105" className="w-28 h-24 stroke-key-tinta fill-none">
        <ellipse cx="65" cy="24" rx="32" ry="10" strokeWidth="2" className="fill-key-azul/12" />
        <path d="M33,24 L33,76 A32,10 0 0,0 97,76 L97,24" strokeWidth="2" className="fill-key-azul/6" />
        <ellipse
          cx="65"
          cy="76"
          rx="32"
          ry="10"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          className="stroke-key-texto-suave"
        />
        <line x1="65" y1="24" x2="97" y2="24" strokeWidth="2" className="stroke-key-azul" />
        <text x="78" y="20" className="fill-key-azul stroke-none text-xs font-bold italic">
          r
        </text>
        <text x="103" y="54" className="fill-key-tinta stroke-none text-xs font-bold italic">
          h
        </text>
      </svg>
    ),
  },
  {
    id: 'cone',
    title: 'Cono Circular Recto',
    category: 'volumes',
    formulas: ['V = \\frac{1}{3}\\pi r^2 h'],
    caption: 'Un tercio del volumen de un cilindro con el mismo radio r y altura h.',
    svg: (
      <svg viewBox="0 0 130 105" className="w-28 h-24 stroke-key-tinta fill-none">
        <polygon points="65,16 33,78 97,78" strokeWidth="2" className="fill-key-azul/8 stroke-none" />
        <line x1="65" y1="16" x2="33" y2="78" strokeWidth="2" />
        <line x1="65" y1="16" x2="97" y2="78" strokeWidth="2" />
        <ellipse cx="65" cy="78" rx="32" ry="10" strokeWidth="2" className="fill-key-azul/10" />
        <line
          x1="65"
          y1="16"
          x2="65"
          y2="78"
          strokeWidth="1.6"
          strokeDasharray="3 3"
          className="stroke-key-azul"
        />
        <line x1="65" y1="78" x2="97" y2="78" strokeWidth="1.8" className="stroke-key-azul" />
        <text x="54" y="54" className="fill-key-azul stroke-none text-xs font-bold italic">
          h
        </text>
        <text x="79" y="75" className="fill-key-azul stroke-none text-xs font-bold italic">
          r
        </text>
      </svg>
    ),
  },
  {
    id: 'sphere',
    title: 'Esfera',
    category: 'volumes',
    formulas: ['V = \\frac{4}{3}\\pi r^3', 'A = 4\\pi r^2'],
    caption: 'Volumen V y área superficial A de una esfera de radio r.',
    svg: (
      <svg viewBox="0 0 130 105" className="w-28 h-24 stroke-key-tinta fill-none">
        <circle cx="65" cy="52" r="35" strokeWidth="2.2" className="fill-key-azul/8" />
        <ellipse
          cx="65"
          cy="52"
          rx="35"
          ry="11"
          strokeWidth="1.5"
          strokeDasharray="3 3"
          className="stroke-key-texto-suave"
        />
        <circle cx="65" cy="52" r="2.5" className="fill-key-azul stroke-none" />
        <line x1="65" y1="52" x2="100" y2="52" strokeWidth="2" className="stroke-key-azul" />
        <text x="80" y="47" className="fill-key-azul stroke-none text-xs font-bold italic">
          r
        </text>
      </svg>
    ),
  },
  {
    id: 'prism',
    title: 'Prisma Rectangular',
    category: 'volumes',
    formulas: ['V = \\ell wh'],
    caption: 'Producto del largo (ℓ), ancho (w) y altura (h).',
    svg: (
      <svg viewBox="0 0 140 105" className="w-28 h-24 stroke-key-tinta fill-none">
        <rect x="24" y="36" width="64" height="44" strokeWidth="2" className="fill-key-azul/8" />
        <polyline points="24,36 44,20 108,20 108,64 88,80" strokeWidth="2" className="fill-key-azul/4" />
        <line x1="88" y1="36" x2="108" y2="20" strokeWidth="2" />
        <text x="52" y="93" className="fill-key-tinta stroke-none text-xs font-bold italic">
          ℓ
        </text>
        <text x="101" y="78" className="fill-key-azul stroke-none text-xs font-bold italic">
          w
        </text>
        <text x="113" y="46" className="fill-key-tinta stroke-none text-xs font-bold italic">
          h
        </text>
      </svg>
    ),
  },
  {
    id: 'pyramid',
    title: 'Pirámide de Base Rectangular',
    category: 'volumes',
    formulas: ['V = \\frac{1}{3}\\ell wh'],
    caption: 'Un tercio del área de la base rectangular (ℓw) multiplicada por la altura h.',
    svg: (
      <svg viewBox="0 0 140 105" className="w-28 h-24 stroke-key-tinta fill-none">
        <polygon points="30,80 86,80 106,62 50,62" strokeWidth="1.8" className="fill-key-azul/10" />
        <line x1="68" y1="18" x2="30" y2="80" strokeWidth="2" />
        <line x1="68" y1="18" x2="86" y2="80" strokeWidth="2" />
        <line x1="68" y1="18" x2="106" y2="62" strokeWidth="2" />
        <line
          x1="68"
          y1="18"
          x2="68"
          y2="71"
          strokeWidth="1.6"
          strokeDasharray="3 3"
          className="stroke-key-azul"
        />
        <text x="58" y="52" className="fill-key-azul stroke-none text-xs font-bold italic">
          h
        </text>
        <text x="56" y="93" className="fill-key-tinta stroke-none text-xs font-bold italic">
          ℓ
        </text>
        <text x="102" y="76" className="fill-key-tinta stroke-none text-xs font-bold italic">
          w
        </text>
      </svg>
    ),
  },
];

export const FormulaModal: React.FC<FormulaModalProps> = ({ isOpen, onClose }) => {
  const dialogRef = useRef<HTMLDialogElement | null>(null);
  const titleId = useId();
  const [category, setCategory] = useState<FormulaCategory>('all');

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (isOpen && !dialog.open) {
      dialog.showModal();
    } else if (!isOpen && dialog.open) {
      dialog.close();
    }
  }, [isOpen]);

  // Fallback for browsers without native <dialog closedby="any"> support
  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;

    if (!('closedBy' in HTMLDialogElement.prototype)) {
      const handleBackdropClick = (event: MouseEvent) => {
        if (event.target !== dialog) return;
        const rect = dialog.getBoundingClientRect();
        const isDialogContent =
          rect.top <= event.clientY &&
          event.clientY <= rect.top + rect.height &&
          rect.left <= event.clientX &&
          event.clientX <= rect.left + rect.width;
        if (isDialogContent) return;
        dialog.close();
      };

      dialog.addEventListener('click', handleBackdropClick);
      return () => dialog.removeEventListener('click', handleBackdropClick);
    }
  }, []);

  const filteredItems =
    category === 'all'
      ? FORMULA_ITEMS
      : FORMULA_ITEMS.filter((item) => item.category === category);

  return (
    <dialog
      ref={dialogRef}
      {...({ closedby: 'any' } as any)}
      aria-labelledby={titleId}
      onClose={onClose}
      className="paa-dialog w-[95vw] max-w-4xl overflow-hidden"
    >
      <div className="bg-key-blanco text-key-tinta flex flex-col max-h-[88dvh] border-[0.8px] border-key-negro overflow-hidden">
        {/* Modal Header */}
        <div className="bg-key-blanco text-key-tinta px-5 sm:px-6 py-4 border-b-[0.8px] border-key-negro flex items-center justify-between gap-4 shrink-0">
          <div className="flex items-center gap-3">
            <Compass aria-hidden="true" className="w-6 h-6 text-key-azul shrink-0" />
            <div>
              <h2 id={titleId} className="font-display font-bold text-base sm:text-lg">
                Fórmulas y notas de referencia PAA
              </h2>
              <p className="text-sm text-key-texto-suave">
                Hoja oficial de consulta para la sección de Matemáticas · College Board
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar modal de fórmulas"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-key-tinta transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Category Filter Tabs */}
        <div className="px-5 sm:px-6 py-3 bg-key-gris-claro border-b-[0.8px] border-key-negro flex flex-wrap items-center gap-2 shrink-0">
          {(
            [
              { id: 'all', label: 'Todas las Fórmulas' },
              { id: 'areas', label: 'Áreas y Perímetros' },
              { id: 'triangles', label: 'Triángulos y Pitágoras' },
              { id: 'volumes', label: 'Volúmenes 3D' },
            ] as { id: FormulaCategory; label: string }[]
          ).map((tab) => (
            <button
              key={tab.id}
              type="button"
              onClick={() => setCategory(tab.id)}
              className={`px-3 py-1.5 text-xs font-semibold transition-all cursor-pointer ${
                category === tab.id
                  ? 'bg-key-azul text-key-blanco'
                  : 'bg-key-blanco text-key-texto-suave border-[0.8px] border-key-negro hover:border-key-negro'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Scrollable Formulas Grid + Official Notes */}
        <div className="flex-1 overflow-y-auto custom-scrollbar p-5 sm:p-6 space-y-6 bg-key-gris-claro">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="bg-key-blanco border-[0.8px] border-key-negro p-4 flex flex-col justify-between hover:border-key-azul transition-colors"
              >
                <div>
                  <div className="flex items-center justify-between gap-2 mb-2">
                    <h3 className="font-display font-bold text-sm text-key-tinta">
                      {item.title}
                    </h3>
                    <Sigma className="w-3.5 h-3.5 text-key-azul" />
                  </div>

                  {/* SVG Geometric Diagram */}
                  <div className="h-26 bg-key-gris-claro border-[0.8px] border-key-gris flex items-center justify-center my-2">
                    {item.svg}
                  </div>

                  {/* KaTeX Rendered Formulas */}
                  <div className="space-y-1 my-2 text-center bg-key-gris-claro py-2 px-2 border-[0.8px] border-key-azul">
                    {item.formulas.map((f, idx) => (
                      <div key={idx} className="text-sm font-medium text-key-tinta">
                        <LatexRenderer content={`$${f}$`} />
                      </div>
                    ))}
                  </div>
                </div>

                <p className="text-xs text-key-texto-suave leading-snug mt-1">
                  {item.caption}
                </p>
              </div>
            ))}
          </div>

          {/* Official PAA General Notes Box */}
          <div className="bg-key-blanco border-[0.8px] border-key-negro p-4 sm:p-5">
            <div className="flex items-center gap-2 font-display font-bold text-sm text-key-tinta mb-2.5">
              <Info className="w-4 h-4 text-key-azul" />
              Notas Generales de la Prueba PAA
            </div>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-xs text-key-texto-suave">
              <li className="flex items-start gap-2">
                <span className="text-key-azul font-bold">•</span>
                <span>
                  <LatexRenderer content="El número de grados de arco en un círculo es $360^\circ$." />
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-key-azul font-bold">•</span>
                <span>
                  <LatexRenderer content="La suma de las medidas en grados de los ángulos de un triángulo es $180^\circ$." />
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-key-azul font-bold">•</span>
                <span>
                  <LatexRenderer content="Las figuras que acompañan a los ejercicios proveen información útil, pero no están necesariamente dibujadas a escala." />
                </span>
              </li>
              <li className="flex items-start gap-2">
                <span className="text-key-azul font-bold">•</span>
                <span>
                  <LatexRenderer content="Todos los números que se usan son números reales ($x \in \mathbb{R}$)." />
                </span>
              </li>
            </ul>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="px-5 sm:px-6 py-3 bg-key-blanco border-t-[0.8px] border-key-negro flex items-center justify-between shrink-0">
          <span className="text-xs text-key-texto-suave">
            Presiona <kbd className="px-1.5 py-0.5 bg-key-gris border-[0.8px] text-xs">Esc</kbd> o haz clic fuera para cerrar
          </span>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            className="inline-flex items-center justify-center gap-2 h-10 px-5 rounded-full bg-key-azul hover:bg-key-azul-hover text-sm font-semibold text-key-blanco transition-colors cursor-pointer focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
          >
            Entendido, volver al problema
          </button>
        </div>
      </div>
    </dialog>
  );
};
