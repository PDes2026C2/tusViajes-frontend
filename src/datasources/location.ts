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
    const response = await publicClient.get<CityDTO[]>("/cities", {
        params: { isoCode },
    })
    return response.data
  },
}
