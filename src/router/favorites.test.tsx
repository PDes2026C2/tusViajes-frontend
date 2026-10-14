import { fireEvent, render, screen, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { toast } from "react-toastify"
import { AppRouter } from "."
import { Header } from "../components/layout/header"
import { useHeader } from "../hooks/useHeader"
import { useAuth } from "../hooks/useAuth"
import { useFavoritesStore } from "../stores/favorites"
import { favoritesDataSource } from "../datasources/favorites"
import { favoritePackage, favoritePackageDTO } from "../tests/fixtures/package"
import { handleViewDetails } from "./packageDetails"

vi.mock("../hooks/useAuth", () => ({ useAuth: vi.fn() }))
vi.mock("./packageDetails", () => ({ handleViewDetails: vi.fn() }))
vi.mock("../datasources/favorites", () => ({
  favoritesDataSource: { getFavorites: vi.fn(), addFavorite: vi.fn(), removeFavorite: vi.fn() },
}))
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock("../components/auth/AuthModal", () => ({ default: () => null }))
vi.mock("../pages/home", () => ({
  default: function Home() {
    return <Header {...useHeader()} />
  },
}))
vi.mock("../pages/login", () => ({ default: () => <h1>Iniciar sesión</h1> }))
vi.mock("../pages/adminPanel", () => ({ default: () => null }))
vi.mock("../pages/agencyPanel", () => ({ default: () => null }))

describe("Favorites navigation", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useFavoritesStore.getState().reset()
    window.history.replaceState(null, "", "/home")
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 7, email: "buyer@example.com", role: "BUYER" },
      modal: { open: vi.fn() }, logout: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>)
    vi.mocked(favoritesDataSource.getFavorites).mockResolvedValue([favoritePackageDTO])
    vi.mocked(favoritesDataSource.removeFavorite).mockResolvedValue(undefined)
  })

  it("opens the saved packages from the navbar heart", async () => {
    // arrange
    render(<AppRouter />)

    // act
    fireEvent.click(screen.getByRole("button", { name: "Mis favoritos" }))

    // assert
    await screen.findByText(favoritePackageDTO.name)
    expect(window.location.pathname).toBe("/favorites")
    expect(screen.getByRole("heading", { name: "Paquetes guardados" })).toBeInTheDocument()
    expect(favoritesDataSource.getFavorites).toHaveBeenCalledTimes(1)
  })

  it("loads the buyer's favorites when opening the URL directly", async () => {
    // arrange
    window.history.replaceState(null, "", "/favorites")

    // act
    render(<AppRouter />)

    // assert
    await screen.findByText(favoritePackageDTO.name)
    expect(favoritesDataSource.getFavorites).toHaveBeenCalledTimes(1)
  })

  it("retries a failed favorites request from the view", async () => {
    // arrange
    window.history.replaceState(null, "", "/favorites")
    vi.mocked(favoritesDataSource.getFavorites).mockRejectedValueOnce(new Error("Servicio no disponible"))
    render(<AppRouter />)

    // act
    fireEvent.click(await screen.findByRole("button", { name: "Reintentar" }))

    // assert
    await screen.findByText(favoritePackageDTO.name)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(favoritesDataSource.getFavorites).toHaveBeenCalledTimes(2)
  })

  it("uses the shared package detail action without opening a modal or changing routes", async () => {
    // arrange
    window.history.replaceState(null, "", "/favorites")
    render(<AppRouter />)

    // act
    fireEvent.click(await screen.findByRole("button", { name: "Ver detalle" }))

    // assert
    expect(handleViewDetails).toHaveBeenCalledWith(favoritePackage)
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
    expect(window.location.pathname).toBe("/favorites")
  })

  it("removes the last saved card through the heart and shows the empty view", async () => {
    // arrange
    window.history.replaceState(null, "", "/favorites")
    render(<AppRouter />)

    // act
    fireEvent.click(await screen.findByRole("button", { name: `Quitar ${favoritePackageDTO.name} de favoritos` }))

    // assert
    await screen.findByText("Todavía no tenés favoritos")
    expect(screen.queryByText(favoritePackageDTO.name)).not.toBeInTheDocument()
    expect(favoritesDataSource.removeFavorite).toHaveBeenCalledWith(favoritePackageDTO.id)
    expect(toast.success).not.toHaveBeenCalled()
    expect(useFavoritesStore.getState()).toMatchObject({ favoriteIds: [], favoritePackages: [], pendingPackageIds: [] })
  })

  it("keeps the card and enables retrying when removal fails", async () => {
    // arrange
    window.history.replaceState(null, "", "/favorites")
    vi.mocked(favoritesDataSource.removeFavorite).mockRejectedValueOnce(new Error("Servicio no disponible"))
    render(<AppRouter />)
    const removeButton = await screen.findByRole("button", { name: `Quitar ${favoritePackageDTO.name} de favoritos` })

    // act
    fireEvent.click(removeButton)

    // assert
    await waitFor(() => expect(removeButton).toBeEnabled())
    expect(screen.getByText(favoritePackageDTO.name)).toBeInTheDocument()
    expect(useFavoritesStore.getState().favoriteIds).toEqual([favoritePackageDTO.id])

    // act
    fireEvent.click(removeButton)

    // assert
    await screen.findByText("Todavía no tenés favoritos")
    expect(favoritesDataSource.removeFavorite).toHaveBeenCalledTimes(2)
  })

  it("requires login for a visitor opening the favorites URL", async () => {
    // arrange
    window.history.replaceState(null, "", "/favorites")
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(), isAuthenticated: false, user: null,
    })

    // act
    render(<AppRouter />)

    // assert
    await screen.findByRole("heading", { name: "Iniciar sesión" })
    expect(window.location.pathname).toBe("/login")
    expect(favoritesDataSource.getFavorites).not.toHaveBeenCalled()
  })
})
