import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AdminTabs } from "./AdminTabs"
import type { AdminTab } from "../../hooks/useAdmin"

describe("AdminTabs component", () => {
  let mockOnTabChange: (tab: AdminTab) => void

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnTabChange = vi.fn()
  })

  it("renders all tabs and displays pending count badge", () => {
    // arrange & act
    render(
      <AdminTabs
        activeTab="metrics"
        pendingAgenciesCount={3}
        onTabChange={mockOnTabChange}
      />
    )

    // assert
    expect(screen.getByText("Métricas y Rankings")).toBeDefined()
    expect(screen.getByText("Agencias")).toBeDefined()
    expect(screen.getByText("Usuarios")).toBeDefined()
    expect(screen.getByText("3")).toBeDefined()
  })

  it("calls onTabChange when a tab button is clicked", () => {
    // arrange
    render(
      <AdminTabs
        activeTab="metrics"
        pendingAgenciesCount={0}
        onTabChange={mockOnTabChange}
      />
    )
    const agenciesTabButton = screen.getByRole("button", { name: /agencias/i })

    // act
    fireEvent.click(agenciesTabButton)

    // assert
    expect(mockOnTabChange).toHaveBeenCalledWith("agencies")
  })
})
