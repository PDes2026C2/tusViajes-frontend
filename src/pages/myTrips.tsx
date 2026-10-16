import { Header } from "../components/layout/header"
import { MyTripsView } from "../components/trip/MyTripsView"
import { ReviewModal } from "../components/trip/ReviewModal"
import { usePackageDetailsModal } from "../hooks/usePackageDetailsModal"
import { PackageDetailsModal } from "../components/package/PackageDetailsModal"
import { useMyTrips } from "../hooks/useMyTrips"
import { useReviewModal } from "../hooks/useReviewModal"
import { useHeader } from "../hooks/useHeader"

export default function MyTripsPage() {
  const detailsModal = usePackageDetailsModal()
  const headerProps = useHeader()
  const {
    currentTrips,
    activeTab,
    upcomingCount,
    completedCount,
    isLoading,
    error,
    page,
    totalPages,
    reviewedPackageIds,
    onTabChange,
    onRetry,
    onPageChange,
  } = useMyTrips()

  const reviewModal = useReviewModal()

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col">
      <Header {...headerProps} />
      <MyTripsView
        trips={currentTrips}
        activeTab={activeTab}
        upcomingCount={upcomingCount}
        completedCount={completedCount}
        isLoading={isLoading}
        error={error}
        page={page}
        totalPages={totalPages}
        reviewedPackageIds={reviewedPackageIds}
        onTabChange={onTabChange}
        onRetry={onRetry}
        onExplore={headerProps.onNavigateHome}
        onViewDetails={detailsModal.openDetails}
        onReviewClick={reviewModal.openReviewModal}
        onPageChange={onPageChange}
      />
      <PackageDetailsModal packageData={detailsModal.selectedPackage} onClose={detailsModal.closeDetails} />
      <ReviewModal
        isOpen={reviewModal.isOpen}
        trip={reviewModal.selectedTrip}
        isSubmitting={reviewModal.isSubmitting}
        onClose={reviewModal.closeReviewModal}
        onSubmit={reviewModal.onSubmit}
        form={reviewModal.form}
      />
    </div>
  )
}
