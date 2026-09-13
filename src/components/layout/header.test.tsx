import { fireEvent, render, screen } from "@testing-library/react"
import { describe, expect, it, vi } from "vitest"
import { Header } from "./header"

describe("Header component", () => {
  it("renders the brand title and calls onNavigateHome when clicked", () => {
    // arrange
    const onNavigateHome = vi.fn()
    render(<Header onNavigateHome={onNavigateHome} />)
    const brandButton = screen.getByRole("button", { name: /tus viajes/i })

    // act
    fireEvent.click(brandButton)

    // assert
    expect(brandButton).toBeDefined()
    expect(onNavigateHome).toHaveBeenCalledTimes(1)
  })

  it("renders cart count and calls onCartClick when clicked", () => {
    // arrange
    const onCartClick = vi.fn()
    const expectedCartCount = 4
    render(<Header cartCount={expectedCartCount} onCartClick={onCartClick} />)
    const cartButton = screen.getByRole("button", { name: /carrito/i })

    // act
    fireEvent.click(cartButton)

    // assert
    expect(screen.getByText(expectedCartCount.toString())).toBeDefined()
    expect(onCartClick).toHaveBeenCalledTimes(1)
  })

  it("calls onMyTripsClick when Mis Viajes is clicked", () => {
    // arrange
    const onMyTripsClick = vi.fn()
    render(<Header onMyTripsClick={onMyTripsClick} />)
    const myTripsButton = screen.getByRole("button", { name: /mis viajes/i })

    // act
    fireEvent.click(myTripsButton)

    // assert
    expect(myTripsButton).toBeDefined()
    expect(onMyTripsClick).toHaveBeenCalledTimes(1)
  })

  it("renders agency offer prompt and calls onAgencyClick when clicked as non-agency", () => {
    // arrange
    const onAgencyClick = vi.fn()
    render(<Header userRole="BUYER" onAgencyClick={onAgencyClick} />)
    const agencyButton = screen.getByRole("button", { name: /postulate como agencia/i })

    // act
    fireEvent.click(agencyButton)

    // assert
    expect(screen.getByText("¿Querés ofrecer paquetes?")).toBeDefined()
    expect(onAgencyClick).toHaveBeenCalledTimes(1)
  })

  it("renders agency management panel button and calls onAgencyClick when userRole is AGENCY", () => {
    // arrange
    const onAgencyClick = vi.fn()
    render(<Header userRole="AGENCY" onAgencyClick={onAgencyClick} />)
    const panelButton = screen.getByRole("button", { name: /ir al panel/i })

    // act
    fireEvent.click(panelButton)

    // assert
    expect(screen.getByText("Tu panel de gestión")).toBeDefined()
    expect(onAgencyClick).toHaveBeenCalledTimes(1)
  })

  it("renders admin panel button and calls onAdminClick when userRole is ADMIN", () => {
    // arrange
    const onAdminClick = vi.fn()
    render(<Header userRole="ADMIN" onAdminClick={onAdminClick} />)
    const adminButton = screen.getByRole("button", { name: /panel administrador/i })

    // act
    fireEvent.click(adminButton)

    // assert
    expect(screen.queryByText(/postulate como agencia/i)).toBeNull()
    expect(onAdminClick).toHaveBeenCalledTimes(1)
  })

  it("renders login button when unauthenticated and calls onLoginClick when clicked", () => {
    // arrange
    const onLoginClick = vi.fn()
    render(<Header isAuthenticated={false} onLoginClick={onLoginClick} />)
    const loginButton = screen.getByRole("button", { name: /ingresar/i })

    // act
    fireEvent.click(loginButton)

    // assert
    expect(loginButton).toBeDefined()
    expect(onLoginClick).toHaveBeenCalledTimes(1)
  })

  it("renders user email and logout button when authenticated and calls onLogoutClick when clicked", () => {
    // arrange
    const onLogoutClick = vi.fn()
    const expectedUserEmail = "viajero@gmail.com"
    render(
      <Header
        isAuthenticated={true}
        userEmail={expectedUserEmail}
        onLogoutClick={onLogoutClick}
      />
    )
    const logoutButton = screen.getByRole("button", { name: /cerrar sesión/i })

    // act
    fireEvent.click(logoutButton)

    // assert
    expect(screen.getByText(expectedUserEmail)).toBeDefined()
    expect(logoutButton).toBeDefined()
    expect(onLogoutClick).toHaveBeenCalledTimes(1)
  })
})
