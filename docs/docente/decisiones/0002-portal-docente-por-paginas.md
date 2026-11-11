# 0002 · Portal del docente por páginas, con la ficha del estudiante como pantalla propia

- **Estado:** Aceptada (reemplaza a la estructura de la 0001; el estilo de líneas se mantiene)
- **Fecha:** 2026-11-11
- **Módulo:** docente
- **Autores:** Soham, con Claude Code

## Contexto

La 0001 pasó el portal del docente al estilo de líneas de Key sin cambiar sus flujos: todo vivía en una sola página con dos pestañas. Al revisarlo, Soham notó que **no se sentía diferencia entre ver a todos los alumnos y ver a uno solo**: la ficha del estudiante era un bloque más que aparecía encima de la misma tabla. Además, el formulario para publicar material se abría dentro de la lista, con ocho campos seguidos y la vista previa abajo.

## Decisión

1. **Una URL por pantalla**, con el mismo encabezado y menú de celdas que el estudiante (`EncabezadoPortal`, compartido):
   - `/docente`: **Estudiantes**. Una fila por estudiante (no por intento): pruebas, precisión, lectura, matemáticas y la última prueba, con «Ver ficha». La precisión baja de 60 % se marca en rojo. Arriba, cuatro datos: estudiantes, intentos, precisión promedio y cuántos necesitan refuerzo.
   - `/docente/estudiantes/<id>`: **la ficha**, una pantalla propia. «← Todos los estudiantes» para volver (conserva la búsqueda), el estudiante en el bloque azul con su precisión general, sus cifras en celdas y **solo sus intentos**, cada uno con su solucionario. En el menú, «Estudiantes» sigue activa.
   - `/docente/intentos`: todos los intentos, del más reciente al más viejo, con los filtros por prueba y desempeño del portal anterior. El nombre lleva a la ficha.
   - `/docente/material`: la lista de material en filas, con «Publicar material» como la acción azul. Eliminar pide confirmación.
   - `/docente/material/nuevo` y `/docente/material/<id>`: **el formulario**.
2. **Los filtros viven en la URL** (`?q=`, `?ciclo=`, `?nivel=`, `?prueba=`): volver desde una ficha o un solucionario deja la lista como estaba, y un enlace se puede compartir.
3. **El formulario de material**, en dos columnas dentro de un marco:
   - Izquierda, tres secciones: **lo básico** (título; materia en dos celdas en vez de una lista; tema con sugerencias de los temas ya usados; minutos; resumen con contador), **contenido** (la guía, con botones para insertar fórmula, fracción, raíz, potencia y π sin saber LaTeX) y **archivo** (opcional, se arrastra o se elige).
   - Derecha, **«Así lo verá el estudiante»**, que se actualiza mientras se escribe. En celular, «Editar · Vista previa» son dos celdas.
   - «Publicar» es la única pastilla azul. Los errores aparecen junto a cada campo, con un aviso arriba y el foco en el primero. Si hay cambios sin guardar, se avisa antes de salir.
   - Al guardar vuelve a la lista con el aviso «Material publicado» o «Cambios guardados».
4. Del solucionario, el docente **vuelve a donde estaba** (la ficha o Intentos).
5. Se elimina `TeacherDashboard` (unas 1 380 líneas); cada pantalla vive en `src/paginas/docente/` y los cálculos en `src/components/docente/datos.ts`.

## Alternativas consideradas

- **Dejar la ficha dentro de la lista, con más contraste:** se seguiría sintiendo como un filtro, no como la página de una persona, y no tendría su propia URL.
- **Formulario en una ventana encima de la lista:** más rápido de abrir, pero el formulario es largo y en celular no cabe; una página propia permite «Atrás» y enlazar a la edición.

## Consecuencias

- `e2e/docente-examen.spec.ts` revisa el menú, que la ficha vuelve con los filtros y que el formulario valida y muestra la vista previa; `e2e/accesibilidad.spec.ts` pasa axe por las cinco pantallas.
- El filtro por ciclo sigue disponible, pero los estudiantes nuevos aparecen «Sin ciclo» (ya no lo eligen; pendiente para Iván).
