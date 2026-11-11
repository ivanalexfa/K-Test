import { test, expect } from './ayudantes';

test.describe('Acceso', () => {
  test('ofrece Google y Microsoft con el mismo peso y explica cómo entra un docente', async ({ page }) => {
    await page.goto('/entrar');

    await expect(page.getByRole('heading', { level: 1, name: 'Te damos la bienvenida' })).toBeVisible();
    const google = page.getByRole('button', { name: 'Continuar con Google' });
    const microsoft = page.getByRole('button', { name: 'Continuar con Microsoft' });
    await expect(google).toBeVisible();
    await expect(microsoft).toBeVisible();

    const [altoGoogle, altoMicrosoft] = await Promise.all([
      google.evaluate((b) => b.getBoundingClientRect().height),
      microsoft.evaluate((b) => b.getBoundingClientRect().height),
    ]);
    expect(altoGoogle).toBe(altoMicrosoft);

    await expect(page.getByText(/¿Eres docente\?/)).toContainText('@keyinstitute.edu.sv');
  });

  test('«Volver al inicio» regresa a la landing', async ({ page }) => {
    await page.goto('/entrar');
    await page.getByRole('link', { name: 'Volver al inicio' }).click();
    await expect(page).toHaveURL(/\/$/);
    await expect(page.getByRole('heading', { level: 1 })).toContainText('Practica y prepárate');
  });

  test('los botones caben en una línea a 320 px', async ({ page }) => {
    await page.setViewportSize({ width: 320, height: 700 });
    await page.goto('/entrar');
    await expect(page.getByRole('button', { name: 'Continuar con Microsoft' })).toBeVisible();

    const problemas = await page.evaluate(() => ({
      desborde: document.documentElement.scrollWidth - document.documentElement.clientWidth,
      botonesPartidos: [...document.querySelectorAll('main button')]
        .slice(0, 2)
        .filter((b) => b.getBoundingClientRect().height > 60).length,
    }));
    expect(problemas).toEqual({ desborde: 0, botonesPartidos: 0 });
  });
});
