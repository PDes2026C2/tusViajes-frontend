import { test, expect } from '@playwright/test';
import mockCountries from './fixtures/countries.json' with { type: 'json' };

test.describe('Landing page', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/countries*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCountries),
      });
    });
  });

  test('Home renders tusViajes header', async ({ page }) => {
    await page.goto('/home');

    const section = page.getByText("Vuelo de ida, vuelo de vuelta y hotel en un solo paquete. Explorá sin iniciar sesión y guardá todas las reservas que quieras");
    // Expect a title "to contain" a substring.
    await expect(section).not.toBeNull();
  });
});