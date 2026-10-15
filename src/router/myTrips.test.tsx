import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AppRouter } from "."
import { Header } from "../components/layout/header"
import { useHeader } from "../hooks/useHeader"
import { useAuth } from "../hooks/useAuth"
import { useMyTripsStore } from "../stores/myTrips"
import { buyerDataSource } from "../datasources/buyer"
import { favoritePackage, favoritePackageDTO } from "../tests/fixtures/package"
import { handleViewDetails } from "./packageDetails"
import type { BuyerPurchasesPageDTO } from "../types/buyer"

vi.mock("../hooks/useAuth", () => ({ useAuth: vi.fn() }))
vi.mock("./packageDetails", () => ({ handleViewDetails: vi.fn() }))
vi.mock("../datasources/buyer", () => ({
  buyerDataSource: { getMyPurchases: vi.fn() },
}))
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock("../components/auth/AuthModal", () => ({ default: () => null }))
vi.mock("../pages/home", () => ({
  default: function Home() {
    return <Header {...useHeader()} />
  },
}))
vi.mock("../pages/login", () => ({ default: () => <h1>Iniciar sesión</h1> }))
vi.mock("../pages/favorites", () => ({ default: () => null }))
vi.mock("../pages/adminPanel", () => ({ default: () => null }))
vi.mock("../pages/agencyPanel", () => ({ default: () => null }))

describe("MyTrips navigation and page integration", () => {
  const mockPageDTO: BuyerPurchasesPageDTO = {
    content: [
      {
        id: 101,
        price: 950,
        purchasedAt: "2026-09-01T12:00:00Z",
        travelPackage: favoritePackageDTO,
      },
    ],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false,
  }

  beforeEach(() => {
    vi.resetAllMocks()
    useMyTripsStore.getState().reset()
    window.history.replaceState(null, "", "/home")
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 7, email: "buyer@example.com", role: "BUYER" },
      modal: { open: vi.fn() },
      logout: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>)
    vi.mocked(buyerDataSource.getMyPurchases).mockResolvedValue(mockPageDTO)
  })

  it("navigates to /my-trips when clicking 'Mis Viajes' in the navbar", async () => {
    // arrange
    render(<AppRouter />)

    // act
    fireEvent.click(screen.getByRole("button", { name: "Mis Viajes" }))

    // assert
    await screen.findByText(favoritePackageDTO.name)
    expect(window.location.pathname).toBe("/my-trips")
    expect(screen.getByRole("heading", { name: "Mis Viajes" })).toBeInTheDocument()
    expect(buyerDataSource.getMyPurchases).toHaveBeenCalledTimes(1)
  })

  it("loads the buyer's trips when opening /my-trips directly", async () => {
    // arrange
    window.history.replaceState(null, "", "/my-trips")

    // act
    render(<AppRouter />)

    // assert
    await screen.findByText(favoritePackageDTO.name)
    expect(buyerDataSource.getMyPurchases).toHaveBeenCalledTimes(1)
  })

  it("retries a failed trips request from the view", async () => {
    // arrange
    window.history.replaceState(null, "", "/my-trips")
    vi.mocked(buyerDataSource.getMyPurchases).mockRejectedValueOnce(new Error("Error de conexión"))
    render(<AppRouter />)

    // act
    fireEvent.click(await screen.findByRole("button", { name: /Reintentar/ }))

    // assert
    await screen.findByText(favoritePackageDTO.name)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(buyerDataSource.getMyPurchases).toHaveBeenCalledTimes(2)
  })

  it("triggers package detail action from the trip card", async () => {
    // arrange
    window.history.replaceState(null, "", "/my-trips")
    render(<AppRouter />)

    // act
    fireEvent.click(await screen.findByRole("button", { name: "Ver detalle" }))

    // assert
    expect(handleViewDetails).toHaveBeenCalledWith(favoritePackage)
  })

  it("redirects unauthenticated visitor to login when opening /my-trips directly", async () => {
    // arrange
    window.history.replaceState(null, "", "/my-trips")
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      isAuthenticated: false,
      user: null,
    })

    // act
    render(<AppRouter />)

    // assert
    await screen.findByRole("heading", { name: "Iniciar sesión" })
    expect(window.location.pathname).toBe("/login")
    expect(buyerDataSource.getMyPurchases).not.toHaveBeenCalled()
  })
})
