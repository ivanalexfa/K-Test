# CLAUDE.md

Guía para Claude Code en este repositorio.

**Lee primero [`AGENTS.md`](AGENTS.md):** tiene las reglas del equipo (ramas, PR, commits, comandos y verificación) que comparten Claude Code y Antigravity. Lo que sigue solo agrega lo propio de Claude Code.

## Proyecto

K-test es la plataforma de práctica de la PAA (College Board) para los admitidos de **Key Institute**. Soham lleva el frontend (lo visual y la experiencia de usuario) e Iván el backend; los dos revisan los PR del otro. El plan del rediseño y sus fases está en [`docs/PLAN.md`](docs/PLAN.md).

## Skills del proyecto (`.claude/skills/`)

| Skill | Para qué |
| :--- | :--- |
| `ui-ux-pro-max` | Decisiones de UI/UX, layout, accesibilidad e interacción. Scripts: `python .claude/skills/ui-ux-pro-max/scripts/search.py "<consulta>" --domain ux` (desde la raíz) |
| `design-system` | Tokens en 3 capas, escalas de tipografía y espaciado |
| `brand` | Voz de marca, identidad visual y consistencia |
| `frontend-design` | Dirección visual intencional, que no se vea genérica (Anthropic) |
| `web-design-guidelines` | Revisión de UI contra las Web Interface Guidelines (copia fija en `guidelines.md`) |
| `webapp-testing` | Probar la app en el navegador con Playwright (Anthropic) |

Precedencia cuando chocan: **marca de Key (`docs/marca/DESIGN.md`) > skills > preferencias generales.** La accesibilidad (WCAG AA) no se negocia.

## Convenciones del frontend

- React 18 + Vite + TypeScript + Tailwind 4. Íconos: `lucide-react`.
- Textos de la interfaz en español, con mayúscula inicial solamente («Empezar a practicar»).
- Las decisiones se documentan como ADR antes de cerrar el PR (ver `AGENTS.md`).
