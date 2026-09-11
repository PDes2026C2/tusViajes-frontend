import type { CityDTO, CountryDTO } from "../types/location"
import publicClient from "./public-client"

export const locationDataSource = {
  async getCountries(): Promise<CountryDTO[]> {
    try {
      const response = await publicClient.get<CountryDTO[]>("/countries")
      return response.data
    } catch {
      // Fallback mock countries for offline/local development
      return [
        { isoCode: "AR", name: "Argentina" },
        { isoCode: "US", name: "Estados Unidos" },
        { isoCode: "ES", name: "España" },
        { isoCode: "BR", name: "Brasil" },
      ]
    }
  },

  async getCities(isoCode: string): Promise<CityDTO[]> {
    try {
      const response = await publicClient.get<CityDTO[]>("/cities", {
        params: { isoCode },
      })
      return response.data
    } catch {
      // Fallback mock cities for offline/local development
      const countries: Record<string, CountryDTO> = {
        AR: { isoCode: "AR", name: "Argentina" },
        US: { isoCode: "US", name: "Estados Unidos" },
        ES: { isoCode: "ES", name: "España" },
        BR: { isoCode: "BR", name: "Brasil" },
      }

      const cityMocks: Record<string, CityDTO[]> = {
        AR: [
          { id: 1, countryDTO: countries.AR, name: "Buenos Aires" },
          { id: 2, countryDTO: countries.AR, name: "Córdoba" },
          { id: 3, countryDTO: countries.AR, name: "Mendoza" },
          { id: 4, countryDTO: countries.AR, name: "Bariloche" },
        ],
        US: [
          { id: 5, countryDTO: countries.US, name: "Nueva York" },
          { id: 6, countryDTO: countries.US, name: "Miami" },
          { id: 7, countryDTO: countries.US, name: "Orlando" },
          { id: 8, countryDTO: countries.US, name: "Los Ángeles" },
        ],
        ES: [
          { id: 9, countryDTO: countries.ES, name: "Madrid" },
          { id: 10, countryDTO: countries.ES, name: "Barcelona" },
          { id: 11, countryDTO: countries.ES, name: "Sevilla" },
        ],
        BR: [
          { id: 12, countryDTO: countries.BR, name: "Río de Janeiro" },
          { id: 13, countryDTO: countries.BR, name: "Florianópolis" },
          { id: 14, countryDTO: countries.BR, name: "São Paulo" },
        ],
      }
      return cityMocks[isoCode.toUpperCase()] || []
    }
  },
}
