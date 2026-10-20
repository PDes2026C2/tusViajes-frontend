import { test, expect, type Page } from '@playwright/test';
import type { Role } from '../src/models/auth';
import mockCountries from './fixtures/countries.json' with { type: 'json' };

async function authenticate(page: Page, role: Role) {
  await page.addInitScript((userRole) => {
    sessionStorage.setItem('auth-storage', JSON.stringify({
      state: {
        isAuthenticated: true,
        user: { id: 7, email: 'user@example.com', role: userRole },
        accessToken: 'fake-jwt-token',
        refreshToken: 'fake-refresh-token',
      },
      version: 0,
    }));
  }, role);
}

async function submitBuyerLogin(page: Page) {
  const form = page.locator('main form');
  await form.getByLabel('Correo electrónico').fill('buyer@example.com');
  await form.getByLabel('Contraseña', { exact: true }).fill('Password123');
  await form.getByRole('button', { name: 'Iniciar sesión', exact: true }).click();
}

test.beforeEach(async ({ page }) => {
  await page.route('**/api/**', async (route) => {
    const pathname = new URL(route.request().url()).pathname;
    const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 };
    switch (pathname) {
      case '/api/countries':
        return route.fulfill({ json: mockCountries });
      case '/api/travel-packages':
      case '/api/buyers/me/purchases':
      case '/api/buyers/me/reviews':
        return route.fulfill({ json: emptyPage });
      case '/api/buyers/me/favorites':
        return route.fulfill({ json: [] });
      case '/api/auth/login':
        return route.fulfill({ json: {
          id: 7, email: 'buyer@example.com', role: 'BUYER',
          token: 'fake-jwt-token', refreshToken: 'fake-refresh-token',
        } });
      default:
        await route.abort();
        throw new Error(`Unexpected API request: ${pathname}`);
    }
  });
});

test.describe('Denied access', () => {
  const deniedRoutes: { role: Role; path: string }[] = [
    { role: 'BUYER', path: '/agency/panel' },
    { role: 'BUYER', path: '/admin/panel' },
    { role: 'AGENCY', path: '/admin/panel' },
    { role: 'AGENCY', path: '/my-trips' },
    { role: 'ADMIN', path: '/agency/panel' },
    { role: 'ADMIN', path: '/favorites' },
  ];

  for (const { role, path } of deniedRoutes) {
    test(`${role} cannot access ${path} and can return Home from the denied-access screen`, async ({ page }) => {
      // arrange
      await authenticate(page, role);

      // act
      await page.goto(path);

      // assert
      await expect(page).toHaveURL(/\/unauthorized$/);
      await expect(page.getByRole('heading', { name: 'No tenés acceso a esta página' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cerrar sesión', exact: true })).toBeVisible();

      // act
      await page.getByRole('button', { name: 'Volver al inicio', exact: true }).click();

      // assert
      await expect(page).toHaveURL(/\/home$/);
      await expect(page.getByRole('heading', { name: 'Viajes armados a tu medida' })).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cerrar sesión', exact: true })).toBeVisible();
    });
  }
});

test.describe('Buyer login destinations', () => {
  for (const path of ['/agency/panel', '/admin/panel', '/agency/login', '/admin/login']) {
    test(`buyer logging in from ${path} reaches Home`, async ({ page }) => {
      // arrange
      await page.goto(path);
      await expect(page.locator('main form')).toBeVisible();

      // act
      await submitBuyerLogin(page);

      // assert
      await expect(page).toHaveURL(/\/home$/);
      await expect(page.getByRole('heading', { name: 'Viajes armados a tu medida' })).toBeVisible();
      await expect(page.getByRole('heading', { name: 'No tenés acceso a esta página' })).toHaveCount(0);
    });
  }

  for (const path of ['/favorites', '/my-trips']) {
    test(`buyer returns to the requested ${path} after logging in`, async ({ page }) => {
      // arrange
      await page.goto(path);
      await expect(page).toHaveURL(/\/login$/);

      // act
      await submitBuyerLogin(page);

      // assert
      await expect(page).toHaveURL(new RegExp(`${path}$`));
      await expect(page.getByRole('main')).toBeVisible();
      await expect(page.getByRole('button', { name: 'Cerrar sesión', exact: true })).toBeVisible();
    });
  }
});
