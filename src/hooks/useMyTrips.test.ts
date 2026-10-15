import { renderHook, act } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { toast } from "react-toastify"
import { useMyTrips } from "./useMyTrips"
import { useAuth } from "./useAuth"
import { useMyTripsStore, type MyTripsState } from "../stores/myTrips"
import type { BuyerPurchase } from "../models/purchase"
import { favoritePackage } from "../tests/fixtures/package"

vi.mock("./useAuth", () => ({ useAuth: vi.fn() }))
vi.mock("../stores/myTrips", () => ({ useMyTripsStore: vi.fn() }))
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

describe("useMyTrips hook", () => {
  const mockUpcomingTrip: BuyerPurchase = {
    id: 1,
    price: 950,
    purchasedAt: new Date("2026-09-01T12:00:00Z"),
    travelPackage: favoritePackage,
    status: "UPCOMING",
    isCompleted: false,
  }

  const mockCompletedTrip: BuyerPurchase = {
    id: 2,
    price: 800,
    purchasedAt: new Date("2026-08-01T12:00:00Z"),
    travelPackage: favoritePackage,
    status: "COMPLETED",
    isCompleted: true,
  }

  let tripsState: MyTripsState

  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 7, email: "buyer@example.com", role: "BUYER" },
    } as any)

    tripsState = {
      buyerId: 7,
      purchases: [mockUpcomingTrip, mockCompletedTrip],
      activeTab: "upcoming",
      page: 0,
      totalPages: 1,
      totalElements: 2,
      isLoading: false,
      error: null,
      reset: vi.fn(),
      setActiveTab: vi.fn((tab) => {
        tripsState.activeTab = tab
      }),
      fetchMyPurchases: vi.fn().mockResolvedValue(undefined),
    }

    vi.mocked(useMyTripsStore).mockImplementation(() => tripsState)
  })

  it("filters trips correctly between upcoming and completed tabs", () => {
    // arrange
    const { result, rerender } = renderHook(() => useMyTrips())

    // assert
    expect(result.current.upcomingCount).toBe(1)
    expect(result.current.completedCount).toBe(1)
    expect(result.current.currentTrips).toEqual([mockUpcomingTrip])

    // act (switch tab)
    act(() => {
      result.current.onTabChange("completed")
    })
    rerender()

    // assert
    expect(tripsState.setActiveTab).toHaveBeenCalledWith("completed")
    expect(result.current.activeTab).toBe("completed")
    expect(result.current.currentTrips).toEqual([mockCompletedTrip])
  })

  it("surfaces an error toast when retry fails", async () => {
    // arrange
    tripsState.fetchMyPurchases = vi.fn().mockRejectedValue(new Error("Fallo de red"))
    const { result } = renderHook(() => useMyTrips())

    // act
    await act(async () => {
      await result.current.onRetry()
    })

    // assert
    expect(toast.error).toHaveBeenCalledWith("Fallo de red")
  })
})
