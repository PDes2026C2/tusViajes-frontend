import type { AgencyStatus, BuyerResponseDTO } from "./auth"
import type { CityDTO } from "./location"

export interface AgencyResponseDTO {
  id: number
  businessName: string
  taxId: string
  email: string
  status: AgencyStatus
}

export type { BuyerResponseDTO }

export interface TopBuyerDTO {
  buyer: BuyerResponseDTO
  purchaseCount: number
}

export interface TopDestinationDTO {
  city: CityDTO
  salesCount: number
}

export interface TopRatedCityDTO {
  city: CityDTO
  stars: number
}

export interface SimpleAgencyDTO {
  id: number
  businessName: string
  email: string
}

export interface TopAgencyDTO {
  agency: SimpleAgencyDTO
  salesCount: number
}