import type { BuyerPurchasesPageDTO } from "../types/buyer"
import apiClient from "./api-client"

export const buyerDataSource = {
  async getMyPurchases(page = 0, size = 10): Promise<BuyerPurchasesPageDTO> {
    const response = await apiClient.get<BuyerPurchasesPageDTO>("/buyers/me/purchases", {
      params: { page, size },
    })
    return response.data
  },
}
