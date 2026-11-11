import React from 'react';
import { BotonPastilla } from './BotonPastilla';
import { rutas } from '../../rutas';

/**
 * Primera pantalla de la landing: foto real de estudiantes de Key a sangre, velo negro
 * a la izquierda y un titular gigante en blanco alineado a la izquierda, como los hero
 * de las carreras de Key. Es el único momento con movimiento de la página (entrada suave
 * del texto; sin movimiento con prefers-reduced-motion).
 */
export const Hero: React.FC = () => (
  <section aria-labelledby="hero-titulo" className="relative isolate overflow-hidden bg-key-tinta">
    <img
      src="/brand/fotos/estudiantes-trabajando-1600.webp"
      srcSet="/brand/fotos/estudiantes-trabajando-800.webp 800w, /brand/fotos/estudiantes-trabajando-1600.webp 1440w"
      sizes="100vw"
      width={1440}
      height={961}
      alt="Estudiantes de Key trabajando en grupo con un profesor alrededor de una mesa"
      // React 18 no conoce la prop fetchPriority (llega en React 19): se pasa el atributo HTML tal cual.
      {...{ fetchpriority: 'high' }}
      className="absolute inset-0 -z-20 h-full w-full object-cover object-[65%_center]"
    />
    {/* Velo para asegurar el contraste del texto blanco sobre la foto. */}
    <div
      aria-hidden="true"
      className="absolute inset-0 -z-10 bg-linear-to-r from-key-negro/85 via-key-negro/60 to-key-negro/10 max-md:bg-key-negro/65"
    />

    <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10 py-20 sm:py-28 lg:py-36 min-h-[min(78svh,760px)] flex items-end">
      <div className="max-w-[820px] motion-safe:animate-[entrada_700ms_var(--ease-key-salida)_both]">
        <h1
          id="hero-titulo"
          className="text-key-blanco font-bold tracking-[-0.02em] text-balance text-[40px] leading-[44px] sm:text-[56px] sm:leading-[60px] lg:text-[72px] lg:leading-[76px]"
        >
          Llega a la PAA sabiendo qué esperar.
        </h1>
        <p className="mt-6 max-w-[560px] text-key-blanco/90 text-lg leading-7 sm:text-xl sm:leading-[30px]">
          Practica la Prueba de Aptitud Académica con los simulacros y sprints de Key Institute.
          Gratis y a tu ritmo.
        </p>
        <div className="mt-10">
          <BotonPastilla to={rutas.entrar} tamano="grande">
            Empezar a practicar
          </BotonPastilla>
        </div>
      </div>
    </div>
  </section>
);
