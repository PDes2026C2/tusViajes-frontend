export interface CountryDTO {
  isoCode: string
  name: string
}

export interface CityDTO {
  id: number
  isoCodeCountry: string
  name: string
}
