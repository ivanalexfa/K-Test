# 0002 · Examen sin adornos: preguntas en celdas y sin íconos decorativos

- **Estado:** Aceptada (amplía la 0001)
- **Fecha:** 2026-11-11
- **Módulo:** examen
- **Autores:** Soham, con Claude Code (skills `frontend-design` y `ui-ux-pro-max`)

## Contexto

Después de la 0001, el examen tenía el color y las líneas de Key, pero quedaban restos del diseño anterior que se notaban hechos «con IA»:

- Íconos dibujados a mano (`KTestIcons`) antes de cada tema y en los botones: una llave para la pista, una «S» tachada para descartar, destellos.
- Etiquetas que repetían lo mismo: «Enfoque: Líneas 11–12», «Referencia directa en el texto», «Expresión», «Línea / Texto del pasaje», «Pregunta 1» dentro del pasaje.
- El botón «Fórmulas» repetido en el encabezado y en la tarjeta, la palomita junto a la opción elegida, el amarillo en las líneas citadas y «(0/2 respondidas)».
- La ventana de fórmulas con tarjetas sueltas y un Σ en cada una, y un pie con «Presiona Esc…».

## Decisión

1. **Sin íconos decorativos.** Se borra `KTestIcons`. Solo quedan íconos de `lucide-react` donde ayudan a reconocer una acción (reloj, fórmulas, mapa, pista, marcar, descartar). Un ícono que solo repite el texto de al lado se quita. Coincide con `frontend-design` («quitar la decoración que no sirve») y con el sitio de Key, que no pone íconos antes de los títulos.
2. **Piezas compartidas** (`src/components/examen/`): `BarraPregunta` (número en una celda, tema, Pista y Marcar), `Pista` (gris claro con la línea azul a la izquierda, como la solución del solucionario) y `Opciones`.
3. **Opciones en celdas que se tocan**, con la letra en su propia celda. La elegida lleva la letra en azul y una línea azul por dentro. Descartar es una celda a la derecha que tacha el texto.
4. **Lectura:** pasaje y pregunta lado a lado en un solo marco. Las líneas se numeran de 5 en 5, y las citadas se marcan con gris claro y la línea azul, sin amarillo. En la pregunta, un solo enlace: «Ver líneas 11–12 en el pasaje».
5. **Matemáticas:** una sola columna de lectura sin tarjeta alrededor, la expresión en un marco fino y las opciones en dos columnas. «Fórmulas» vive solo en el encabezado, y la pista enlaza a ellas.
6. **Fórmulas:** filtros como celdas; las fórmulas, en una cuadrícula de líneas; título «Fórmulas de referencia». Ya no dice «Hoja oficial… College Board», porque no es la hoja oficial. Se cierra con el botón redondo o con Esc.
7. **Mapa de preguntas:** casillas que se tocan (la actual en azul y las respondidas en gris claro, con su letra) y un resumen en texto: «1 de 2 respondidas · 1 marcada para revisar».
8. Los nombres que usan las pruebas no cambian («Siguiente», «Entregar y Guardar», «Descartar opción A», etc.).

## Alternativas consideradas

- **Rediseñar los íconos propios** con el trazo de Key: seguirían repitiendo el texto, y mantener un juego propio de íconos cuesta más que lo que aporta.
- **Opciones como tarjetas separadas:** son más comunes en apps de práctica, pero rompen la regla de bloques que se tocan (ADR marca/0003).

## Consecuencias

- El examen, el mapa y las fórmulas pasan axe (WCAG AA) y la prueba con teclado.
- El solucionario y el encabezado del examen tampoco usan íconos propios.
