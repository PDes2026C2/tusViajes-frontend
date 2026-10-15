import type { Page, TravelPackage } from "./package"
import { packageMappers } from "./package"
import type { BuyerPurchaseResponseDTO, BuyerPurchasesPageDTO } from "../types/buyer"

export type TripStatus = "UPCOMING" | "IN_PROGRESS" | "COMPLETED"

export interface BuyerPurchase {
  id: number
  price: number
  purchasedAt: Date
  travelPackage: TravelPackage
  status: TripStatus
  isCompleted: boolean
}

export function getTripStatus(initialDate: Date, finalDate: Date, now = new Date()): TripStatus {
  if (now.getTime() > finalDate.getTime()) {
    return "COMPLETED"
  }
  if (now.getTime() >= initialDate.getTime() && now.getTime() <= finalDate.getTime()) {
    return "IN_PROGRESS"
  }
  return "UPCOMING"
}

export const purchaseMappers = {
  mapDTOToModel: (dto: BuyerPurchaseResponseDTO, now = new Date()): BuyerPurchase => {
    const travelPackage = packageMappers.mapDTOToModel(dto.travelPackage)
    const status = getTripStatus(travelPackage.initialDate, travelPackage.finalDate, now)

    return {
      id: dto.id,
      price: dto.price,
      purchasedAt: new Date(dto.purchasedAt),
      travelPackage,
      status,
      isCompleted: status === "COMPLETED",
    }
  },

  mapPageDTOToModel: (dto: BuyerPurchasesPageDTO, now = new Date()): Page<BuyerPurchase> => ({
    content: dto.content.map((item) => purchaseMappers.mapDTOToModel(item, now)),
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
    size: dto.size,
    number: dto.number,
  }),
}
