import { create } from "zustand"
import { favoritesDataSource } from "../datasources/favorites"
import { packageMappers, type TravelPackage } from "../models/package"

export interface FavoritesState {
  buyerId: number | null
  favoriteIds: number[]
  favoritePackages: TravelPackage[]
  pendingPackageIds: number[]
  isLoading: boolean
  error: string | null
  reset: (buyerId?: number | null) => void
  fetchFavorites: () => Promise<void>
  addFavorite: (packageId: number, minimumLoadingMs?: number) => Promise<boolean>
  removeFavorite: (packageId: number, minimumLoadingMs?: number) => Promise<boolean>
}

async function withMinimumLoading(action: () => Promise<void>, minimumLoadingMs: number) {
  const minimumLoading = minimumLoadingMs > 0
    ? new Promise<void>((resolve) => setTimeout(resolve, minimumLoadingMs))
    : Promise.resolve()
  try {
    await action()
  } finally {
    await minimumLoading
  }
}

export const useFavoritesStore = create<FavoritesState>((set, get) => {
  let requestVersion = 0
  const removedPackageIds = new Set<number>()

  return {
    buyerId: null,
    favoriteIds: [],
    favoritePackages: [],
    pendingPackageIds: [],
    isLoading: false,
    error: null,

    reset: (buyerId = null) => {
      requestVersion += 1
      removedPackageIds.clear()
      set({ buyerId, favoriteIds: [], favoritePackages: [], pendingPackageIds: [], isLoading: false, error: null })
    },

    fetchFavorites: async () => {
      if (get().buyerId === null || get().isLoading) return

      const version = requestVersion
      set({ isLoading: true, error: null })
      try {
        const favorites = await favoritesDataSource.getFavorites()
        if (version !== requestVersion) return

        const favoritePackages = [...new Map(
          favorites.filter((dto) => !removedPackageIds.has(dto.id))
            .map((dto) => [dto.id, packageMappers.mapDTOToModel(dto)])
        ).values()]

        set((state) => ({
          favoriteIds: [...new Set([...state.favoriteIds, ...favoritePackages.map((pkg) => pkg.id)])],
          favoritePackages,
        }))
      } catch (error) {
        if (version === requestVersion) {
          set({ error: error instanceof Error ? error.message : "No pudimos cargar tus favoritos." })
          throw error
        }
      } finally {
        if (version === requestVersion) set({ isLoading: false })
      }
    },

    addFavorite: async (packageId, minimumLoadingMs = 0) => {
      const state = get()
      if (
        state.buyerId === null ||
        state.favoriteIds.includes(packageId) ||
        state.pendingPackageIds.includes(packageId)
      ) return false

      const version = requestVersion
      set({ pendingPackageIds: [...state.pendingPackageIds, packageId] })
      try {
        await withMinimumLoading(() => favoritesDataSource.addFavorite(packageId), minimumLoadingMs)
        if (version !== requestVersion) return false

        removedPackageIds.delete(packageId)
        set((current) => ({ favoriteIds: [...new Set([...current.favoriteIds, packageId])] }))
        return true
      } catch (error) {
        if (version === requestVersion) throw error
        return false
      } finally {
        if (version === requestVersion) {
          set((current) => ({
            pendingPackageIds: current.pendingPackageIds.filter((id) => id !== packageId),
          }))
        }
      }
    },

    removeFavorite: async (packageId, minimumLoadingMs = 0) => {
      const state = get()
      if (
        state.buyerId === null ||
        !state.favoriteIds.includes(packageId) ||
        state.pendingPackageIds.includes(packageId)
      ) return false

      const version = requestVersion
      set({ pendingPackageIds: [...state.pendingPackageIds, packageId] })
      try {
        await withMinimumLoading(() => favoritesDataSource.removeFavorite(packageId), minimumLoadingMs)
        if (version !== requestVersion) return false

        removedPackageIds.add(packageId)
        set((current) => ({
          favoriteIds: current.favoriteIds.filter((id) => id !== packageId),
          favoritePackages: current.favoritePackages.filter((pkg) => pkg.id !== packageId),
        }))
        return true
      } catch (error) {
        if (version === requestVersion) throw error
        return false
      } finally {
        if (version === requestVersion) {
          set((current) => ({
            pendingPackageIds: current.pendingPackageIds.filter((id) => id !== packageId),
          }))
        }
      }
    },
  }
})
