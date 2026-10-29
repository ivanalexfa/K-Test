# MASTER SPEC & AGENT RULES: Plataforma de Entrenamiento y Simulacros PAA (College Board)

> **INSTRUCCIÓN CRÍTICA PARA EL AGENTE DE ANTIGRAVITY:** 
> Este documento es la única fuente de verdad (Single Source of Truth) del proyecto. Antes de crear o modificar cualquier componente, tabla de base de datos, ruta o estado, debes verificar que cumpla estrictamente con las reglas de negocio de la **Prueba de Aptitud Académica (PAA)**, los esquemas de TypeScript/SQL y la arquitectura definida a continuación.

---

## 1. Visión General y Problema que Resuelve
Plataforma Web Progresiva (PWA) diseñada para preparar aspirantes universitarios para la **PAA del College Board**.
- **Objetivo 1 (Optimización del aula presencial):** Permitir al profesor diagnosticar exactamente qué subtemas y qué tipo de errores (falta de teoría vs. lentitud vs. trampas de lectura) comete el grupo antes de llegar al salón de clases (Enfoque *Flipped Classroom* / Clase Invertida).
- **Objetivo 2 (Autonomía para estudiantes foráneos o asíncronos):** Proveer un entrenador virtual que no solo califique "bien o mal", sino que enseñe **cómo piensa el College Board**, revelando atajos de menos de 60 segundos (*Hacks PAA*) y explicando por qué cada distractor (opción incorrecta) es una trampa.

---

## 2. Stack Tecnológico y Reglas Técnicas
- **Framework Frontend:** React 19 + TypeScript (Next.js App Router o Vite) + Tailwind CSS + Lucide Icons.
- **Motor Matemático (OBLIGATORIO):** `KaTeX` (`react-katex`). Toda expresión matemática en enunciados, opciones, hoja de fórmulas y explicaciones debe renderizarse con soporte para `$inline$` y `$$block$$`.
- **Persistencia Offline-First (Crítico para Foráneos):** Uso de `IndexedDB` (vía `idb-keyval` o `Dexie.js`) o `localStorage` sincronizado con el estado global (`Zustand`). Si un alumno pierde conexión a mitad de un simulacro de 70 minutos, sus respuestas, banderas de revisión y el segundo exacto del temporizador deben persistir localmente y sincronizarse al recuperar la red.
- **Backend y Base de Datos:** Supabase (PostgreSQL + Auth + RLS) conectado mediante **Supabase MCP**.
- **Gráficas y Analítica:** `Recharts` o `Tremor` para el Dashboard del Profesor y el Semáforo del Estudiante.

---

## 3. Reglas Oficiales de la PAA (Innegociables)

### 3.1. Estructura de Secciones y Tiempos Oficiales
| Sección | Código Interno | Cantidad de Reactivos | Tiempo Límite | Reglas Especiales |
| :--- | :--- | :--- | :--- | :--- |
| **Lectura y Redacción** | `lectura_redaccion` | 60 preguntas | **65 minutos** | Dividido en *Lectura Crítica* (textos simples y dobles con líneas numeradas) y *Redacción Indirecta* (textos con oraciones numeradas `(1), (2)...` para mejorar estilo y cohesión). |
| **Matemáticas** | `matematicas` | 55 preguntas | **70 minutos** | **PROHIBIDO el uso de calculadora.** Combina preguntas de opción múltiple (`A, B, C, D`) y ejercicios de **Suplir Respuesta (`grid_in`)** al final de la prueba. Incluye hoja de fórmulas oficial. |
| **Inglés (Opcional)** | `ingles` | 50 preguntas | **50 minutos** | *Language Usage* y *Reading Comprehension*. Configurable según requerimiento de admisión. |

### 3.2. Regla de las 4 Opciones y Puntuación
1. **Siempre 4 opciones (`A`, `B`, `C`, `D`):** La PAA revisada **NO utiliza 5 opciones**. Está prohibido generar reactivos con opción `E`.
2. **Sin penalización por error:** Las respuestas incorrectas o en blanco valen `0` puntos brutos. El alumno siempre debe responder todas las preguntas antes de que se agote el reloj.

### 3.3. Especificación Exacta del Componente `Grid-in` (Suplir Respuesta en Matemáticas)
El componente interactivo de cuadrícula para las últimas preguntas de Matemáticas debe replicar la hoja de respuestas óptica del College Board:
- **Longitud máxima:** Exactamente **4 celdas/columnas**.
- **Caracteres permitidos:** Dígitos (`0-9`), barra de fracción (`/`) y punto decimal (`.`).
- **Restricciones:**
  - **No existen respuestas negativas** (no permitir el signo `-`).
  - La barra `/` no puede ir en la primera ni en la última celda (columna 1 o 4).
  - Solo puede haber un punto decimal `.` o una barra `/` en toda la respuesta.
  - Si el resultado es un número mixto (ej. $3\frac{1}{2}$), el alumno NO puede escribir `3 1/2` (porque se leería `31/2`). Debe ingresarlo como fracción impropia (`7/2`) o decimal (`3.5`).
  - Si es un decimal periódico (ej. $2/3 = 0.6666...$), se acepta `2/3`, `.666` o `.667`.

```typescript
// Función de validación oficial para el componente Grid-in que el agente debe implementar:
export function validateGridInInput(rawInput: string): { isValidFormat: boolean; error?: string } {
  const clean = rawInput.trim();
  if (clean.length === 0 || clean.length > 4) {
    return { isValidFormat: false, error: "La respuesta debe tener entre 1 y 4 caracteres." };
  }
  if (!/^[0-9./]+$/.test(clean)) {
    return { isValidFormat: false, error: "Solo se permiten números (0-9), punto decimal (.) o barra de fracción (/). No hay respuestas negativas." };
  }
  const slashCount = (clean.match(/\//g) || []).length;
  const dotCount = (clean.match(/\./g) || []).length;
  if (slashCount > 1 || dotCount > 1 || (slashCount === 1 && dotCount === 1)) {
    return { isValidFormat: false, error: "No puedes combinar fracciones y decimales ni usar múltiples signos." };
  }
  if (clean.startsWith('/') || clean.endsWith('/')) {
    return { isValidFormat: false, error: "La barra de fracción (/) no puede ir al inicio ni al final." };
  }
  return { isValidFormat: true };
}