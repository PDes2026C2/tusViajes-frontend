import { act, cleanup, fireEvent, render, screen, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { toast } from "react-toastify"
import { Home } from "./home"
import { useAuth } from "../hooks/useAuth"
import { useFavoritesStore } from "../stores/favorites"
import { favoritesDataSource } from "../datasources/favorites"
import { favoritePackage, favoritePackageDTO } from "../tests/fixtures/package"

vi.mock("../hooks/useAuth", () => ({ useAuth: vi.fn() }))
vi.mock("../hooks/useHeader", () => ({ useHeader: () => ({}) }))
vi.mock("../hooks/useSearch", () => ({
  useSearch: () => ({
    packages: [favoritePackage], page: 0, totalPages: 1, totalElements: 1, isSearching: false,
  }),
}))
vi.mock("../components/layout/header", () => ({ Header: () => null }))
vi.mock("../components/package/search", () => ({ SearchPackage: () => null }))
vi.mock("../datasources/favorites", () => ({
  favoritesDataSource: { getFavorites: vi.fn(), addFavorite: vi.fn(), removeFavorite: vi.fn() },
}))
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))

describe("Home favorites", () => {
  beforeEach(() => {
    vi.useFakeTimers()
    vi.resetAllMocks()
    useFavoritesStore.getState().reset()
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 7, email: "buyer@example.com", role: "BUYER" },
      modal: { open: vi.fn() },
    } as unknown as ReturnType<typeof useAuth>)
    vi.mocked(favoritesDataSource.getFavorites).mockResolvedValue([favoritePackageDTO])
    vi.mocked(favoritesDataSource.addFavorite).mockResolvedValue(undefined)
    vi.mocked(favoritesDataSource.removeFavorite).mockResolvedValue(undefined)
  })

  afterEach(() => {
    cleanup()
    vi.useRealTimers()
  })

  it("opens package details for a visitor and returns to the catalog when closed", async () => {
    // arrange
    vi.useRealTimers()
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: false, user: null, modal: { open: vi.fn() },
    } as unknown as ReturnType<typeof useAuth>)
    render(<Home />)

    // act
    fireEvent.click(screen.getByRole("button", { name: "Ver detalle" }))

    // assert
    expect(await screen.findByRole("dialog", { name: favoritePackage.name })).toBeInTheDocument()
    expect(favoritesDataSource.getFavorites).not.toHaveBeenCalled()

    // act
    fireEvent.click(screen.getByRole("button", { name: "Cerrar detalle" }))

    // assert
    await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument())
    expect(screen.getByRole("button", { name: "Ver detalle" })).toBeInTheDocument()
  })

  it("removes a saved package from home and allows adding it again", async () => {
    // arrange
    await act(async () => { render(<Home />) })
    const favoriteButton = screen.getByRole("button", { name: `Quitar de favoritos: ${favoritePackage.name}` })

    // act
    fireEvent.mouseEnter(favoriteButton)

    // assert
    expect(favoriteButton).toHaveTextContent("Quitar de favoritos")

    // act
    fireEvent.click(favoriteButton)

    // assert
    expect(favoriteButton).toHaveTextContent("Cargando...")
    expect(favoriteButton).toBeDisabled()

    // act
    await act(async () => { await vi.advanceTimersByTimeAsync(999) })

    // assert
    expect(favoriteButton).toHaveTextContent("Cargando...")
    expect(useFavoritesStore.getState().favoriteIds).toEqual([favoritePackage.id])

    // act
    await act(async () => { await vi.advanceTimersByTimeAsync(1) })

    // assert
    const addButton = screen.getByRole("button", { name: `Agregar a favoritos: ${favoritePackage.name}` })
    expect(addButton).toBeEnabled()
    expect(favoritesDataSource.removeFavorite).toHaveBeenCalledWith(favoritePackage.id)
    expect(useFavoritesStore.getState()).toMatchObject({ favoriteIds: [], favoritePackages: [], pendingPackageIds: [] })
    expect(screen.getByText(favoritePackage.name)).toBeInTheDocument()

    // act
    fireEvent.click(addButton)
    fireEvent.mouseLeave(addButton)
    await act(async () => { await vi.advanceTimersByTimeAsync(1000) })

    // assert
    expect(screen.getByText("En favoritos")).toBeInTheDocument()
    expect(favoritesDataSource.addFavorite).toHaveBeenCalledWith(favoritePackage.id)
    expect(useFavoritesStore.getState().favoriteIds).toEqual([favoritePackage.id])
    expect(toast.success).not.toHaveBeenCalled()
  })

  it("keeps the saved state and shows an error when removing from home fails", async () => {
    // arrange
    vi.mocked(favoritesDataSource.removeFavorite).mockRejectedValueOnce(new Error("Servicio no disponible"))
    await act(async () => { render(<Home />) })
    const favoriteButton = screen.getByRole("button", { name: `Quitar de favoritos: ${favoritePackage.name}` })

    // act
    fireEvent.click(favoriteButton)
    await act(async () => { await vi.advanceTimersByTimeAsync(1000) })

    // assert
    expect(toast.error).toHaveBeenCalledWith("Servicio no disponible")
    expect(favoriteButton).toBeEnabled()
    expect(favoriteButton).toHaveAttribute("aria-pressed", "true")
    expect(favoriteButton).toHaveTextContent("En favoritos")
    expect(useFavoritesStore.getState().favoriteIds).toEqual([favoritePackage.id])
  })

  it("shows loading for one second when adding without displaying a success notification", async () => {
    // arrange
    vi.mocked(favoritesDataSource.getFavorites).mockResolvedValue([])
    await act(async () => { render(<Home />) })
    const favoriteButton = screen.getByRole("button", { name: `Agregar a favoritos: ${favoritePackage.name}` })

    // act
    fireEvent.click(favoriteButton)
    fireEvent.click(favoriteButton)

    // assert
    expect(favoriteButton).toHaveTextContent("Cargando...")
    expect(favoriteButton).toBeDisabled()

    // act
    await act(async () => { await vi.advanceTimersByTimeAsync(999) })

    // assert
    expect(favoriteButton).toHaveTextContent("Cargando...")
    expect(useFavoritesStore.getState().favoriteIds).toEqual([])

    // act
    await act(async () => { await vi.advanceTimersByTimeAsync(1) })

    // assert
    expect(screen.getByText("En favoritos")).toBeInTheDocument()
    expect(favoriteButton).toBeEnabled()
    expect(favoritesDataSource.addFavorite).toHaveBeenCalledWith(favoritePackage.id)
    expect(favoritesDataSource.addFavorite).toHaveBeenCalledTimes(1)
    expect(toast.success).not.toHaveBeenCalled()
  })
})
