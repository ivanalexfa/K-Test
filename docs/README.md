# Documentación de K-test

Aquí vive el porqué de lo que construimos. El código dice *qué* hace el sistema; estos documentos dicen *por qué* se decidió así, para que Iván, Soham o cualquier agente puedan seguir el hilo sin preguntar.

## Cómo está organizada

```
docs/
├── README.md              ← este índice
├── PLAN.md                ← plan del rediseño del frontend, por fases
├── plantilla-adr.md       ← copia esta plantilla para cada decisión nueva
├── general/decisiones/    ← flujo de trabajo, herramientas, arquitectura
├── marca/                 ← DESIGN.md (sistema de diseño) y sus decisiones
├── landing/decisiones/
├── acceso/decisiones/     ← login y roles
├── estudiante/decisiones/ ← dashboard y portal del estudiante
├── docente/decisiones/
└── examen/decisiones/     ← preguntas, examen y resultados
```

Cada módulo tiene sus propias decisiones. Una carpeta se crea cuando llega su primera decisión.

## Decisiones (ADR)

Un ADR (*Architecture Decision Record*) es un archivo corto por decisión: contexto, decisión, alternativas y consecuencias. Se numeran por módulo (`0001-…`, `0002-…`) y no se borran: si una decisión cambia, se escribe una nueva que la reemplaza y la anterior pasa a «Reemplazada por …».

### General

| # | Decisión | Estado |
| :--- | :--- | :--- |
| [0001](general/decisiones/0001-flujo-de-trabajo-ramas-y-pr.md) | Flujo de trabajo: ramas por tarea, rama de integración y PR siempre | Aceptada; precisada por 0004 |
| [0002](general/decisiones/0002-calidad-lint-y-pruebas.md) | Calidad: ESLint, Vitest, Playwright y CI en cada PR | Aceptada |
| [0003](general/decisiones/0003-skills-del-proyecto.md) | Skills de agente dentro del repositorio | Aceptada |
| [0004](general/decisiones/0004-fases-por-rama-de-integracion.md) | Las fases entran a `rediseno/estudiante` y llegan a `main` en pocas entregas | Aceptada |
| [0005](general/decisiones/0005-react-router-y-estado.md) | React Router, una URL por pantalla y el estado en dos contextos | Aceptada |

### Marca

[`marca/DESIGN.md`](marca/DESIGN.md) es el sistema de diseño vivo de K-test como producto de Key Institute. El origen de las fotos está en [`marca/fotos-originales/FUENTES.md`](marca/fotos-originales/FUENTES.md).

| # | Decisión | Estado |
| :--- | :--- | :--- |
| [0001](marca/decisiones/0001-k-test-usa-la-identidad-de-key.md) | K-test usa la identidad de Key Institute, no una propia | Aceptada |
| [0002](marca/decisiones/0002-tokens-y-colores-de-carrera.md) | Tokens en Tailwind 4 y colores de carrera solo en la landing | Aceptada |
