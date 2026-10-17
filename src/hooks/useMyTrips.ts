import { useEffect } from "react"
import { toast } from "react-toastify"
import type { BuyerPurchase } from "../models/purchase"
import { useMyTripsStore } from "../stores/myTrips"
import { useAuth } from "./useAuth"

export function useMyTrips() {
  const { user, isAuthenticated } = useAuth()
  const {
    buyerId,
    purchases,
    activeTab,
    page,
    totalPages,
    totalElements,
    isLoading,
    error,
    reviewedPackageIds,
    reset,
    setActiveTab,
    fetchMyPurchases,
  } = useMyTripsStore()

  const currentBuyerId = isAuthenticated && user?.role === "BUYER" ? user.id : null
  const belongsToCurrentBuyer = currentBuyerId !== null && buyerId === currentBuyerId

  useEffect(() => {
    let active = true
    reset(currentBuyerId)

    if (currentBuyerId !== null) {
      fetchMyPurchases(0).catch((err: unknown) => {
        if (active) {
          toast.error(err instanceof Error ? err.message : "No pudimos cargar tus viajes comprados.")
        }
      })
    }

    return () => {
      active = false
      reset()
    }
  }, [currentBuyerId, reset, fetchMyPurchases])

  const upcomingTrips = belongsToCurrentBuyer
    ? purchases.filter((p) => p.status === "UPCOMING" || p.status === "IN_PROGRESS")
    : []

  const completedTrips = belongsToCurrentBuyer
    ? purchases.filter((p) => p.status === "COMPLETED")
    : []

  const currentTrips = activeTab === "upcoming" ? upcomingTrips : completedTrips

  const handleRetry = async () => {
    if (currentBuyerId === null) return
    try {
      await fetchMyPurchases(page)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No pudimos cargar tus viajes comprados.")
    }
  }

  const handlePageChange = async (newPage: number) => {
    if (currentBuyerId === null) return
    try {
      await fetchMyPurchases(newPage)
    } catch (err: unknown) {
      toast.error(err instanceof Error ? err.message : "No pudimos cargar la página de viajes.")
    }
  }

  const handleReviewClick = (trip: BuyerPurchase) => {
    // Review modal action placeholder for future branch
    console.info("Review action triggered for trip:", trip.id)
  }

  return {
    activeTab,
    onTabChange: setActiveTab,
    purchases: belongsToCurrentBuyer ? purchases : [],
    upcomingTrips,
    completedTrips,
    currentTrips,
    upcomingCount: upcomingTrips.length,
    completedCount: completedTrips.length,
    isLoading: currentBuyerId !== null && (!belongsToCurrentBuyer || isLoading),
    error: belongsToCurrentBuyer ? error : null,
    page,
    totalPages,
    totalElements,
    reviewedPackageIds: belongsToCurrentBuyer ? reviewedPackageIds : [],
    onRetry: handleRetry,
    onPageChange: handlePageChange,
    onReviewClick: handleReviewClick,
  }
}
