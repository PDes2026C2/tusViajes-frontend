import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MyTripsView, type MyTripsViewProps } from "./MyTripsView"
import type { BuyerPurchase } from "../../models/purchase"
import { favoritePackage } from "../../tests/fixtures/package"

describe("MyTripsView component", () => {
  const mockTrip: BuyerPurchase = {
    id: 1,
    price: 950,
    purchasedAt: new Date("2026-09-01T10:00:00Z"),
    travelPackage: favoritePackage,
    status: "UPCOMING",
    isCompleted: false,
  }

  let defaultProps: MyTripsViewProps

  beforeEach(() => {
    defaultProps = {
      trips: [mockTrip],
      activeTab: "upcoming",
      upcomingCount: 1,
      completedCount: 0,
      isLoading: false,
      error: null,
      onTabChange: vi.fn(),
      onRetry: vi.fn(),
      onExplore: vi.fn(),
      onViewDetails: vi.fn(),
      onReviewClick: vi.fn(),
    }
  })

  it("renders trips and allows changing tabs", () => {
    // arrange
    render(<MyTripsView {...defaultProps} />)

    // act
    const completedTabButton = screen.getByRole("button", { name: /Finalizados/ })
    fireEvent.click(completedTabButton)

    // assert
    expect(screen.getByText("Mis Viajes")).toBeInTheDocument()
    expect(screen.getByText("1 viaje")).toBeInTheDocument()
    expect(screen.getByText(favoritePackage.name)).toBeInTheDocument()
    expect(defaultProps.onTabChange).toHaveBeenCalledWith("completed")
  })

  it("renders loading state when isLoading is true", () => {
    // arrange
    render(<MyTripsView {...defaultProps} isLoading={true} />)

    // act & assert
    expect(screen.getByRole("status")).toBeInTheDocument()
    expect(screen.getByText("Cargando tus viajes...")).toBeInTheDocument()
  })

  it("renders error state and triggers onRetry", () => {
    // arrange
    render(<MyTripsView {...defaultProps} error="Error al cargar" />)

    // act
    const retryButton = screen.getByRole("button", { name: /Reintentar/ })
    fireEvent.click(retryButton)

    // assert
    expect(screen.getByRole("alert")).toBeInTheDocument()
    expect(screen.getByText("Error al cargar")).toBeInTheDocument()
    expect(defaultProps.onRetry).toHaveBeenCalledTimes(1)
  })

  it("renders empty state and allows exploring packages", () => {
    // arrange
    render(<MyTripsView {...defaultProps} trips={[]} />)

    // act
    const exploreButton = screen.getByRole("button", { name: /Explorar paquetes/ })
    fireEvent.click(exploreButton)

    // assert
    expect(screen.getByText("No tenés viajes próximos")).toBeInTheDocument()
    expect(defaultProps.onExplore).toHaveBeenCalledTimes(1)
  })

  it("renders 'Reseña enviada' badge when package id is in reviewedPackageIds", () => {
    // arrange
    const completedTrip: BuyerPurchase = {
      ...mockTrip,
      id: 2,
      status: "COMPLETED",
      isCompleted: true,
    }
    render(
      <MyTripsView
        {...defaultProps}
        trips={[completedTrip]}
        activeTab="completed"
        reviewedPackageIds={[completedTrip.travelPackage.id]}
      />
    )

    // act & assert
    expect(screen.getByText("Reseña enviada")).toBeInTheDocument()
  })
})
