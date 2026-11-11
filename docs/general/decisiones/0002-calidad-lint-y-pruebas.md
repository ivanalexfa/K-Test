# 0002 · ESLint, Vitest, Playwright y CI en cada PR

- **Estado:** Aceptada
- **Fecha:** 2026-11-10
- **Módulo:** general
- **Autores:** Soham, con Claude Code

## Contexto

Hasta ahora el frontend no tenía lint ni pruebas: lo único automático era `scripts/test-api.mjs` para la API. El rediseño va a tocar casi todas las pantallas en pocos días, así que hace falta algo que avise en cuanto una se rompa, sin depender de revisar todo a mano.

## Decisión

**Lint (`npm run lint`, `eslint.config.js`)**
- ESLint 9 con `typescript-eslint`, `jsx-a11y` (accesibilidad), `react-hooks` v7 (reglas del React Compiler) y `react-refresh`.
- Revisa `src/`, `e2e/` y los archivos de configuración. **`server/` y `scripts/` (backend) quedan fuera por ahora:** son de Iván y tienen ~80 avisos propios; se suman cuando él lo decida.
- `@typescript-eslint/no-explicit-any` queda como **aviso**: hay unos 20 `any` heredados en `src/` (sobre todo en `catch`). El código nuevo no debe agregar más; cuando se limpien, la regla pasa a error.
- Al activarlo se corrigieron los errores reales: 4 de hooks (estado reiniciado dentro de un `useEffect`, JSX dentro de `try/catch`, `Date.now()` durante el render), 12 etiquetas de formulario sin su campo asociado y el código sin usar.

**Pruebas de componentes (`npm run test:web`, `vitest.config.ts`)**
- Vitest + Testing Library + jsdom. Archivos `src/**/*.test.tsx`, junto al componente que prueban.
- Configuración aparte de `vite.config.ts` para no levantar el plugin de la API ni SQLite.

**Pruebas de punta a punta (`npm run test:e2e`, `playwright.config.ts`)**
- Playwright en dos proyectos: `escritorio` (Desktop Chrome) y `movil` (Pixel 7).
- Levanta su propio Vite en el puerto 5174 con `SQLITE_DB_PATH=e2e/.tmp/e2e.sqlite`: no toca `data/paa_platform.sqlite` y convive con `npm run dev`.
- Toda prueba importa `test` de `e2e/ayudantes.ts`, que la hace fallar si la página lanza una excepción, escribe un error en consola o la API responde 5xx.
- Una pantalla o un flujo nuevo lleva su prueba en `e2e/`.

**CI (`.github/workflows/verificar.yml`)**
- En cada PR y en cada push a `main`: lint, tipos, pruebas de componentes, pruebas de la API, build y e2e. Node 24, igual que en desarrollo (`node:sqlite` sin bandera).
- Si falla el e2e, sube el reporte de Playwright como artefacto.
- `npm run verificar` corre lo mismo en local.

## Alternativas consideradas

- **Jest:** más lento y con más configuración en un proyecto Vite; Vitest comparte la configuración y los transformadores de Vite.
- **Cypress:** Playwright prueba escritorio y celular en la misma corrida, es más rápido en CI y es el que usa la skill `webapp-testing`.
- **Lint del backend también:** bloquearía el CI con avisos que no son del rediseño y mezclaría trabajo de Iván en este PR.

## Consecuencias

- Cada PR muestra en verde o rojo si rompe algo, antes de que alguien lo revise.
- El CI tarda unos minutos más por PR, sobre todo por el navegador de Playwright.
- Deuda anotada: los `any` de `src/` y el lint del backend.
