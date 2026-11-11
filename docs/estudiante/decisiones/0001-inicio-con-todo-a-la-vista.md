# 0001 · Inicio del estudiante con todo a la vista y cada acción a un clic

- **Estado:** Aceptada
- **Fecha:** 2026-11-10
- **Módulo:** estudiante
- **Autores:** Soham, con Claude Code (skills `frontend-design` y `ui-ux-pro-max`)

## Contexto

El portal anterior abría en un banner azul marino con métricas y tres botones grandes (Pruebas, Materiales, Resultados) que funcionaban como pestañas: para ver cualquier cosa había que hacer clic, y no se veían las tres secciones sin scroll. La referencia que pidió Soham es Aprendo Libre, con todo a la vista. Él pidió también menos elementos y menos clics.

## Decisión

1. **Nueva pantalla `/inicio`** (a donde llega el estudiante al entrar) con **tres columnas que se tocan**, separadas por bordes finos como el sitio de Key:
   - **Pruebas:** el simulacro completo (materias, minutos, preguntas) con «Empezar simulacro», y la lista de los sprints. **Cada sprint empieza con un clic.**
   - **Material:** los últimos materiales; cada uno abre directo en `/inicio/material?m=<id>`.
   - **Mis resultados:** tres datos (pruebas, precisión, mejor simulacro) y los últimos intentos; cada uno abre su resultado. Si no hay intentos, invita a empezar con un sprint corto.
2. **En escritorio cabe sin scroll** en 1440×900 (lo revisa `e2e/inicio-estudiante.spec.ts`). En celular las columnas se apilan; los títulos largos se recortan con «…» y la acción de cada fila siempre se ve.
3. **Encabezado del estudiante** blanco y fijo, con el logo de Key + K-TEST, un **menú de celdas** con borde fino (Inicio · Pruebas · Material · Resultados) y el nombre con «Salir». La celda activa se pinta de azul Key: en keyinstitute.com se pinta del color de la sección, pero en K-Test el único color de acción es el azul (ADR marca/0002). En celular el menú baja a una fila de cuatro celdas.
4. **Las pestañas existentes se conservan** (`/inicio/pruebas`, `/material`, `/resultados`) dentro del nuevo marco: `StudentDashboard` se muestra «incrustado», sin su encabezado ni su banner. Su contenido interno se restiliza en la Fase 6.
5. Los números (minutos, preguntas, porcentajes) van en JetBrains Mono, como dicta `DESIGN.md`.
6. **Se quita el paso de elegir ciclo de admisión** (la ventana que aparecía la primera vez): no hace falta para practicar. El campo `cohort` queda en la base; los filtros del docente por ciclo verán vacíos a los estudiantes nuevos (avisar a Iván).

## Alternativas consideradas

- **Mantener el banner con métricas en tarjetas grandes:** es el patrón genérico de «número grande con etiqueta» y ocupaba media pantalla sin dejar hacer nada.
- **Pestañas en el inicio:** obligan a un clic para ver cada sección; justo lo que había que eliminar.
- **Tarjetas separadas con sombra:** el sitio de Key usa bloques que se tocan con borde fino.

## Consecuencias

- Del inicio a empezar un sprint, abrir un material o ver un resultado: **un clic**.
- Si crece el catálogo de sprints o de material, el inicio muestra los primeros y «Ver todas» lleva a la pestaña; habrá que decidir cuáles destacar (por ejemplo, los no hechos).
- Pendiente (Fase 6): las pestañas internas todavía tienen el estilo anterior.
