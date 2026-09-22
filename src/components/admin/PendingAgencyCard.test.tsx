import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi, type Mock } from "vitest"
import { PendingAgencyCard } from "./PendingAgencyCard"
import type { AdminAgency } from "../../models/admin"

describe("PendingAgencyCard component", () => {
  let mockAgency: AdminAgency
  let mockOnAuthorize: Mock<(agency: AdminAgency) => void>
  let mockOnReject: Mock<(agency: AdminAgency) => void>

  beforeEach(() => {
    vi.clearAllMocks()

    mockAgency = {
      id: 10,
      businessName: "Viajes Patagonia S.A.",
      taxId: "30-55667788-9",
      email: "contacto@patagoniaviajes.com",
      status: "PENDING",
    }
    mockOnAuthorize = vi.fn<(agency: AdminAgency) => void>()
    mockOnReject = vi.fn<(agency: AdminAgency) => void>()
  })

  it("renders agency information correctly", () => {
    // arrange & act
    render(
      <PendingAgencyCard
        agency={mockAgency}
        onAuthorize={mockOnAuthorize}
        onReject={mockOnReject}
      />
    )

    // assert
    expect(screen.getByText("Viajes Patagonia S.A.")).toBeDefined()
    expect(screen.getByText("30-55667788-9")).toBeDefined()
    expect(screen.getByText("contacto@patagoniaviajes.com")).toBeDefined()
    expect(screen.getByText("Pendiente")).toBeDefined()
    expect(screen.getByText("ID #10")).toBeDefined()
  })

  it("calls onAuthorize when Aprobar button is clicked", () => {
    // arrange
    render(
      <PendingAgencyCard
        agency={mockAgency}
        onAuthorize={mockOnAuthorize}
        onReject={mockOnReject}
      />
    )
    const approveButton = screen.getByRole("button", { name: /aprobar/i })

    // act
    fireEvent.click(approveButton)

    // assert
    expect(mockOnAuthorize).toHaveBeenCalledWith(mockAgency)
  })

  it("calls onReject when Rechazar button is clicked", () => {
    // arrange
    render(
      <PendingAgencyCard
        agency={mockAgency}
        onAuthorize={mockOnAuthorize}
        onReject={mockOnReject}
      />
    )
    const rejectButton = screen.getByRole("button", { name: /rechazar/i })

    // act
    fireEvent.click(rejectButton)

    // assert
    expect(mockOnReject).toHaveBeenCalledWith(mockAgency)
  })

  it("disables both buttons and shows spinner when isProcessing is true", () => {
    // arrange
    render(
      <PendingAgencyCard
        agency={mockAgency}
        isProcessing={true}
        onAuthorize={mockOnAuthorize}
        onReject={mockOnReject}
      />
    )
    const approveButton = screen.getByRole("button", { name: /procesando/i })
    const rejectButton = screen.getByRole("button", { name: /rechazar/i })

    // act & assert
    expect(approveButton.hasAttribute("disabled")).toBe(true)
    expect(rejectButton.hasAttribute("disabled")).toBe(true)
  })
})
