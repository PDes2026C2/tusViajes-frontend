import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AgencyTabs } from "./AgencyTabs"
import type { AgencyTab } from "../../hooks/useAgency"

describe("AgencyTabs component", () => {
  let mockOnTabChange: (tab: AgencyTab) => void

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnTabChange = vi.fn()
  })

  it("renders all agency tabs and displays counts", () => {
    // arrange & act
    render(
      <AgencyTabs
        activeTab="packages"
        packagesCount={4}
        salesCount={12}
        onTabChange={mockOnTabChange}
      />
    )

    // assert
    expect(screen.getByText("Mis Paquetes")).toBeDefined()
    expect(screen.getByText("Consulta de Vuelos")).toBeDefined()
    expect(screen.getByText("Ventas y Clientes")).toBeDefined()
    expect(screen.getByText("4")).toBeDefined()
    expect(screen.getByText("12")).toBeDefined()
  })

  it("calls onTabChange when a tab is clicked", () => {
    // arrange
    render(
      <AgencyTabs
        activeTab="packages"
        packagesCount={0}
        salesCount={0}
        onTabChange={mockOnTabChange}
      />
    )
    const flightsButton = screen.getByRole("button", {
      name: /consulta de vuelos/i,
    })

    // act
    fireEvent.click(flightsButton)

    // assert
    expect(mockOnTabChange).toHaveBeenCalledWith("flights")
  })
})
