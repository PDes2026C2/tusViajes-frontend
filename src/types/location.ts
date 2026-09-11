export interface CountryDTO {
  isoCode: string
  name: string
}

export interface CityDTO {
  id: number
  countryDTO: CountryDTO
  name: string
}
