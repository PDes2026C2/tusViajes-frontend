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
    agency: {
      id: 1,
      businessName: "TusViajes Premium",
      taxId: "30-11223344-5",
      email: "contacto@tusviajes.com",
      status: "AUTHORIZED",
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

  it("adds the displayed package when the favorite button is clicked", () => {
    // arrange
    const onAddFavorite = vi.fn()
    render(<TravelPackageCard packageData={mockPackage} canAddFavorite onAddFavorite={onAddFavorite} />)
    const favoriteButton = screen.getByRole("button", { name: `Agregar a favoritos: ${mockPackage.name}` })

    // act
    fireEvent.click(favoriteButton)

    // assert
    expect(onAddFavorite).toHaveBeenCalledWith(mockPackage)
    expect(favoriteButton).toHaveAttribute("aria-pressed", "false")
  })

  it("shows an existing favorite as pressed and prevents adding it again", () => {
    // arrange
    const onAddFavorite = vi.fn()
    render(<TravelPackageCard packageData={mockPackage} canAddFavorite isFavorite onAddFavorite={onAddFavorite} />)
    const favoriteButton = screen.getByRole("button", { name: `Guardado en favoritos: ${mockPackage.name}` })

    // act
    fireEvent.click(favoriteButton)

    // assert
    expect(favoriteButton).toHaveAttribute("aria-pressed", "true")
    expect(favoriteButton).toBeDisabled()
    expect(screen.getByText("En favoritos")).toBeInTheDocument()
    expect(onAddFavorite).not.toHaveBeenCalled()
  })

  it.each([
    { isAddingFavorite: true, isLoadingFavorites: false, label: "Guardando..." },
    { isAddingFavorite: false, isLoadingFavorites: true, label: "Cargando favoritos..." },
  ])("disables the favorite action while $label", ({ isAddingFavorite, isLoadingFavorites, label }) => {
    // arrange
    const onAddFavorite = vi.fn()
    render(
      <TravelPackageCard
        packageData={mockPackage}
        canAddFavorite
        isAddingFavorite={isAddingFavorite}
        isLoadingFavorites={isLoadingFavorites}
        onAddFavorite={onAddFavorite}
      />
    )
    const favoriteButton = screen.getByRole("button", { name: /agregar a favoritos/i })

    // act
    fireEvent.click(favoriteButton)

    // assert
    expect(favoriteButton).toBeDisabled()
    expect(favoriteButton).toHaveAttribute("aria-busy", "true")
    expect(screen.getByText(label)).toBeInTheDocument()
    expect(onAddFavorite).not.toHaveBeenCalled()
  })

  it("hides the favorite action when it is unavailable for the user's role", () => {
    // arrange
    const onAddFavorite = vi.fn()

    // act
    render(<TravelPackageCard packageData={mockPackage} canAddFavorite={false} onAddFavorite={onAddFavorite} />)

    // assert
    expect(screen.queryByRole("button", { name: /favoritos/i })).not.toBeInTheDocument()
  })
})
