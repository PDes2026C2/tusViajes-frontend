import { test, expect, type Page } from '@playwright/test';
import mockPackages from '../tests/fixtures/travelPackages.json' with { type: 'json' };
import mockCountries from '../tests/fixtures/countries.json' with { type: 'json' };

async function loginAsUser(page: Page, user = { id: 1, email: 'buyer@tusviajes.com', role: 'BUYER' }) {
  await page.addInitScript((userData) => {
    window.sessionStorage.setItem(
      'auth-storage',
      JSON.stringify({
        state: {
          isAuthenticated: true,
          user: userData,
          accessToken: 'fake-jwt-token',
          refreshToken: 'fake-refresh-token',
        },
        version: 0,
      })
    );
  }, user);
}

test.describe('Travel Packages and Favorites', () => {
  test.beforeEach(async ({ page }) => {
    await page.route('**/api/travel-packages*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockPackages),
      });
    });

    await page.route('**/api/countries*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCountries),
      });
    });
  });

  test('Travel packages are render when home is visited', async ({ page }) => {
    await page.goto('/home');

    await expect(page.getByText('Escapada a Bariloche')).toBeVisible();
    await expect(page.getByText('Aventura en Cataratas')).toBeVisible();
    await expect(page.getByText('Relax en Mendoza')).toBeVisible();
    await expect(page.getByText('Hubo un problema al obtener los paises')).not.toBeVisible();
  });

  test('Cant add a Travel Package as favorite if user is not logged', async ({ page }) => {
    await page.goto('/home');

    const barilocheCard = page.locator('article', { hasText: 'Escapada a Bariloche' });
    await barilocheCard.getByRole('button', { name: 'Agregar a favoritos' }).click();

    await expect(page.getByLabel('Correo electrónico')).toBeVisible();
    await expect(page.getByLabel('Contraseña')).toBeVisible();
  });

  test('Logged-in buyer can successfully add a travel package to favorites', async ({ page }) => {
    await loginAsUser(page);

    await page.route('**/api/buyers/me/favorites', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    let addFavoriteCalled = false;
    await page.route('**/api/buyers/me/favorites/1', async (route) => {
      addFavoriteCalled = true;
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.goto('/home');

    const barilocheCard = page.locator('article', { hasText: 'Escapada a Bariloche' });
    const favoriteButton = barilocheCard.getByRole('button', { name: 'Agregar a favoritos' });

    await expect(favoriteButton).toBeVisible();
    await expect(favoriteButton).toBeEnabled();
    await expect(favoriteButton).toHaveAttribute('aria-pressed', 'false');

    await favoriteButton.click();

    await expect.poll(() => addFavoriteCalled).toBe(true);

    const addedButton = barilocheCard.getByRole('button', { name: /favoritos/i });
    await expect(addedButton).toBeEnabled();
    await expect(addedButton).toHaveAttribute('aria-pressed', 'true');
    await expect(addedButton).toHaveText('Quitar de favoritos');

    // Moving mouse away restores "En favoritos"
    await page.mouse.move(0, 0);
    await expect(addedButton).toHaveText('En favoritos');
  });

  test('Package is already in favorites on initial load and shows remove option on hover', async ({ page }) => {
    await loginAsUser(page);

    await page.route('**/api/buyers/me/favorites', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([mockPackages.content[0]]),
      });
    });

    await page.goto('/home');

    const barilocheCard = page.locator('article', { hasText: 'Escapada a Bariloche' });
    const barilocheFavoriteButton = barilocheCard.getByRole('button', { name: /favoritos/i });

    await expect(barilocheFavoriteButton).toBeVisible();
    await expect(barilocheFavoriteButton).toBeEnabled();
    await expect(barilocheFavoriteButton).toHaveAttribute('aria-pressed', 'true');
    await expect(barilocheFavoriteButton).toHaveText('En favoritos');

    await barilocheFavoriteButton.hover();
    await expect(barilocheFavoriteButton).toHaveText('Quitar de favoritos');

    await page.mouse.move(0, 0);
    await expect(barilocheFavoriteButton).toHaveText('En favoritos');

    // Another package not in favorites is still available to be added
    const cataratasCard = page.locator('article', { hasText: 'Aventura en Cataratas' });
    const cataratasFavoriteButton = cataratasCard.getByRole('button', { name: 'Agregar a favoritos' });
    await expect(cataratasFavoriteButton).toBeVisible();
    await expect(cataratasFavoriteButton).toBeEnabled();
    await expect(cataratasFavoriteButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('Shows error notification and keeps button enabled when adding favorite fails', async ({ page }) => {
    await loginAsUser(page);

    await page.route('**/api/buyers/me/favorites', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/buyers/me/favorites/1', async (route) => {
      await route.fulfill({
        status: 500,
        contentType: 'application/json',
        body: JSON.stringify({ message: 'No pudimos agregar el paquete a favoritos.' }),
      });
    });

    await page.goto('/home');

    const barilocheCard = page.locator('article', { hasText: 'Escapada a Bariloche' });
    const favoriteButton = barilocheCard.getByRole('button', { name: 'Agregar a favoritos' });

    await favoriteButton.click();

    await expect(page.getByText(/No pudimos agregar el paquete a favoritos/i)).toBeVisible();
    await expect(favoriteButton).toBeVisible();
    await expect(favoriteButton).toBeEnabled();
    await expect(favoriteButton).toHaveAttribute('aria-pressed', 'false');
  });

  test('Unauthenticated user clicks favorite, logs in via modal, and adds favorite successfully', async ({ page }) => {
    await page.route('**/api/buyers/me/favorites', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([]),
      });
    });

    await page.route('**/api/buyers/me/favorites/1', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({}),
      });
    });

    await page.route('**/api/auth/login', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          id: 1,
          email: 'buyer@tusviajes.com',
          role: 'BUYER',
          token: 'fake-jwt-token',
          refreshToken: 'fake-refresh-token',
        }),
      });
    });

    await page.goto('/home');

    const barilocheCard = page.locator('article', { hasText: 'Escapada a Bariloche' });
    await barilocheCard.getByRole('button', { name: 'Agregar a favoritos' }).click();

    // Fill login modal
    await page.getByLabel('Correo electrónico').fill('buyer@tusviajes.com');
    await page.getByLabel('Contraseña').fill('Password123');
    await page.locator('form').getByRole('button', { name: 'Iniciar sesión' }).click();

    // Modal closes upon successful login
    await expect(page.getByLabel('Correo electrónico')).not.toBeVisible();

    // Now logged in, click to add favorite
    const favoriteButton = barilocheCard.getByRole('button', { name: 'Agregar a favoritos' });
    await expect(favoriteButton).toBeVisible();
    await favoriteButton.click();

    const addedButton = barilocheCard.getByRole('button', { name: /favoritos/i });
    await expect(addedButton).toBeEnabled();
    await expect(addedButton).toHaveAttribute('aria-pressed', 'true');
    await expect(addedButton).toHaveText('Quitar de favoritos');

    await page.mouse.move(0, 0);
    await expect(addedButton).toHaveText('En favoritos');
  });

  test('Agency user cannot see favorite buttons', async ({ page }) => {
    await loginAsUser(page, { id: 2, email: 'agency@tusviajes.com', role: 'AGENCY' });

    await page.goto('/home');

    const barilocheCard = page.locator('article', { hasText: 'Escapada a Bariloche' });
    await expect(barilocheCard).toBeVisible();
    await expect(barilocheCard.getByRole('button', { name: /favoritos/i })).toHaveCount(0);
  });
});
