import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AdminUsersView } from "./AdminUsersView"
import type { Buyer } from "../../models/admin"

describe("AdminUsersView component", () => {
  let mockBuyers: Buyer[]
  let mockOnSearchChange: (query: string) => void
  let mockOnRefresh: () => void

  beforeEach(() => {
    vi.clearAllMocks()

    mockBuyers = [
      {
        id: 1,
        firstName: "Lionel",
        lastName: "Messi",
        email: "lio@afa.com",
        nationalId: "10101010",
        phoneNumber: "11223344",
      },
    ]

    mockOnSearchChange = vi.fn()
    mockOnRefresh = vi.fn()
  })

  it("renders users list and details", () => {
    // arrange & act
    render(
      <AdminUsersView
        buyers={mockBuyers}
        searchQuery=""
        isLoading={false}
        error={null}
        onSearchChange={mockOnSearchChange}
        onRefresh={mockOnRefresh}
      />
    )

    // assert
    expect(screen.getByText("Lionel Messi")).toBeDefined()
    expect(screen.getByText("lio@afa.com")).toBeDefined()
    expect(screen.getByText("10101010")).toBeDefined()
    expect(screen.getByText("11223344")).toBeDefined()
  })

  it("calls onSearchChange when input changes", () => {
    // arrange
    render(
      <AdminUsersView
        buyers={mockBuyers}
        searchQuery=""
        isLoading={false}
        error={null}
        onSearchChange={mockOnSearchChange}
        onRefresh={mockOnRefresh}
      />
    )
    const input = screen.getByPlaceholderText(/buscar por nombre, email o dni/i)

    // act
    fireEvent.change(input, { target: { value: "Messi" } })

    // assert
    expect(mockOnSearchChange).toHaveBeenCalledWith("Messi")
  })

  it("calls onRefresh when clicking the refresh button", () => {
    // arrange
    render(
      <AdminUsersView
        buyers={mockBuyers}
        searchQuery=""
        isLoading={false}
        error={null}
        onSearchChange={mockOnSearchChange}
        onRefresh={mockOnRefresh}
      />
    )
    const refreshButton = screen.getByRole("button", { name: /actualizar/i })

    // act
    fireEvent.click(refreshButton)

    // assert
    expect(mockOnRefresh).toHaveBeenCalled()
  })

  it("renders empty state when there are no users", () => {
    // arrange & act
    render(
      <AdminUsersView
        buyers={[]}
        searchQuery=""
        isLoading={false}
        error={null}
        onSearchChange={mockOnSearchChange}
        onRefresh={mockOnRefresh}
      />
    )

    // assert
    expect(screen.getByText("No hay usuarios registrados")).toBeDefined()
  })
})
