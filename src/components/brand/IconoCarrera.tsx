import React from 'react';

/**
 * Íconos de las carreras de Key: cada uno es un trozo del isotipo (tomados de
 * keyinstitute.com, también en public/brand/key/carreras/). En línea para que tomen
 * el color del texto (currentColor). Ver docs/marca/DESIGN.md#6-íconos.
 */
export type Carrera = 'computacion' | 'industrial' | 'mecatronica' | 'quimica';

const ICONOS: Record<Carrera, { viewBox: string; trazos: React.ReactNode }> = {
  computacion: {
    viewBox: '0 0 105 118',
    trazos: (
      <>
        <path d="M62.6751 8.98497L15.6951 36.105V48.505L44.5551 65.175V82.215L0.935059 57.025V27.585L47.9151 0.464966L62.6751 8.98497Z" />
        <path d="M42.325 109.015L89.305 81.8949V69.4949L60.445 52.8349V35.7849L104.065 60.9749V90.4149L57.085 117.535L42.325 109.015Z" />
      </>
    ),
  },
  industrial: {
    viewBox: '0 0 139 84',
    trazos: (
      <>
        <path d="M138.88 8.68003L91.9001 35.8V48.2L120.76 64.87V81.91L77.1401 56.72V27.28L124.12 0.160034L138.88 8.68003Z" />
        <path d="M0.120117 75.3201L47.1001 48.1901V35.7901L18.2401 19.1301V2.09009L61.8601 27.2701V56.7101L14.8801 83.8401L0.120117 75.3201Z" />
      </>
    ),
  },
  mecatronica: {
    viewBox: '0 0 135 92',
    trazos: (
      <>
        <path d="M50.6207 0L0 29.2312L13.7446 37.1635L50.6207 15.8731L60.6191 21.6435V60.6156L74.3637 52.6834V13.7113L50.6207 0Z" />
        <path d="M111.249 31.3844L60.6279 60.607L74.3725 68.5479L111.249 47.2575L121.256 53.0279V92L135 84.0678V45.0957L111.249 31.3844Z" />
      </>
    ),
  },
  quimica: {
    viewBox: '123.19 87.09 259.82 300.02',
    trazos: (
      <>
        <polygon points="123.19 354.17 123.19 213.69 156.22 232.76 156.22 335.1 180.25 348.97 261.36 302.15 261.36 340.29 180.25 387.11 123.19 354.17" />
        <polygon points="383.01 307.48 261.36 377.72 261.36 339.58 349.98 288.41 349.98 260.66 268.88 213.83 301.91 194.76 383.01 241.59 383.01 307.48" />
        <polygon points="180.26 87.09 301.91 157.33 268.88 176.4 180.26 125.24 156.22 139.11 156.22 232.76 123.19 213.69 123.19 120.04 180.26 87.09" />
      </>
    ),
  },
};

export const IconoCarrera: React.FC<{ carrera: Carrera; className?: string }> = ({
  carrera,
  className = '',
}) => {
  const icono = ICONOS[carrera];
  return (
    <svg
      viewBox={icono.viewBox}
      fill="currentColor"
      aria-hidden="true"
      focusable="false"
      className={className}
    >
      {icono.trazos}
    </svg>
  );
};
