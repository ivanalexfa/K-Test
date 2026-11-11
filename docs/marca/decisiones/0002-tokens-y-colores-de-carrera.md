# 0002 · Tokens en Tailwind 4 y colores de carrera solo en la landing

- **Estado:** Aceptada
- **Fecha:** 2026-11-10
- **Módulo:** marca
- **Autores:** Soham, con Claude Code (skills `design-system` y `ui-ux-pro-max`)

## Contexto

Los componentes tienen los colores escritos a mano (`bg-[#0A1128]`, `text-[#0052FF]`…) en cientos de lugares. Cambiar de marca así es lento y deja diferencias sueltas. Además, Key usa cuatro colores muy vivos (verde, amarillo, morado y naranja), uno por carrera, que pueden competir con el botón principal si se usan en todas partes.

## Decisión

1. **Los tokens viven en `src/index.css`, dentro de `@theme` de Tailwind 4**, y generan clases como `bg-key-azul`, `text-key-texto`, `border-key-negro` o `bg-carrera-computacion`. Un componente nuevo no lleva hex sueltos.
2. Nombres en español y por rol (`key-texto`, `key-texto-suave`, `estado-error`), no por tono (`blue-500`).
3. **Colores de carrera solo en la landing** (fichas de «¿Por qué estudiar en Key?» y de carreras). En el resto de la app no se usan: el único color de acción es el azul Key, para que «Empezar a practicar» y cada acción principal no tengan competencia.
4. **Colores de estado propios** (éxito, alerta, error) porque Key no los define. Se derivan de su paleta y se comprobó su contraste AA.
5. **Contraste comprobado** para cada combinación usada (tabla en `DESIGN.md`): blanco sobre azul Key da 4.53:1, el mínimo de AA, así que el azul nunca se aclara; sobre verde o amarillo solo va texto negro.

## Alternativas consideradas

- **Variables CSS sueltas en `:root` sin `@theme`:** funcionan, pero no generan clases de Tailwind y obligan a escribir `bg-[var(--…)]`.
- **Un archivo de tokens en JSON** con la skill `brand` (`sync-brand-to-tokens.cjs`): agrega un paso de sincronización que este proyecto no necesita todavía; `@theme` ya es la fuente única.
- **Usar los colores de carrera para las materias de la PAA** (por ejemplo, matemáticas en morado): mezclaría el significado de los colores de Key (carreras) con el de K-test (materias). Se descartó.

## Consecuencias

- Las clases `bg-[#…]` existentes siguen funcionando mientras se reemplazan por tokens en las fases 3 a 6.
- Un cambio de color de Key se hace en un solo lugar.
- Pendiente: un chequeo automático que avise si aparece un hex suelto en `src/` (por ejemplo, con el validador de la skill `design-system`), cuando ya no queden los heredados.
