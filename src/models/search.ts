import type { DateRange } from "react-day-picker"

export interface SearchPackageCriteria {
  originCountryIso?: string
  originCityId?: number
  destinationCountryIso?: string
  destinationCityId?: number
  departureDateRange?: DateRange
  arrivalDateRange?: DateRange
  page?: number
  size?: number
}
