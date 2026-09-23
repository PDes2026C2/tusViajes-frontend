export interface CountryDTO {
  isoCode: string
  name: string
}

export interface CityDTO {
  id: number
  countryDTO?: CountryDTO
  country?: CountryDTO
  name: string
}
