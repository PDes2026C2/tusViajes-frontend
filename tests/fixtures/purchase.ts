import type { BuyerPurchaseResponseDTO } from '../../src/types/buyer';
import type { TravelPackageResponseDTO } from '../../src/types/package';

const originCity = {
  id: 1,
  name: 'Buenos Aires',
  countryDTO: { isoCode: 'AR', name: 'Argentina' },
};
const destinationCity = {
  id: 2,
  name: 'Bariloche',
  countryDTO: { isoCode: 'AR', name: 'Argentina' },
};

export const availablePackage: TravelPackageResponseDTO = {
  id: 101,
  name: 'Escapada a Bariloche',
  description: 'Vuelo y hotel para disfrutar la Patagonia.',
  price: 950,
  initialDate: '2026-11-10T10:00:00Z',
  finalDate: '2026-11-17T10:00:00Z',
  hotel: {
    id: 10,
    name: 'Hotel del Cerro',
    city: destinationCity,
    photoUrl: "data:image/svg+xml,%3Csvg%20xmlns='http://www.w3.org/2000/svg'%20width='1'%20height='1'/%3E",
  },
  agency: {
    id: 1,
    businessName: 'Agencia Sol',
    taxId: '30-11111111-1',
    email: 'sol@example.com',
    status: 'AUTHORIZED',
  },
  departureFlight: {
    id: 11,
    flightNumber: 'AR-1200',
    originCity,
    destinationCity,
    departureTime: '2026-11-10T10:00:00Z',
    arrivalTime: '2026-11-10T12:00:00Z',
  },
  arrivalFlight: {
    id: 12,
    flightNumber: 'AR-1201',
    originCity: destinationCity,
    destinationCity: originCity,
    departureTime: '2026-11-17T10:00:00Z',
    arrivalTime: '2026-11-17T12:00:00Z',
  },
};

export const recordedPurchase: BuyerPurchaseResponseDTO = {
  id: 501,
  price: 875,
  purchasedAt: '2026-10-01T12:00:00Z',
  travelPackage: availablePackage,
};
