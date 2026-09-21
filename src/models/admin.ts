import type { AgencySellsDTO, BuyerResponseDTO, RatedCityDTO, TopBuyerDTO } from "../types/admin"
import type { CityDTO } from "../types/location"
import { locationMappers, type City } from "./location"
import { packageMappers, type SimpleAgency } from "./package"


export interface Buyer {
  id: number
  firstName: string
  lastName: string
  email: string
  phoneNumber: string
  nationalId: string
}

export interface TopBuyer {
  buyer: Buyer
  purchases: number
  rank: number
}

export interface TopDestination {
  city: City
  rank: number
}

export interface TopAgency {
  agency: SimpleAgency
  sales: number
  rank: number
}

export interface TopRatedDestination {
  city: City
  stars: number
  rank: number
}

export const buyerMapper = {
  mapDTOToModel: (dto: BuyerResponseDTO): Buyer => ({
    id: dto.id,
    firstName: dto.firstName,
    lastName: dto.lastName,
    email: dto.email,
    phoneNumber: dto.phoneNumber,
    nationalId: dto.nationalId,
  }),
}

export const metricsMapper = {
  mapTopBuyerDTOToModel: (dto: TopBuyerDTO, index = 0): TopBuyer => ({
    buyer: buyerMapper.mapDTOToModel(dto.buyer),
    purchases: dto.purchaseCount,
    rank: index + 1,
  }),

  mapTopDestinationDTOToModel: (dto: CityDTO, index = 0): TopDestination => ({
    city: locationMappers.mapCityDTOToModel(dto),
    rank: index + 1,
  }),

  mapTopAgencyDTOToModel: (dto: AgencySellsDTO, index = 0): TopAgency => ({
    agency: packageMappers.mapSimpleAgencyDTOToModel(dto.agency),
    sales: dto.salesCount,
    rank: index + 1,
  }),

  mapTopRatedDestinationDTOToModel: (dto: RatedCityDTO, index = 0): TopRatedDestination => ({
    city: locationMappers.mapCityDTOToModel(dto.city),
    stars: dto.stars,
    rank: index + 1,
  }),
}
