import type { BuyerPurchasesPageDTO } from "../types/buyer"
import apiClient from "./api-client"

export const buyerDataSource = {
  async hasPurchasedPackage(travelPackageId: number): Promise<boolean> {
    for (let page = 0; ; page += 1) {
      const purchases = await buyerDataSource.getMyPurchases(page, 100)
      if (purchases.content.some((purchase) => purchase.travelPackage.id === travelPackageId)) return true
      if (page + 1 >= purchases.totalPages) return false
    }
  },

  async getMyPurchases(page = 0, size = 10): Promise<BuyerPurchasesPageDTO> {
    const response = await apiClient.get<BuyerPurchasesPageDTO>("/buyers/me/purchases", {
      params: { page, size },
    })
    return response.data
  },
}
