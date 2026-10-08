import { beforeEach, describe, expect, it, vi } from "vitest"
import { useFavoritesStore } from "./favorites"
import { favoritesDataSource } from "../datasources/favorites"
import { favoritePackageDTO } from "../tests/fixtures/package"
import type { TravelPackageResponseDTO } from "../types/package"

vi.mock("../datasources/favorites", () => ({
  favoritesDataSource: { getFavorites: vi.fn(), addFavorite: vi.fn() },
}))


function deferred<T>() {
  let resolve!: (value: T) => void
  const promise = new Promise<T>((resolvePromise) => { resolve = resolvePromise })
  return { promise, resolve }
}

describe("useFavoritesStore", () => {
  beforeEach(() => {
    vi.resetAllMocks()
    useFavoritesStore.getState().reset(7)
    vi.mocked(favoritesDataSource.getFavorites).mockResolvedValue([])
    vi.mocked(favoritesDataSource.addFavorite).mockResolvedValue(undefined)
  })

  it("loads existing favorites and removes duplicate IDs", async () => {
    // arrange
    const expectedFavoriteIds = [favoritePackageDTO.id]
    vi.mocked(favoritesDataSource.getFavorites).mockResolvedValue([favoritePackageDTO, favoritePackageDTO])

    // act
    await useFavoritesStore.getState().fetchFavorites()

    // assert
    expect(useFavoritesStore.getState()).toMatchObject({
      buyerId: 7, favoriteIds: expectedFavoriteIds, pendingPackageIds: [], isLoading: false,
    })
  })

  it("marks a package only after the API confirms and blocks repeated clicks", async () => {
    // arrange
    const savedRequest = deferred<void>()
    const expectedPendingState = { favoriteIds: [], pendingPackageIds: [101] }
    const expectedSavedState = { favoriteIds: [101], pendingPackageIds: [] }
    vi.mocked(favoritesDataSource.addFavorite).mockReturnValue(savedRequest.promise)

    // act
    const firstRequest = useFavoritesStore.getState().addFavorite(101)
    const repeatedClick = await useFavoritesStore.getState().addFavorite(101)

    // assert
    expect(useFavoritesStore.getState()).toMatchObject(expectedPendingState)
    expect(repeatedClick).toBe(false)
    expect(favoritesDataSource.addFavorite).toHaveBeenCalledTimes(1)

    // act
    savedRequest.resolve()
    const saved = await firstRequest
    const alreadySavedClick = await useFavoritesStore.getState().addFavorite(101)

    // assert
    expect(saved).toBe(true)
    expect(alreadySavedClick).toBe(false)
    expect(useFavoritesStore.getState()).toMatchObject(expectedSavedState)
    expect(favoritesDataSource.addFavorite).toHaveBeenCalledTimes(1)
  })

  it("clears the pending state after a failure and allows retrying", async () => {
    // arrange
    const expectedError = new Error("No se pudo guardar")
    const expectedFailureState = { favoriteIds: [], pendingPackageIds: [] }
    vi.mocked(favoritesDataSource.addFavorite).mockRejectedValueOnce(expectedError)

    // act
    const failedRequest = useFavoritesStore.getState().addFavorite(101)

    // assert
    await expect(failedRequest).rejects.toBe(expectedError)
    expect(useFavoritesStore.getState()).toMatchObject(expectedFailureState)

    // act
    await useFavoritesStore.getState().addFavorite(101)

    // assert
    expect(useFavoritesStore.getState().favoriteIds).toEqual([101])
  })

  it("preserves both favorites when different packages are saved concurrently", async () => {
    // arrange
    const firstSave = deferred<void>()
    const secondSave = deferred<void>()
    vi.mocked(favoritesDataSource.addFavorite)
      .mockReturnValueOnce(firstSave.promise)
      .mockReturnValueOnce(secondSave.promise)

    // act
    const firstRequest = useFavoritesStore.getState().addFavorite(101)
    const secondRequest = useFavoritesStore.getState().addFavorite(102)
    secondSave.resolve()
    await secondRequest
    firstSave.resolve()
    await firstRequest

    // assert
    expect(useFavoritesStore.getState()).toMatchObject({
      favoriteIds: [102, 101], pendingPackageIds: [],
    })
  })

  it.each(["load first", "save first"])("preserves favorites when loading and saving overlap: %s", async (completionOrder) => {
    // arrange
    const loadingRequest = deferred<TravelPackageResponseDTO[]>()
    const savingRequest = deferred<void>()
    const expectedState = {
      buyerId: 7, favoriteIds: [101, 102], pendingPackageIds: [], isLoading: false,
    }
    vi.mocked(favoritesDataSource.getFavorites).mockReturnValue(loadingRequest.promise)
    vi.mocked(favoritesDataSource.addFavorite).mockReturnValue(savingRequest.promise)

    // act
    const loading = useFavoritesStore.getState().fetchFavorites()
    const saving = useFavoritesStore.getState().addFavorite(102)
    if (completionOrder === "load first") {
      loadingRequest.resolve([favoritePackageDTO])
      await loading
      savingRequest.resolve()
    } else {
      savingRequest.resolve()
      await saving
      loadingRequest.resolve([favoritePackageDTO])
    }
    const [saved] = await Promise.all([saving, loading])

    // assert
    expect(saved).toBe(true)
    expect(favoritesDataSource.addFavorite).toHaveBeenCalledWith(102)
    expect(useFavoritesStore.getState()).toMatchObject({
      ...expectedState, favoriteIds: expect.arrayContaining(expectedState.favoriteIds),
    })
    expect(useFavoritesStore.getState().favoriteIds).toHaveLength(expectedState.favoriteIds.length)
  })

  it("surfaces load errors and clears the loading indicator", async () => {
    // arrange
    const expectedError = new Error("No se pudieron cargar")
    vi.mocked(favoritesDataSource.getFavorites).mockRejectedValue(expectedError)

    // act
    const request = useFavoritesStore.getState().fetchFavorites()

    // assert
    await expect(request).rejects.toBe(expectedError)
    expect(useFavoritesStore.getState()).toMatchObject({ favoriteIds: [], isLoading: false })
  })

  it("ignores a previous buyer's load response after the session changes", async () => {
    // arrange
    const oldLoad = deferred<TravelPackageResponseDTO[]>()
    const currentLoad = deferred<TravelPackageResponseDTO[]>()
    vi.mocked(favoritesDataSource.getFavorites)
      .mockReturnValueOnce(oldLoad.promise)
      .mockReturnValueOnce(currentLoad.promise)

    // act
    const oldRequest = useFavoritesStore.getState().fetchFavorites()
    useFavoritesStore.getState().reset(8)
    const currentRequest = useFavoritesStore.getState().fetchFavorites()
    oldLoad.resolve([favoritePackageDTO])
    await oldRequest

    // assert
    expect(useFavoritesStore.getState()).toMatchObject({
      buyerId: 8, favoriteIds: [], isLoading: true,
    })

    // act
    currentLoad.resolve([])
    await currentRequest

    // assert
    expect(useFavoritesStore.getState()).toMatchObject({
      buyerId: 8, favoriteIds: [], isLoading: false,
    })
  })

  it("ignores a pending save after logout", async () => {
    // arrange
    const pendingSave = deferred<void>()
    vi.mocked(favoritesDataSource.addFavorite).mockReturnValue(pendingSave.promise)

    // act
    const oldRequest = useFavoritesStore.getState().addFavorite(101)
    useFavoritesStore.getState().reset()
    pendingSave.resolve()
    const saved = await oldRequest

    // assert
    expect(saved).toBe(false)
    expect(useFavoritesStore.getState()).toMatchObject({
      buyerId: null, favoriteIds: [], pendingPackageIds: [], isLoading: false,
    })
  })

  it("does not call the API without a buyer session", async () => {
    // arrange
    useFavoritesStore.getState().reset()

    // act
    await useFavoritesStore.getState().fetchFavorites()
    const saved = await useFavoritesStore.getState().addFavorite(101)

    // assert
    expect(saved).toBe(false)
    expect(favoritesDataSource.getFavorites).not.toHaveBeenCalled()
    expect(favoritesDataSource.addFavorite).not.toHaveBeenCalled()
  })
})
