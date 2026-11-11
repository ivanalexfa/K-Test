# 0003 · Skills de agente dentro del repositorio

- **Estado:** Aceptada
- **Fecha:** 2026-11-10
- **Módulo:** general
- **Autores:** Soham, con Claude Code

## Contexto

Soham trabaja con Claude Code e Iván con Antigravity. Para que el diseño y las revisiones salgan con el mismo criterio sin importar quién o qué agente lo haga, las guías tienen que vivir en el repositorio, versionadas y revisadas como el código.

## Decisión

Las skills van en `.claude/skills/`, una carpeta por skill, y se listan en `CLAUDE.md`. Las reglas del equipo, que valen para los dos agentes, están en `AGENTS.md`.

| Skill | Origen | Licencia | Para qué |
| :--- | :--- | :--- | :--- |
| `ui-ux-pro-max` | Copia de la usada en el proyecto De Panas de Soham | No la declara su `SKILL.md` (pendiente de confirmar) | UI/UX, layout, accesibilidad, interacción (con scripts de búsqueda en Python) |
| `design-system` | claudekit, copia de la usada en De Panas | MIT | Tokens en 3 capas, escalas |
| `brand` | claudekit, copia de la usada en De Panas | No la declara su `SKILL.md` (pendiente de confirmar) | Voz e identidad de marca |
| `frontend-design` | [anthropics/skills](https://github.com/anthropics/skills) @ `2c5958e` | Apache-2.0 | Dirección visual intencional, no genérica |
| `webapp-testing` | [anthropics/skills](https://github.com/anthropics/skills) @ `2c5958e` | Apache-2.0 | Probar la app con Playwright |
| `web-design-guidelines` | [vercel-labs/agent-skills](https://github.com/vercel-labs/agent-skills) @ `1a2c79d` | MIT | Revisión contra las Web Interface Guidelines |

Reglas para sumar una skill:
1. Se lee su `SKILL.md` y sus scripts antes de agregarla: son instrucciones que el agente va a seguir.
2. Se fija a una versión (commit) y se anota aquí su origen y licencia.
3. **Nada de instrucciones remotas.** `web-design-guidelines` descarga sus reglas de internet en cada uso; aquí se guardó una copia fija en `guidelines.md` (tomada el 2026-11-10) y su `SKILL.md` lee esa copia. Así las reglas solo cambian con un PR revisado.
4. Se agrega en su propio commit (`chore(skills): …`).

## Alternativas consideradas

- **Instalarlas solo en la cuenta de cada uno:** Iván no tendría las mismas guías y no quedarían versionadas.
- **Más skills de diseño de terceros** (`design-system` de jezweb, `html-to-design-md`, `extract-design`): sirven para sacar un `DESIGN.md` de un sitio, pero la marca de Key ya se midió a mano en la fase de análisis. Se pueden sumar después si hace falta.

## Consecuencias

- `ui-ux-pro-max` pesa 3,7 MB (datos y scripts). Es el costo de tener su base de búsqueda local.
- Los agentes que no son Claude Code (Antigravity) no cargan `.claude/skills/` solos; `AGENTS.md` resume las reglas que importan.
