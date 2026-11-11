import { test, expect } from './ayudantes';

test.describe('Landing', () => {
  test('presenta K-test y «Empezar a practicar» lleva al acceso', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/K-test/);
    await expect(
      page.getByRole('heading', { level: 1, name: 'Llega a la PAA sabiendo qué esperar.' }),
    ).toBeVisible();
    await expect(page.getByRole('img', { name: 'Key Institute' }).first()).toBeVisible();

    await page.getByRole('link', { name: 'Empezar a practicar' }).last().click();
    await expect(page).toHaveURL(/\/entrar$/);
    await expect(page.getByText('Continuar con Google')).toBeVisible();
    await expect(page.getByText('Continuar con Microsoft')).toBeVisible();
  });

  test('tiene los tres beneficios, las fichas de Key y el enlace a admisiones', async ({ page }) => {
    await page.goto('/');

    for (const titulo of ['Conoce la prueba', 'Prepárate a tu ritmo', 'Sin costo']) {
      await expect(page.getByRole('heading', { level: 3, name: titulo })).toBeVisible();
    }
    await expect(page.getByRole('heading', { name: '¿Por qué estudiar en Key?' })).toBeVisible();
    await expect(page.getByRole('link', { name: /Descubre nuestras carreras/ })).toHaveAttribute(
      'href',
      'https://www.keyinstitute.com/carreras',
    );
    await expect(page.getByRole('link', { name: /Admisiones 2027/ })).toHaveAttribute(
      'href',
      'https://admisiones.keyinstitute.com/login',
    );
  });

  test('ningún elemento se sale de la pantalla, de 1280 a 320 px', async ({ page }) => {
    for (const ancho of [1280, 1024, 768, 390, 320]) {
      await page.setViewportSize({ width: ancho, height: 800 });
      await page.goto('/');
      await expect(page.getByRole('heading', { level: 1 })).toBeVisible();

      const problemas = await page.evaluate(() => {
        const desborde = document.documentElement.scrollWidth - document.documentElement.clientWidth;
        const cortados = [...document.querySelectorAll('a, button, h1, h2, h3')]
          .filter((e) => {
            const r = e.getBoundingClientRect();
            return r.width > 0 && (r.right > window.innerWidth + 1 || r.left < -1);
          })
          .map((e) => e.textContent?.trim().slice(0, 30));
        return { desborde, cortados };
      });
      expect(problemas, `a ${ancho} px`).toEqual({ desborde: 0, cortados: [] });
    }
  });
});
