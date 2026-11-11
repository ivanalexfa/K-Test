import React, { useEffect, useId, useRef, useState } from 'react';
import { X } from 'lucide-react';
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
        {/* Encabezado: título y cerrar */}
        <div className="px-5 sm:px-7 py-4 border-b-[0.8px] border-key-negro flex items-center justify-between gap-4 shrink-0">
          <div>
            <h2 id={titleId} className="text-xl font-semibold text-key-tinta">
              Fórmulas de referencia
            </h2>
            <p className="text-sm text-key-texto-suave">Las mismas que da la PAA en la sección de Matemáticas.</p>
          </div>
          <button
            type="button"
            onClick={() => dialogRef.current?.close()}
            aria-label="Cerrar fórmulas"
            className="inline-flex items-center justify-center w-10 h-10 rounded-full border-[0.8px] border-key-negro bg-key-blanco hover:bg-key-gris-claro text-key-tinta transition-colors cursor-pointer shrink-0 focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul"
          >
            <X aria-hidden="true" className="w-5 h-5" />
          </button>
        </div>

        {/* Filtro por tipo: celdas, la activa en azul */}
        <div role="group" aria-label="Tipo de fórmula" className="grid grid-cols-2 sm:grid-cols-4 border-b-[0.8px] border-key-negro shrink-0">
          {(
            [
              { id: 'all', label: 'Todas' },
              { id: 'areas', label: 'Áreas y perímetros' },
              { id: 'triangles', label: 'Triángulos' },
              { id: 'volumes', label: 'Volúmenes' },
            ] as { id: FormulaCategory; label: string }[]
          ).map((tab, i) => (
            <button
              key={tab.id}
              type="button"
              aria-pressed={category === tab.id}
              onClick={() => setCategory(tab.id)}
              className={`h-11 px-2 text-sm cursor-pointer border-key-negro focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-azul ${
                i > 0 ? 'sm:border-l-[0.8px]' : ''
              } ${i % 2 === 1 ? 'max-sm:border-l-[0.8px]' : ''} ${i >= 2 ? 'max-sm:border-t-[0.8px]' : ''} ${
                category === tab.id ? 'bg-key-azul text-key-blanco font-semibold' : 'bg-key-blanco text-key-tinta hover:bg-key-gris-claro'
              }`}
            >
              {tab.label}
            </button>
          ))}
        </div>

        {/* Fórmulas en celdas que se tocan, y las notas de la prueba */}
        <div className="flex-1 overflow-y-auto overflow-x-hidden custom-scrollbar">
          {/* Cada celda dibuja su línea derecha e inferior; la del borde derecho queda fuera. */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 -mr-[0.8px]">
            {filteredItems.map((item) => (
              <div
                key={item.id}
                className="p-5 border-r-[0.8px] border-b-[0.8px] border-key-negro"
              >
                <h3 className="font-semibold text-key-tinta">{item.title}</h3>
                <div className="h-26 flex items-center justify-center my-3" aria-hidden="true">
                  {item.svg}
                </div>
                <div className="space-y-1 text-center text-key-tinta">
                  {item.formulas.map((f, idx) => (
                    <div key={idx}>
                      <LatexRenderer content={`$${f}$`} />
                    </div>
                  ))}
                </div>
                <p className="mt-3 text-sm text-key-texto-suave leading-snug">{item.caption}</p>
              </div>
            ))}
          </div>

          <div className="px-5 sm:px-7 py-5">
            <h3 className="font-semibold text-key-tinta mb-2">Notas de la prueba</h3>
            <ul className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1.5 text-sm text-key-texto list-disc pl-5">
              <li>
                <LatexRenderer content="Un círculo tiene $360^\circ$ de arco." />
              </li>
              <li>
                <LatexRenderer content="Los ángulos de un triángulo suman $180^\circ$." />
              </li>
              <li>Las figuras ayudan, pero no siempre están dibujadas a escala.</li>
              <li>
                <LatexRenderer content="Todos los números son reales ($x \in \mathbb{R}$)." />
              </li>
            </ul>
          </div>
        </div>
      </div>
    </dialog>
  );
};
