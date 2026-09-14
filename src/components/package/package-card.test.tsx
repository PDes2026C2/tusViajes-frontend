import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { TravelPackageCard } from "./package-card"
import type { TravelPackage } from "../../models/package"

describe("TravelPackageCard component", () => {
  const mockPackage: TravelPackage = {
    id: 1,
    name: "Aventura en Bariloche",
    description: "Vuelo directo + 7 noches en hotel con vista al lago.",
    price: 950,
    initialDate: new Date("2026-10-10T10:00:00Z"),
    finalDate: new Date("2026-10-17T10:00:00Z"),
    nights: 7,
    hotel: {
      id: 10,
      name: "Hotel del Cerro",
      city: {
        id: 2,
        name: "Bariloche",
        country: { isoCode: "AR", name: "Argentina" },
      },
      photoUrl: "https://example.com/photo.jpg",
    },
    departureFlight: {
      id: 101,
      flightNumber: "AR-1200",
      originCity: {
        id: 1,
        name: "Buenos Aires",
        country: { isoCode: "AR", name: "Argentina" },
      },
      destinationCity: {
        id: 2,
        name: "Bariloche",
        country: { isoCode: "AR", name: "Argentina" },
      },
      departureTime: new Date("2026-10-10T10:00:00Z"),
      arrivalTime: new Date("2026-10-10T12:00:00Z"),
    },
    arrivalFlight: {
      id: 102,
      flightNumber: "AR-1201",
      originCity: {
        id: 2,
        name: "Bariloche",
        country: { isoCode: "AR", name: "Argentina" },
      },
      destinationCity: {
        id: 1,
        name: "Buenos Aires",
        country: { isoCode: "AR", name: "Argentina" },
      },
      departureTime: new Date("2026-10-17T14:00:00Z"),
      arrivalTime: new Date("2026-10-17T16:00:00Z"),
    },
  }

  it("renders the package information, flight details, and calculated nights", () => {
    // arrange
    render(<TravelPackageCard packageData={mockPackage} />)

    // act & assert
    expect(screen.getByText("Aventura en Bariloche")).toBeDefined()
    expect(screen.getByText(/Vuelo directo \+ 7 noches/)).toBeDefined()
    expect(screen.getByText("Vuelo de Ida")).toBeDefined()
    expect(screen.getByText("Vuelo de Vuelta")).toBeDefined()
    expect(screen.getByText("Buenos Aires → Bariloche")).toBeDefined()
    expect(screen.getByText("Bariloche → Buenos Aires")).toBeDefined()
    expect(screen.getByText("Hotel del Cerro")).toBeDefined()
    expect(screen.getByText(/7 noches de estadía/)).toBeDefined()
  })

  it("calls onAddToCart callback with packageData when Agregar al carrito is clicked", () => {
    // arrange
    const onAddToCart = vi.fn()
    render(<TravelPackageCard packageData={mockPackage} onAddToCart={onAddToCart} />)
    const cartButton = screen.getByRole("button", { name: /agregar al carrito/i })

    // act
    fireEvent.click(cartButton)

    // assert
    expect(onAddToCart).toHaveBeenCalledWith(mockPackage)
  })

  it("calls onViewDetails callback with packageData when Ver detalle is clicked", () => {
    // arrange
    const onViewDetails = vi.fn()
    render(<TravelPackageCard packageData={mockPackage} onViewDetails={onViewDetails} />)
    const detailButton = screen.getByRole("button", { name: /ver detalle/i })

    // act
    fireEvent.click(detailButton)

    // assert
    expect(onViewDetails).toHaveBeenCalledWith(mockPackage)
  })
})
