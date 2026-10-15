import { beforeEach, describe, expect, it, vi } from "vitest"
import { reviewDataSource } from "./review"
import apiClient from "./api-client"
import type { ReviewRequestDTO, ReviewResponseDTO } from "../types/review"

vi.mock("./api-client", () => ({
  default: {
    post: vi.fn(),
    get: vi.fn(),
  },
}))

describe("reviewDataSource", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("submits a review for a travel package", async () => {
    // arrange
    const travelPackageId = 101
    const requestDTO: ReviewRequestDTO = {
      score: 10,
      comment: "Inolvidable",
    }
    const responseDTO: ReviewResponseDTO = {
      id: 5,
      buyerId: 7,
      travelPackageId,
      score: 10,
      comment: "Inolvidable",
      createdAt: "2026-10-14T21:00:00Z",
    }
    vi.mocked(apiClient.post).mockResolvedValueOnce({ data: responseDTO })

    // act
    const result = await reviewDataSource.createReview(travelPackageId, requestDTO)

    // assert
    expect(apiClient.post).toHaveBeenCalledWith(
      `/reviews/${travelPackageId}`,
      requestDTO
    )
    expect(result).toEqual(responseDTO)
  })

  it("fetches the buyer's reviews with pagination params", async () => {
    // arrange
    const pageResponseDTO = {
      content: [
        {
          id: 1,
          buyerId: 7,
          travelPackageId: 101,
          score: 10,
          comment: "Excelente",
          createdAt: "2026-10-14T21:00:00Z",
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 100,
      number: 0,
    }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: pageResponseDTO })

    // act
    const result = await reviewDataSource.getMyReviews(0, 100)

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/buyers/me/reviews", {
      params: { page: 0, size: 100 },
    })
    expect(result).toEqual(pageResponseDTO)
  })
})
