import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { AppToastContainer, ToastCloseButton } from "./toast"

describe("Toast UI components", () => {
  it("renders ToastCloseButton with a cross icon in top right and triggers closeToast on click", () => {
    // arrange
    const mockClose = vi.fn()
    render(<ToastCloseButton closeToast={mockClose} />)

    const button = screen.getByRole("button", { name: "Cerrar" })

    // assert button exists, is positioned top right, and has hover color primary
    expect(button).toBeDefined()
    expect(button.className).toContain("absolute")
    expect(button.className).toContain("top-2.5")
    expect(button.className).toContain("right-2.5")
    expect(button.className).toContain("hover:text-primary")

    // act
    fireEvent.click(button)

    // assert
    expect(mockClose).toHaveBeenCalledTimes(1)
  })

  it("renders AppToastContainer without crashing", () => {
    // arrange & act
    const { container } = render(<AppToastContainer />)

    // assert
    expect(container).toBeDefined()
  })
})
