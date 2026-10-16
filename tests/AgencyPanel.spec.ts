import { test, expect, type Page } from '@playwright/test';
import mockPackages from './fixtures/travelPackages.json' with { type: 'json' };
import mockCountries from './fixtures/countries.json' with { type: 'json' };
import mockHotels from './fixtures/hotels.json' with { type: 'json' };
import mockFlights from './fixtures/flights.json' with { type: 'json' };

async function loginAsUser(page: Page, user = { id: 10, email: 'agency@tusviajes.com', role: 'AGENCY' }) {
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

test.describe('Agency Panel - Access Control & Role Protection', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept countries to prevent any toast errors
    await page.route('**/api/countries*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCountries),
      });
    });
  });

  test('Unauthenticated user cannot access /agency/panel and is redirected to /login', async ({ page }) => {
    await page.goto('/agency/panel');

    await expect(page).toHaveURL(/\/login/);
  });

  test('Buyer user cannot access /agency/panel and is redirected to /unauthorized', async ({ page }) => {
    await loginAsUser(page, { id: 1, email: 'buyer@tusviajes.com', role: 'BUYER' });

    await page.goto('/agency/panel');

    await expect(page).toHaveURL(/\/unauthorized/);
  });

  test('Admin user cannot access /agency/panel and is redirected to /unauthorized', async ({ page }) => {
    await loginAsUser(page, { id: 99, email: 'admin@tusviajes.com', role: 'ADMIN' });

    await page.goto('/agency/panel');

    await expect(page).toHaveURL(/\/unauthorized/);
  });
});

test.describe('Agency Panel - Management & Packages', () => {
  test.beforeEach(async ({ page }) => {
    // Intercept common APIs
    await page.route('**/api/countries*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockCountries),
      });
    });

    await page.route('**/api/hotels*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockHotels),
      });
    });

    await page.route('**/api/flights*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify(mockFlights),
      });
    });

    await page.route('**/api/agencies/me/sales*', async (route) => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({ content: [], totalElements: 0, totalPages: 0 }),
      });
    });

    await page.route('**/api/travel-packages*', async (route) => {
      if (route.request().method() === 'POST') {
        const postData = route.request().postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 999,
            name: postData?.name || 'Escapada Soñada a Miami',
            description: postData?.description || 'Vacaciones inolvidables en Miami',
            price: postData?.price || 1800,
            initialDate: '2026-11-01T18:00:00.000Z',
            finalDate: '2026-11-08T10:00:00.000Z',
            hotel: {
              id: 201,
              name: 'Grand Hotel',
              city: {
                id: 6,
                name: 'Miami',
                countryDTO: { isoCode: 'US', name: 'Estados Unidos' },
              },
              photoUrl: 'https://images.example.com/hotels/miami.jpg',
            },
            departureFlight: {
              id: 501,
              flightNumber: 'AR-1300',
              airline: 'Aerolíneas Argentinas',
              originCity: {
                id: 1,
                name: 'Buenos Aires',
                countryDTO: { isoCode: 'AR', name: 'Argentina' },
              },
              destinationCity: {
                id: 6,
                name: 'Miami',
                countryDTO: { isoCode: 'US', name: 'Estados Unidos' },
              },
              departureTime: '2026-11-01T10:00:00.000Z',
              arrivalTime: '2026-11-01T18:00:00.000Z',
            },
            arrivalFlight: {
              id: 502,
              flightNumber: 'AR-1301',
              airline: 'Aerolíneas Argentinas',
              originCity: {
                id: 6,
                name: 'Miami',
                countryDTO: { isoCode: 'US', name: 'Estados Unidos' },
              },
              destinationCity: {
                id: 1,
                name: 'Buenos Aires',
                countryDTO: { isoCode: 'AR', name: 'Argentina' },
              },
              departureTime: '2026-11-08T10:00:00.000Z',
              arrivalTime: '2026-11-08T18:00:00.000Z',
            },
            agency: {
              id: 10,
              businessName: 'Patagonia Tours S.A.',
              taxId: '30-71234567-9',
              email: 'contacto@patagoniatours.com',
              status: 'ACTIVE',
            },
          }),
        });
      } else {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify(mockPackages),
        });
      }
    });
  });

  test('Agency user can access /agency/panel and see header and tabs', async ({ page }) => {
    await loginAsUser(page, { id: 10, email: 'agency@tusviajes.com', role: 'AGENCY' });

    await page.goto('/agency/panel');

    await expect(page.getByText('Panel de Gestión de Agencia')).toBeVisible();
    await expect(page.getByText('Agencia Autorizada')).toBeVisible();
    await expect(page.getByRole('button', { name: /Mis Paquetes/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Consulta de Vuelos/i })).toBeVisible();
    await expect(page.getByRole('button', { name: /Ventas y Clientes/i })).toBeVisible();
  });

  test('Agency user sees only packages belonging to their agency in Mis Paquetes', async ({ page }) => {
    await loginAsUser(page, { id: 10, email: 'agency@tusviajes.com', role: 'AGENCY' });

    await page.goto('/agency/panel');

    // Own agency packages are visible
    await expect(page.getByText('Escapada a Bariloche')).toBeVisible();
    await expect(page.getByText('Relax en Mendoza')).toBeVisible();

    // Other agency package is filtered out
    await expect(page.getByText('Aventura en Cataratas')).not.toBeVisible();
  });

  test('Agency user can filter/search their packages in Mis Paquetes', async ({ page }) => {
    await loginAsUser(page, { id: 10, email: 'agency@tusviajes.com', role: 'AGENCY' });

    await page.goto('/agency/panel');

    await expect(page.getByText('Escapada a Bariloche')).toBeVisible();
    await expect(page.getByText('Relax en Mendoza')).toBeVisible();

    const searchInput = page.getByPlaceholder('Buscar por nombre, hotel o ciudad destino...');
    await searchInput.fill('Bariloche');

    await expect(page.getByText('Escapada a Bariloche')).toBeVisible();
    await expect(page.getByText('Relax en Mendoza')).not.toBeVisible();
  });

  test('Agency user can open modal, fill form, and create a package successfully', async ({ page }) => {
    await loginAsUser(page, { id: 10, email: 'agency@tusviajes.com', role: 'AGENCY' });

    await page.goto('/agency/panel');

    const openCreateButton = page.locator('main').getByRole('button', { name: 'Crear Paquete' });
    await openCreateButton.click();

    // Verify modal is open
    const modal = page.getByRole('dialog');
    await expect(modal).toBeVisible();
    await expect(page.getByRole('heading', { name: 'Crear Nuevo Paquete' })).toBeVisible();

    // Select Hotel (Miami, Estados Unidos)
    await page.locator('#package-hotel').selectOption('201');

    // Select Departure Flight (AR-1300 to Miami)
    await page.locator('#package-departure-flight').selectOption('501');

    await page.locator('#package-return-flight').selectOption('502');

    await page.locator('#package-name').fill('Escapada Soñada a Miami');
    await page.locator('#package-price').fill('1800');
    await page.locator('#package-description').fill('Vacaciones inolvidables en Miami');

    // Submit form
    const submitButton = modal.getByRole('button', { name: 'Crear Paquete' });
    await submitButton.click();

    // Verify success toast
    await expect(page.getByText(/creado con éxito/i)).toBeVisible();

    // Modal should close
    await expect(modal).not.toBeVisible();

    // The newly created package should now be displayed in the list
    await expect(page.getByRole('heading', { name: 'Escapada Soñada a Miami' })).toBeVisible();
  });
});
