import { create } from "zustand"
import { buyerDataSource } from "../datasources/buyer"
import { purchaseMappers, type BuyerPurchase } from "../models/purchase"

export type MyTripsTab = "upcoming" | "completed"

export interface MyTripsState {
  buyerId: number | null
  purchases: BuyerPurchase[]
  activeTab: MyTripsTab
  page: number
  totalPages: number
  totalElements: number
  isLoading: boolean
  error: string | null
  reset: (buyerId?: number | null) => void
  setActiveTab: (tab: MyTripsTab) => void
  fetchMyPurchases: (page?: number) => Promise<void>
}

export const useMyTripsStore = create<MyTripsState>((set, get) => {
  let requestVersion = 0

  return {
    buyerId: null,
    purchases: [],
    activeTab: "upcoming",
    page: 0,
    totalPages: 0,
    totalElements: 0,
    isLoading: false,
    error: null,

    reset: (buyerId = null) => {
      requestVersion += 1
      set({
        buyerId,
        purchases: [],
        activeTab: "upcoming",
        page: 0,
        totalPages: 0,
        totalElements: 0,
        isLoading: false,
        error: null,
      })
    },

    setActiveTab: (activeTab: MyTripsTab) => {
      set({ activeTab })
    },

    fetchMyPurchases: async (page = 0) => {
      if (get().buyerId === null || get().isLoading) return

      const version = requestVersion
      set({ isLoading: true, error: null })

      try {
        const responseDTO = await buyerDataSource.getMyPurchases(page)
        if (version !== requestVersion) return

        const pageModel = purchaseMappers.mapPageDTOToModel(responseDTO)
        set({
          purchases: pageModel.content,
          page: pageModel.number,
          totalPages: pageModel.totalPages,
          totalElements: pageModel.totalElements,
        })
      } catch (error) {
        if (version === requestVersion) {
          set({
            error: error instanceof Error ? error.message : "No pudimos cargar tus viajes comprados.",
          })
          throw error
        }
      } finally {
        if (version === requestVersion) {
          set({ isLoading: false })
        }
      }
    },
  }
})
