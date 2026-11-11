# 0003 · La plataforma interna usa el estilo de líneas de Key

- **Estado:** Aceptada
- **Fecha:** 2026-11-11
- **Módulo:** marca
- **Autores:** Soham, con Claude Code

## Contexto

La primera versión del inicio del estudiante (tres columnas dentro de un marco negro) se sintió pesada para una plataforma que se usa como sistema. Se compararon dos versiones de la misma pantalla, con el simulacro completo como acción protagonista:

- **A1, estilo Key:** bordes negros finos (0.8 px), formas rectas, bloques que se tocan, menú de celdas y el bloque azul plano. Es el lenguaje de keyinstitute.com.
- **A2, estilo suave:** líneas grises, paneles gris claro, esquinas redondeadas y menú en pastillas, como una app de trabajo genérica.

Además, las pestañas Pruebas, Material y Resultados seguían con el estilo anterior (azul marino, tarjetas redondeadas con sombra) y no se parecían a nada del resto.

## Decisión

**Toda la plataforma interna (estudiante y, en la Fase 6, docente, examen y resultados) usa el estilo de líneas de Key (A1).** Al poner una sola acción como protagonista, el marco de líneas ordena la pantalla en vez de cargarla. Reglas:

1. **Marco y divisiones:** bordes negros de 0.8 px. Los bloques se tocan; no hay tarjetas flotantes ni sombras.
2. **Formas rectas:** radio 0 en marcos, celdas, campos, tablas y bloques. **Solo los botones son pastillas** (`rounded-full`).
3. **Una acción protagonista por pantalla**, en un bloque azul Key plano a sangre dentro del marco (por ejemplo, «Empezar simulacro»). El resto de acciones son enlaces azules («Empezar», «Ver todo») o pastillas con borde negro.
4. **Menú de celdas** con borde fino; la celda activa se pinta de azul Key. Los filtros (por ejemplo, por materia en Material) usan las mismas celdas.
5. **Listas con líneas negras finas** entre filas, con la acción de cada fila siempre visible. Las tablas tienen las mismas líneas; en celular cada fila se vuelve un bloque apilado.
6. **El fondo gris claro (`#F5F7FA`) se reserva** para el elemento activo de una lista y los estados vacíos.
7. **Cifras en JetBrains Mono** (minutos, preguntas, porcentajes, puntajes).
8. **Las piezas son compartidas** (`src/components/estudiante/piezas.tsx`): `BloqueSimulacro`, `FilaSprint`, `FilaIntento`, `DatosEstudiante`, `EncabezadoBloque`, `TituloPagina`, `Pastilla` y `Vacio`. Una pantalla nueva se arma con ellas.

## Alternativas consideradas

- **A2, estilo suave:** se siente más cómodo de inmediato, pero diluye la identidad de Key y se parece a cualquier otra app. Con la acción protagonista resuelta, A1 dejó de sentirse pesado.
- **Mezclar:** Key en la landing y suave dentro de la app. Se descartó para que todo K-Test hable el mismo idioma visual.

## Consecuencias

- Inicio, Pruebas, Material y Mis resultados quedan con el mismo estilo; `StudentDashboard` (el portal anterior) se elimina.
- La Fase 6 aplica estas reglas al portal del docente, al examen y a la pantalla de resultados y solucionario.
- `DESIGN.md` documenta estas reglas en «Plataforma interna».
