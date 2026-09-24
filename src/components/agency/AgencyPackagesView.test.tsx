import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AgencyPackagesView } from "./AgencyPackagesView"
import type { AgencyPackageItem } from "../../models/agency"

describe("AgencyPackagesView component", () => {
  const mockCity = {
    id: 5,
    name: "Nueva York",
    country: { isoCode: "US", name: "Estados Unidos" },
  }

  const mockPackage: AgencyPackageItem = {
    id: 101,
    name: "Vacaciones en Nueva York",
    description: "Excelente paquete",
    price: 1300,
    startDate: new Date("2026-10-01T10:00:00Z"),
    endDate: new Date("2026-10-08T10:00:00Z"),
    nights: 7,
    hotel: {
      id: 201,
      name: "Grand Manhattan",
      city: mockCity,
      photoUrl: "http://photo.com/1.jpg",
    },
    departureFlight: {
      id: 501,
      flightNumber: "AR-1300",
      originCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
      destinationCity: mockCity,
      departureTime: new Date("2026-10-01T10:00:00Z"),
      arrivalTime: new Date("2026-10-01T18:00:00Z"),
    },
    returnFlight: {
      id: 502,
      flightNumber: "AR-1301",
      originCity: mockCity,
      destinationCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
      departureTime: new Date("2026-10-08T10:00:00Z"),
      arrivalTime: new Date("2026-10-08T18:00:00Z"),
    },
  }

  let mockOnSearchChange: (q: string) => void
  let mockOnOpenCreate: () => void
  let mockOnOpenEdit: (p: AgencyPackageItem) => void
  let mockOnOpenDelete: (p: AgencyPackageItem) => void
  let mockOnRefresh: () => void

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnSearchChange = vi.fn()
    mockOnOpenCreate = vi.fn()
    mockOnOpenEdit = vi.fn()
    mockOnOpenDelete = vi.fn()
    mockOnRefresh = vi.fn()
  })

  it("renders packages with details and price", () => {
    // arrange & act
    render(
      <AgencyPackagesView
        packages={[mockPackage]}
        isLoading={false}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onOpenCreate={mockOnOpenCreate}
        onOpenEdit={mockOnOpenEdit}
        onOpenDelete={mockOnOpenDelete}
        onRefresh={mockOnRefresh}
      />
    )

    // assert
    expect(screen.getByText("Vacaciones en Nueva York")).toBeDefined()
    expect(screen.getByText("Grand Manhattan")).toBeDefined()
    expect(screen.getByText("USD $1300")).toBeDefined()
  })

  it("calls onOpenCreate when Crear Paquete button is clicked", () => {
    // arrange
    render(
      <AgencyPackagesView
        packages={[mockPackage]}
        isLoading={false}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onOpenCreate={mockOnOpenCreate}
        onOpenEdit={mockOnOpenEdit}
        onOpenDelete={mockOnOpenDelete}
        onRefresh={mockOnRefresh}
      />
    )
    const createBtn = screen.getByRole("button", { name: /crear paquete/i })

    // act
    fireEvent.click(createBtn)

    // assert
    expect(mockOnOpenCreate).toHaveBeenCalled()
  })

  it("calls onOpenEdit and onOpenDelete callbacks", () => {
    // arrange
    render(
      <AgencyPackagesView
        packages={[mockPackage]}
        isLoading={false}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onOpenCreate={mockOnOpenCreate}
        onOpenEdit={mockOnOpenEdit}
        onOpenDelete={mockOnOpenDelete}
        onRefresh={mockOnRefresh}
      />
    )
    const editBtn = screen.getByRole("button", { name: /editar/i })
    const deleteBtn = screen.getByRole("button", { name: /eliminar/i })

    // act
    fireEvent.click(editBtn)
    fireEvent.click(deleteBtn)

    // assert
    expect(mockOnOpenEdit).toHaveBeenCalledWith(mockPackage)
    expect(mockOnOpenDelete).toHaveBeenCalledWith(mockPackage)
  })

  it("renders empty state when there are no packages", () => {
    // arrange & act
    render(
      <AgencyPackagesView
        packages={[]}
        isLoading={false}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        onOpenCreate={mockOnOpenCreate}
        onOpenEdit={mockOnOpenEdit}
        onOpenDelete={mockOnOpenDelete}
        onRefresh={mockOnRefresh}
      />
    )

    // assert
    expect(screen.getByText("No se encontraron paquetes")).toBeDefined()
  })
})
