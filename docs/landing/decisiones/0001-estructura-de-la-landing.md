# 0001 · Estructura de la landing: un solo llamado y la lógica del Tec con el estilo de Key

- **Estado:** Aceptada
- **Fecha:** 2026-11-10
- **Módulo:** landing
- **Autores:** Soham, con Claude Code (skills `frontend-design`, `ui-ux-pro-max` y `web-design-guidelines`)

## Contexto

Antes, la primera pantalla era el login con mucho contenido alrededor. La landing tiene que convencer al admitido de practicar y llevarlo a entrar con el menor esfuerzo. Las referencias:
- El simulador del Tec de Monterrey, con su orden de venta: hero con foto, beneficios, «¿Por qué estudiar…?», admisiones y cierre. Key diseñó su modelo educativo con el Tec.
- El sitio de Key, con su estilo (`docs/marca/DESIGN.md`).

## Decisión

1. **Un solo llamado a la acción, «Empezar a practicar»**, en el encabezado (siempre visible) y en el hero; lleva a `/entrar`. No hay «Registrarse» ni «Iniciar sesión» por separado: con Google o Microsoft entrar y registrarse son lo mismo.
2. **Orden de las secciones:**
   1. Encabezado blanco y fijo, con el logo de Key, «K-TEST» y la pastilla azul (en celular, el isotipo y «Empezar»).
   2. Hero: foto de estudiantes de Key a sangre, velo negro a la izquierda y titular gigante en blanco alineado a la izquierda: «Practica y prepárate para tu prueba de admisión».
   3. Frase de presentación grande y fina (como el sitio de Key) y **tres beneficios**: Conoce la prueba, Prepárate a tu ritmo, Sin costo. Van en celdas que se tocan con borde fino, no en tarjetas con sombra.
   4. «¿Por qué estudiar en Key?»: cuatro fichas tomadas de «Por qué elegirnos» de keyinstitute.com, cada una en el **color de una carrera** (sin ícono, para que no compita con el texto), con enlace a la página de Key de ese tema.
   5. Bloque azul con una frase del sitio de Key («Una universidad para ingenieros con una misión. Para los que imaginan, y hacen.») y la barra negra **«Admisiones 2027»** con la franja degradada, hacia `https://admisiones.keyinstitute.com/login`. La flecha se mueve al pasar el mouse, como en Key.
   6. Footer gris con el logo, «Pide información» (el formulario de Key, opcional), carreras y redes oficiales.
3. **Lo memorable es una sola cosa:** el hero con el titular gigante sobre la foto. El resto es sobrio. El único movimiento automático es la entrada del texto del hero, y no se mueve con `prefers-reduced-motion`.
4. **Textos verdaderos:** se dice lo que hay hoy (simulacro de Lectura y Redacción y Matemáticas, sprints por materia, puntaje estimado de 400 a 1600, gratis). No se prometen cantidades ni tiempos oficiales que el banco de preguntas todavía no tiene.

## Alternativas consideradas

- **Formulario de registro a la derecha, como el Tec:** K-test no pide datos (entra con Google o Microsoft y los datos del aspirante saldrán del portal de admisiones de Key), así que un formulario agregaría pasos sin sentido.
- **Hero dividido (texto a la izquierda, foto a la derecha):** más genérico. Los hero de carrera de Key ponen el titular grande sobre la imagen o el fondo oscuro.
- **Una pregunta de práctica interactiva en el hero:** muestra el producto, pero compite con «Empezar a practicar». Queda como idea para «Conoce la prueba».

## Consecuencias

- `/` es la landing y `/entrar` el acceso. Un usuario con sesión que va a `/entrar` pasa directo a su pantalla.
- Las fichas y el bloque de admisiones dependen de URLs de keyinstitute.com: si Key cambia su sitio, hay que revisarlas.
- Pruebas: `e2e/inicio.spec.ts` revisa el llamado, las secciones, los enlaces y que nada se salga de la pantalla de 1280 a 320 px.
