import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest"
import { PendingAgenciesList } from "./PendingAgenciesList"
import type { AdminAgency } from "../../models/admin"

describe("PendingAgenciesList component", () => {
  let mockAgencies: AdminAgency[]
  let mockOnSearchChange: Mock<(query: string) => void>
  let mockOnAuthorize: Mock<(agency: AdminAgency) => void>
  let mockOnReject: Mock<(agency: AdminAgency) => void>
  let mockOnRefresh: Mock<() => void>

  beforeEach(() => {
    vi.clearAllMocks()

    mockAgencies = [
      {
        id: 1,
        businessName: "Agencia Sol",
        taxId: "30-11111111-1",
        email: "sol@agencia.com",
        status: "PENDING",
      },
      {
        id: 2,
        businessName: "Agencia Luna",
        taxId: "30-22222222-2",
        email: "luna@agencia.com",
        status: "PENDING",
      },
    ]

    mockOnSearchChange = vi.fn<(query: string) => void>()
    mockOnAuthorize = vi.fn<(agency: AdminAgency) => void>()
    mockOnReject = vi.fn<(agency: AdminAgency) => void>()
    mockOnRefresh = vi.fn<() => void>()
  })

  it("renders pending agencies and counter", () => {
    // arrange & act
    render(
      <PendingAgenciesList
        agencies={mockAgencies}
        isLoading={false}
        processingAgencyId={null}
        searchQuery=""
        error={null}
        onSearchChange={mockOnSearchChange}
        onAuthorize={mockOnAuthorize}
        onReject={mockOnReject}
        onRefresh={mockOnRefresh}
      />
    )

    // assert
    expect(screen.getByText("Agencia Sol")).toBeDefined()
    expect(screen.getByText("Agencia Luna")).toBeDefined()
    expect(screen.getByText("2")).toBeDefined()
  })

  it("renders empty state when there are no pending agencies", () => {
    // arrange & act
    render(
      <PendingAgenciesList
        agencies={[]}
        isLoading={false}
        processingAgencyId={null}
        searchQuery=""
        error={null}
        onSearchChange={mockOnSearchChange}
        onAuthorize={mockOnAuthorize}
        onReject={mockOnReject}
        onRefresh={mockOnRefresh}
      />
    )

    // assert
    expect(screen.getByText("¡No hay agencias pendientes!")).toBeDefined()
    expect(
      screen.getByText(
        "Todas las solicitudes de registro han sido procesadas correctamente."
      )
    ).toBeDefined()
  })

  it("renders not found state with clean search button when search yields no results", () => {
    // arrange & act
    render(
      <PendingAgenciesList
        agencies={[]}
        isLoading={false}
        processingAgencyId={null}
        searchQuery="Agencia Inexistente"
        error={null}
        onSearchChange={mockOnSearchChange}
        onAuthorize={mockOnAuthorize}
        onReject={mockOnReject}
        onRefresh={mockOnRefresh}
      />
    )

    // assert
    expect(screen.getByText("No se encontraron resultados")).toBeDefined()
    const cleanButton = screen.getByRole("button", { name: /limpiar búsqueda/i })
    fireEvent.click(cleanButton)
    expect(mockOnSearchChange).toHaveBeenCalledWith("")
  })

  it("calls onSearchChange when typing in the search input", () => {
    // arrange
    render(
      <PendingAgenciesList
        agencies={mockAgencies}
        isLoading={false}
        processingAgencyId={null}
        searchQuery=""
        error={null}
        onSearchChange={mockOnSearchChange}
        onAuthorize={mockOnAuthorize}
        onReject={mockOnReject}
        onRefresh={mockOnRefresh}
      />
    )
    const input = screen.getByPlaceholderText(/buscar por nombre o cuit/i)

    // act
    fireEvent.change(input, { target: { value: "Sol" } })

    // assert
    expect(mockOnSearchChange).toHaveBeenCalledWith("Sol")
  })

  it("calls onRefresh when clicking the refresh button", () => {
    // arrange
    render(
      <PendingAgenciesList
        agencies={mockAgencies}
        isLoading={false}
        processingAgencyId={null}
        searchQuery=""
        error={null}
        onSearchChange={mockOnSearchChange}
        onAuthorize={mockOnAuthorize}
        onReject={mockOnReject}
        onRefresh={mockOnRefresh}
      />
    )
    const refreshButton = screen.getByRole("button", { name: /actualizar/i })

    // act
    fireEvent.click(refreshButton)

    // assert
    expect(mockOnRefresh).toHaveBeenCalled()
  })

  it("renders error message and retry button", () => {
    // arrange & act
    render(
      <PendingAgenciesList
        agencies={[]}
        isLoading={false}
        processingAgencyId={null}
        searchQuery=""
        error="Fallo de conexión"
        onSearchChange={mockOnSearchChange}
        onAuthorize={mockOnAuthorize}
        onReject={mockOnReject}
        onRefresh={mockOnRefresh}
      />
    )

    // assert
    expect(screen.getByText("Fallo de conexión")).toBeDefined()
    const retryButton = screen.getByRole("button", { name: /reintentar/i })
    fireEvent.click(retryButton)
    expect(mockOnRefresh).toHaveBeenCalled()
  })
})
