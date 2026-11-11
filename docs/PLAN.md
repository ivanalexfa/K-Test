# Plan · Rediseño del frontend de K-test

- **Responsable:** Soham (frontend, lo visual y la experiencia de usuario). Revisa: Iván.
- **Entrega:** jueves 12 de noviembre de 2026, revisión con Iván. Después, prueba con los directivos de Key.
- **Flujo:** cada fase sale de `rediseno/estudiante` y abre su PR contra ella; esa rama llega a `main` en pocas entregas que revisa Iván (ADR [general/0004](general/decisiones/0004-fases-por-rama-de-integracion.md)).

## Objetivo

K-test es la plataforma de práctica de la PAA para los admitidos de Key Institute, al estilo del simulador del Tec de Monterrey y de Aprendo Libre. El rediseño busca que:

1. **Se vea y se sienta como una extensión de keyinstitute.com.** No es una sub-marca: logo de Key en los encabezados y «K-test» solo como nombre del producto.
2. **Venda la idea de prepararse** con una landing de un solo llamado a la acción: «Empezar a practicar».
3. **Pida los menos clics posibles:** en escritorio, las 3 secciones del estudiante se ven sin scroll.

## Alcance para el jueves

| Entra | Queda para después |
| :--- | :--- |
| Marca de Key aplicada (tokens, logo, fuente, fotos) | Rediseño a fondo del portal del docente |
| React Router (una URL por pantalla) | Rediseño a fondo de las pantallas del examen y de resultados |
| Landing, login y dashboard del estudiante | Login único con el portal de admisiones de Key (requiere a TI de Key) |
| Docente, examen y resultados con el nuevo estilo, sin rediseño | Fotos oficiales y el visto bueno de Key para usar su logo, textos y fotos |
| Lint, pruebas y CI | |

## Fases

| Fase | Rama | Horas | Estado |
| :--- | :--- | :---: | :--- |
| 0 · Herramientas y reglas | `chore/herramientas` | ~3 | En `main` (PR #8 y #10) |
| 1 · Base de marca | `feat/marca-key` | ~4 | Fusionada en `rediseno/estudiante` (PR #11) |
| 2 · Router y estructura | `feat/router` | ~3 | Fusionada en `rediseno/estudiante` (PR #12) |
| 3 · Landing | `feat/landing` | ~6 | Fusionada en `rediseno/estudiante` (PR #13) |
| 4 · Login | `feat/login` | ~2 | Fusionada en `rediseno/estudiante` (PR #14) |
| 5 · Portal del estudiante (inicio, pruebas, material, resultados) | `feat/dashboard-estudiante` | ~8 | En revisión (PR #15) |
| 6 · Docente, examen y solucionario con el estilo de líneas de Key | `feat/estilo-docente-examen` | ~3 | Pendiente |
| 7 · Revisión y entrega del jueves | `rediseno/estudiante` → `main` | ~4 | Pendiente |

Total: unas 31 horas. Si algo se atrasa, la Fase 6 es la primera que se recorta.

### 0 · Herramientas y reglas
- Skills en `.claude/skills/` (ADR [general/0003](general/decisiones/0003-skills-del-proyecto.md)).
- ESLint, Vitest, Playwright y CI en cada PR (ADR [general/0002](general/decisiones/0002-calidad-lint-y-pruebas.md)).
- Reglas del equipo en `AGENTS.md` (las leen Claude Code y Antigravity) y `CLAUDE.md`; plantilla de PR.
- Esta carpeta `docs/` con ADR por módulo.

### 1 · Base de marca
- `docs/marca/DESIGN.md` completo con lo medido (abajo).
- Tokens en Tailwind 4 (`@theme`): se acaban los hex sueltos.
- Logo de Key en los encabezados, «K-test» como nombre del producto; se retira `KTestLogo`.
- Fotos del sitio y del Instagram de Key en `public/brand/fotos/`, con una lista de dónde salió cada una.

### 2 · Router y estructura
- React Router: `/` landing, `/entrar` login, `/inicio` dashboard (con `/inicio/pruebas`, `/inicio/material`, `/inicio/resultados`), `/examen/:id`, `/resultados/:id`, `/docente`.
- Rutas protegidas por rol; sacar el estado de pantallas de `App.tsx`; borrar `LandingView` (sin usar).

### 3 · Landing
Orden, con la lógica de venta del Tec y el estilo de Key:
1. Encabezado: logo de Key, «K-test» y la pastilla azul «Empezar a practicar», siempre visible.
2. Hero con foto real y titular grande.
3. Tres tarjetas: Conoce la prueba · Prepárate a tu ritmo · Sin costo.
4. «¿Por qué estudiar en Key?»: las fichas del sitio de Key, con los colores de las carreras.
5. Bloque azul («Futuro ingeniero…») y barra negra «Admisiones 2027 →» con la franja degradada, a `https://admisiones.keyinstitute.com/login`.
6. Footer con enlace discreto «Pide información» al formulario de Key (`https://info.keyinstitute.com/admisiones`), opcional.

### 4 · Login
Tarjeta simple como la de Key: logo, «Bienvenido», Google y Microsoft. Sin cuentas demo; el rol se detecta solo. El origen correcto es `localhost`.

### 5 · Portal del estudiante
- Inicio con el **simulacro completo como acción protagonista** (versión A1, ADR estudiante/0001); sprints, resultados y material acompañan; sin scroll en 1440×900.
- Pruebas, Material y Mis resultados rehechos con el mismo estilo; se elimina el portal anterior (`StudentDashboard`).
- Se decidió que **toda la plataforma interna usa el estilo de líneas de Key** (ADR marca/0003, `DESIGN.md` §11).
- Se quitó el paso de elegir ciclo de admisión.

### 6 · Docente, examen y solucionario
Aplicar las reglas de «Plataforma interna» (`DESIGN.md` §11) al portal del docente, a la pantalla del examen y a la de resultados y solucionario. Sin rediseñar los flujos.

### 7 · Revisión y PR
Revisión con las skills (contraste AA, teclado, de 320 a 1440 px, e2e) y un PR a `main` con capturas de antes y después y los pendientes.

## Análisis de marca (resumen)

Medido el 10 de noviembre de 2026 en keyinstitute.com (a 1440 px), `admisiones.keyinstitute.com`, `info.keyinstitute.com/admisiones` e Instagram `@keyinstitute.sv`. El detalle completo y las decisiones están en [`marca/DESIGN.md`](marca/DESIGN.md).

**Colores**

| Rol | Valores |
| :--- | :--- |
| Principales | Negro `#000000`, blanco `#FFFFFF`, azul Key `#006DFF` |
| Grises | `#111111`, `#333333` (texto), `#E3E7E8` (footer), `#F5F7FA` (fondos suaves) |
| Carreras (solo acentos, sobre todo en la landing) | Morado `#9746FF` / `#8521D9`, verde `#31E083`, amarillo `#F5F500`, naranja `#FFA04C` |
| Degradado | `linear-gradient(90deg, #006DFF, #FBD2FF 63%, #F5F500)`, como franja bajo las barras negras |

Amarillo y verde no llevan texto blanco (no llegan a AA); Key usa texto negro sobre ellos.

**Tipografía:** Albert Sans (300–700) en todo.

| Uso | Tamaño / interlineado | Peso |
| :--- | :--- | :--- |
| Titular gigante | 85/89 px, `letter-spacing: -0.48px` | 700 |
| Titular en mayúsculas | 60/80 px | 400 |
| Subtítulo grande | 45/51 px | 300 |
| Título de sección | 42–45/55 px | 500 |
| Texto | 20/30 px | 400 |
| Etiqueta con viñeta («• Qué es Key») | 16/20 px | 700 |

**Layout:** casi de borde a borde (1345 px de contenido y unos 40 px de margen); textos largos de máximo 940 px; secciones de 460 a 1100 px de alto; bordes finos de 0.8 px en negro en lugar de sombras; menú hecho de celdas con borde.

**Componentes:** botones en pastilla (radio `100px`) de 49 o 72 px de alto, azul o negro con texto blanco; campos cuadrados de 40 px con borde de 0.8 px. Hover de 0.2 s con un leve rebote: `cubic-bezier(0.175, 0.885, 0.32, 1.275)`.

**Fotos:** en el sitio, blanco y negro alternado con bloques de color plano y un video en el hero. En Instagram, a color: estudiantes en laboratorio, proyectos (Fórmula SAE, Electro Radar, Key Week) y eventos (KREA, Entropy Hack). Campaña actual: «The Do Generation».

**Referencias de flujo:** simulador del Tec (hero con foto, tres beneficios, «¿Por qué estudiar…?», proceso de admisión, CTA final) y Aprendo Libre (el dashboard con todo a la vista).

## Pendientes para la reunión con Iván

- Login único con el portal de admisiones de Key: requiere a TI de Key.
- Fotos oficiales y el visto bueno de Key para usar su logo, textos y fotos (el logo en vector ya se tomó del sitio).
- `SPEC.md` describe otro stack (React 19, Supabase, Zustand, Recharts): hay que actualizarlo.
- `data/paa_platform.sqlite` está en git y cambia al usar la app en local.
- Lint del backend (`server/`, `scripts/`) y los `any` que quedan en `src/`.
- Ya no se pide el ciclo de admisión al estudiante: los filtros por ciclo del portal del docente verán vacíos a los estudiantes nuevos. ¿Se quita el filtro o el ciclo sale de otro lado (portal de admisiones)?
