import React from 'react';
import { EncabezadoPublico } from '../components/landing/EncabezadoPublico';
import { Hero } from '../components/landing/Hero';
import { Beneficios } from '../components/landing/Beneficios';
import { PorQueKey } from '../components/landing/PorQueKey';
import { BloqueAdmisiones } from '../components/landing/BloqueAdmisiones';
import { PiePagina } from '../components/landing/PiePagina';

/**
 * Landing pública (/): convence de practicar y lleva a «Empezar a practicar» (/entrar).
 * Orden y decisiones en docs/landing/decisiones/0001-estructura-de-la-landing.md.
 */
export const PaginaLanding: React.FC = () => (
  <div className="min-h-dvh flex flex-col bg-key-blanco">
    <a
      href="#contenido"
      className="sr-only focus:not-sr-only focus:fixed focus:left-4 focus:top-4 focus:z-50 focus:rounded-full focus:bg-key-negro focus:px-5 focus:py-3 focus:text-key-blanco"
    >
      Saltar al contenido
    </a>
    <EncabezadoPublico />
    <main id="contenido" className="flex-1">
      <Hero />
      <Beneficios />
      <PorQueKey />
      <BloqueAdmisiones />
    </main>
    <PiePagina />
  </div>
);
