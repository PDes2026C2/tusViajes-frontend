import type { SearchPackageCriteria } from "../models/search"
import type { PageResponseDTO, TravelPackageResponseDTO } from "../types/package"
import publicClient from "./public-client"

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
    if (criteria.departureDateRange?.from) params.departureFrom = criteria.departureDateRange.from.toISOString()
    if (criteria.departureDateRange?.to) params.departureTo = criteria.departureDateRange.to.toISOString()
    if (criteria.arrivalDateRange?.from) params.arrivalFrom = criteria.arrivalDateRange.from.toISOString()
    if (criteria.arrivalDateRange?.to) params.arrivalTo = criteria.arrivalDateRange.to.toISOString()

    const response = await publicClient.get<PageResponseDTO<TravelPackageResponseDTO>>(
      "/travel-packages",
      { params }
    )
    return response.data

  },
}
