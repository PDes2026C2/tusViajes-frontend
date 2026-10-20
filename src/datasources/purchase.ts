import type { BuyerPurchaseResponseDTO } from "../types/buyer"
import apiClient from "./api-client"

export const purchaseDataSource = {
  async purchasePackage(travelPackageId: number): Promise<BuyerPurchaseResponseDTO> {
    const response = await apiClient.post<BuyerPurchaseResponseDTO>(`/purchases/${travelPackageId}`)
    return response.data
  },
}
