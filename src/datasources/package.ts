import { endOfDay, format, startOfDay } from "date-fns"
import type { SearchPackageCriteria } from "../models/search"
import type { PageResponseDTO, TravelPackageResponseDTO } from "../types/package"
import publicClient from "./public-client"

const dateTimeFormat = "yyyy-MM-dd'T'HH:mm:ss.SSS"

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
    if (criteria.departureDateRange?.from) params.departureFrom = format(startOfDay(criteria.departureDateRange.from), dateTimeFormat)
    if (criteria.departureDateRange?.to) params.departureTo = format(endOfDay(criteria.departureDateRange.to), dateTimeFormat)
    if (criteria.arrivalDateRange?.from) params.arrivalFrom = format(startOfDay(criteria.arrivalDateRange.from), dateTimeFormat)
    if (criteria.arrivalDateRange?.to) params.arrivalTo = format(endOfDay(criteria.arrivalDateRange.to), dateTimeFormat)

    const response = await publicClient.get<PageResponseDTO<TravelPackageResponseDTO>>(
      "/travel-packages",
      { params }
    )
    return response.data

  },
}
