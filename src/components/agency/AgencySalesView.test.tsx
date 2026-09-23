import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AgencySalesView } from "./AgencySalesView"
import type { AgencyMetricsSummary, AgencySale } from "../../models/agency"

describe("AgencySalesView component", () => {
  const mockMetrics: AgencyMetricsSummary = {
    totalRevenue: 2700,
    totalSales: 2,
    uniqueClients: 2,
  }

  const mockSale: AgencySale = {
    id: 1001,
    buyer: {
      id: 1,
      firstName: "Lucía",
      lastName: "García",
      fullName: "Lucía García",
      email: "lucia@gmail.com",
      nationalId: "38992110",
    },
    travelPackage: {
      id: 101,
      name: "Escapada a Miami",
      hotelName: "Oceanfront Palms Resort",
      destinationCityName: "Miami, Estados Unidos",
      initialDate: new Date("2026-10-01T10:00:00Z"),
      finalDate: new Date("2026-10-08T10:00:00Z"),
    },
    price: 1350,
    purchasedAt: new Date("2026-09-18T14:30:00Z"),
  }

  let mockOnSearchChange: (q: string) => void
  let mockOnRefresh: () => void

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnSearchChange = vi.fn()
    mockOnRefresh = vi.fn()
  })

  it("renders metric cards with formatted totals", () => {
    // arrange & act
    render(
      <AgencySalesView
        sales={[mockSale]}
        isLoading={false}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        metrics={mockMetrics}
        onRefresh={mockOnRefresh}
      />
    )

    // assert
    expect(screen.getByText(/2[.,]700/)).toBeDefined()
    expect(screen.getAllByText("2")).toHaveLength(2)
  })

  it("renders sales table with buyer and package details", () => {
    // arrange & act
    render(
      <AgencySalesView
        sales={[mockSale]}
        isLoading={false}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        metrics={mockMetrics}
        onRefresh={mockOnRefresh}
      />
    )

    // assert
    expect(screen.getByText("Lucía García")).toBeDefined()
    expect(screen.getByText("lucia@gmail.com")).toBeDefined()
    expect(screen.getByText("DNI: 38992110")).toBeDefined()
    expect(screen.getByText("Escapada a Miami")).toBeDefined()
    expect(screen.getByText("Oceanfront Palms Resort")).toBeDefined()
    expect(screen.getByText(/1[.,]350/)).toBeDefined()
  })

  it("calls onSearchChange when search input changes", () => {
    // arrange
    render(
      <AgencySalesView
        sales={[mockSale]}
        isLoading={false}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        metrics={mockMetrics}
        onRefresh={mockOnRefresh}
      />
    )
    const searchInput = screen.getByPlaceholderText(
      /buscar por cliente, email, dni o paquete/i
    )

    // act
    fireEvent.change(searchInput, { target: { value: "Lucía" } })

    // assert
    expect(mockOnSearchChange).toHaveBeenCalledWith("Lucía")
  })

  it("renders empty state when sales array is empty", () => {
    // arrange & act
    render(
      <AgencySalesView
        sales={[]}
        isLoading={false}
        searchQuery=""
        onSearchChange={mockOnSearchChange}
        metrics={{ totalRevenue: 0, totalSales: 0, uniqueClients: 0 }}
        onRefresh={mockOnRefresh}
      />
    )

    // assert
    expect(screen.getByText("No se registraron ventas")).toBeDefined()
  })
})
