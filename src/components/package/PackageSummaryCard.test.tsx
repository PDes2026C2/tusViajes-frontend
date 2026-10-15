import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import type { AgencyPackageItem } from "../../models/agency"
import { favoritePackage } from "../../tests/fixtures/package"
import { PackageSummaryCard } from "./PackageSummaryCard"

describe("PackageSummaryCard", () => {
  let savedPackage: AgencyPackageItem

  beforeEach(() => {
    savedPackage = {
      ...favoritePackage,
      startDate: favoritePackage.initialDate,
      endDate: favoritePackage.finalDate,
      returnFlight: favoritePackage.arrivalFlight,
    }
  })

  it("renders the hotel, price, destination, dates, nights and round-trip flights", () => {
    // arrange
    const expectedDates = `${savedPackage.startDate.toLocaleDateString("es-AR")} - ${savedPackage.endDate.toLocaleDateString("es-AR")} (${savedPackage.nights} ${savedPackage.nights === 1 ? "noche" : "noches"})`

    // act
    render(<PackageSummaryCard packageData={savedPackage} />)

    // assert
    expect(screen.getByRole("heading", { name: savedPackage.name })).toBeInTheDocument()
    expect(screen.getByText(savedPackage.description)).toBeInTheDocument()
    expect(screen.getByRole("img", { name: savedPackage.hotel.name })).toHaveAttribute("src", savedPackage.hotel.photoUrl)
    expect(screen.getByText(savedPackage.hotel.name)).toBeInTheDocument()
    expect(screen.getByText("USD $950")).toBeInTheDocument()
    expect(screen.getByText(savedPackage.hotel.city.name)).toBeInTheDocument()
    expect(screen.getByText(expectedDates)).toBeInTheDocument()
    expect(screen.getByText("AR-1200 / AR-1201")).toBeInTheDocument()
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("supports missing photos and descriptions while preserving supplied actions", () => {
    // arrange
    savedPackage = { ...savedPackage, description: "", hotel: { ...savedPackage.hotel, photoUrl: "" } }
    const onEdit = vi.fn()
    render(
      <PackageSummaryCard packageData={savedPackage}>
        <button onClick={onEdit}>Editar</button>
      </PackageSummaryCard>,
    )

    // act
    fireEvent.click(screen.getByRole("button", { name: "Editar" }))

    // assert
    expect(screen.queryByRole("img")).not.toBeInTheDocument()
    expect(screen.getByText("Sin descripción proporcionada.")).toBeInTheDocument()
    expect(screen.getByText(savedPackage.hotel.name)).toBeInTheDocument()
    expect(onEdit).toHaveBeenCalledTimes(1)
  })

  it("renders an optional status badge alongside image action", () => {
    // arrange
    const statusBadge = <span data-testid="status-badge">Disponible</span>

    // act
    render(<PackageSummaryCard packageData={savedPackage} statusBadge={statusBadge} />)

    // assert
    expect(screen.getByTestId("status-badge")).toBeInTheDocument()
  })
})
