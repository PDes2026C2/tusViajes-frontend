import type { PageResponseDTO, TravelPackageResponseDTO } from "./package"

export interface BuyerPurchaseResponseDTO {
  id: number
  price: number
  purchasedAt: string
  buyer?: {
    id: number
    firstName: string
    lastName: string
    email: string
    nationalId: string
  } | null
  travelPackage: TravelPackageResponseDTO
}

export type BuyerPurchasesPageDTO = PageResponseDTO<BuyerPurchaseResponseDTO>
