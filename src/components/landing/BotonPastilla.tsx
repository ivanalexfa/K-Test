import React from 'react';
import { Link } from 'react-router';

/**
 * Botón en pastilla de Key (docs/marca/DESIGN.md#botones). Es un enlace: en la landing
 * todas las acciones llevan a otra pantalla.
 */
type Variante = 'principal' | 'secundario';
type Tamano = 'normal' | 'grande';

const VARIANTES: Record<Variante, string> = {
  principal: 'bg-key-azul text-key-blanco hover:bg-key-azul-hover',
  secundario: 'bg-key-negro text-key-blanco hover:bg-key-tinta',
};

const TAMANOS: Record<Tamano, string> = {
  normal: 'h-[49px] px-6 text-base',
  grande: 'h-14 sm:h-[72px] px-8 sm:px-10 text-lg sm:text-xl',
};

interface Props {
  to: string;
  children: React.ReactNode;
  variante?: Variante;
  tamano?: Tamano;
  className?: string;
}

export const BotonPastilla: React.FC<Props> = ({
  to,
  children,
  variante = 'principal',
  tamano = 'normal',
  className = '',
}) => (
  <Link
    to={to}
    className={`inline-flex items-center justify-center rounded-full font-semibold whitespace-nowrap
      transition-[background-color,transform] duration-200 ease-key motion-safe:active:scale-[0.97]
      focus-visible:outline-2 focus-visible:outline-offset-[3px] focus-visible:outline-key-azul
      ${VARIANTES[variante]} ${TAMANOS[tamano]} ${className}`}
  >
    {children}
  </Link>
);
