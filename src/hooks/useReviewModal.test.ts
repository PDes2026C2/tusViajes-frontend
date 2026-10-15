import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { toast } from "react-toastify"
import { useReviewModal } from "./useReviewModal"
import { useMyTripsStore } from "../stores/myTrips"
import type { BuyerPurchase } from "../models/purchase"
import { favoritePackage } from "../tests/fixtures/package"

vi.mock("../stores/myTrips", () => ({
  useMyTripsStore: vi.fn(),
}))

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe("useReviewModal hook", () => {
  const mockTrip: BuyerPurchase = {
    id: 1,
    price: 950,
    purchasedAt: new Date("2026-09-01T12:00:00Z"),
    travelPackage: favoritePackage,
    status: "COMPLETED",
    isCompleted: true,
  }

  let submitReviewMock: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    submitReviewMock = vi.fn().mockResolvedValue(undefined)
    vi.mocked(useMyTripsStore).mockReturnValue({
      submitReview: submitReviewMock,
      isSubmittingReview: false,
    } as any)
  })

  it("opens and closes modal with trip data", () => {
    // arrange
    const { result } = renderHook(() => useReviewModal())

    // act (open)
    act(() => {
      result.current.openReviewModal(mockTrip)
    })

    // assert
    expect(result.current.isOpen).toBe(true)
    expect(result.current.selectedTrip).toEqual(mockTrip)

    // act (close)
    act(() => {
      result.current.closeReviewModal()
    })

    // assert
    expect(result.current.isOpen).toBe(false)
    expect(result.current.selectedTrip).toBeNull()
  })

  it("submits valid review and displays success toast", async () => {
    // arrange
    const { result } = renderHook(() => useReviewModal())
    act(() => {
      result.current.openReviewModal(mockTrip)
    })

    // act
    await act(async () => {
      result.current.form.setValue("score", 9)
      result.current.form.setValue("comment", "Excelente todo")
      await result.current.onSubmit()
    })

    // assert
    expect(submitReviewMock).toHaveBeenCalledWith(mockTrip.travelPackage.id, {
      score: 9,
      comment: "Excelente todo",
    })
    expect(toast.success).toHaveBeenCalledWith("¡Tu reseña fue publicada con éxito!")
    expect(result.current.isOpen).toBe(false)
  })

  it("handles 409 conflict gracefully and closes modal with info toast", async () => {
    // arrange
    submitReviewMock.mockRejectedValueOnce(new Error("409: El comprador ya opinó sobre este paquete"))
    const { result } = renderHook(() => useReviewModal())
    act(() => {
      result.current.openReviewModal(mockTrip)
    })

    // act
    await act(async () => {
      result.current.form.setValue("score", 8)
      await result.current.onSubmit()
    })

    // assert
    expect(toast.info).toHaveBeenCalledWith("Ya habías dejado una opinión para este viaje.")
    expect(result.current.isOpen).toBe(false)
  })

  it("displays error toast when submission fails with other error", async () => {
    // arrange
    submitReviewMock.mockRejectedValueOnce(new Error("Error de servidor"))
    const { result } = renderHook(() => useReviewModal())
    act(() => {
      result.current.openReviewModal(mockTrip)
    })

    // act
    await act(async () => {
      result.current.form.setValue("score", 8)
      await result.current.onSubmit()
    })

    // assert
    expect(toast.error).toHaveBeenCalledWith("Error de servidor")
    expect(result.current.isOpen).toBe(true)
  })
})
