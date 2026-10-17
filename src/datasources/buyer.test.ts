import { beforeEach, describe, expect, it, vi } from "vitest"
import { buyerDataSource } from "./buyer"
import apiClient from "./api-client"
import type { BuyerPurchasesPageDTO } from "../types/buyer"
import { favoritePackageDTO } from "../tests/fixtures/package"

vi.mock("./api-client", () => ({
  default: {
    get: vi.fn(),
  },
}))

describe("buyerDataSource", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("fetches buyer purchases with pagination parameters", async () => {
    // arrange
    const mockPageDTO: BuyerPurchasesPageDTO = {
      content: [
        {
          id: 1,
          price: 500,
          purchasedAt: "2026-09-10T10:00:00Z",
          travelPackage: favoritePackageDTO,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false,
    }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: mockPageDTO })

    // act
    const result = await buyerDataSource.getMyPurchases(0, 10)

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/buyers/me/purchases", {
      params: { page: 0, size: 10 },
    })
    expect(result).toEqual(mockPageDTO)
  })
})
