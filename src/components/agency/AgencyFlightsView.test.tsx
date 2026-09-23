import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AgencyFlightsView } from "./AgencyFlightsView"
import type { AgencyFlight } from "../../models/agency"

describe("AgencyFlightsView component", () => {
  const mockFlight: AgencyFlight = {
    id: 501,
    flightNumber: "AR-1300",
    airline: "Aerolíneas Argentinas",
    originCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
    destinationCity: { id: 5, name: "Nueva York", country: { isoCode: "US", name: "Estados Unidos" } },
    departureDate: new Date("2026-10-01T10:00:00Z"),
    arrivalDate: new Date("2026-10-01T18:00:00Z"),
    capacity: 200,
    availableSeats: 35,
    price: 600,
  }

  let mockOnDestinationChange: (id?: number) => void
  let mockOnOriginChange: (id?: number) => void
  let mockOnOnlyAvailableToggle: () => void
  let mockOnUseFlightInPackage: (flight: AgencyFlight) => void
  let mockOnRefresh: () => void

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnDestinationChange = vi.fn()
    mockOnOriginChange = vi.fn()
    mockOnOnlyAvailableToggle = vi.fn()
    mockOnUseFlightInPackage = vi.fn()
    mockOnRefresh = vi.fn()
  })

  it("renders flight card with route and availability", () => {
    // arrange & act
    render(
      <AgencyFlightsView
        flights={[mockFlight]}
        isLoading={false}
        onlyAvailable={true}
        onDestinationChange={mockOnDestinationChange}
        onOriginChange={mockOnOriginChange}
        onOnlyAvailableToggle={mockOnOnlyAvailableToggle}
        onUseFlightInPackage={mockOnUseFlightInPackage}
        onRefresh={mockOnRefresh}
      />
    )

    // assert
    expect(screen.getByText("AR-1300")).toBeDefined()
    expect(screen.getByText("Aerolíneas Argentinas")).toBeDefined()
    expect(screen.getByText("Buenos Aires")).toBeDefined()
    expect(screen.getByText("Nueva York")).toBeDefined()
    expect(screen.getByText("35 disp. (200 tot.)")).toBeDefined()
  })

  it("calls onUseFlightInPackage when Usar en nuevo paquete button is clicked", () => {
    // arrange
    render(
      <AgencyFlightsView
        flights={[mockFlight]}
        isLoading={false}
        onlyAvailable={true}
        onDestinationChange={mockOnDestinationChange}
        onOriginChange={mockOnOriginChange}
        onOnlyAvailableToggle={mockOnOnlyAvailableToggle}
        onUseFlightInPackage={mockOnUseFlightInPackage}
        onRefresh={mockOnRefresh}
      />
    )
    const useBtn = screen.getByRole("button", {
      name: /usar en nuevo paquete/i,
    })

    // act
    fireEvent.click(useBtn)

    // assert
    expect(mockOnUseFlightInPackage).toHaveBeenCalledWith(mockFlight)
  })

  it("calls onOnlyAvailableToggle when the availability checkbox is toggled", () => {
    // arrange
    render(
      <AgencyFlightsView
        flights={[mockFlight]}
        isLoading={false}
        onlyAvailable={true}
        onDestinationChange={mockOnDestinationChange}
        onOriginChange={mockOnOriginChange}
        onOnlyAvailableToggle={mockOnOnlyAvailableToggle}
        onUseFlightInPackage={mockOnUseFlightInPackage}
        onRefresh={mockOnRefresh}
      />
    )
    const checkbox = screen.getByRole("checkbox")

    // act
    fireEvent.click(checkbox)

    // assert
    expect(mockOnOnlyAvailableToggle).toHaveBeenCalled()
  })
})
