import { beforeEach, describe, expect, it, vi } from "vitest"
import apiClient from "./api-client"
import { purchaseDataSource } from "./purchase"
import { favoritePackageDTO } from "../tests/fixtures/package"
import type { BuyerPurchaseResponseDTO } from "../types/buyer"

vi.mock("./api-client", () => ({ default: { post: vi.fn() } }))

describe("purchaseDataSource", () => {
  beforeEach(() => { vi.resetAllMocks() })

  it("buys one package for the authenticated account and returns the purchase", async () => {
    // arrange
    const expectedPurchase: BuyerPurchaseResponseDTO = {
      id: 501, price: 950, purchasedAt: "2026-10-01T12:00:00", travelPackage: favoritePackageDTO,
    }
    vi.mocked(apiClient.post).mockResolvedValue({ data: expectedPurchase })

    // act
    const purchase = await purchaseDataSource.purchasePackage(favoritePackageDTO.id)

    // assert
    expect(apiClient.post).toHaveBeenCalledWith(`/purchases/${favoritePackageDTO.id}`)
    expect(purchase).toEqual(expectedPurchase)
  })

  it("propagates a rejected purchase instead of fabricating a successful result", async () => {
    // arrange
    const error = new Error("Uno de los vuelos no cuenta con cupo disponible")
    vi.mocked(apiClient.post).mockRejectedValue(error)

    // act
    const purchase = purchaseDataSource.purchasePackage(favoritePackageDTO.id)

    // assert
    await expect(purchase).rejects.toBe(error)
  })
})
