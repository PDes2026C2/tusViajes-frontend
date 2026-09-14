import type { SearchPackageCriteria } from "../models/search"
import type { PageResponseDTO, TravelPackageResponseDTO } from "../types/package"
import publicClient from "./public-client"

export const packageDataSource = {
  async searchPackages(
    criteria: SearchPackageCriteria = {}
  ): Promise<PageResponseDTO<TravelPackageResponseDTO>> {
    const params: Record<string, any> = {
      page: criteria.page ?? 0,
      size: criteria.size ?? 10,
    }

    if (criteria.originCountryIso) params.originCountryIso = criteria.originCountryIso
    if (criteria.originCityId) params.originCityId = criteria.originCityId
    if (criteria.destinationCountryIso) params.destinationCountryIso = criteria.destinationCountryIso
    if (criteria.destinationCityId) params.destinationCityId = criteria.destinationCityId
    if (criteria.departureDateRange?.from) params.departureFrom = criteria.departureDateRange.from.toISOString()
    if (criteria.departureDateRange?.to) params.departureTo = criteria.departureDateRange.to.toISOString()
    if (criteria.arrivalDateRange?.from) params.arrivalFrom = criteria.arrivalDateRange.from.toISOString()
    if (criteria.arrivalDateRange?.to) params.arrivalTo = criteria.arrivalDateRange.to.toISOString()

    try {
      const response = await publicClient.get<PageResponseDTO<TravelPackageResponseDTO>>(
        "/travel-packages",
        { params }
      )
      return response.data
    } catch {
      // Fallback mock paginated package response for development / demo
      const now = new Date()
      const in7Days = new Date(now.getTime() + 7 * 24 * 60 * 60 * 1000)
      const in10Days = new Date(now.getTime() + 10 * 24 * 60 * 60 * 1000)
      const in14Days = new Date(now.getTime() + 14 * 24 * 60 * 60 * 1000)

      return {
        content: [
          {
            id: 101,
            name: "Escapada Soñada a Nueva York",
            description: "Vuelo directo + 7 noches en hotel céntrico con desayuno buffet incluido.",
            price: 1250.0,
            initialDate: now.toISOString(),
            finalDate: in7Days.toISOString(),
            hotel: {
              id: 201,
              name: "Manhattan Grand Hotel",
              city: {
                id: 5,
                countryDTO: { isoCode: "US", name: "Estados Unidos" },
                name: "Nueva York",
              },
              photoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945?auto=format&fit=crop&w=600&q=80",
            },
            agency: {
              id: 1,
              businessName: "TusViajes Premium",
              taxId: "30-11223344-5",
            },
            departureFlight: {
              id: 501,
              flightNumber: "AR-1300",
              originCity: {
                id: 1,
                countryDTO: { isoCode: "AR", name: "Argentina" },
                name: "Buenos Aires",
              },
              destinationCity: {
                id: 5,
                countryDTO: { isoCode: "US", name: "Estados Unidos" },
                name: "Nueva York",
              },
              departureTime: now.toISOString(),
              arrivalTime: new Date(now.getTime() + 9 * 3600 * 1000).toISOString(),
            },
            arrivalFlight: {
              id: 502,
              flightNumber: "AR-1301",
              originCity: {
                id: 5,
                countryDTO: { isoCode: "US", name: "Estados Unidos" },
                name: "Nueva York",
              },
              destinationCity: {
                id: 1,
                countryDTO: { isoCode: "AR", name: "Argentina" },
                name: "Buenos Aires",
              },
              departureTime: in7Days.toISOString(),
              arrivalTime: new Date(in7Days.getTime() + 9 * 3600 * 1000).toISOString(),
            },
          },
          {
            id: 102,
            name: "Paraíso Tropical en Miami Beach",
            description: "Vuelo con escala rápida + 10 noches en resort frente al mar con acceso exclusivo.",
            price: 1420.0,
            initialDate: now.toISOString(),
            finalDate: in10Days.toISOString(),
            hotel: {
              id: 202,
              name: "Oceanfront Palms Resort",
              city: {
                id: 6,
                countryDTO: { isoCode: "US", name: "Estados Unidos" },
                name: "Miami",
              },
              photoUrl: "https://images.unsplash.com/photo-1571003123894-1f0594d2b5d9?auto=format&fit=crop&w=600&q=80",
            },
            agency: {
              id: 2,
              businessName: "Caribe & Sol",
              taxId: "30-99887766-4",
            },
            departureFlight: {
              id: 503,
              flightNumber: "AA-900",
              originCity: {
                id: 1,
                countryDTO: { isoCode: "AR", name: "Argentina" },
                name: "Buenos Aires",
              },
              destinationCity: {
                id: 6,
                countryDTO: { isoCode: "US", name: "Estados Unidos" },
                name: "Miami",
              },
              departureTime: now.toISOString(),
              arrivalTime: new Date(now.getTime() + 8 * 3600 * 1000).toISOString(),
            },
            arrivalFlight: {
              id: 504,
              flightNumber: "AA-901",
              originCity: {
                id: 6,
                countryDTO: { isoCode: "US", name: "Estados Unidos" },
                name: "Miami",
              },
              destinationCity: {
                id: 1,
                countryDTO: { isoCode: "AR", name: "Argentina" },
                name: "Buenos Aires",
              },
              departureTime: in10Days.toISOString(),
              arrivalTime: new Date(in10Days.getTime() + 8 * 3600 * 1000).toISOString(),
            },
          },
          {
            id: 103,
            name: "Aventura y Nieve en Bariloche",
            description: "Vuelo directo de cabotaje + 7 noches en cabaña alpina con vista panorámica a los cerros.",
            price: 490.0,
            initialDate: in7Days.toISOString(),
            finalDate: in14Days.toISOString(),
            hotel: {
              id: 203,
              name: "Cabañas del Nahuel",
              city: {
                id: 2,
                countryDTO: { isoCode: "AR", name: "Argentina" },
                name: "Córdoba",
              },
              photoUrl: "https://images.unsplash.com/photo-1542314831-068cd1dbfeeb?auto=format&fit=crop&w=600&q=80",
            },
            agency: {
              id: 1,
              businessName: "TusViajes Premium",
              taxId: "30-11223344-5",
            },
            departureFlight: {
              id: 505,
              flightNumber: "FO-5200",
              originCity: {
                id: 1,
                countryDTO: { isoCode: "AR", name: "Argentina" },
                name: "Buenos Aires",
              },
              destinationCity: {
                id: 2,
                countryDTO: { isoCode: "AR", name: "Argentina" },
                name: "Córdoba",
              },
              departureTime: in7Days.toISOString(),
              arrivalTime: new Date(in7Days.getTime() + 2 * 3600 * 1000).toISOString(),
            },
            arrivalFlight: {
              id: 506,
              flightNumber: "FO-5201",
              originCity: {
                id: 2,
                countryDTO: { isoCode: "AR", name: "Argentina" },
                name: "Córdoba",
              },
              destinationCity: {
                id: 1,
                countryDTO: { isoCode: "AR", name: "Argentina" },
                name: "Buenos Aires",
              },
              departureTime: in14Days.toISOString(),
              arrivalTime: new Date(in14Days.getTime() + 2 * 3600 * 1000).toISOString(),
            },
          },
        ],
        totalElements: 3,
        totalPages: 1,
        size: criteria.size ?? 10,
        number: criteria.page ?? 0,
        first: true,
        last: true,
        empty: false,
      }
    }
  },
}
