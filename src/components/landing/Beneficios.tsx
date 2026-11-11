import React from 'react';
import { BookOpenCheck, CalendarClock, BadgeCheck } from 'lucide-react';

/**
 * Por qué practicar en K-Test: una frase grande de presentación, al estilo del sitio de Key,
 * y tres beneficios en celdas que se tocan con borde fino (no tarjetas flotantes).
 */
const BENEFICIOS = [
  {
    Icono: BookOpenCheck,
    titulo: 'Conoce la prueba',
    texto:
      'Familiarízate con el formato y el tipo de ejercicios de Lectura y Redacción y de Matemáticas.',
  },
  {
    Icono: CalendarClock,
    titulo: 'Prepárate a tu ritmo',
    texto:
      'Practica cuando quieras y desde donde estés: un simulacro completo o un sprint corto por materia.',
  },
  {
    Icono: BadgeCheck,
    titulo: 'Sin costo',
    texto: 'Accede a los simulacros, los sprints y el material de estudio sin pagar nada.',
  },
] as const;

export const Beneficios: React.FC = () => (
  <section aria-labelledby="beneficios-titulo" className="bg-key-blanco">
    <div className="mx-auto max-w-[1360px] px-5 sm:px-8 lg:px-10 py-16 lg:py-24">
      <h2 id="beneficios-titulo" className="sr-only">
        Por qué practicar en K-Test
      </h2>
      <p className="max-w-[940px] text-key-tinta font-light text-[28px] leading-[36px] sm:text-[36px] sm:leading-[44px] lg:text-[45px] lg:leading-[54px] text-pretty">
        K-Test es la práctica de Key Institute para la PAA: preguntas como las del examen, con
        cronómetro y tu puntaje estimado en la escala de 400 a 1600.
      </p>

      <ul className="mt-14 lg:mt-20 grid md:grid-cols-3 border-[0.8px] border-key-negro">
        {BENEFICIOS.map(({ Icono, titulo, texto }, i) => (
          <li
            key={titulo}
            className={`p-7 sm:p-9 lg:p-10 ${i > 0 ? 'max-md:border-t-[0.8px] md:border-l-[0.8px] border-key-negro' : ''}`}
          >
            <Icono aria-hidden="true" strokeWidth={1.5} className="h-9 w-9 text-key-azul" />
            <h3 className="mt-8 text-key-tinta font-semibold text-xl leading-7 sm:text-2xl sm:leading-8">
              {titulo}
            </h3>
            <p className="mt-3 max-w-[38ch] text-key-texto text-base leading-[26px] sm:text-lg sm:leading-7">
              {texto}
            </p>
          </li>
        ))}
      </ul>
    </div>
  </section>
);
