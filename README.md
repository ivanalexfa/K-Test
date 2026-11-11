# K-test · Práctica PAA · Key Institute

Plataforma web (celular y escritorio) para que los admitidos de **Key Institute** practiquen la **Prueba de Aptitud Académica (PAA, College Board)**: simulacros completos, sprints cortos por materia, material de estudio y resultados, con un portal de diagnóstico para docentes.

K-test **no es una sub-marca**: es un producto de Key Institute y se ve como una extensión de [keyinstitute.com](https://www.keyinstitute.com/).

## Empezar

```bash
npm ci
npm run dev        # http://localhost:5173 (usa localhost, no 127.0.0.1: el login lo exige)
npm run verificar  # lint, tipos, pruebas de componentes, API y e2e
```

Reglas del equipo, comandos y flujo de ramas y PR: [`AGENTS.md`](AGENTS.md). Plan del rediseño: [`docs/PLAN.md`](docs/PLAN.md).

## Marca

Todo lo visual sale de [`docs/marca/DESIGN.md`](docs/marca/DESIGN.md): colores, tipografía (Albert Sans), proporciones, componentes, fotos y voz, medidos en keyinstitute.com, su portal de admisiones y su Instagram.

- **Tokens:** `src/index.css` (`@theme` de Tailwind 4). Usa las clases `bg-key-azul`, `text-key-texto`, `bg-carrera-computacion`, …; nunca hex sueltos.
- **Logo:** `src/components/brand/LogoKey.tsx` → `<LogoKey variant="full" | "mark-only" theme="dark" | "light" />`. Archivos en `public/brand/key/`.
- **Íconos de carrera:** `public/brand/key/carreras/*.svg` (en `currentColor`).
- **Fotos:** `public/brand/fotos/` (WebP generados con `npm run fotos` desde `docs/marca/fotos-originales/`).
- **Íconos propios del examen:** `src/components/brand/KTestIcons.tsx` (tachar opción, pista, insignias de materia).
- **Fórmulas:** KaTeX.
