import React from 'react';

/**
 * Logo de K-test como producto de Key Institute: el logo oficial de Key
 * y, separado por una línea fina, el nombre del producto. Ver docs/marca/DESIGN.md#logo.
 *
 * - `variant="full"`: logo horizontal de Key («key | Instituto Kriete…»). Encabezados de escritorio.
 * - `variant="mark-only"`: isotipo + «key». Celular y espacios chicos.
 * - `theme="dark"`: logo en blanco, para fondos oscuros o azul Key.
 * - `theme="light"`: logo en negro, para fondos blancos o grises claros.
 */
interface LogoKeyProps {
  variant?: 'full' | 'mark-only';
  theme?: 'dark' | 'light';
  /** Muestra «K-test» junto al logo de Key. */
  conProducto?: boolean;
  className?: string;
}

const ARCHIVOS = {
  full: { ancho: 409, alto: 69, base: '/brand/key/logo-key-horizontal' },
  'mark-only': { ancho: 204, alto: 84, base: '/brand/key/key-wordmark' },
} as const;

export const LogoKey: React.FC<LogoKeyProps> = ({
  variant = 'full',
  theme = 'light',
  conProducto = true,
  className = '',
}) => {
  const archivo = ARCHIVOS[variant];
  const color = theme === 'dark' ? 'blanco' : 'negro';
  // Alto visible del logo: 32 px el horizontal, 36 px el isotipo con «key».
  const alto = variant === 'full' ? 32 : 36;
  const ancho = Math.round((archivo.ancho / archivo.alto) * alto);

  return (
    <span className={`inline-flex items-center gap-3 select-none ${className}`}>
      <img
        src={`${archivo.base}-${color}.svg`}
        alt="Key Institute"
        width={ancho}
        height={alto}
        className={`block shrink-0 w-auto ${variant === 'full' ? 'h-8' : 'h-9'}`}
      />
      {conProducto && (
        <>
          <span
            aria-hidden="true"
            className={`h-7 w-px shrink-0 ${theme === 'dark' ? 'bg-white/40' : 'bg-key-negro/30'}`}
          />
          <span
            translate="no"
            className={`font-sans text-lg font-semibold tracking-[0.04em] leading-none ${
              theme === 'dark' ? 'text-white' : 'text-key-negro'
            }`}
          >
            K-TEST
          </span>
        </>
      )}
    </span>
  );
};
