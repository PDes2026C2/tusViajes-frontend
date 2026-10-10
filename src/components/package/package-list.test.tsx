import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PackageList } from "./package-list"
import type { TravelPackage } from "../../models/package"

describe("PackageList component", () => {
  const mockPackages: TravelPackage[] = [
    {
      id: 1,
      name: "Paquete a Miami",
      description: "Playas y compras",
      price: 1500,
      initialDate: new Date("2026-11-01T00:00:00Z"),
      finalDate: new Date("2026-11-08T00:00:00Z"),
      nights: 7,
      hotel: {
        id: 10,
        name: "Hotel Miami",
        city: { id: 6, name: "Miami", country: { isoCode: "US", name: "Estados Unidos" } },
        photoUrl: "https://example.com/miami.jpg",
      },
      departureFlight: {
        id: 101,
        flightNumber: "AA-100",
        originCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
        destinationCity: { id: 6, name: "Miami", country: { isoCode: "US", name: "Estados Unidos" } },
        departureTime: new Date("2026-11-01T10:00:00Z"),
        arrivalTime: new Date("2026-11-01T18:00:00Z"),
      },
      arrivalFlight: {
        id: 102,
        flightNumber: "AA-101",
        originCity: { id: 6, name: "Miami", country: { isoCode: "US", name: "Estados Unidos" } },
        destinationCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
        departureTime: new Date("2026-11-08T10:00:00Z"),
        arrivalTime: new Date("2026-11-08T18:00:00Z"),
      },
      agency: {
        id: 1,
        businessName: "TusViajes Premium",
        taxId: "30-11223344-5",
        email: "premium@tusviajes.com",
        status: "AUTHORIZED",
      },
    },
    {
      id: 2,
      name: "Paquete a Madrid",
      description: "Historia y cultura",
      price: 1800,
      initialDate: new Date("2026-12-01T00:00:00Z"),
      finalDate: new Date("2026-12-10T00:00:00Z"),
      nights: 9,
      hotel: {
        id: 20,
        name: "Hotel Madrid",
        city: { id: 10, name: "Madrid", country: { isoCode: "ES", name: "España" } },
        photoUrl: "https://example.com/madrid.jpg",
      },
      departureFlight: {
        id: 201,
        flightNumber: "IB-200",
        originCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
        destinationCity: { id: 10, name: "Madrid", country: { isoCode: "ES", name: "España" } },
        departureTime: new Date("2026-12-01T10:00:00Z"),
        arrivalTime: new Date("2026-12-02T04:00:00Z"),
      },
      arrivalFlight: {
        id: 202,
        flightNumber: "IB-201",
        originCity: { id: 10, name: "Madrid", country: { isoCode: "ES", name: "España" } },
        destinationCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
        departureTime: new Date("2026-12-10T10:00:00Z"),
        arrivalTime: new Date("2026-12-11T04:00:00Z"),
      },
      agency: {
        id: 2,
        businessName: "Caribe & Sol",
        taxId: "30-99887766-4",
        email: "info@caribesol.com",
        status: "AUTHORIZED",
      },
    },
  ]

  it("renders empty state when there are no packages", () => {
    // arrange & act
    render(<PackageList packages={[]} isLoading={false} />)

    // assert
    expect(
      screen.getByText("No encontramos paquetes para tu búsqueda")
    ).toBeDefined()
  })

  it("renders packages and pagination when data is available", () => {
    // arrange
    const onPageChange = vi.fn()
    render(
      <PackageList
        packages={mockPackages}
        isLoading={false}
        currentPage={0}
        totalPages={2}
        totalElements={2}
        onPageChange={onPageChange}
      />
    )

    // act & assert
    expect(screen.getByText("Paquete a Miami")).toBeDefined()
    expect(screen.getByText("Paquete a Madrid")).toBeDefined()
    expect(screen.getByText("2 opciones")).toBeDefined()
    expect(screen.getByRole("button", { name: "1" })).toBeDefined()
    expect(screen.getByRole("button", { name: "2" })).toBeDefined()
  })

  it("passes each package's saved status and favorite action to its card", () => {
    // arrange
    const onAddFavorite = vi.fn()
    const onRemoveFavorite = vi.fn()
    render(
      <PackageList
        packages={mockPackages}
        favoriteIds={[mockPackages[0].id]}
        canAddFavorite
        onAddFavorite={onAddFavorite}
        onRemoveFavorite={onRemoveFavorite}
      />
    )
    const savedButton = screen.getByRole("button", { name: `Quitar de favoritos: ${mockPackages[0].name}` })
    const unsavedButton = screen.getByRole("button", { name: `Agregar a favoritos: ${mockPackages[1].name}` })

    // act
    fireEvent.click(unsavedButton)
    fireEvent.click(savedButton)

    // assert
    expect(savedButton).toBeEnabled()
    expect(savedButton).toHaveAttribute("aria-pressed", "true")
    expect(unsavedButton).toBeEnabled()
    expect(onAddFavorite).toHaveBeenCalledWith(mockPackages[1])
    expect(onRemoveFavorite).toHaveBeenCalledWith(mockPackages[0])
  })

  it("disables only the card whose favorite is being saved", () => {
    // arrange
    const onAddFavorite = vi.fn()

    // act
    render(
      <PackageList
        packages={mockPackages}
        pendingFavoriteIds={[mockPackages[0].id]}
        canAddFavorite
        onAddFavorite={onAddFavorite}
      />
    )

    // assert
    expect(screen.getByRole("button", { name: `Agregar a favoritos: ${mockPackages[0].name}` })).toBeDisabled()
    expect(screen.getByRole("button", { name: `Agregar a favoritos: ${mockPackages[1].name}` })).toBeEnabled()
  })
})
