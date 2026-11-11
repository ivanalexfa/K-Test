# 0005 · React Router, una URL por pantalla y el estado en dos contextos

- **Estado:** Aceptada
- **Fecha:** 2026-11-10
- **Módulo:** general
- **Autores:** Soham, con Claude Code

## Contexto

`App.tsx` (620 líneas) decidía qué pantalla mostrar con un `useState<'auth' | 'portal' | 'exam' | 'results'>`, y ahí mismo cargaba los datos, guardaba la sesión, llevaba el examen y su cronómetro y dibujaba la pantalla del examen. Por eso:

- La URL nunca cambiaba: «Atrás» sacaba al usuario de la app y no se podía compartir el enlace a una sección.
- Recargar la página cerraba la sesión.
- Cada pantalla nueva (landing, login nuevo, dashboard) habría tenido que meterse en ese mismo archivo.

## Decisión

1. **React Router 7** (`react-router`, modo declarativo con `<BrowserRouter>`). Todas las URLs viven en `src/rutas.ts`, y las pantallas navegan con esas funciones, nunca con cadenas sueltas.

   | URL | Pantalla | Quién |
   | :--- | :--- | :--- |
   | `/` | Landing (Fase 3); hoy, el acceso | Todos |
   | `/entrar` | Acceso con Google o Microsoft | Todos |
   | `/inicio/pruebas`, `/inicio/material`, `/inicio/resultados` | Pestañas del portal del estudiante | Estudiante |
   | `/examen/:clave` | Examen en curso (`simulacro`, `lectura`, `matematicas` o id de sprint) | Estudiante |
   | `/resultados/:intentoId` | Resultado y solucionario | Ambos |
   | `/docente` | Portal del docente | Docente |

2. **Rutas protegidas por rol** (`RequiereSesion`): sin sesión, a `/entrar`, y después de entrar vuelve a la página que pidió; con otro rol, a la pantalla de su rol.
3. **El estado sale de `App.tsx` a dos contextos** en `src/estado/`:
   - `SesionProvider` / `useSesion`: datos (usuarios, material, intentos), sesión, login, cohorte y CRUD de material.
   - `ExamenProvider` / `useExamen`: examen en curso, cronómetro, respuestas, entrega y último resultado. La lógica de puntaje y tiempos se movió sin cambios.
4. **La sesión sobrevive a una recarga:** se guarda solo el id del usuario en `sessionStorage` (`ktest_usuario`), que se borra al salir o al cerrar la pestaña.
5. **El examen no se reinicia solo.** Si se abre `/examen/...` sin un examen en curso (enlace directo o recarga a mitad del examen), se muestra «Empezar examen» y se avisa que las respuestas de antes no se guardaron. Guardar el examen a medias (offline) es trabajo aparte (ver `SPEC.md`).
6. **Las pantallas viven en `src/paginas/`** y conectan rutas y contextos con los componentes que ya existían (`StudentDashboard`, `TeacherDashboard`, `ResultsView`…), que casi no cambian. `StudentDashboard` acepta `tab` y `onChangeTab` para que la pestaña salga de la URL.
7. Se borra `LandingView.tsx`, que nadie usaba. La landing nueva llega en la Fase 3.

## Alternativas consideradas

- **TanStack Router:** tipado de rutas más estricto, pero agrega otra librería y otro modelo que Iván no conoce; React Router es el estándar.
- **Modo de datos de React Router** (`createBrowserRouter`, loaders): los datos se cargan una vez al inicio desde `/api/bootstrap` y no por ruta, así que no aporta nada todavía.
- **Zustand para el estado** (lo menciona `SPEC.md`): dos contextos alcanzan para este tamaño; se puede migrar si el estado crece.
- **Reiniciar el examen solo al recargar:** se descartó porque el estudiante perdería respuestas sin enterarse.

## Consecuencias

- «Atrás», los enlaces directos y la recarga funcionan; lo cubren 11 pruebas en `e2e/rutas.spec.ts` (en escritorio y celular).
- Vercel ya reescribe toda ruta que no es `/api` a `index.html` (`vercel.json`), así que las URLs funcionan en producción sin cambios.
- **Pantalla nueva:** su componente en `src/paginas/`, su URL en `src/rutas.ts`, su `<Route>` en `App.tsx` (dentro de `RequiereSesion` si es privada) y su prueba en `e2e/`.
