# 0004 · Cada fase va directo a `main` con su PR, en paralelo

- **Estado:** Aceptada. Reemplaza el punto 3 del ADR [0001](0001-flujo-de-trabajo-ramas-y-pr.md) (rama de integración).
- **Fecha:** 2026-11-10
- **Módulo:** general
- **Autores:** Soham, con Claude Code

## Contexto

El ADR 0001 proponía una rama de integración, `rediseno/estudiante`, donde entraría cada fase antes de un único PR a `main` el jueves. En la práctica:

- Iván agregó `.github/CODEOWNERS` (`* @ivanalexfa @casoham`) y una regla en `main`: **1 aprobación de un code owner, y quien hizo el último push no puede aprobar**. Soham puede aprobar los PR de Iván y viceversa, pero nadie los suyos.
- Con la rama de integración, cada cambio necesitaba **dos** aprobaciones (la del PR de la tarea y la del PR final). La Fase 0 (PR #8) quedó aprobada y fusionada en `rediseno/estudiante`, pero no en `main`.
- Iván no va a poder aprobar cada fase en el momento, así que el trabajo no puede depender de una cadena de aprobaciones.

## Decisión

1. **Cada fase abre su PR directo a `main`**, y entra en cuanto Iván la aprueba. Se deja de usar `rediseno/estudiante` (se borra cuando su contenido esté en `main`).
2. **En paralelo:** una fase que no depende de otra sale de `main`. Una que sí depende (por ejemplo, la landing necesita los tokens de la marca) sale de la rama de la fase que necesita. Su PR apunta igual a `main`, y GitHub deja de mostrar los commits de la fase anterior en cuanto esta se fusiona.
3. **Para no saturar a Iván**, cada PR es pequeño, lleva capturas y dice qué revisar primero; las fases sin cambios visibles (documentación, herramientas) se pueden revisar más rápido.
4. Se mantiene el resto del ADR 0001: nunca push directo a `main`, una rama por tarea, Conventional Commits en español y el CI en verde antes de fusionar.

## Alternativas consideradas

- **Seguir con la rama de integración:** dos aprobaciones por cambio y `main` sin nada hasta el jueves.
- **Pedir que Soham pueda aprobar sus propios PR:** le quita sentido a la revisión y contradice la regla de Iván.

## Consecuencias

- `main` recibe el trabajo por partes y se puede probar antes del jueves.
- Si un PR del que dependen otros espera revisión, los siguientes se apilan sobre su rama; cuando se fusiona, se actualizan con `main`.
- `docs/PLAN.md` y `AGENTS.md` se actualizan para quitar la rama de integración.
