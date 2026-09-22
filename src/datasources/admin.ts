import apiClient from "./api-client"
import type {
  AgencyResponseDTO,
  TopAgencyDTO,
  BuyerResponseDTO,
  TopRatedCityDTO,
  TopBuyerDTO,
} from "../types/admin"
import type { CityDTO } from "../types/location"

export const adminAgencyDataSource = {
  async getPendingAgencies(): Promise<AgencyResponseDTO[]> {
    const response = await apiClient.get<AgencyResponseDTO[]>("/admin/agencies/pending")
    return response.data
  },

  async getAllAgencies(): Promise<AgencyResponseDTO[]> {
    const response = await apiClient.get<AgencyResponseDTO[]>("/agencies")
    return response.data
  },

  async authorizeAgency(id: number): Promise<AgencyResponseDTO> {
    const response = await apiClient.post<AgencyResponseDTO>(`/admin/agencies/${id}/authorize`)
    return response.data
  },

  async rejectAgency(id: number): Promise<AgencyResponseDTO> {
    const response = await apiClient.post<AgencyResponseDTO>(`/admin/agencies/${id}/reject`)
    return response.data
  },

  async getBuyers(): Promise<BuyerResponseDTO[]> {
    const response = await apiClient.get<BuyerResponseDTO[]>("/buyers")
    return response.data
  },

  async getTopBuyers(): Promise<TopBuyerDTO[]> {
    const response = await apiClient.get<TopBuyerDTO[]>("/admin/metrics/top-buyers")
    return response.data
  },

  async getTopRankedDestinations(): Promise<CityDTO[]> {
    const response = await apiClient.get<CityDTO[]>("/admin/metrics/top-destinations")
    return response.data
  },

  async getTopAgencies(): Promise<TopAgencyDTO[]> {
    const response = await apiClient.get<TopAgencyDTO[]>("/admin/metrics/top-agencies")
    return response.data
  },

  async getTopRatedDestinations(): Promise<TopRatedCityDTO[]> {
    const response = await apiClient.get<TopRatedCityDTO[]>("/admin/metrics/top-rated-destinations")
    return response.data
  },
}

export const adminDataSource = adminAgencyDataSource
