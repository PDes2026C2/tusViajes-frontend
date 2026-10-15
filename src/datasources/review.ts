import type {
  ReviewPageResponseDTO,
  ReviewRequestDTO,
  ReviewResponseDTO,
} from "../types/review"
import apiClient from "./api-client"

export const reviewDataSource = {
  async createReview(
    travelPackageId: number,
    dto: ReviewRequestDTO
  ): Promise<ReviewResponseDTO> {
    const response = await apiClient.post<ReviewResponseDTO>(
      `/reviews/${travelPackageId}`,
      dto
    )
    return response.data
  },

  async getMyReviews(page = 0, size = 100): Promise<ReviewPageResponseDTO> {
    const response = await apiClient.get<ReviewPageResponseDTO>(
      "/buyers/me/reviews",
      { params: { page, size } }
    )
    return response.data
  },
}
