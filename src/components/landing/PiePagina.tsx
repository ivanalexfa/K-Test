import React from 'react';
import { LogoKey } from '../brand/LogoKey';

/** Pie de la landing: gris de Key, logo, enlaces útiles y redes oficiales. */
const ENLACES = [
  { texto: 'Pide información', href: 'https://info.keyinstitute.com/admisiones' },
  { texto: 'Carreras', href: 'https://www.keyinstitute.com/carreras' },
  { texto: 'Conoce Key', href: 'https://www.keyinstitute.com/key' },
];

const REDES = [
  { texto: 'Instagram', href: 'https://www.instagram.com/keyinstitute.sv/' },
  { texto: 'LinkedIn', href: 'https://www.linkedin.com/company/keyinstitutesv/' },
  { texto: 'TikTok', href: 'https://www.tiktok.com/@keyinstitute.sv' },
  { texto: 'Facebook', href: 'https://www.facebook.com/keyinstitute.sv' },
];

// Fuera del componente: leer la fecha durante el render es impuro (react-hooks/purity).
const ANIO = new Date().getFullYear();

const claseEnlace =
  'text-key-tinta hover:underline underline-offset-4 decoration-[0.8px] rounded-sm focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-key-azul';

export const PiePagina: React.FC = () => (
  <footer className="bg-key-gris">
    <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10 py-14 lg:py-20 grid gap-12 md:grid-cols-[1.4fr_1fr_1fr]">
      <div className="space-y-5">
        <LogoKey theme="light" variant="full" className="max-sm:[&_img]:h-7" />
        <p className="text-key-tinta text-2xl leading-8 font-semibold max-w-[22ch]">
          Impulsando ingenieros para la vida.
        </p>
      </div>

      <nav aria-label="Key Institute">
        <h2 className="text-key-tinta font-bold text-base">Key Institute</h2>
        <ul className="mt-4 space-y-3 text-base">
          {ENLACES.map((e) => (
            <li key={e.href}>
              <a href={e.href} target="_blank" rel="noopener noreferrer" className={claseEnlace}>
                {e.texto}
              </a>
            </li>
          ))}
        </ul>
      </nav>

      <nav aria-label="Redes de Key Institute">
        <h2 className="text-key-tinta font-bold text-base">Conectemos</h2>
        <ul className="mt-4 space-y-3 text-base">
          {REDES.map((r) => (
            <li key={r.href}>
              <a href={r.href} target="_blank" rel="noopener noreferrer" className={claseEnlace}>
                {r.texto}
              </a>
            </li>
          ))}
        </ul>
      </nav>
    </div>
    <div className="border-t-[0.8px] border-key-negro/30">
      <p className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10 py-6 text-sm text-key-texto">
        © {ANIO} Key Institute. K-test es la plataforma de práctica de la PAA
        de Key Institute.
      </p>
    </div>
  </footer>
);
