import type { CityDTO, CountryDTO } from "../types/location"
import publicClient from "./public-client"

export const locationDataSource = {
  async getCountries(): Promise<CountryDTO[]> {
    const response = await publicClient.get<CountryDTO[]>("/countries")
    return response.data
  },

  async getCities(isoCode: string): Promise<CityDTO[]> {
    const response = await publicClient.get<CityDTO[]>("/cities", {
        params: { isoCode },
    })
    return response.data
  },
}
