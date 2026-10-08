import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AdminMetricsView } from "./AdminMetricsView"
import type {
  TopAgency,
  TopBuyer,
  TopDestination,
  TopRatedDestination,
} from "../../models/admin"

describe("AdminMetricsView component", () => {
  let mockTopBuyers: TopBuyer[]
  let mockTopRankedDestinations: TopDestination[]
  let mockTopAgencies: TopAgency[]
  let mockTopRatedDestinations: TopRatedDestination[]
  let mockOnRefresh: () => void

  beforeEach(() => {
    vi.clearAllMocks()

    mockTopBuyers = [
      {
        buyer: {
          id: 1,
          firstName: "Lionel",
          lastName: "Messi",
          email: "lio@afa.com",
          phoneNumber: "11223344",
          nationalId: "10101010",
        },
        purchases: 15,
        rank: 1,
      },
    ]

    mockTopRankedDestinations = [
      {
        city: {
          id: 10,
          name: "Cancún",
          country: {
            isoCode: "MX",
            name: "México",
          },
        },
        rank: 1,
        sales: 42,
      },
    ]

    mockTopAgencies = [
      {
        agency: {
          id: 20,
          businessName: "Agencia Sol",
          email: "info@sol.com",
        },
        sales: 88,
        rank: 1,
      },
    ]

    mockTopRatedDestinations = [
      {
        city: {
          id: 30,
          name: "Bariloche",
          country: {
            isoCode: "AR",
            name: "Argentina",
          },
        },
        stars: 9.7,
        rank: 1,
      },
    ]

    mockOnRefresh = vi.fn()
  })

  it("renders all 4 top 5 metric sections correctly", () => {
    // arrange & act
    render(
      <AdminMetricsView
        topBuyers={mockTopBuyers}
        topRankedDestinations={mockTopRankedDestinations}
        topAgencies={mockTopAgencies}
        topRatedDestinations={mockTopRatedDestinations}
        isLoading={false}
        onRefresh={mockOnRefresh}
      />
    )

    // assert
    expect(screen.getByText("Usuarios con más compras")).toBeDefined()
    expect(screen.getByText("Lionel Messi")).toBeDefined()
    expect(screen.getByText("15 compras")).toBeDefined()

    expect(screen.getByText("Destinos mejor rankeados")).toBeDefined()
    expect(screen.getByText("Cancún")).toBeDefined()

    expect(screen.getByText("Agencias con más ventas")).toBeDefined()
    expect(screen.getByText("Agencia Sol")).toBeDefined()
    expect(screen.getByText("88 ventas")).toBeDefined()

    expect(screen.getByText("Destinos mejor valorados")).toBeDefined()
    expect(screen.getByText("Bariloche")).toBeDefined()
    expect(screen.getByText("9.7")).toBeDefined()
  })

  it("calls onRefresh when clicking the refresh metrics button", () => {
    // arrange
    render(
      <AdminMetricsView
        topBuyers={mockTopBuyers}
        topRankedDestinations={mockTopRankedDestinations}
        topAgencies={mockTopAgencies}
        topRatedDestinations={mockTopRatedDestinations}
        isLoading={false}
        onRefresh={mockOnRefresh}
      />
    )
    const refreshButton = screen.getByRole("button", { name: /actualizar métricas/i })

    // act
    fireEvent.click(refreshButton)

    // assert
    expect(mockOnRefresh).toHaveBeenCalled()
  })

  it("renders top ranked destination city name, country and sales badge", () => {
    // arrange
    const destinationsWithSales: TopDestination[] = [
      {
        city: {
          id: 15,
          name: "Mendoza",
          country: {
            isoCode: "AR",
            name: "Argentina",
          },
        },
        rank: 1,
        sales: 23,
      },
    ]

    // act
    render(
      <AdminMetricsView
        topBuyers={[]}
        topRankedDestinations={destinationsWithSales}
        topAgencies={[]}
        topRatedDestinations={[]}
        isLoading={false}
      />
    )

    // assert
    expect(screen.getByText("Mendoza")).toBeDefined()
    expect(screen.getByText("Argentina")).toBeDefined()
    expect(screen.getByText("23 ventas")).toBeDefined()
  })
})
