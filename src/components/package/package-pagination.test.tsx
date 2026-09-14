import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { PackagePagination } from "./package-pagination"

describe("PackagePagination component", () => {
  it("renders null if totalPages is 1 or less", () => {
    // arrange
    const { container } = render(
      <PackagePagination currentPage={0} totalPages={1} onPageChange={vi.fn()} />
    )

    // act & assert
    expect(container.firstChild).toBeNull()
  })

  it("renders pages and highlights active page", () => {
    // arrange
    const onPageChange = vi.fn()
    render(
      <PackagePagination currentPage={1} totalPages={3} onPageChange={onPageChange} />
    )

    // act & assert
    const page2Button = screen.getByRole("button", { name: "2" })
    expect(page2Button.getAttribute("aria-current")).toBe("page")
  })

  it("disables Anterior on first page and enables Siguiente", () => {
    // arrange
    render(
      <PackagePagination currentPage={0} totalPages={3} onPageChange={vi.fn()} />
    )

    // act & assert
    const prevButton = screen.getByRole("button", { name: /anterior/i })
    const nextButton = screen.getByRole("button", { name: /siguiente/i })

    expect(prevButton.hasAttribute("disabled")).toBe(true)
    expect(nextButton.hasAttribute("disabled")).toBe(false)
  })

  it("calls onPageChange when clicking Siguiente", () => {
    // arrange
    const onPageChange = vi.fn()
    render(
      <PackagePagination currentPage={0} totalPages={3} onPageChange={onPageChange} />
    )
    const nextButton = screen.getByRole("button", { name: /siguiente/i })

    // act
    fireEvent.click(nextButton)

    // assert
    expect(onPageChange).toHaveBeenCalledWith(1)
  })

  it("calls onPageChange when clicking page number", () => {
    // arrange
    const onPageChange = vi.fn()
    render(
      <PackagePagination currentPage={0} totalPages={3} onPageChange={onPageChange} />
    )
    const page3Button = screen.getByRole("button", { name: "3" })

    // act
    fireEvent.click(page3Button)

    // assert
    expect(onPageChange).toHaveBeenCalledWith(2)
  })
})
