import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { MyTripCard } from "./MyTripCard"
import type { BuyerPurchase } from "../../models/purchase"
import { favoritePackage } from "../../tests/fixtures/package"

describe("MyTripCard component", () => {
  const mockCompletedTrip: BuyerPurchase = {
    id: 101,
    price: 950,
    purchasedAt: new Date("2026-09-01T10:00:00Z"),
    travelPackage: favoritePackage,
    status: "COMPLETED",
    isCompleted: true,
  }

  const mockUpcomingTrip: BuyerPurchase = {
    id: 102,
    price: 950,
    purchasedAt: new Date("2026-09-01T10:00:00Z"),
    travelPackage: favoritePackage,
    status: "UPCOMING",
    isCompleted: false,
  }

  it("renders trip details and triggers onViewDetails", () => {
    // arrange
    const onViewDetails = vi.fn()
    const onReviewClick = vi.fn()
    render(
      <MyTripCard
        trip={mockCompletedTrip}
        onViewDetails={onViewDetails}
        onReviewClick={onReviewClick}
      />
    )

    // act
    const viewDetailsButton = screen.getByRole("button", { name: "Ver detalle" })
    fireEvent.click(viewDetailsButton)

    // assert
    expect(screen.getByText(favoritePackage.name)).toBeInTheDocument()
    expect(screen.getByText("Finalizado")).toBeInTheDocument()
    expect(onViewDetails).toHaveBeenCalledWith(favoritePackage)
  })

  it("enables review button and calls onReviewClick when trip is completed", () => {
    // arrange
    const onViewDetails = vi.fn()
    const onReviewClick = vi.fn()
    render(
      <MyTripCard
        trip={mockCompletedTrip}
        onViewDetails={onViewDetails}
        onReviewClick={onReviewClick}
      />
    )

    // act
    const reviewButton = screen.getByRole("button", { name: "Dejar reseña" })
    expect(reviewButton).toBeEnabled()
    fireEvent.click(reviewButton)

    // assert
    expect(onReviewClick).toHaveBeenCalledWith(mockCompletedTrip)
  })

  it("disables review button when trip is not completed", () => {
    // arrange
    const onViewDetails = vi.fn()
    const onReviewClick = vi.fn()
    render(
      <MyTripCard
        trip={mockUpcomingTrip}
        onViewDetails={onViewDetails}
        onReviewClick={onReviewClick}
      />
    )

    // act & assert
    const reviewButton = screen.getByRole("button", { name: "Dejar reseña" })
    expect(reviewButton).toBeDisabled()
    expect(screen.getByText("Próximo")).toBeInTheDocument()
  })
})
