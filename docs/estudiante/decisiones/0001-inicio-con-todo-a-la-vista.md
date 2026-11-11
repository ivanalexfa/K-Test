# 0001 · Inicio del estudiante: el simulacro como acción protagonista y todo a un clic

- **Estado:** Aceptada (versión A1, 11 nov 2026; reemplaza a la primera versión de tres columnas iguales)
- **Fecha:** 2026-11-10, revisada el 2026-11-11
- **Módulo:** estudiante
- **Autores:** Soham, con Claude Code (skills `frontend-design` y `ui-ux-pro-max`)

## Contexto

El portal anterior abría en un banner azul marino con métricas y tres botones grandes que funcionaban como pestañas: para ver cualquier cosa había que hacer clic, y no se veían las tres secciones sin scroll. Soham pidió menos elementos, menos clics y tener todo a la vista (la referencia era Aprendo Libre).

La primera versión nueva puso Pruebas, Material y Mis resultados en tres columnas iguales dentro de un marco negro. Funcionaba, pero se sentía pesada: tres columnas iguales no dicen qué es lo importante. Se exploraron tres direcciones (siguiente paso, menú lateral, columnas suaves) y se eligió **«siguiente paso» con el simulacro completo como protagonista**, en el estilo de líneas de Key (ADR marca/0003).

## Decisión

1. **`/inicio`** (a donde llega el estudiante al entrar):
   - **Izquierda:** el **simulacro completo** en un bloque azul Key a sangre («Haz la prueba como el día del examen», materias, minutos, preguntas y «Empezar simulacro»). Debajo, los **sprints por materia** en filas con «Empezar»: cada uno empieza con un clic.
   - **Derecha:** **Mis resultados** (pruebas, precisión, mejor simulacro y los últimos intentos) y **Material** (los últimos; cada uno abre directo en `/inicio/material?m=<id>`).
   - En escritorio cabe sin scroll en 1440×900 (lo revisa `e2e/inicio-estudiante.spec.ts`). En celular se apila; los títulos largos se recortan con «…» y la acción de cada fila siempre se ve.
2. **Encabezado del estudiante** blanco y fijo, con el logo de Key + K-TEST, un **menú de celdas** con borde fino (Inicio · Pruebas · Material · Resultados), la celda activa en azul Key, y el nombre con «Salir». En celular el menú baja a una fila de cuatro celdas.
3. **Pruebas, Material y Mis resultados se rehicieron con el mismo estilo** (en vez de mostrar el portal anterior incrustado):
   - **Pruebas:** el bloque del simulacro y los sprints en dos columnas por materia, con descripción, dificultad, minutos y preguntas.
   - **Material:** filtro por materia en celdas, lista a la izquierda y lector a la derecha (fórmulas con KaTeX, descarga y vista previa de PDF e imágenes). El material abierto vive en la URL.
   - **Mis resultados:** tres datos y una tabla de líneas finas (prueba, fecha, correctas, precisión, puntaje, tiempo) con «Ver solucionario»; en celular, filas apiladas.
4. **Se quita el paso de elegir ciclo de admisión** (la ventana que aparecía la primera vez): no hace falta para practicar. El campo `cohort` queda en la base; los filtros del docente por ciclo verán vacíos a los estudiantes nuevos (avisar a Iván).
5. Los números van en JetBrains Mono, como dicta `DESIGN.md`.

## Alternativas consideradas

- **Tres columnas iguales (primera versión):** todo a la vista, pero sin jerarquía y pesada.
- **Menú lateral tipo sistema (B):** escala bien, pero se aleja de Key y en celular cambia de forma.
- **Columnas suaves (C) y estilo suave (A2):** más ligeros, pero menos de Key (ver ADR marca/0003).
- **Recomendar un sprint según los errores** como acción protagonista: mejor a futuro, pero necesita lógica de recomendación. Por ahora el protagonista es el simulacro completo, que es la meta de la preparación.

## Consecuencias

- Del inicio a empezar el simulacro o un sprint, abrir un material o ver un resultado: **un clic**.
- `StudentDashboard` (el portal anterior, unas 900 líneas) se elimina; las cuatro pantallas comparten piezas en `src/components/estudiante/piezas.tsx`.
- Si crecen los sprints o el material, el inicio muestra los primeros y «Ver todos» lleva a la pantalla completa; habrá que decidir cuáles destacar (por ejemplo, los no hechos).
