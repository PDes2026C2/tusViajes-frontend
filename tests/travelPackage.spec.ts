import { test, expect } from '@playwright/test';
import mockPackages from '../tests/fixtures/travelPackages.json' with { type: 'json' };

test('Travel packages are render when home is visited', async ({ page }) => {
  await page.route('**/api/travel-packages*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockPackages)
    });
  });

  
  await page.goto('/home');

  await expect(page.getByText("Escapada a Bariloche")).toBeVisible()
  
  await expect(page.getByText("Aventura en Cataratas")).toBeVisible()
  
  await expect(page.getByText("Relax en Mendoza")).toBeVisible()
});

test('Cant add a Travel Package as favorite if user is not logged', async ({ page }) => {
  await page.route('**/api/travel-packages*', async route => {
    await route.fulfill({
      status: 200,
      contentType: 'application/json',
      body: JSON.stringify(mockPackages)
    });
  });

  await page.goto('/home');

  const barilocheCard = page.locator('article', { hasText: 'Escapada a Bariloche' });
  await barilocheCard.getByRole('button', { name: 'Agregar a favoritos' }).click();

  await expect(page.getByLabel("Correo electrónico")).toBeVisible();
  await expect(page.getByLabel("Contraseña")).toBeVisible();
});
