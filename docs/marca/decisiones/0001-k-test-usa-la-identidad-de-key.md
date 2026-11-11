# 0001 · K-test usa la identidad de Key Institute, no una propia

- **Estado:** Aceptada
- **Fecha:** 2026-11-10
- **Módulo:** marca
- **Autores:** Soham, con Claude Code (skills `brand` y `frontend-design`)

## Contexto

K-test nació con identidad propia: logo «K-test» en un cuadro azul marino, paleta azul marino `#0A1128`, azul eléctrico `#0052FF` y cian `#00D2FF`, y las fuentes Inter y Plus Jakarta Sans. Nada de eso existe en Key Institute. La plataforma es para los admitidos de Key y la van a probar sus directivos: tiene que sentirse como parte de Key, no como un producto de terceros.

Al revisar keyinstitute.com, el portal de admisiones, el formulario de información y el Instagram se encontró (detalle en `docs/marca/DESIGN.md`):
- Albert Sans en todo el sitio.
- Negro, blanco y azul `#006DFF` como base, con un color por carrera.
- El logo de Key **en vector** dentro del propio sitio, así que no hace falta pedirlo para la primera versión.
- Un estilo de bordes finos, bloques que se tocan y botones en pastilla.

## Decisión

1. K-test es **un producto de Key**: logo oficial de Key en los encabezados y «K-test» solo como nombre del producto al lado, separado por una línea fina (`LogoKey`). Se elimina `KTestLogo`.
2. **Albert Sans** reemplaza a Inter y Plus Jakarta Sans. JetBrains Mono se queda solo para cifras.
3. La paleta es la de Key: **negro, blanco y azul `#006DFF`** como principales, con los grises del sitio. El azul marino y el cian se retiran.
4. El favicon pasa a ser el isotipo blanco en un círculo azul Key, como el avatar de Key en Instagram.
5. Las fotos son de estudiantes reales de Key (Instagram, primera versión) en WebP optimizado.

## Alternativas consideradas

- **Sub-marca K-test con estilo propio:** lo que había. Se descartó porque el producto es de Key, para aspirantes de Key, y la confianza viene de su marca.
- **Calcar keyinstitute.com tal cual** (todo en blanco y negro, fotos en blanco y negro, titulares de 85 px): el sitio es editorial y de marketing; K-test es una app que se usa por sesiones largas, en celular. Se tomó la base (fuente, color, bordes, pastillas, logo) y se ajustó la escala (ver «Escala de K-test» en `DESIGN.md`).

## Consecuencias

- Las pantallas existentes cambian de fuente de inmediato. Sus colores (hex sueltos del azul marino) se sustituyen pantalla por pantalla en las fases 3 a 6.
- Hay que pedirle a Key el visto bueno para usar su logo, sus textos y sus fotos antes de publicar para los aspirantes (pendiente en `docs/PLAN.md`).
- `README.md` deja de describir la paleta vieja y apunta a `DESIGN.md`.
