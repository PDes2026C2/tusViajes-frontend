import { Header } from "../components/layout/header"
import { MyTripsView } from "../components/trip/MyTripsView"
import { handleViewDetails } from "../router/packageDetails"
import { useMyTrips } from "../hooks/useMyTrips"
import { useHeader } from "../hooks/useHeader"

export default function MyTripsPage() {
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
    onTabChange,
    onRetry,
    onPageChange,
    onReviewClick,
  } = useMyTrips()

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
        onTabChange={onTabChange}
        onRetry={onRetry}
        onExplore={headerProps.onNavigateHome}
        onViewDetails={handleViewDetails}
        onReviewClick={onReviewClick}
        onPageChange={onPageChange}
      />
    </div>
  )
}
