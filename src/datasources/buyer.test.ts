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

  it("finds a purchased package beyond the first history page", async () => {
    // arrange
    const firstPage: BuyerPurchasesPageDTO = {
      content: [{ id: 1, price: 950, purchasedAt: "2026-10-01", travelPackage: { ...favoritePackageDTO, id: 99 } }],
      totalElements: 101, totalPages: 2, size: 100, number: 0,
    }
    const secondPage: BuyerPurchasesPageDTO = {
      ...firstPage, number: 1,
      content: [{ id: 2, price: 950, purchasedAt: "2026-10-01", travelPackage: favoritePackageDTO }],
    }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: firstPage }).mockResolvedValueOnce({ data: secondPage })

    // act
    const purchased = await buyerDataSource.hasPurchasedPackage(favoritePackageDTO.id)

    // assert
    expect(purchased).toBe(true)
    expect(apiClient.get).toHaveBeenNthCalledWith(1, "/buyers/me/purchases", { params: { page: 0, size: 100 } })
    expect(apiClient.get).toHaveBeenNthCalledWith(2, "/buyers/me/purchases", { params: { page: 1, size: 100 } })
  })

  it("does not mark a package as purchased when the history is empty", async () => {
    // arrange
    const emptyPage: BuyerPurchasesPageDTO = { content: [], totalElements: 0, totalPages: 0, size: 100, number: 0 }
    vi.mocked(apiClient.get).mockResolvedValueOnce({ data: emptyPage })

    // act
    const purchased = await buyerDataSource.hasPurchasedPackage(favoritePackageDTO.id)

    // assert
    expect(purchased).toBe(false)
    expect(apiClient.get).toHaveBeenCalledTimes(1)
  })

  it("propagates a history failure instead of assuming the package can be purchased", async () => {
    // arrange
    const error = new Error("Servicio no disponible")
    vi.mocked(apiClient.get).mockRejectedValueOnce(error)

    // act
    const purchased = buyerDataSource.hasPurchasedPackage(favoritePackageDTO.id)

    // assert
    await expect(purchased).rejects.toBe(error)
  })
})
