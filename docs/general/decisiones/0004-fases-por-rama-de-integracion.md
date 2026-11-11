# 0004 · Las fases entran a `rediseno/estudiante` y llegan a `main` en pocas entregas

- **Estado:** Aceptada. Confirma la rama de integración del ADR [0001](0001-flujo-de-trabajo-ramas-y-pr.md) y fija quién aprueba qué.
- **Fecha:** 2026-11-10
- **Módulo:** general
- **Autores:** Soham, con Claude Code

## Contexto

Iván agregó `.github/CODEOWNERS` (`* @ivanalexfa @casoham`) y un ruleset, «Protección a Main», que **solo protege `main`**:
- Cada PR a `main` necesita 1 aprobación de un code owner.
- Quien hizo el último push no puede aprobar. Soham aprueba los PR de Iván y viceversa, pero nadie los suyos.

Las demás ramas no tienen reglas. Iván no va a poder aprobar cada fase del rediseño antes del jueves, y las fases dependen unas de otras (marca → landing → login → dashboard).

Se probó por un momento abrir cada fase directo a `main` (PR #10 y #11). Se descartó: obligaba a Iván a aprobar unos 8 PR y a apilar ramas mientras tanto.

## Decisión

1. **Cada fase sale de `rediseno/estudiante` y abre su PR contra esa rama.** El CI corre en cada PR, y Soham lo fusiona en cuanto pasa, sin esperar aprobación (la rama no está protegida).
2. **`rediseno/estudiante` llega a `main` en pocas entregas**, cada una con un PR que Iván revisa: la principal, el jueves 12 de noviembre de 2026, con la marca, la landing, el login y el dashboard.
3. El PR de cada entrega enlaza los PR internos y sus ADR, y trae capturas de antes y después, para que Iván pueda revisarlo aunque sea grande.
4. Si Iván cambia algo en `main` mientras tanto, se trae `main` a `rediseno/estudiante` con un merge (nunca rebase ni force-push).
5. Sigue igual lo demás del ADR 0001: una rama por tarea, Conventional Commits en español, CI en verde antes de fusionar y nunca push directo a `main`.

## Alternativas consideradas

- **Cada fase directo a `main`:** unas 8 aprobaciones de Iván antes del jueves, con las fases bloqueadas esperando la anterior.
- **Una sola rama de Soham sin PR por fase:** se pierden el CI por fase y el registro de cada cambio, y el PR final no tendría estructura.

## Consecuencias

- Soham avanza sin esperar, con CI y registro por fase.
- El PR de cada entrega a `main` es grande; se compensa con PR internos pequeños y bien descritos.
- `main` no tiene el rediseño hasta la primera entrega. La vista previa de Vercel de cada PR permite mostrarlo antes.
