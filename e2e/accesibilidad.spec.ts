import { createRequire } from 'node:module';
import type { Page } from '@playwright/test';
import { test, expect } from './ayudantes';

/**
 * Revisión automática de accesibilidad (WCAG 2.1 A y AA) con axe-core en cada pantalla.
 * Falla con cualquier problema serio o crítico, incluido el contraste de color.
 * Fase 7 del plan; la accesibilidad AA no se negocia (CLAUDE.md).
 */
const rutaAxe = createRequire(import.meta.url).resolve('axe-core');

interface Problema {
  id: string;
  impact: string | null;
  help: string;
  nodes: { target: string[] }[];
}

async function revisar(page: Page) {
  await page.addScriptTag({ path: rutaAxe });
  const problemas = await page.evaluate(async () => {
    // @ts-expect-error axe se inyecta en la página
    const r = await window.axe.run(document, { runOnly: ['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa'] });
    return r.violations as Problema[];
  });
  return problemas
    .filter((p) => p.impact === 'serious' || p.impact === 'critical')
    .map((p) => `${p.id} (${p.impact}): ${p.help} → ${p.nodes.slice(0, 3).map((n) => n.target.join(' ')).join(' | ')}`);
}

async function entrarComo(page: Page, id: string) {
  await page.addInitScript((u) => window.sessionStorage.setItem('ktest_usuario', u), id);
}

/** Recorre la página con Tab y devuelve los elementos que reciben foco sin indicador visible. */
async function focoSinIndicador(page: Page, pasos = 40) {
  const sinIndicador = new Set<string>();
  for (let i = 0; i < pasos; i++) {
    await page.keyboard.press('Tab');
    const r = await page.evaluate(() => {
      const e = document.activeElement as HTMLElement | null;
      if (!e || e === document.body) return null;
      const s = getComputedStyle(e);
      const visible = (s.outlineStyle !== 'none' && parseFloat(s.outlineWidth) > 0) || s.boxShadow !== 'none';
      return visible ? '' : (e.getAttribute('aria-label') || e.textContent || e.tagName).trim().slice(0, 40);
    });
    if (r) sinIndicador.add(r);
  }
  return [...sinIndicador];
}

test.describe('Teclado: todo lo que recibe foco lo muestra', () => {
  test('inicio del estudiante, examen y portal del docente', async ({ page, isMobile }) => {
    test.skip(isMobile, 'El recorrido con Tab se revisa en escritorio');
    await entrarComo(page, 'stu-1');
    await page.goto('/inicio');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await focoSinIndicador(page), '/inicio').toEqual([]);

    await page.goto('/examen/sprint-math-1');
    await page.getByRole('button', { name: 'Empezar examen' }).click();
    await expect(page.getByRole('button', { name: /Siguiente/ })).toBeVisible();
    expect(await focoSinIndicador(page, 25), 'examen').toEqual([]);
  });

  test('portal del docente', async ({ page, isMobile }) => {
    test.skip(isMobile, 'El recorrido con Tab se revisa en escritorio');
    await entrarComo(page, 'tch-1');
    await page.goto('/docente');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await focoSinIndicador(page, 30), '/docente').toEqual([]);
  });
});

test.describe('Accesibilidad (axe, WCAG AA)', () => {
  test('landing y acceso', async ({ page }) => {
    for (const ruta of ['/', '/entrar']) {
      await page.goto(ruta);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await revisar(page), ruta).toEqual([]);
    }
  });

  test('portal del estudiante', async ({ page }) => {
    await entrarComo(page, 'stu-1');
    for (const ruta of ['/inicio', '/inicio/pruebas', '/inicio/material', '/inicio/resultados']) {
      await page.goto(ruta);
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
      expect(await revisar(page), ruta).toEqual([]);
    }
  });

  test('examen y solucionario', async ({ page }) => {
    await entrarComo(page, 'stu-1');
    await page.goto('/examen/sprint-read-2');
    expect(await revisar(page), 'empezar examen').toEqual([]);
    await page.getByRole('button', { name: 'Empezar examen' }).click();
    await expect(page.getByRole('button', { name: /Siguiente/ })).toBeVisible();
    expect(await revisar(page), 'examen').toEqual([]);

    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: /Siguiente/ }).click();
    await page.getByRole('radio').first().click();
    await page.getByRole('button', { name: /Entregar y Guardar/ }).click();
    await page.getByRole('button', { name: /Guardar y Ver Resultados/ }).click();
    await expect(page).toHaveURL(/\/resultados\//);
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await revisar(page), 'solucionario').toEqual([]);
  });

  test('portal del docente', async ({ page }) => {
    await entrarComo(page, 'tch-1');
    await page.goto('/docente');
    await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    expect(await revisar(page), 'resultados').toEqual([]);
    const material = page.getByRole('navigation', { name: 'Portal del docente' }).getByRole('button', { name: /Material/ });
    await material.click();
    await expect(material).toHaveAttribute('aria-current', 'page');
    // Espera a que termine la transición de color de la celda activa antes de medir el contraste.
    await page.waitForTimeout(400);
    expect(await revisar(page), 'material').toEqual([]);
  });
});
