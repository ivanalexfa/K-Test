import React from 'react';
import type { OptionId } from '../../types/exam';

/** Estado común de una pregunta: pista y opciones tachadas, que se limpian al cambiar de pregunta. */
export function useEstadoPregunta(preguntaId: string) {
  const [tachadas, setTachadas] = React.useState<Record<string, boolean>>({});
  const [pista, setPista] = React.useState(false);
  const [mostrada, setMostrada] = React.useState(preguntaId);
  if (mostrada !== preguntaId) {
    // Ajuste durante el render, no en un efecto: https://react.dev/learn/you-might-not-need-an-effect
    setMostrada(preguntaId);
    setTachadas({});
    setPista(false);
  }
  return {
    tachadas,
    tachar: (id: OptionId) => setTachadas((t) => ({ ...t, [id]: !t[id] })),
    pista,
    alternarPista: () => setPista((p) => !p),
  };
}
