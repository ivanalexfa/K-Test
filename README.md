# K-test | Entrenador PAA · Key Institute

Plataforma web **Mobile-First & Desktop** de simulación, entrenamiento asíncrono por Sprints y diagnóstico docente para la **Prueba de Aptitud Académica (PAA - College Board)** de **Key Institute** (*Powering Engineers for Life*).

---

## 1. Guía de Estilos e Identidad Visual Oficial

### Paleta de Colores Exacta
| Token / Rol | Hex / Valor | Uso Principal |
| :--- | :--- | :--- |
| **Deep Navy** | `#0A1128` | Headers institucionales, fondos hero, textos principales de alto contraste, backdrops. |
| **Electric Blue** | `#0052FF` (Hover `#0045D8`) | Botones primarios (CTA), bordes activos, acentos de marca e indicadores de selección. |
| **Tech Cyan** | `#00D2FF` | Acentos tecnológicos sobre fondo oscuro, insignias de módulo y detalles del isotipo. |
| **Surface Light** | `#F8FAFC` / `#FFFFFF` | Fondo general de la aplicación (`#F8FAFC`) y tarjetas/modales de lectura limpia (`#FFFFFF`). |
| **Emerald / Éxito** | `#10B981` (`#ECFDF5`) | Indicadores de alto desempeño (`≥ 85%`) y módulo de Práctica Asíncrona / Sprints. |
| **Amber / Alerta** | `#F59E0B` (`#FFFBEB`) | Pistas guiadas (`KeyHintIcon`), preguntas marcadas para revisión y alertas de tiempo. |
| **Red / Descarte** | `#EF4444` (`#FEF2F2`) | Descarte de distractores (`StrikeOptionIcon`) y alertas de refuerzo (`< 60%`). |

### Tipografías (`index.html` + `src/index.css`)
- **Títulos y Display (`--font-display` / `.font-display`)**: `'Plus Jakarta Sans', 'Inter', system-ui, sans-serif` (`500, 600, 700, 800`).
- **Texto Base y Lectura (`--font-sans`)**: `'Inter', system-ui, -apple-system, sans-serif` (`400, 500, 600, 700`).
- **Cifras, Cronómetro y Líneas Numeradas (`--font-mono` / `.font-mono-num`)**: `'JetBrains Mono', monospace` con `font-variant-numeric: tabular-nums`.
- **Fórmulas Matemáticas**: `katex` (`0.16.11`).

---

## 2. Sistema Oficial de Logotipo e Iconografía Dedicada

Cualquier vista o componente nuevo en **K-test** debe utilizar los activos oficiales ubicados en `src/components/brand/`:

### A. Logotipo Oficial (`src/components/brand/KTestLogo.tsx`)
- `<KTestLogo variant="full" | "mark-only" theme="dark" | "light" />`
  - Usar `theme="dark"` sobre fondos `#0A1128` (Headers, Login Navbar) y `theme="light"` sobre fondos claros (`#FFFFFF` / `#F8FAFC`).
- Favicon oficial en `public/favicon.svg`.

### B. Iconografía Dedicada Bitono (`src/components/brand/KTestIcons.tsx`)
Diseñada bajo grilla `24x24` compatible con `lucide-react`:
1. **`<SimulacroEngineIcon />`**: Módulo de Simulacro PAA en condiciones reales (contenedor `w-10 h-10 rounded-lg bg-[#0052FF]/10 border border-[#0052FF]/20 flex items-center justify-center`).
2. **`<AsyncTrainerIcon />`**: Módulo de Práctica Asíncrona / Sprints Cortos (contenedor `w-10 h-10 rounded-lg bg-[#ECFDF5] border border-[#10B981]/20 flex items-center justify-center`).
3. **`<TeacherDiagnosticIcon />`**: Módulo de Diagnóstico del Profesor y Analítica (contenedor `w-10 h-10 rounded-lg bg-[#F1F5F9] border border-[#CBD5E1] flex items-center justify-center`).
4. **`<MathPAAIcon />`**: Insignia oficial del área de Matemáticas PAA.
5. **`<VerbalPAAIcon />`**: Insignia oficial del área de Lectura y Redacción / Verbal PAA.
6. **`<StrikeOptionIcon />`**: Herramienta interactiva para tachar/descartar opciones (`A, B, C, D`) en las vistas de examen.
7. **`<KeyHintIcon />`**: Botón de pista o asistencia guiada en el motor de examen y entrenamiento.
