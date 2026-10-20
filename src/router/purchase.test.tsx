import { act, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { AppRouter } from "."
import { useAuth } from "../hooks/useAuth"
import { useSearch } from "../hooks/useSearch"
import { useFavoritesStore } from "../stores/favorites"
import { useMyTripsStore } from "../stores/myTrips"
import { purchaseDataSource } from "../datasources/purchase"
import { buyerDataSource } from "../datasources/buyer"
import { favoritesDataSource } from "../datasources/favorites"
import { reviewDataSource } from "../datasources/review"
import { favoritePackageDTO } from "../tests/fixtures/package"
import { packageMappers } from "../models/package"
import type { BuyerPurchaseResponseDTO } from "../types/buyer"

vi.mock("../hooks/useAuth", () => ({ useAuth: vi.fn() }))
vi.mock("../hooks/useSearch", () => ({ useSearch: vi.fn() }))
vi.mock("../components/package/search", () => ({ SearchPackage: () => null }))
vi.mock("../components/auth/AuthModal", () => ({ default: () => null }))
vi.mock("../datasources/purchase", () => ({ purchaseDataSource: { purchasePackage: vi.fn() } }))
vi.mock("../datasources/buyer", () => ({ buyerDataSource: { getMyPurchases: vi.fn(), hasPurchasedPackage: vi.fn() } }))
vi.mock("../datasources/favorites", () => ({ favoritesDataSource: { getFavorites: vi.fn() } }))
vi.mock("../datasources/review", () => ({ reviewDataSource: { getMyReviews: vi.fn() } }))
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

describe("Purchase navigation", () => {
  let purchasedPackage: BuyerPurchaseResponseDTO
  let openLogin: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.resetAllMocks()
    useFavoritesStore.getState().reset()
    useMyTripsStore.getState().reset()
    window.history.replaceState(null, "", "/home")
    const packageDTO = { ...favoritePackageDTO, initialDate: "2099-10-10T10:00:00Z", finalDate: "2099-10-17T10:00:00Z" }
    purchasedPackage = { id: 501, price: 875, purchasedAt: "2026-10-01T12:00:00", travelPackage: packageDTO }
    openLogin = vi.fn()
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true, user: { id: 7, email: "buyer@example.com", role: "BUYER" },
      modal: { open: openLogin }, logout: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>)
    vi.mocked(useSearch).mockReturnValue({
      packages: [packageMappers.mapDTOToModel(packageDTO)], page: 0, totalPages: 1, totalElements: 1, isSearching: false,
    } as ReturnType<typeof useSearch>)
    vi.mocked(favoritesDataSource.getFavorites).mockResolvedValue([])
    vi.mocked(reviewDataSource.getMyReviews).mockResolvedValue({ content: [], totalElements: 0, totalPages: 0, number: 0, size: 100 })
    vi.mocked(purchaseDataSource.purchasePackage).mockResolvedValue(purchasedPackage)
    vi.mocked(buyerDataSource.hasPurchasedPackage).mockResolvedValue(false)
    vi.mocked(buyerDataSource.getMyPurchases).mockResolvedValue({
      content: [purchasedPackage], totalElements: 1, totalPages: 1, number: 0, size: 10,
    })
  })

  it.each(["/home", "/favorites"])("confirms from %s and shows the recorded purchase price in Mis viajes", async (path) => {
    // arrange
    window.history.replaceState(null, "", path)
    vi.mocked(favoritesDataSource.getFavorites).mockResolvedValue([purchasedPackage.travelPackage])
    render(<AppRouter />)
    fireEvent.click(await screen.findByRole("button", { name: "Ver detalle" }))
    fireEvent.click(await screen.findByRole("button", { name: "Comprar paquete" }))

    // act
    fireEvent.click(screen.getByRole("button", { name: "Confirmar compra" }))

    // assert
    await screen.findByRole("heading", { name: "Mis Viajes" })
    expect(await screen.findByText("USD $875")).toBeInTheDocument()
    expect(window.location.pathname).toBe("/my-trips")
    expect(purchaseDataSource.purchasePackage).toHaveBeenCalledExactlyOnceWith(purchasedPackage.travelPackage.id)
    expect(buyerDataSource.getMyPurchases).toHaveBeenCalled()
  })

  it("lets the buyer cancel the confirmation and keep reading the detail", async () => {
    // arrange
    render(<AppRouter />)
    fireEvent.click(screen.getByRole("button", { name: "Ver detalle" }))
    fireEvent.click(await screen.findByRole("button", { name: "Comprar paquete" }))

    // act
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }))

    // assert
    expect(screen.getByRole("dialog", { name: favoritePackageDTO.name })).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Comprar paquete" })).toBeInTheDocument()
    expect(purchaseDataSource.purchasePackage).not.toHaveBeenCalled()
    expect(window.location.pathname).toBe("/home")
  })

  it("shows a failed purchase in the detail and allows retrying without leaving Home", async () => {
    // arrange
    vi.mocked(purchaseDataSource.purchasePackage).mockRejectedValueOnce(new Error("Uno de los vuelos está completo"))
    render(<AppRouter />)
    fireEvent.click(screen.getByRole("button", { name: "Ver detalle" }))
    fireEvent.click(await screen.findByRole("button", { name: "Comprar paquete" }))

    // act
    fireEvent.click(screen.getByRole("button", { name: "Confirmar compra" }))

    // assert
    expect(await screen.findByRole("alert")).toHaveTextContent("Uno de los vuelos está completo")
    expect(window.location.pathname).toBe("/home")
    expect(buyerDataSource.getMyPurchases).not.toHaveBeenCalled()
    const retryButton = screen.getByRole("button", { name: "Confirmar compra" })
    await waitFor(() => expect(retryButton).toBeEnabled())

    // act
    await act(async () => { fireEvent.click(retryButton) })

    // assert
    await screen.findByRole("heading", { name: "Mis Viajes" })
    expect(purchaseDataSource.purchasePackage).toHaveBeenCalledTimes(2)
  })

  it("keeps the dialog open and blocks repeated confirmation and Escape while purchasing", async () => {
    // arrange
    let finishPurchase!: (purchase: BuyerPurchaseResponseDTO) => void
    vi.mocked(purchaseDataSource.purchasePackage).mockReturnValue(new Promise(resolve => { finishPurchase = resolve }))
    render(<AppRouter />)
    fireEvent.click(screen.getByRole("button", { name: "Ver detalle" }))
    fireEvent.click(await screen.findByRole("button", { name: "Comprar paquete" }))
    const confirmButton = screen.getByRole("button", { name: "Confirmar compra" })

    // act
    fireEvent.click(confirmButton)
    fireEvent.click(confirmButton)
    fireEvent.keyDown(document.activeElement!, { key: "Escape" })

    // assert
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Cerrar detalle" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Comprando..." })).toBeDisabled()
    expect(purchaseDataSource.purchasePackage).toHaveBeenCalledTimes(1)

    // act
    await act(async () => { finishPurchase(purchasedPackage) })

    // assert
    await screen.findByRole("heading", { name: "Mis Viajes" })
  })

  it("opens login for a visitor and closes the detail without buying", async () => {
    // arrange
    vi.mocked(useAuth).mockReturnValue({ ...vi.mocked(useAuth)(), user: null, isAuthenticated: false })
    render(<AppRouter />)
    fireEvent.click(screen.getByRole("button", { name: "Ver detalle" }))

    // act
    fireEvent.click(await screen.findByRole("button", { name: "Iniciar sesión para comprar" }))

    // assert
    expect(openLogin).toHaveBeenCalledWith("login")
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(purchaseDataSource.purchasePackage).not.toHaveBeenCalled()
  })

  it("does not offer a new purchase from Mis viajes", async () => {
    // arrange
    window.history.replaceState(null, "", "/my-trips")
    render(<AppRouter />)

    // act
    fireEvent.click(await screen.findByRole("button", { name: "Ver detalle" }))

    // assert
    expect(await screen.findByRole("dialog", { name: favoritePackageDTO.name })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Comprar paquete" })).not.toBeInTheDocument()
  })

  it.each(["/home", "/favorites"])("keeps purchased packages visible in %s but replaces the purchase action", async (path) => {
    // arrange
    window.history.replaceState(null, "", path)
    vi.mocked(favoritesDataSource.getFavorites).mockResolvedValue([purchasedPackage.travelPackage])
    vi.mocked(buyerDataSource.hasPurchasedPackage).mockResolvedValue(true)
    render(<AppRouter />)

    // act
    fireEvent.click(await screen.findByRole("button", { name: "Ver detalle" }))

    // assert
    expect(await screen.findByText("Ya compraste este paquete")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Comprar paquete" })).not.toBeInTheDocument()
    expect(purchaseDataSource.purchasePackage).not.toHaveBeenCalled()

    // act
    fireEvent.click(screen.getByRole("button", { name: "Ver en mis viajes" }))

    // assert
    await screen.findByRole("heading", { name: "Mis Viajes" })
    expect(window.location.pathname).toBe("/my-trips")
  })
})
