import type { TravelPackageResponseDTO } from "../types/package"
import apiClient from "./api-client"

export const favoritesDataSource = {
  async getFavorites(): Promise<TravelPackageResponseDTO[]> {
    const response = await apiClient.get<TravelPackageResponseDTO[]>("/buyers/me/favorites")
    return response.data
  },

  async addFavorite(packageId: number): Promise<void> {
    await apiClient.post(`/buyers/me/favorites/${packageId}`)
  },

  async removeFavorite(packageId: number): Promise<void> {
    await apiClient.delete(`/buyers/me/favorites/${packageId}`)
  },
}
