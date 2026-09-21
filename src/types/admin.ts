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

export interface RatedCityDTO {
  city: CityDTO
  stars: number
}

export interface SimpleAgencyDTO {
  id: number
  businessName: string
  email: string
}

export interface AgencySellsDTO {
  agency: SimpleAgencyDTO
  salesCount: number
}