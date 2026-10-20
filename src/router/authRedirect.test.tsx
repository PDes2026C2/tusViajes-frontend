import { fireEvent, render, screen, waitFor, within } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AppRouter } from "."
import { authDataSource } from "../datasources/auth"
import { buyerDataSource } from "../datasources/buyer"
import { favoritesDataSource } from "../datasources/favorites"
import { locationDataSource } from "../datasources/location"
import { packageDataSource } from "../datasources/package"
import { reviewDataSource } from "../datasources/review"
import { useAuthStore } from "../stores/auth"
import { useAuthModalStore } from "../stores/authModal"
import { useFavoritesStore } from "../stores/favorites"
import { useMyTripsStore } from "../stores/myTrips"
import type { LoginCredentials, User } from "../models/auth"
import type { LoginResponseDTO } from "../types/auth"

vi.mock("../datasources/auth", () => ({ authDataSource: { login: vi.fn() } }))
vi.mock("../datasources/buyer", () => ({ buyerDataSource: { getMyPurchases: vi.fn() } }))
vi.mock("../datasources/favorites", () => ({ favoritesDataSource: { getFavorites: vi.fn() } }))
vi.mock("../datasources/location", () => ({ locationDataSource: { getCountries: vi.fn(), getCities: vi.fn() } }))
vi.mock("../datasources/package", () => ({ packageDataSource: { searchPackages: vi.fn() } }))
vi.mock("../datasources/review", () => ({ reviewDataSource: { getMyReviews: vi.fn() } }))
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

describe("Authentication navigation with the real auth store and route guards", () => {
  let buyer: User
  let credentials: LoginCredentials
  let buyerSession: LoginResponseDTO

  beforeEach(() => {
    buyer = { id: 7, email: "buyer@example.com", role: "BUYER" }
    credentials = { email: buyer.email, password: "Password123" }
    buyerSession = { ...buyer, token: "access-token", refreshToken: "refresh-token", tokenType: "Bearer" }
    const emptyPage = { content: [], totalElements: 0, totalPages: 0, number: 0, size: 10 }

    vi.resetAllMocks()
    window.sessionStorage.clear()
    useAuthStore.getState().logout()
    useAuthModalStore.getState().closeModal()
    useFavoritesStore.getState().reset()
    useMyTripsStore.getState().reset()
    window.history.replaceState(null, "", "/home")
    vi.mocked(authDataSource.login).mockResolvedValue(buyerSession)
    vi.mocked(locationDataSource.getCountries).mockResolvedValue([])
    vi.mocked(locationDataSource.getCities).mockResolvedValue([])
    vi.mocked(packageDataSource.searchPackages).mockResolvedValue(emptyPage)
    vi.mocked(favoritesDataSource.getFavorites).mockResolvedValue([])
    vi.mocked(buyerDataSource.getMyPurchases).mockResolvedValue(emptyPage)
    vi.mocked(reviewDataSource.getMyReviews).mockResolvedValue(emptyPage)
  })

  it.each(["/agency/panel", "/admin/panel", "/agency/login", "/admin/login"])("takes a buyer logging in from %s to Home", async (entryPath) => {
    // arrange
    const expectedPath = "/home"
    window.history.replaceState(null, "", entryPath)
    render(<AppRouter />)
    const loginPage = within(screen.getByRole("main"))
    fireEvent.change(loginPage.getByLabelText("Correo electrónico"), { target: { value: credentials.email } })
    fireEvent.change(loginPage.getByLabelText("Contraseña"), { target: { value: credentials.password } })

    // act
    fireEvent.click(loginPage.getByRole("button", { name: "Iniciar sesión" }))

    // assert
    await screen.findByRole("heading", { name: "Viajes armados a tu medida" })
    expect(window.location.pathname).toBe(expectedPath)
    expect(useAuthStore.getState().user).toEqual(buyer)
    expect(authDataSource.login).toHaveBeenCalledExactlyOnceWith(credentials)
    expect(screen.queryByRole("heading", { name: "No tenés acceso a esta página" })).not.toBeInTheDocument()
  })

  it.each([
    { requestedPath: "/favorites", expectedHeading: /Paquetes guardados/i },
    { requestedPath: "/my-trips", expectedHeading: /Mis viajes/i },
  ])("preserves the buyer's requested $requestedPath after login", async ({ requestedPath, expectedHeading }) => {
    // arrange
    window.history.replaceState(null, "", requestedPath)
    render(<AppRouter />)
    const loginPage = within(screen.getByRole("main"))
    fireEvent.change(loginPage.getByLabelText("Correo electrónico"), { target: { value: credentials.email } })
    fireEvent.change(loginPage.getByLabelText("Contraseña"), { target: { value: credentials.password } })

    // act
    fireEvent.click(loginPage.getByRole("button", { name: "Iniciar sesión" }))

    // assert
    await screen.findByRole("heading", { name: expectedHeading })
    expect(window.location.pathname).toBe(requestedPath)
    expect(useAuthStore.getState().user).toEqual(buyer)
    expect(authDataSource.login).toHaveBeenCalledExactlyOnceWith(credentials)
  })

  it("renders the denied-access page for a logged-in buyer and returns Home without ending the session", async () => {
    // arrange
    const expectedPath = "/home"
    useAuthStore.setState({ user: buyer, isAuthenticated: true, accessToken: buyerSession.token })
    window.history.replaceState(null, "", "/admin/panel")
    render(<AppRouter />)
    expect(screen.getByRole("heading", { name: "No tenés acceso a esta página" })).toBeInTheDocument()
    expect(window.location.pathname).toBe("/unauthorized")

    // act
    fireEvent.click(screen.getByRole("button", { name: "Volver al inicio" }))

    // assert
    await waitFor(() => expect(window.location.pathname).toBe(expectedPath))
    expect(screen.getByRole("heading", { name: "Viajes armados a tu medida" })).toBeInTheDocument()
    expect(useAuthStore.getState().user).toEqual(buyer)
    expect(useAuthStore.getState().isAuthenticated).toBe(true)
    expect(authDataSource.login).not.toHaveBeenCalled()
  })
})
