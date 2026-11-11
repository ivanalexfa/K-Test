# 0001 · Ramas por tarea, rama de integración y PR siempre

- **Estado:** Aceptada; el [0004](0004-fases-por-rama-de-integracion.md) precisa cómo se aprueba cada paso
- **Fecha:** 2026-11-10
- **Módulo:** general
- **Autores:** Soham, con Claude Code

## Contexto

Iván y Soham codiseñan K-test: Soham lleva el frontend e Iván el backend, y cada uno revisa los PR del otro. El rediseño del frontend tiene que estar listo para el jueves 12 de noviembre de 2026, con unas 40 horas de trabajo entre medio, y está dividido en 8 fases (`docs/PLAN.md`). Si cada fase esperara la aprobación de Iván antes de empezar la siguiente, el trabajo se detendría entre tarea y tarea.

## Decisión

1. **Nunca se hace commit ni merge directo a `main`.** Todo entra por Pull Request.
2. **Una rama por tarea**, con prefijo de tipo y área: `feat/landing`, `fix/login-origen`, `chore/herramientas`, `docs/...`.
3. **Rama de integración `rediseno/estudiante`** para el rediseño: cada tarea abre su PR contra ella y Soham la puede aprobar para seguir avanzando. Al terminar, `rediseno/estudiante` llega a `main` en **un solo PR** que revisa Iván, con capturas de antes y después y la lista de pendientes.
4. **Commits en Conventional Commits y en español**, como ya venía el historial: `feat(ui): …`, `fix(auth): …`, `chore: …`, `docs: …`, `test: …`.
5. Un PR no se fusiona si falla el flujo `Verificar` (ADR [0002](0002-calidad-lint-y-pruebas.md)).

## Alternativas consideradas

- **Ramas por área de larga vida** (`feature/frontend`): viven semanas, acumulan conflictos y su PR es imposible de revisar.
- **Un PR a `main` por tarea:** cada tarea bloquearía a la siguiente hasta que Iván la revise.
- **Ramas apiladas** (cada una sale de la anterior): sirve, pero un cambio en una rama temprana obliga a rehacer todas las siguientes.

## Consecuencias

- Soham avanza sin esperar y el historial queda ordenado por tarea.
- El PR final a `main` es grande; para que Iván lo pueda revisar, cada PR interno lleva su descripción y sus ADR, y el PR final los enlaza.
- Después del jueves, las fases siguientes (rediseño del docente y del examen) pueden usar su propia rama de integración o ir directo a `main` por PR, según su tamaño.
