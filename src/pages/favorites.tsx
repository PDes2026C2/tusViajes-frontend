import { Header } from "../components/layout/header"
import { FavoritesView } from "../components/package/FavoritesView"
import { usePackageDetailsModal } from "../hooks/usePackageDetailsModal"
import { PackageDetailsModal } from "../components/package/PackageDetailsModal"
import { useFavorites } from "../hooks/useFavorites"
import { useHeader } from "../hooks/useHeader"

export default function FavoritesPage() {
  const detailsModal = usePackageDetailsModal()
  const headerProps = useHeader()
  const {
    favoritePackages, isLoadingFavorites, favoritesError, onRetryFavorites,
    pendingFavoriteIds, onRemoveFavorite,
  } = useFavorites()

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col">
      <Header {...headerProps} />
      <FavoritesView
        packages={favoritePackages}
        isLoading={isLoadingFavorites}
        error={favoritesError}
        onRetry={onRetryFavorites}
        onExplore={headerProps.onNavigateHome}
        pendingFavoriteIds={pendingFavoriteIds}
        onRemoveFavorite={onRemoveFavorite}
        onViewDetails={detailsModal.openDetails}
      />
      <PackageDetailsModal packageData={detailsModal.selectedPackage} onClose={detailsModal.closeDetails} />
    </div>
  )
}
