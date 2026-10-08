import { useEffect } from "react"
import { toast } from "react-toastify"
import type { TravelPackage } from "../models/package"
import { useFavoritesStore } from "../stores/favorites"
import { useAuth } from "./useAuth"

export function useFavorites() {
  const { user, isAuthenticated, modal } = useAuth()
  const { buyerId, favoriteIds, pendingPackageIds, isLoading, reset, fetchFavorites, addFavorite } = useFavoritesStore()
  const currentBuyerId = isAuthenticated && user?.role === "BUYER" ? user.id : null

  useEffect(() => {
    let active = true
    reset(currentBuyerId)

    if (currentBuyerId !== null) {
      fetchFavorites().catch((error: unknown) => {
        if (active) {
          toast.error(error instanceof Error ? error.message : "No pudimos cargar tus favoritos.")
        }
      })
    }

    return () => {
      active = false
      reset()
    }
  }, [currentBuyerId, user, reset, fetchFavorites])

  const handleAddFavorite = async (pkg: TravelPackage) => {
    if (!isAuthenticated) {
      modal.open("login", "/home")
      return
    }
    if (user?.role !== "BUYER") return

    try {
      if (await addFavorite(pkg.id)) {
        toast.success("Paquete agregado a tus favoritos.")
      }
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "No pudimos agregar el paquete a favoritos.")
    }
  }

  const belongsToCurrentBuyer = currentBuyerId !== null && buyerId === currentBuyerId

  return {
    favoriteIds: belongsToCurrentBuyer ? favoriteIds : [],
    pendingFavoriteIds: belongsToCurrentBuyer ? pendingPackageIds : [],
    isLoadingFavorites: currentBuyerId !== null && (!belongsToCurrentBuyer || isLoading),
    canAddFavorite: !isAuthenticated || user?.role === "BUYER",
    onAddFavorite: handleAddFavorite,
  }
}
