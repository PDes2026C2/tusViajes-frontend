import type { SearchPackageCriteria } from "../models/search"
import type { PageResponseDTO, TravelPackageResponseDTO } from "../types/package"
import publicClient from "./public-client"

export const packageDataSource = {
  async searchPackages(
    criteria: SearchPackageCriteria
  ): Promise<PageResponseDTO<TravelPackageResponseDTO>> {
    const params: Record<string, any> = {
      page: criteria.page ?? 0,
      size: criteria.size ?? 20,
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
        "/packages/search",
        { params }
      )
      return response.data
    } catch {
      // Fallback mock paginated package response for development
      return {
        content: [
          {
            id: 101,
            name: "Escapada Soñada a Nueva York",
            description: "Vuelo directo + 7 noches en hotel céntrico con desayuno incluido.",
            price: 1250.0,
            startDate: new Date().toISOString(),
            endDate: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
            hotel: {
              id: 201,
              name: "Manhattan Grand Hotel",
              city: {
                id: 5,
                countryDTO: { isoCode: "US", name: "Estados Unidos" },
                name: "Nueva York",
              },
              photoUrl: "https://images.unsplash.com/photo-1566073771259-6a8506099945",
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
              departureTime: new Date().toISOString(),
              arrivalTime: new Date(Date.now() + 9 * 3600 * 1000).toISOString(),
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
              departureTime: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
              arrivalTime: new Date(Date.now() + (7 * 24 + 9) * 3600 * 1000).toISOString(),
            },
          },
        ],
        totalElements: 1,
        totalPages: 1,
        size: criteria.size ?? 20,
        number: criteria.page ?? 0,
        first: true,
        last: true,
        empty: false,
      }
    }
  },
}
