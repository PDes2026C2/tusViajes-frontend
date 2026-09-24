import type { CityDTO, CountryDTO } from "../types/location"

export interface Country {
  isoCode: string
  name: string
}

export interface City {
  id: number
  country: Country
  name: string
}

export const locationMappers = {
  mapCountryDTOToModel: (dto?: CountryDTO): Country => ({
    isoCode: dto?.isoCode || "",
    name: dto?.name || "",
  }),

  mapCityDTOToModel: (dto: CityDTO): City => ({
    id: dto.id,
    country: locationMappers.mapCountryDTOToModel(dto.country || dto.countryDTO),
    name: dto.name,
  }),
}
