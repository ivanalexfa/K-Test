import React from 'react';
import { ArrowRight } from 'lucide-react';

/**
 * Cierre de la landing como en keyinstitute.com: bloque azul con titular grande y la barra
 * negra «Admisiones 2027» con la franja degradada, que lleva al proceso de admisión de Key.
 */
const URL_ADMISIONES = 'https://admisiones.keyinstitute.com/login';

export const BloqueAdmisiones: React.FC = () => (
  <section aria-labelledby="admisiones-titulo">
    <div className="bg-key-azul">
      <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10 py-16 sm:py-20 lg:py-28">
        <h2
          id="admisiones-titulo"
          className="max-w-[1000px] text-key-blanco font-semibold tracking-[-0.02em] text-balance text-[34px] leading-[40px] sm:text-[52px] sm:leading-[58px] lg:text-[72px] lg:leading-[76px]"
        >
          Una universidad para ingenieros con una misión. Para los que imaginan, y hacen.
        </h2>
      </div>
    </div>

    <a
      href={URL_ADMISIONES}
      target="_blank"
      rel="noopener noreferrer"
      className="group block bg-key-negro text-key-blanco focus-visible:outline-2 focus-visible:-outline-offset-4 focus-visible:outline-key-blanco"
    >
      <span className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10 h-28 sm:h-[150px] flex items-center gap-6">
        <span className="text-2xl sm:text-[32px] font-bold">Admisiones 2027</span>
        <ArrowRight
          aria-hidden="true"
          strokeWidth={1.5}
          className="h-8 w-8 sm:h-10 sm:w-10 transition-transform duration-200 ease-key motion-safe:group-hover:translate-x-3"
        />
        <span className="ml-auto hidden md:block text-base text-key-blanco/80 group-hover:text-key-blanco transition-colors">
          Conoce el proceso de admisión de Key
        </span>
        <span className="sr-only">(abre el portal de admisiones en otra pestaña)</span>
      </span>
      <span aria-hidden="true" className="block h-1.5 bg-[image:var(--key-degradado)]" />
    </a>
  </section>
);
