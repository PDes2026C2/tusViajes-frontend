import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { usePackageDetailsModal } from "../../hooks/usePackageDetailsModal"
import { favoritePackage } from "../../tests/fixtures/package"
import { PackageDetailsModal } from "./PackageDetailsModal"

describe("PackageDetailsModal", () => {
  it("does not render when no package is selected", () => {
    // arrange
    const onClose = vi.fn()

    // act
    render(<PackageDetailsModal packageData={null} onClose={onClose} />)

    // assert
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("shows the full description, hotel, stay, agency, price and both flight schedules", () => {
    // arrange
    const pkg = {
      ...favoritePackage,
      description: "Una descripción completa del viaje. ".repeat(20),
      hotel: { ...favoritePackage.hotel, services: "Desayuno, Wi-Fi, recepción 24 horas" },
    }
    const expectedPrice = "USD 950,00"

    // act
    render(<PackageDetailsModal packageData={pkg} onClose={vi.fn()} />)

    // assert
    const dialog = screen.getByRole("dialog", { name: pkg.name })
    expect(dialog).toHaveAttribute("aria-modal", "true")
    expect(within(dialog).getByText(pkg.description.trim())).toBeInTheDocument()
    expect(within(dialog).getByRole("img", { name: pkg.hotel.name })).toHaveAttribute("src", pkg.hotel.photoUrl)
    expect(within(dialog).getByRole("heading", { name: "Servicios del hotel" })).toBeInTheDocument()
    expect(within(dialog).getByText(pkg.hotel.services)).toBeInTheDocument()
    expect(within(dialog).getByText("7 noches")).toBeInTheDocument()
    expect(within(dialog).getByText("10 de octubre de 2026")).toBeInTheDocument()
    expect(within(dialog).getByText("17 de octubre de 2026")).toBeInTheDocument()
    expect(within(dialog).getByText(pkg.agency.businessName)).toBeInTheDocument()
    expect(within(dialog).getByRole("link", { name: pkg.agency.email })).toHaveAttribute("href", `mailto:${pkg.agency.email}`)
    expect(within(dialog).getByText(expectedPrice)).toBeInTheDocument()
    for (const [title, flight] of [["Vuelo de ida", pkg.departureFlight], ["Vuelo de vuelta", pkg.arrivalFlight]] as const) {
      const section = within(dialog).getByRole("heading", { name: title }).closest("section")!
      expect(within(section).getByText(`Vuelo ${flight.flightNumber}`)).toBeInTheDocument()
      expect(within(section).getByText(`${flight.originCity.name}, ${flight.originCity.country.name}`)).toBeInTheDocument()
      expect(within(section).getByText(`${flight.destinationCity.name}, ${flight.destinationCity.country.name}`)).toBeInTheDocument()
      expect(Array.from(section.querySelectorAll("time"), (time) => time.dateTime)).toEqual([
        flight.departureTime.toISOString(), flight.arrivalTime.toISOString(),
      ])
    }
    expect(within(dialog).queryByRole("button", { name: /Comprar/ })).not.toBeInTheDocument()
  })

  it("supports packages without a description or photo and a one-night stay", () => {
    // arrange
    const pkg = { ...favoritePackage, description: "", nights: 1, hotel: { ...favoritePackage.hotel, photoUrl: "" } }

    // act
    render(<PackageDetailsModal packageData={pkg} onClose={vi.fn()} />)

    // assert
    expect(screen.getByText("Sin descripción proporcionada.")).toBeInTheDocument()
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(screen.getByText(pkg.hotel.name)).toBeInTheDocument()
    expect(screen.getByText("1 noche")).toBeInTheDocument()
    expect(screen.getByText("Foto no disponible")).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: "Servicios del hotel" })).not.toBeInTheDocument()
  })

  it("keeps only the cross as a close button", () => {
    // arrange
    const onClose = vi.fn()
    render(<PackageDetailsModal packageData={favoritePackage} onClose={onClose} />)

    // act
    fireEvent.click(screen.getByRole("button", { name: "Cerrar detalle" }))

    // assert
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(screen.getAllByRole("button")).toHaveLength(1)
    expect(screen.queryByRole("button", { name: "Cerrar" })).not.toBeInTheDocument()
  })

  it("replaces a failed image with a placeholder and loads the next hotel's photo", () => {
    // arrange
    const onClose = vi.fn()
    const nextPackage = { ...favoritePackage, hotel: { ...favoritePackage.hotel, photoUrl: "https://example.com/another-hotel.jpg" } }
    const { rerender } = render(<PackageDetailsModal packageData={favoritePackage} onClose={onClose} />)

    // act
    fireEvent.error(screen.getByRole("img", { name: favoritePackage.hotel.name }))

    // assert
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(screen.getByText("Foto no disponible")).toBeInTheDocument()

    // act
    rerender(<PackageDetailsModal packageData={nextPackage} onClose={onClose} />)

    // assert
    expect(screen.getByRole("img", { name: nextPackage.hotel.name })).toHaveAttribute("src", nextPackage.hotel.photoUrl)
    expect(screen.queryByText("Foto no disponible")).not.toBeInTheDocument()
  })

  it("closes with Escape, restores focus and shows a different package when reopened", async () => {
    // arrange
    const otherPackage = { ...favoritePackage, id: 202, name: "Escapada a Mendoza", description: "Otra experiencia" }
    function PackageList() {
      const detailsModal = usePackageDetailsModal()
      return <>
        <button onClick={() => detailsModal.openDetails(favoritePackage)}>Ver Bariloche</button>
        <button onClick={() => detailsModal.openDetails(otherPackage)}>Ver Mendoza</button>
        <PackageDetailsModal packageData={detailsModal.selectedPackage} onClose={detailsModal.closeDetails} />
      </>
    }
    render(<PackageList />)
    const firstTrigger = screen.getByRole("button", { name: "Ver Bariloche" })
    firstTrigger.focus()
    fireEvent.click(firstTrigger)
    await screen.findByRole("dialog", { name: favoritePackage.name })

    // act
    fireEvent.keyDown(document.activeElement!, { key: "Escape" })

    // assert
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(firstTrigger).toHaveFocus()

    // act
    fireEvent.click(screen.getByRole("button", { name: "Ver Mendoza" }))

    // assert
    expect(await screen.findByRole("dialog", { name: otherPackage.name })).toBeInTheDocument()
    expect(screen.getByText(otherPackage.description)).toBeInTheDocument()
    expect(screen.queryByRole("heading", { name: favoritePackage.name })).not.toBeInTheDocument()
  })
})
