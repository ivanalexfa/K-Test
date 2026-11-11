import React from 'react';
import { ArrowUpRight } from 'lucide-react';
import { IconoCarrera, type Carrera } from '../brand/IconoCarrera';

/**
 * «¿Por qué estudiar en Key?»: las fichas de «Por qué elegirnos» de keyinstitute.com,
 * cada una en el color e ícono de una carrera (el único lugar de K-test con colores de
 * carrera; ADR marca/0002). Llevan a la página de Key de cada tema.
 */
const FICHAS: { carrera: Carrera; fondo: string; texto: string; enlace: string; destino: string }[] = [
  {
    carrera: 'computacion',
    fondo: 'bg-carrera-computacion',
    texto: 'Nuestras carreras utilizan la tecnología como herramienta para la humanidad.',
    enlace: 'Descubre nuestras carreras',
    destino: 'https://www.keyinstitute.com/carreras',
  },
  {
    carrera: 'industrial',
    fondo: 'bg-carrera-industrial',
    texto: 'Vinculación con la empresa para acelerar el conocimiento.',
    enlace: 'Descubre por qué la industria es nuestra aliada',
    destino: 'https://www.keyinstitute.com/industria',
  },
  {
    carrera: 'mecatronica',
    fondo: 'bg-carrera-mecatronica',
    texto: 'Buscamos crear líderes incentivados por los problemas del mundo.',
    enlace: 'Descubre nuestro modelo educativo',
    destino: 'https://www.keyinstitute.com/metodo-educativo',
  },
  {
    carrera: 'quimica',
    fondo: 'bg-carrera-quimica',
    texto: 'Creemos que aprender no debería tener límites.',
    enlace: 'Descubre nuestras becas',
    destino: 'https://www.keyinstitute.com/asistencia-financiera',
  },
];

export const PorQueKey: React.FC = () => (
  <section aria-labelledby="por-que-key-titulo" className="bg-key-blanco">
    <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10 pb-16 lg:pb-24">
      <div className="grid lg:grid-cols-[1fr_1.2fr] gap-8 lg:gap-16 items-end">
        <h2
          id="por-que-key-titulo"
          className="text-key-tinta font-semibold text-[30px] leading-[36px] sm:text-[42px] sm:leading-[50px] text-balance"
        >
          ¿Por qué estudiar en Key?
        </h2>
        <p className="text-key-texto text-lg leading-7 sm:text-xl sm:leading-[30px] max-w-[60ch]">
          Key Institute forma ingenieros con un modelo diseñado junto al Tec de Monterrey:
          aprendes haciendo, con proyectos reales y la industria como aliada.
        </p>
      </div>

      <ul className="mt-12 grid sm:grid-cols-2 lg:grid-cols-4">
        {FICHAS.map(({ carrera, fondo, texto, enlace, destino }) => (
          <li key={carrera} className={`${fondo} text-key-negro`}>
            <a
              href={destino}
              target="_blank"
              rel="noopener noreferrer"
              className="group flex h-full min-h-[300px] lg:min-h-[340px] flex-col justify-between p-7 sm:p-8 focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-negro"
            >
              <IconoCarrera carrera={carrera} className="h-12 w-auto self-start" />
              <span>
                <span className="block text-xl leading-7 sm:text-[22px] sm:leading-[30px] font-medium text-pretty">
                  {texto}
                </span>
                <span className="mt-6 inline-flex items-center gap-1.5 text-sm font-semibold underline decoration-[0.8px] underline-offset-4">
                  {enlace}
                  <ArrowUpRight
                    aria-hidden="true"
                    className="h-4 w-4 transition-transform duration-200 ease-key motion-safe:group-hover:translate-x-0.5 motion-safe:group-hover:-translate-y-0.5"
                  />
                  <span className="sr-only">(abre keyinstitute.com en otra pestaña)</span>
                </span>
              </span>
            </a>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
