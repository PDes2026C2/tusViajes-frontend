import { test as base, expect, type Request } from '@playwright/test';
import type { BuyerPurchaseResponseDTO } from '../src/types/buyer';
import mockCountries from './fixtures/countries.json' with { type: 'json' };
import { availablePackage, recordedPurchase } from './fixtures/purchase';

interface PurchaseApi {
  purchases: BuyerPurchaseResponseDTO[];
  requests: Request[];
  rejectNextPurchase: boolean;
}

const test = base.extend<{ purchaseApi: PurchaseApi; authenticatedBuyer: boolean }>({
  authenticatedBuyer: [true, { option: true }],
  purchaseApi: async ({ page, authenticatedBuyer }, provideApi) => {
    const api: PurchaseApi = { purchases: [], requests: [], rejectNextPurchase: false };

    await page.clock.setFixedTime(new Date('2026-10-01T12:00:00Z'));
    if (authenticatedBuyer) {
      await page.addInitScript(() => {
        sessionStorage.setItem('auth-storage', JSON.stringify({
          state: {
            isAuthenticated: true,
            user: { id: 7, email: 'buyer@example.com', role: 'BUYER' },
            accessToken: 'fake-jwt-token',
            refreshToken: 'fake-refresh-token',
          },
          version: 0,
        }));
      });
    }

    await page.route('**/api/**', async (route) => {
      const request = route.request();
      const url = new URL(request.url());
      const pageResponse = <T,>(content: T[]) => ({
        content,
        totalElements: content.length,
        totalPages: content.length ? 1 : 0,
        number: Number(url.searchParams.get('page') ?? 0),
        size: Number(url.searchParams.get('size') ?? 10),
      });

      switch (url.pathname) {
        case '/api/countries':
          return route.fulfill({ json: mockCountries });
        case '/api/travel-packages':
          return route.fulfill({ json: pageResponse([availablePackage]) });
        case '/api/buyers/me/favorites':
          return route.fulfill({ json: [availablePackage] });
        case '/api/buyers/me/purchases':
          return route.fulfill({ json: pageResponse(api.purchases) });
        case '/api/buyers/me/reviews':
          return route.fulfill({ json: pageResponse([]) });
        case `/api/purchases/${availablePackage.id}`:
          api.requests.push(request);
          if (api.rejectNextPurchase) {
            api.rejectNextPurchase = false;
            return route.fulfill({
              status: 409,
              json: { message: 'Uno de los vuelos está completo' },
            });
          }
          api.purchases = [recordedPurchase];
          return route.fulfill({ status: 201, json: recordedPurchase });
        default:
          await route.abort();
          throw new Error(`Unexpected API request: ${request.method()} ${url.pathname}`);
      }
    });

    await provideApi(api);
  },
});

test.describe('Package purchase', () => {
  for (const path of ['/home', '/favorites']) {
    test(`buyer confirms a purchase from ${path} and sees the recorded price in Mis viajes`, async ({ page, purchaseApi }) => {
      // arrange
      await page.goto(path);
      await page.getByRole('button', { name: 'Ver detalle', exact: true }).click();
      const detail = page.getByRole('dialog', { name: availablePackage.name });
      await detail.getByRole('button', { name: 'Comprar paquete', exact: true }).click();
      await expect(detail.getByText('¿Confirmás la compra de este paquete?')).toBeVisible();
      expect(purchaseApi.requests).toHaveLength(0);

      // act
      await detail.getByRole('button', { name: 'Confirmar compra', exact: true }).click();

      // assert
      await expect(page).toHaveURL(/\/my-trips$/);
      await expect(page.getByRole('heading', { name: 'Mis Viajes', exact: true })).toBeVisible();
      const trip = page.locator('article', { hasText: availablePackage.name });
      await expect(trip).toBeVisible();
      await expect(trip.getByText('USD $875', { exact: true })).toBeVisible();
      await expect(detail).not.toBeVisible();
      expect(purchaseApi.requests).toHaveLength(1);
      expect(purchaseApi.requests[0].method()).toBe('POST');
      expect(purchaseApi.requests[0].headers().authorization).toBe('Bearer fake-jwt-token');
    });

    test(`already purchased package from ${path} links to Mis viajes without offering another purchase`, async ({ page, purchaseApi }) => {
      // arrange
      purchaseApi.purchases = [recordedPurchase];
      await page.goto(path);

      // act
      await page.getByRole('button', { name: 'Ver detalle', exact: true }).click();

      // assert
      const detail = page.getByRole('dialog', { name: availablePackage.name });
      await expect(detail.getByText('Ya compraste este paquete', { exact: true })).toBeVisible();
      await expect(detail.getByRole('button', { name: 'Comprar paquete', exact: true })).toHaveCount(0);
      expect(purchaseApi.requests).toHaveLength(0);

      // act
      await detail.getByRole('button', { name: 'Ver en mis viajes', exact: true }).click();

      // assert
      await expect(page).toHaveURL(/\/my-trips$/);
      await expect(page.locator('article', { hasText: availablePackage.name })).toBeVisible();
      expect(purchaseApi.requests).toHaveLength(0);
    });
  }

  test('rejected purchase keeps the detail open and allows a successful retry', async ({ page, purchaseApi }) => {
    // arrange
    purchaseApi.rejectNextPurchase = true;
    await page.goto('/home');
    await page.getByRole('button', { name: 'Ver detalle', exact: true }).click();
    const detail = page.getByRole('dialog', { name: availablePackage.name });
    await detail.getByRole('button', { name: 'Comprar paquete', exact: true }).click();

    // act
    await detail.getByRole('button', { name: 'Confirmar compra', exact: true }).click();

    // assert
    await expect(detail.getByRole('alert')).toHaveText('Uno de los vuelos está completo');
    await expect(page).toHaveURL(/\/home$/);
    await expect(detail.getByRole('button', { name: 'Confirmar compra', exact: true })).toBeEnabled();
    expect(purchaseApi.purchases).toEqual([]);
    expect(purchaseApi.requests).toHaveLength(1);

    // act
    await detail.getByRole('button', { name: 'Confirmar compra', exact: true }).click();

    // assert
    await expect(page).toHaveURL(/\/my-trips$/);
    await expect(page.locator('article', { hasText: availablePackage.name })).toBeVisible();
    expect(purchaseApi.requests).toHaveLength(2);
  });
});

test.describe('Visitor purchase', () => {
  test.use({ authenticatedBuyer: false });

  test('visitor is shown the login form without sending a purchase request', async ({ page, purchaseApi }) => {
    // arrange
    await page.goto('/home');
    await page.getByRole('button', { name: 'Ver detalle', exact: true }).click();
    const detail = page.getByRole('dialog', { name: availablePackage.name });

    // act
    await detail.getByRole('button', { name: 'Iniciar sesión para comprar', exact: true }).click();

    // assert
    const login = page.getByRole('dialog', { name: 'Iniciar Sesión', exact: true });
    await expect(login).toBeVisible();
    await expect(login.getByLabel('Correo electrónico')).toBeVisible();
    await expect(login.getByLabel('Contraseña', { exact: true })).toBeVisible();
    await expect(detail).not.toBeVisible();
    await expect(page).toHaveURL(/\/home$/);
    expect(purchaseApi.requests).toHaveLength(0);
  });
});
