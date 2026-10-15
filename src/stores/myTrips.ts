import { create } from "zustand"
import { buyerDataSource } from "../datasources/buyer"
import { reviewDataSource } from "../datasources/review"
import { purchaseMappers, type BuyerPurchase } from "../models/purchase"
import type { ReviewFormData } from "../models/review.schema"

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
  reviewedPackageIds: number[]
  isSubmittingReview: boolean
  reset: (buyerId?: number | null) => void
  setActiveTab: (tab: MyTripsTab) => void
  fetchMyPurchases: (page?: number) => Promise<void>
  fetchMyReviews: () => Promise<void>
  submitReview: (travelPackageId: number, data: ReviewFormData) => Promise<void>
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
    reviewedPackageIds: [],
    isSubmittingReview: false,

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
        reviewedPackageIds: [],
        isSubmittingReview: false,
      })
    },

    setActiveTab: (activeTab: MyTripsTab) => {
      set({ activeTab })
    },

    fetchMyReviews: async () => {
      if (get().buyerId === null) return
      try {
        const responseDTO = await reviewDataSource.getMyReviews(0, 100)
        const backendIds = responseDTO.content.map((review) => review.travelPackageId)
        set({ reviewedPackageIds: Array.from(new Set(backendIds)) })
      } catch {
        // Fallback: keep existing reviews without breaking the view
      }
    },

    fetchMyPurchases: async (page = 0) => {
      if (get().buyerId === null || get().isLoading) return

      const version = requestVersion
      set({ isLoading: true, error: null })

      try {
        const [responseDTO] = await Promise.all([
          buyerDataSource.getMyPurchases(page),
          get().fetchMyReviews(),
        ])
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

    submitReview: async (travelPackageId, data) => {
      const state = get()
      if (state.buyerId === null) return

      set({ isSubmittingReview: true })
      try {
        await reviewDataSource.createReview(travelPackageId, {
          score: data.score,
          comment: data.comment,
        })
        const updatedIds = Array.from(new Set([...get().reviewedPackageIds, travelPackageId]))
        set({ reviewedPackageIds: updatedIds })
      } catch (err) {
        const message = err instanceof Error ? err.message : ""
        if (message.includes("409") || message.toLowerCase().includes("ya opinó")) {
          const updatedIds = Array.from(new Set([...get().reviewedPackageIds, travelPackageId]))
          set({ reviewedPackageIds: updatedIds })
        }
        throw err
      } finally {
        set({ isSubmittingReview: false })
      }
    },
  }
})
