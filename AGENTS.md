# K-Test — Agent Guidelines & Custom Commands

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
