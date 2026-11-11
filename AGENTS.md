# K-Test — Agent Guidelines & Custom Commands

These rules apply to every agent on the team (Antigravity, Claude Code, …). `CLAUDE.md` points here.

## Repository rules (team agreement)

- **Never commit or merge directly to `main`.** Every change goes through a Pull Request that Iván or Soham reviews. Work on one branch per task, named `<type>/<area-task>` (`feat/landing`, `fix/login-origen`, `chore/herramientas`, `docs/...`).
- **Frontend redesign:** each phase branches from `rediseno/estudiante` and opens its PR against it; Soham merges it once CI passes (only `main` is protected). `rediseno/estudiante` reaches `main` in a few deliveries, each one a PR that Iván reviews (`main` rule: one CODEOWNERS approval, the last pusher cannot approve). See ADR `docs/general/decisiones/0004-fases-por-rama-de-integracion.md`.
- **Commits:** Conventional Commits in Spanish, as in the history: `feat(ui): ...`, `fix(auth): ...`, `chore: ...`, `docs: ...`, `test: ...`.
- **Before opening a PR:** `npm run verificar` must pass (lint, types, component tests, API tests and e2e). CI (`.github/workflows/verificar.yml`) runs the same checks on every PR.
- **Decisions:** every design or architecture decision gets an ADR in `docs/<module>/decisiones/NNNN-titulo.md` (template in `docs/plantilla-adr.md`). Index in `docs/README.md`.
- **Brand:** K-test is a Key Institute product. Visual rules, tokens and assets live in `docs/marca/DESIGN.md`; new screens follow it. No loose hex colors in components once the tokens exist.
- **Do not commit `data/paa_platform.sqlite`** changes made by running the app locally (`git restore data/paa_platform.sqlite`). Tests use temporary databases (`SQLITE_DB_PATH`).
- **Local URL:** open the app at `http://localhost:5173`, not `127.0.0.1`: Google and Microsoft sign-in only accept the registered origin.

## Commands

| Command | What it does |
| :--- | :--- |
| `npm run dev` | Vite + API plugin at `http://localhost:5173` |
| `npm run lint` | ESLint (`src/`, `e2e/`, configs) with `jsx-a11y` and `react-hooks` |
| `npm run typecheck` | TypeScript without emitting |
| `npm run test:web` | Component tests (Vitest + Testing Library), files `src/**/*.test.tsx` |
| `npm run test:api` | API test suite on a temporary copy of the database |
| `npm run test:e2e` | Playwright (`e2e/`), desktop and Pixel 7, own Vite on port 5174 and temporary DB. First time: `npx playwright install chromium` |
| `npm run verificar` | All of the above |

**Routes:** every URL lives in `src/rutas.ts`; screens live in `src/paginas/`; shared state in `src/estado/` (`useSesion`, `useExamen`). A new screen = its page, its URL in `rutas.ts`, its `<Route>` in `App.tsx` (inside `RequiereSesion` if private) and its e2e test (ADR `general/0005`).

A new screen or flow gets its test in `e2e/`, importing `test` and `expect` from `e2e/ayudantes.ts` (it fails the test on page exceptions, console errors or API 5xx).

## Command: `/add-sprint` or `#ADD_SPRINT` (or `/nueva-prueba`)

Whenever the user sends a message containing `/add-sprint`, `/nueva-prueba`, `#ADD_SPRINT`, or `#NUEVA_PRUEBA` followed by a sprint template:

1. **Automated Sprint Ingestion:**
   - Parse the provided fields (code, title, difficulty, duration, description, topics).
   - If it includes a new reading passage:
     - Automatically format the text into numbered lines of ~10-12 words with `lineNumber` and `isParagraphStart`.
     - Assign the next sequential passage ID (e.g. `passage-3`) in `src/data/mockPaaExam.json`.
   - If questions are provided:
     - Assign sequential question IDs (e.g. `read-6`, `math-6`) and `numberInSection`.
     - Preserve LaTeX formatting in prompts, `mathEquationBlock`, options, and explanations.
     - Add them to `src/data/mockPaaExam.json`.
   - Add the new sprint configuration to `SPRINTS_CATALOG` in `src/data/sprintsCatalog.ts`.
   - Alternatively, write the raw template to a temporary scratch file and execute `node scripts/import-sprint.mjs <file>`.

2. **Validation & Integrity Verification:**
   - Run `npm.cmd run build` to ensure TypeScript types and bundles compile with zero errors.
   - Run `node scripts/test-api.mjs` to ensure the API suite passes.

3. **Report Back:**
   - Confirm to the user that the sprint was successfully added.
   - List the assigned `sprintId`, the `questionIds`, the passage ID (if applicable), and provide clickable `file:///` links to [`src/data/mockPaaExam.json`](file:///c:/ReposHUB/K-Test/src/data/mockPaaExam.json) and [`src/data/sprintsCatalog.ts`](file:///c:/ReposHUB/K-Test/src/data/sprintsCatalog.ts).
