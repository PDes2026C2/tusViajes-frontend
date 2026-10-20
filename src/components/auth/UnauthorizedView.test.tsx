import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { UnauthorizedView } from "./UnauthorizedView"

describe("UnauthorizedView", () => {
  it("explains the denied access and lets the user return to Home", () => {
    // arrange
    const onNavigateHome = vi.fn()
    render(<UnauthorizedView headerProps={{ isAuthenticated: true, userRole: "BUYER", onNavigateHome }} />)

    // act
    fireEvent.click(screen.getByRole("button", { name: "Volver al inicio" }))

    // assert
    expect(screen.getByRole("heading", { name: "No tenés acceso a esta página" })).toBeInTheDocument()
    expect(onNavigateHome).toHaveBeenCalledTimes(1)
  })
})
