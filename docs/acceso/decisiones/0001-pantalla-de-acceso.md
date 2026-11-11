# 0001 · Pantalla de acceso como la de Key, con Google y Microsoft al mismo nivel

- **Estado:** Aceptada
- **Fecha:** 2026-11-10
- **Módulo:** acceso
- **Autores:** Soham, con Claude Code

## Contexto

La pantalla de acceso (`/entrar`, `AuthView`) era también la portada: fondo azul marino con brillos, un titular, la tarjeta de login y tres tarjetas de presentación. Ahora la presentación vive en la landing (`/`), así que esta pantalla solo tiene que dejar entrar. La referencia es el login del portal de admisiones de Key: fondo oscuro, tarjeta blanca con el logo de Key y lo mínimo para entrar.

## Decisión

1. **Fondo negro de Key y una tarjeta blanca** (radio de 4 px, como el portal de Key) con el isotipo y «K-TEST», el título «Te damos la bienvenida» y una línea que explica que la cuenta se crea al entrar la primera vez.
2. **Google y Microsoft con el mismo peso:** dos pastillas iguales (blancas, borde fino negro, logo del proveedor). El usuario elige según la cuenta que tenga; ninguna se impone.
3. **La regla del docente a la vista:** «¿Eres docente? Entra con tu cuenta de Microsoft de Key (@keyinstitute.edu.sv)». El rol se sigue detectando solo por el dominio del correo.
4. **«Volver al inicio»** lleva a la landing.
5. **Se conserva toda la lógica:** Google y Microsoft reales, el simulador de Microsoft cuando no hay `VITE_MSAL_CLIENT_ID` y el panel de cuentas demo (solo con `VITE_ENABLE_DEMO_ACCOUNTS=true`). Se rediseñaron con los tokens de Key; el panel demo dice que es solo de desarrollo.
6. **Origen en desarrollo:** si se abre la app por `127.0.0.1`, pasa sola a `localhost`, el único origen que aceptan Google y Microsoft (`src/main.tsx`). Para usar `import.meta.env` con tipos se agrega `src/vite-env.d.ts`.

## Alternativas consideradas

- **Microsoft como botón principal (negro) y Google secundario:** así estaba antes. Pero la mayoría de aspirantes entrará con su cuenta personal de Google; solo los docentes necesitan Microsoft. No hay razón para jerarquizar.
- **Formulario de correo y contraseña como en Key:** K-Test no guarda contraseñas; el login único con el portal de admisiones queda pendiente con TI de Key.

## Consecuencias

- Menos elementos y ningún clic de más: dos botones y un enlace de regreso.
- A 320 px cada botón cabe en una línea (lo revisa `e2e/acceso.spec.ts`).
- Si Key habilita el login único de su portal, esta pantalla cambiará a un solo botón «Entrar con tu cuenta de Key».
