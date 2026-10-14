import { useEffect } from "react"
import { toast } from "react-toastify"
import type { TravelPackage } from "../models/package"
import { useFavoritesStore } from "../stores/favorites"
import { useAuth } from "./useAuth"

export function useFavorites({ minimumLoadingMs = 0 }: { minimumLoadingMs?: number } = {}) {
  const { user, isAuthenticated, modal } = useAuth()
  const {
    buyerId, favoriteIds, favoritePackages, pendingPackageIds, isLoading, error,
    reset, fetchFavorites, addFavorite, removeFavorite,
  } = useFavoritesStore()
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
      await addFavorite(pkg.id, minimumLoadingMs)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "No pudimos agregar el paquete a favoritos.")
    }
  }

  const belongsToCurrentBuyer = currentBuyerId !== null && buyerId === currentBuyerId

  const handleRemoveFavorite = async (pkg: TravelPackage) => {
    if (!belongsToCurrentBuyer) return
    try {
      await removeFavorite(pkg.id, minimumLoadingMs)
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "No pudimos quitar el paquete de favoritos.")
    }
  }

  const handleRetryFavorites = async () => {
    if (currentBuyerId === null) return
    try {
      await fetchFavorites()
    } catch (error: unknown) {
      toast.error(error instanceof Error ? error.message : "No pudimos cargar tus favoritos.")
    }
  }

  return {
    favoriteIds: belongsToCurrentBuyer ? favoriteIds : [],
    favoritePackages: belongsToCurrentBuyer ? favoritePackages : [],
    isLoadingFavorites: currentBuyerId !== null && (!belongsToCurrentBuyer || isLoading),
    favoritesError: belongsToCurrentBuyer ? error : null,
    onRetryFavorites: handleRetryFavorites,
    onRemoveFavorite: handleRemoveFavorite,
    pendingFavoriteIds: belongsToCurrentBuyer ? pendingPackageIds : [],
    canAddFavorite: !isAuthenticated || user?.role === "BUYER",
    onAddFavorite: handleAddFavorite,
  }
}
