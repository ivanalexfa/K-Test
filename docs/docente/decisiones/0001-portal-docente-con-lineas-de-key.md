# 0001 · Portal del docente con el estilo de líneas de Key

- **Estado:** Aceptada
- **Fecha:** 2026-11-11
- **Módulo:** docente
- **Autores:** Soham, con Claude Code

## Contexto

El portal del docente (`TeacherDashboard`, unas 1 380 líneas) seguía con el estilo anterior: encabezado y banner azul marino con brillo, celeste `#00D2FF`, tarjetas redondeadas con sombra, etiquetas en mayúsculas y unos 100 colores hex sueltos. El ADR marca/0003 decidió que toda la plataforma interna usa el estilo de líneas de Key, y la Fase 6 lo aplica **sin rediseñar los flujos**: los filtros, la ficha del estudiante, la tabla y el CRUD de material funcionan igual.

## Decisión

1. **Encabezado blanco y fijo**, igual al del estudiante: logo de Key + K-TEST, nombre del docente y la pastilla «Salir».
2. **«Hola, Dr. Roberto»** como título, con una línea de apoyo. El saludo conserva el tratamiento (Dr., Mtra.) si el nombre lo trae.
3. **Un marco con líneas finas** reemplaza el banner oscuro: cuatro datos (estudiantes, simulacros/sprints, precisión, materiales) en celdas, en cifras JetBrains Mono, y debajo el **menú de celdas** Resultados · Material con la celda activa en azul Key (`aria-current`).
4. **Resultados:** buscador y filtros con campos rectos y foco visible; la ficha del estudiante en un marco negro, con «Mejor simulacro» en el bloque azul; la tabla con líneas negras y, **en celular, cada fila apilada como bloque** con etiquetas («Lectura», «Matemáticas», «Precisión»), en vez de desplazarse de lado.
5. **Material:** la acción protagonista es la pastilla azul «Publicar material». Las tarjetas se tocan en una cuadrícula de líneas; editar y eliminar son pastillas con borde (negro y rojo).
6. Textos más simples y en mayúscula inicial («Buscar y filtrar resultados», «Material de estudio», «Limpiar filtros»).

## Alternativas consideradas

- **Rehacer el portal del docente por pantallas y rutas** (como el del estudiante): mejor a futuro, pero es un rediseño y quedó fuera del alcance del jueves.
- **Dejar la tabla con desplazamiento horizontal en celular:** más simple, pero esconde la acción de cada fila, que la regla 5 pide siempre visible.

## Consecuencias

- El portal ya no tiene hex sueltos: todo usa los tokens de `src/index.css`.
- `e2e/docente-examen.spec.ts` revisa el menú de celdas y que nada se salga a 320 px.
- Pendiente para Iván: el filtro por ciclo verá vacíos a los estudiantes nuevos (ya no eligen ciclo, ADR estudiante/0001).
