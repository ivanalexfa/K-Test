## Qué cambia

<!-- Una o dos frases: qué hace este PR y por qué. -->

## Fase / tarea

<!-- Ej.: Fase 3 · Landing (docs/PLAN.md). Rama: feat/landing -->

## Decisiones

<!-- Enlaza los ADR nuevos o actualizados en docs/<módulo>/decisiones/. -->

## Capturas

<!-- Antes y después, en escritorio (1440 px) y celular (390 px), si cambia algo visible. -->

| Antes | Después |
| :---: | :---: |
|  |  |

## Cómo probarlo

1. `npm ci`
2. `npm run dev` y abrir `http://localhost:5173` (con `localhost`, no `127.0.0.1`: el login de Google y Microsoft solo acepta ese origen)
3. <!-- pasos concretos -->

## Revisión

- [ ] `npm run verificar` pasa en local (lint, tipos, pruebas de componentes, API y e2e)
- [ ] Sigue `docs/marca/DESIGN.md` (tokens, sin hex sueltos)
- [ ] Probado de 320 a 1440 px, con teclado y con `prefers-reduced-motion`
- [ ] Una pantalla o un flujo nuevo lleva su prueba en `e2e/`
- [ ] Sin cambios en `data/paa_platform.sqlite`

## Pendientes

<!-- Lo que queda fuera de este PR y quién lo resuelve. -->
