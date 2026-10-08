import { create } from "zustand"
import { favoritesDataSource } from "../datasources/favorites"

export interface FavoritesState {
  buyerId: number | null
  favoriteIds: number[]
  pendingPackageIds: number[]
  isLoading: boolean
  reset: (buyerId?: number | null) => void
  fetchFavorites: () => Promise<void>
  addFavorite: (packageId: number) => Promise<boolean>
}

export const useFavoritesStore = create<FavoritesState>((set, get) => {
  let requestVersion = 0

  return {
    buyerId: null,
    favoriteIds: [],
    pendingPackageIds: [],
    isLoading: false,

    reset: (buyerId = null) => {
      requestVersion += 1
      set({ buyerId, favoriteIds: [], pendingPackageIds: [], isLoading: false })
    },

    fetchFavorites: async () => {
      if (get().buyerId === null || get().isLoading) return

      const version = requestVersion
      set({ isLoading: true })
      try {
        const favorites = await favoritesDataSource.getFavorites()
        if (version !== requestVersion) return

        set((state) => ({
          favoriteIds: [...new Set([...state.favoriteIds, ...favorites.map((pkg) => pkg.id)])],
        }))
      } catch (error) {
        if (version === requestVersion) throw error
      } finally {
        if (version === requestVersion) set({ isLoading: false })
      }
    },

    addFavorite: async (packageId) => {
      const state = get()
      if (
        state.buyerId === null ||
        state.favoriteIds.includes(packageId) ||
        state.pendingPackageIds.includes(packageId)
      ) return false

      const version = requestVersion
      set({ pendingPackageIds: [...state.pendingPackageIds, packageId] })
      try {
        await favoritesDataSource.addFavorite(packageId)
        if (version !== requestVersion) return false

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
  }
})
