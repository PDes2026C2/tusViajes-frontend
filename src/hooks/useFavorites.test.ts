import { act, renderHook, waitFor } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { toast } from "react-toastify"
import type { Role, User } from "../models/auth"
import { favoritePackage } from "../tests/fixtures/package"
import { useFavoritesStore, type FavoritesState } from "../stores/favorites"
import { useAuth } from "./useAuth"
import { useFavorites } from "./useFavorites"

vi.mock("./useAuth", () => ({ useAuth: vi.fn() }))
vi.mock("../stores/favorites", () => ({ useFavoritesStore: vi.fn() }))
vi.mock("react-toastify", () => ({ toast: { success: vi.fn(), error: vi.fn() } }))

describe("useFavorites", () => {
  const buyer: User = { id: 7, email: "buyer@example.com", role: "BUYER" }
  let authState: ReturnType<typeof useAuth>
  let favoritesState: FavoritesState

  beforeEach(() => {
    vi.resetAllMocks()
    authState = {
      user: null,
      isAuthenticated: false,
      isLoading: false,
      modal: {
        isOpen: false, mode: "login", redirectPath: null,
        open: vi.fn(), close: vi.fn(), setMode: vi.fn(),
      },
      login: vi.fn(), registerBuyer: vi.fn(), registerAgency: vi.fn(), logout: vi.fn(),
    }
    favoritesState = {
      buyerId: null, favoriteIds: [], pendingPackageIds: [], isLoading: false,
      reset: vi.fn(),
      fetchFavorites: vi.fn().mockResolvedValue(undefined),
      addFavorite: vi.fn().mockResolvedValue(true),
    }
    vi.mocked(useAuth).mockImplementation(() => authState)
    vi.mocked(useFavoritesStore).mockImplementation(() => favoritesState)
  })

  it("opens login for visitors without calling the favorites API", async () => {
    // arrange
    const { result } = renderHook(() => useFavorites())

    // act
    await act(async () => result.current.onAddFavorite(favoritePackage))

    // assert
    expect(authState.modal.open).toHaveBeenCalledWith("login", "/home")
    expect(favoritesState.fetchFavorites).not.toHaveBeenCalled()
    expect(favoritesState.addFavorite).not.toHaveBeenCalled()
    expect(result.current.canAddFavorite).toBe(true)
  })

  it("loads and exposes the buyer's favorite and pending packages", () => {
    // arrange
    authState = { ...authState, user: buyer, isAuthenticated: true }
    favoritesState = { ...favoritesState, buyerId: buyer.id, favoriteIds: [101], pendingPackageIds: [102] }
    const expectedState = {
      favoriteIds: [101], pendingFavoriteIds: [102], canAddFavorite: true,
    }

    // act
    const { result } = renderHook(() => useFavorites())

    // assert
    expect(favoritesState.reset).toHaveBeenCalledWith(buyer.id)
    expect(favoritesState.fetchFavorites).toHaveBeenCalledTimes(1)
    expect(result.current).toMatchObject(expectedState)
  })

  it.each<Role>(["AGENCY", "ADMIN"])("hides the action and avoids API calls for %s", async (role) => {
    // arrange
    authState = { ...authState, user: { ...buyer, role }, isAuthenticated: true }
    const { result } = renderHook(() => useFavorites())

    // act
    await act(async () => result.current.onAddFavorite(favoritePackage))

    // assert
    expect(result.current.canAddFavorite).toBe(false)
    expect(favoritesState.fetchFavorites).not.toHaveBeenCalled()
    expect(favoritesState.addFavorite).not.toHaveBeenCalled()
    expect(authState.modal.open).not.toHaveBeenCalled()
  })

  it("shows a success notification after saving", async () => {
    // arrange
    authState = { ...authState, user: buyer, isAuthenticated: true }
    const { result } = renderHook(() => useFavorites())

    // act
    await act(async () => result.current.onAddFavorite(favoritePackage))

    // assert
    expect(favoritesState.addFavorite).toHaveBeenCalledWith(favoritePackage.id)
    expect(toast.success).toHaveBeenCalledWith("Paquete agregado a tus favoritos.")
  })

  it("does not announce success for an ignored or duplicate request", async () => {
    // arrange
    authState = { ...authState, user: buyer, isAuthenticated: true }
    vi.mocked(favoritesState.addFavorite).mockResolvedValue(false)
    const { result } = renderHook(() => useFavorites())

    // act
    await act(async () => result.current.onAddFavorite(favoritePackage))

    // assert
    expect(toast.success).not.toHaveBeenCalled()
  })

  it("shows the API error when saving fails", async () => {
    // arrange
    authState = { ...authState, user: buyer, isAuthenticated: true }
    vi.mocked(favoritesState.addFavorite).mockRejectedValue(new Error("Paquete no encontrado"))
    const { result } = renderHook(() => useFavorites())

    // act
    await act(async () => result.current.onAddFavorite(favoritePackage))

    // assert
    expect(toast.error).toHaveBeenCalledWith("Paquete no encontrado")
    expect(toast.success).not.toHaveBeenCalled()
  })

  it("surfaces an error loading existing favorites", async () => {
    // arrange
    authState = { ...authState, user: buyer, isAuthenticated: true }
    vi.mocked(favoritesState.fetchFavorites).mockRejectedValue(new Error("Servicio no disponible"))

    // act
    renderHook(() => useFavorites())

    // assert
    await waitFor(() => expect(toast.error).toHaveBeenCalledWith("Servicio no disponible"))
  })

  it("clears and hides favorites when the buyer logs out", () => {
    // arrange
    authState = { ...authState, user: buyer, isAuthenticated: true }
    favoritesState = { ...favoritesState, buyerId: buyer.id, favoriteIds: [101] }
    const { result, rerender } = renderHook(() => useFavorites())

    // act
    authState = { ...authState, user: null, isAuthenticated: false }
    rerender()

    // assert
    expect(favoritesState.reset).toHaveBeenCalledWith(null)
    expect(result.current.favoriteIds).toEqual([])
    expect(result.current.pendingFavoriteIds).toEqual([])
  })

  it("hides stale favorites while switching buyers", () => {
    // arrange
    authState = { ...authState, user: buyer, isAuthenticated: true }
    favoritesState = { ...favoritesState, buyerId: 8, favoriteIds: [101] }

    // act
    const { result } = renderHook(() => useFavorites())

    // assert
    expect(result.current.favoriteIds).toEqual([])
  })

  it("clears pending work on unmount", () => {
    // arrange
    const { unmount } = renderHook(() => useFavorites())

    // act
    unmount()

    // assert
    expect(favoritesState.reset).toHaveBeenLastCalledWith()
  })
})
