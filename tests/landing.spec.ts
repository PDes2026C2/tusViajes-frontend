import { test, expect } from '@playwright/test';

test('Home renders tusViajes header', async ({ page }) => {
  await page.goto('/home');

  const section = page.getByText("Vuelo de ida, vuelo de vuelta y hotel en un solo paquete. Explorá sin iniciar sesión y guardá todas las reservas que quieras")
  // Expect a title "to contain" a substring.
  await expect(section).not.toBeNull();
});