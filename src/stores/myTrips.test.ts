import { beforeEach, describe, expect, it, vi } from "vitest"
import { useMyTripsStore } from "./myTrips"
import { buyerDataSource } from "../datasources/buyer"
import type { BuyerPurchasesPageDTO } from "../types/buyer"
import { favoritePackageDTO } from "../tests/fixtures/package"

vi.mock("../datasources/buyer", () => ({
  buyerDataSource: {
    getMyPurchases: vi.fn(),
  },
}))

describe("useMyTripsStore", () => {
  const mockPageDTO: BuyerPurchasesPageDTO = {
    content: [
      {
        id: 10,
        price: 950,
        purchasedAt: "2026-09-01T12:00:00Z",
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

  beforeEach(() => {
    vi.clearAllMocks()
    useMyTripsStore.getState().reset()
  })

  it("initializes with default state and resets correctly", () => {
    // arrange
    useMyTripsStore.setState({
      buyerId: 5,
      activeTab: "completed",
      isLoading: true,
      error: "Error",
    })

    // act
    useMyTripsStore.getState().reset(12)

    // assert
    const state = useMyTripsStore.getState()
    expect(state.buyerId).toBe(12)
    expect(state.activeTab).toBe("upcoming")
    expect(state.purchases).toEqual([])
    expect(state.isLoading).toBe(false)
    expect(state.error).toBeNull()
  })

  it("updates active tab when setActiveTab is called", () => {
    // arrange
    const expectedTab = "completed"

    // act
    useMyTripsStore.getState().setActiveTab(expectedTab)

    // assert
    expect(useMyTripsStore.getState().activeTab).toBe(expectedTab)
  })

  it("does not fetch if buyerId is null", async () => {
    // arrange
    useMyTripsStore.getState().reset(null)

    // act
    await useMyTripsStore.getState().fetchMyPurchases()

    // assert
    expect(buyerDataSource.getMyPurchases).not.toHaveBeenCalled()
  })

  it("fetches purchases and updates state successfully", async () => {
    // arrange
    useMyTripsStore.getState().reset(7)
    vi.mocked(buyerDataSource.getMyPurchases).mockResolvedValueOnce(mockPageDTO)

    // act
    await useMyTripsStore.getState().fetchMyPurchases(0)

    // assert
    const state = useMyTripsStore.getState()
    expect(buyerDataSource.getMyPurchases).toHaveBeenCalledWith(0)
    expect(state.isLoading).toBe(false)
    expect(state.purchases).toHaveLength(1)
    expect(state.purchases[0].id).toBe(10)
    expect(state.totalElements).toBe(1)
    expect(state.totalPages).toBe(1)
  })

  it("handles fetch failure by saving error message", async () => {
    // arrange
    useMyTripsStore.getState().reset(7)
    const failureMessage = "Network error"
    vi.mocked(buyerDataSource.getMyPurchases).mockRejectedValueOnce(new Error(failureMessage))

    // act & assert
    await expect(useMyTripsStore.getState().fetchMyPurchases(0)).rejects.toThrow(failureMessage)
    const state = useMyTripsStore.getState()
    expect(state.isLoading).toBe(false)
    expect(state.error).toBe(failureMessage)
  })
})
