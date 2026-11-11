# DESIGN.md · K-test, un producto de Key Institute

**Versión 1.0 · 10 de noviembre de 2026.** Sistema de diseño vivo: se actualiza en el mismo PR que cambia la interfaz.

K-test **no es una sub-marca**. Se ve y se siente como una extensión de [keyinstitute.com](https://www.keyinstitute.com/): mismo logo, misma fuente, mismos colores, mismas proporciones. «K-test» es solo el nombre del producto.

**De dónde sale.** Todo lo de este documento se midió en el sitio de Key (a 1440 px, con las herramientas del navegador), en su portal de admisiones (`admisiones.keyinstitute.com`), en su formulario de información (`info.keyinstitute.com/admisiones`) y en su Instagram ([@keyinstitute.sv](https://www.instagram.com/keyinstitute.sv/)), siguiendo la auditoría por canal de la skill `brand`. Las decisiones que tomó el equipo sobre esa base se marcan como **Decisión K-test**.

## Referencia rápida

| | |
| :--- | :--- |
| Color principal | Azul Key `#006DFF`, sobre blanco y negro |
| Fuente | Albert Sans (300–700) |
| Botón principal | Pastilla azul (`rounded-full`), texto blanco |
| Borde característico | Línea fina de 0.8 px en negro |
| Voz | Directa, segura, de ingeniería: «Aprende haciendo», «Ingenieros para la vida» |
| Tokens | `src/index.css` (`@theme`) |

## 1. Color

### Principales
| Nombre | Hex | Token | Uso |
| :--- | :--- | :--- | :--- |
| Negro | `#000000` | `key-negro` | Barras de anuncio, botones secundarios, bordes finos |
| Blanco | `#FFFFFF` | `key-blanco` | Fondo general |
| Azul Key | `#006DFF` | `key-azul` | Botón principal, bloques de llamado, enlaces, foco |
| Azul Key (hover) | `#0058D1` | `key-azul-hover` | Estado hover/activo del azul. **Decisión K-test** (Key no lo define) |

### Neutros
| Nombre | Hex | Token | Uso |
| :--- | :--- | :--- | :--- |
| Tinta | `#111111` | `key-tinta` | Titulares; fondo oscuro de los hero de carrera |
| Texto | `#333333` | `key-texto` | Texto corrido (12.6:1 sobre blanco) |
| Texto suave | `#5C6670` | `key-texto-suave` | Texto secundario (5.9:1). **Decisión K-test** |
| Gris | `#E3E7E8` | `key-gris` | Footer, divisores suaves |
| Gris claro | `#F5F7FA` | `key-gris-claro` | Fondos de sección (logos de aliados en Key) |

### Carreras: solo acentos
Cada carrera de Key tiene un color y un ícono (un trozo del isotipo). Nunca compiten con el azul.

| Carrera | Hex | Token | Ícono |
| :--- | :--- | :--- | :--- |
| Ingeniería y Ciencias de la Computación Integradas | `#31E083` | `carrera-computacion` | `public/brand/key/carreras/computacion.svg` |
| Ingeniería Industrial y Manufactura Avanzada | `#F5F500` | `carrera-industrial` | `…/industrial.svg` |
| Ingeniería Mecatrónica y Robótica | `#9746FF` | `carrera-mecatronica` | `…/mecatronica.svg` |
| Ingeniería Química y Procesos Digitales | `#FC8524` | `carrera-quimica` | `…/quimica.svg` |

- En Key, cada carrera es un bloque de color plano con su ícono y su nombre en negro, y el botón de su página va en su color con texto negro.
- **Decisión K-test:** los colores de carrera aparecen **en la landing**, en las fichas de «¿Por qué estudiar en Key?» y de carreras. En el resto de la app no se usan, para que nada compita con «Empezar a practicar».

### Degradado
`linear-gradient(90deg, #006DFF, #FBD2FF 63%, #F5F500)` (variable `--key-degradado`). Key lo usa **solo como franja fina** (unos 6 px) bajo las barras negras de «Admisiones». Nunca como fondo de un bloque.

### Estados (**Decisión K-test**)
Key no define colores de estado. Para resultados, pistas y descartes del examen:

| Estado | Texto | Fondo | Contraste del texto |
| :--- | :--- | :--- | :--- |
| Éxito | `#0B7A43` `estado-exito` | `#E8FBF1` `estado-exito-fondo` | 5.4:1 |
| Alerta | `#7A5A00` `estado-alerta` | `#FEFBD6` `estado-alerta-fondo` | 6.4:1 |
| Error | `#C2261E` `estado-error` | `#FDECEB` `estado-error-fondo` | 5.9:1 |

### Contraste (WCAG 2.1 AA)
| Combinación | Ratio | ¿Se puede? |
| :--- | :--- | :--- |
| Blanco sobre azul Key | 4.53:1 | Sí, cualquier tamaño (justo: no aclarar el azul) |
| Azul Key sobre blanco | 4.53:1 | Sí |
| Negro sobre verde / amarillo / naranja / morado | 12.1 / 17.9 / 8.5 / 4.6 | Sí |
| Blanco sobre verde o amarillo | 1.7 / 1.1 | **Nunca** |
| Blanco sobre morado | 4.53:1 | Sí, pero Key usa negro; seguimos a Key |
| Azul o morado sobre `#111` | 4.2:1 | Solo texto grande (≥ 24 px, o ≥ 18.7 px en negrita) |

## 2. Tipografía

**Albert Sans** en todo (Google Fonts, pesos 300–700). Key usa Montserrat solo en detalles sueltos; K-test no la carga. **JetBrains Mono** solo para cifras alineadas: cronómetro, puntajes, numeración de líneas (`font-mono-num`).

### Escala medida en keyinstitute.com (escritorio)
| Uso en Key | Tamaño / interlineado | Peso | Extra |
| :--- | :--- | :--- | :--- |
| Titular gigante | 85 / 89 px (1.05) | 700 | `letter-spacing: -0.48px` |
| Titular en mayúsculas | 60 / 80 px | 400 | mayúsculas, fino |
| Subtítulo grande | 45 / 51 px | 300 | fino |
| Título de sección | 42–45 / 55 px | 500 | |
| Botón de anuncio («Admisiones 2027») | 32 px | 700 | |
| Texto | 20 / 30 px (1.5) | 400 | |
| Texto de tarjeta | 20 / 25 px | 400 | |
| Menú | 16 px | 400 | |
| Etiqueta de sección («• Qué es Key») | 16 / 20 px | 700 | con viñeta, no en mayúsculas |

### Escala de K-test (**Decisión K-test**)
La misma lógica, reducida para una app que se usa más tiempo y en celular:

| Rol | Escritorio | Celular | Peso | Tailwind |
| :--- | :--- | :--- | :--- | :--- |
| Display (hero de la landing) | 72 / 76 px | 40 / 44 px | 700, `-0.02em` | `text-[72px]` / `text-[40px]` |
| H1 de pantalla | 44 / 52 px | 30 / 36 px | 600 | |
| H2 de sección | 30 / 38 px | 24 / 30 px | 600 | |
| H3 de tarjeta | 20 / 28 px | 18 / 26 px | 600 | |
| Texto grande (intro) | 20 / 30 px | 18 / 28 px | 400 | |
| Texto | 16 / 26 px | 16 / 26 px | 400 | |
| Pequeño | 14 / 20 px | 14 / 20 px | 400–500 | |

- Titulares en frase normal (mayúscula inicial), como Key. Nada de etiquetas en MAYÚSCULAS con espaciado amplio.
- Líneas de texto de máximo ~70 caracteres (`max-w-prose`); Key limita sus párrafos a 940 px.
- `text-wrap: balance` en titulares.

## 3. Layout y proporciones

| Medida de Key (1440 px) | Valor | En K-test |
| :--- | :--- | :--- |
| Ancho del contenido | 1345 px, casi de borde a borde | `max-w-[1360px]` con `px-5 sm:px-8 lg:px-10` |
| Margen lateral | ~40 px | 20 / 32 / 40 px según ancho |
| Ancho de texto largo | 940 px | `max-w-[940px]` |
| Alto de sección | 460–1100 px (una idea por sección) | `py-16 lg:py-24` |
| Separaciones | 16, 30 y 40 px | Escala de Tailwind 4 / 8 / 10 |
| Encabezado de páginas internas | Blanco, fijo al bajar (`sticky`), con borde fino abajo | Igual |

- **Bloques que se tocan**, separados por bordes finos de 0.8 px, no por tarjetas flotantes con sombra. Las sombras casi no existen en Key.
- **Menú hecho de celdas:** cada opción es una celda con borde fino (49 px de alto, 20 px de relleno lateral). La celda de la sección activa se pinta del color de esa sección.
- **Radios:** 0 en bloques, campos y celdas; pastilla (`rounded-full`) solo en botones. **Decisión K-test:** las tarjetas de la app pueden llevar `rounded-2xl` (16 px) cuando agrupan contenido interactivo, pero nunca botones cuadrados.

## 4. Componentes

### Botones
| Tipo | Fondo | Texto | Alto | Relleno | Radio |
| :--- | :--- | :--- | :--- | :--- | :--- |
| Principal | `key-azul` → hover `key-azul-hover` | blanco | 49 px (72 px en hero) | 24 px lateral | pastilla |
| Secundario | `key-negro` | blanco | 49 / 72 px | 24 px | pastilla |
| Carrera (solo landing) | color de la carrera | negro | 49 px | 24 px | pastilla |
| Fantasma | transparente, borde 0.8 px negro | negro | 49 px | 20 px | pastilla |
| Flecha circular | `boton-flecha.svg`: círculo negro con flecha blanca | | 83 px | | círculo |

Hover: `transition: transform, background-color 0.2s var(--ease-key)` (leve rebote). Foco visible: anillo de 2 px en `key-azul` con 2 px de separación. Con `prefers-reduced-motion`, sin rebote.

### Campos de formulario
Cuadrados (radio 0), 40 px de alto, borde 0.8 px negro, texto 16 px, etiqueta arriba (como el formulario de Key).

### Barra de admisiones
Barra negra de lado a lado con «Admisiones 2027 →» en blanco (32 px, 700) y la franja degradada debajo. Lleva a `https://admisiones.keyinstitute.com/login`. Key la usa arriba de todo y al final de cada página, después de un bloque azul con un titular grande en blanco.

### Encabezado
Fondo blanco, logo horizontal de Key a la izquierda, celdas del menú y el botón principal en pastilla azul a la derecha; fijo al bajar. **Decisión K-test:** «Empezar a practicar» es el único botón destacado del encabezado de la landing.

## 5. Logo

Archivos (vector) en `public/brand/key/`, tomados del sitio de Key. Componente: `src/components/brand/LogoKey.tsx`.

| Variante | Archivo | Uso |
| :--- | :--- | :--- |
| Horizontal («key \| Instituto Kriete de Ingeniería y Ciencias») | `logo-key-horizontal-{negro,blanco}.svg` (409×69) | Encabezados de escritorio |
| Isotipo + «key» | `key-wordmark-{negro,blanco}.svg` (204×84) | Celular, espacios chicos |
| Isotipo en círculo azul | `public/favicon.svg` | Favicon (como el avatar de Instagram de Key) |

- **El nombre junto al logo:** «K-TEST» en mayúsculas, Albert Sans 600 con `letter-spacing: 0.04em`, separado del logo de Key por una línea vertical fina, en sintonía con «INSTITUTO KRIETE DE INGENIERÍA Y CIENCIAS». Nunca un logotipo propio. **Decisión K-test (10 nov):** se probaron «K-test», «K-Test» y «K-TEST» junto al logo; en minúsculas se veía débil y «K-TEST» acompaña mejor al logo de Key.
- **En el texto corrido** (títulos de página, frases) el producto se escribe **«K-Test»**: en mayúsculas dentro de una frase se lee como un grito.
- **Negro** sobre blanco o gris claro; **blanco** sobre negro, `#111`, azul Key o fotos oscuras.
- Alto mínimo: 32 px el horizontal, 24 px el isotipo. Espacio libre alrededor: el alto del isotipo.
- No se deforma, no se recolorea con colores de carrera, no se le ponen sombras ni degradados.

## 6. Íconos

- **De carrera:** los 4 SVG de `public/brand/key/carreras/`, en `currentColor`, para pintarlos con el color de su carrera o en negro.
- **De interfaz:** `lucide-react`, trazo de 1.5–2 px, en negro o `key-texto`. Sin contenedores de colores de fondo (los «chips» de íconos tipo SaaS no son de Key).
- **Del examen:** `src/components/brand/KTestIcons.tsx` (tachar opción, pista) se conservan y se recolorean con los tokens.

## 7. Fotografía

- **En el sitio:** blanco y negro, alternando con bloques de color plano; video en el hero.
- **En Instagram:** a color, en tonos fríos y naturales: estudiantes trabajando en grupo, laboratorios, proyectos reales (Fórmula SAE, Hopper Project, STEMLAB), eventos.
- **Decisión K-test:** fotos **a color** de estudiantes reales, en situaciones de aprendizaje (grupo, laboratorio, clase), porque K-test le habla a un aspirante que se imagina ahí. Sobre una foto, el texto va en blanco con un velo negro de 40–60 % para asegurar el contraste.
- Archivos en `public/brand/fotos/` (WebP de 800 y 1600 px, `npm run fotos`). Origen de cada una en `docs/marca/fotos-originales/FUENTES.md`. Las portadas de reel solo sirven para tarjetas o celular.
- Pendiente: fotos oficiales y visto bueno de Key.

## 8. Estilo gráfico de las publicaciones (referencia)

En Instagram, Key usa fondos azul Key o negros con titular blanco en negrita, el isotipo blanco, una cuadrícula tipo plano de ingeniería, bloques sueltos como píxeles en los colores de carrera y stickers del isotipo en collage. **Decisión K-test:** la cuadrícula fina y los bloques tipo píxel se pueden usar como textura puntual (un solo momento por pantalla, como el hero), nunca como fondo general.

## 9. Movimiento

- Hover de botones: 0.2 s, `cubic-bezier(0.175, 0.885, 0.32, 1.275)` (`--ease-key`), leve rebote.
- Cambios de fondo: 0.2–0.3 s.
- **Decisión K-test** (skills `frontend-design` y `web-design-guidelines`): un solo momento de movimiento orquestado por pantalla (por ejemplo, la entrada del hero); nada de animar cada sección al aparecer. Animar solo `transform` y `opacity`, nunca `transition: all`, y respetar siempre `prefers-reduced-motion`.

## 10. Voz

- **Lemas:** «Ingenieros para la vida», «Impulsando ingenieros para la vida», «Somos los que sueñan y construyen», campaña «The Do Generation · Aprende haciendo».
- **Valores:** Integridad, Curiosidad, Innovación, Servicio, Respeto, Excelencia.
- **Tono:** directo, seguro, cercano; habla de tú al aspirante; frases cortas y verbos de acción.
- **Decisión K-test:** los textos de la interfaz en español con mayúscula inicial solamente, voz activa, botones que dicen lo que hacen («Empezar a practicar», no «Continuar»), errores que dicen cómo resolverlo.

| En K-test somos | No somos |
| :--- | :--- |
| Directos: «Practica la PAA a tu ritmo» | Corporativos: «Plataforma integral de preparación» |
| Prácticos: «Empieza con un sprint de 10 minutos» | Vagos: «Mejora tu desempeño» |
| Cercanos: «Así vas» | Fríos: «Reporte de rendimiento» |

## Historial

- **1.0 (2026-11-10):** primera versión a partir del análisis de Key (Fase 1, `feat/marca-key`).
- **1.1 (2026-11-10):** «K-TEST» junto al logo y «K-Test» en el texto (Fase 3, `feat/landing`).
