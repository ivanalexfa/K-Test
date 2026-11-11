# 0001 · Examen y solucionario con el estilo de líneas de Key

- **Estado:** Aceptada
- **Fecha:** 2026-11-11
- **Módulo:** examen
- **Autores:** Soham, con Claude Code

## Contexto

Las pantallas del examen (encabezado, preguntas de lectura y de matemáticas, pie, fórmulas, mapa de preguntas y confirmación de entrega) y la de resultados y solucionario seguían con el estilo anterior: azul marino, celeste, degradados, tarjetas redondeadas y sombras. La Fase 6 les aplica el estilo de líneas de Key (ADR marca/0003) **sin cambiar el flujo** de la PAA: secciones en orden, sin volver a Lectura al pasar a Matemáticas, entrega con confirmación.

## Decisión

### Examen

1. **Encabezado blanco** con línea fina: logo, sección activa, el **reloj en una celda** (en los últimos 2 minutos pasa al color de alerta, y el parpadeo respeta «reducir movimiento») y las pastillas «Fórmulas» y el mapa de preguntas. La barra de avance es azul Key plano sobre gris, sin degradado.
2. **Pie blanco:** «Anterior» en pastilla con borde, «Pregunta 3 de 10» como enlace al mapa y **«Siguiente» / «Entregar y Guardar» como la única pastilla azul**: la acción protagonista de la pantalla.
3. **Preguntas:** paneles rectos con línea fina. Cada opción es una celda; la elegida lleva la línea azul por dentro, sin mover el contenido. Pista, Fórmulas y Marcar son pastillas con borde; descartar una opción es un botón circular. En celular, Pasaje · Pregunta es un menú de dos celdas.
4. **Ventanas** (fórmulas, mapa, entrega): cabecera blanca con línea, cerrar en un botón circular, la acción principal en azul y la secundaria con borde. Textos más claros («¿Terminar Lectura y Redacción?», sin mencionar SQLite).

### Resultados y solucionario

5. **El puntaje es el protagonista**, en el bloque azul plano: tipo de prueba, título, estudiante y fecha, y la precisión global grande. Debajo, el desglose por materia en celdas.
6. **Filtros del solucionario como menú de celdas** (Todas · Lectura · Matemáticas · Por reforzar) y las preguntas en un solo marco separadas por líneas. La solución paso a paso va en gris claro con una línea azul a la izquierda.
7. «Volver al Portal» pasa a una pastilla con borde en el encabezado blanco (las pruebas dependen de ese texto).

### Íconos

8. Los íconos propios (`KTestIcons`) cambian a la paleta de Key: azul `#006DFF` con tinta `#111` (se quitan el celeste, el violeta y el verde esmeralda).

## Alternativas consideradas

- **Encabezado del examen en negro**, para separar «modo examen» del portal: se descartó porque el negro sólido no forma parte de las reglas internas y cansa en una prueba de dos horas.
- **Rediseñar las preguntas** (pasaje y pregunta lado a lado con otro orden, temporizador por pregunta): fuera de alcance, queda en el plan como pendiente.

## Consecuencias

- Los nombres de botones que usan las pruebas no cambian («Siguiente», «Entregar y Guardar», «Guardar y Ver Resultados», «Volver al Portal», «Empezar examen»).
- `e2e/docente-examen.spec.ts` hace un sprint completo a 320 px y revisa que nada se salga en el examen ni en el solucionario.
