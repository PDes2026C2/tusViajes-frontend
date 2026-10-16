import { ArrowRight, Compass, Loader2, Plane, RefreshCw } from "lucide-react"
import type { BuyerPurchase } from "../../models/purchase"
import type { TravelPackage } from "../../models/package"
import type { MyTripsTab } from "../../stores/myTrips"
import { Button } from "../ui/button"
import { MyTripCard } from "./MyTripCard"
import { PackagePagination } from "../package/package-pagination"

export interface MyTripsViewProps {
  trips: BuyerPurchase[]
  activeTab: MyTripsTab
  upcomingCount: number
  completedCount: number
  isLoading: boolean
  error: string | null
  page?: number
  totalPages?: number
  reviewedPackageIds?: number[]
  onTabChange: (tab: MyTripsTab) => void
  onRetry: () => void
  onExplore: () => void
  onViewDetails: (pkg: TravelPackage) => void
  onReviewClick: (trip: BuyerPurchase) => void
  onPageChange?: (page: number) => void
}

export function MyTripsView({
  trips,
  activeTab,
  upcomingCount,
  completedCount,
  isLoading,
  error,
  page = 0,
  totalPages = 0,
  reviewedPackageIds = [],
  onTabChange,
  onRetry,
  onExplore,
  onViewDetails,
  onReviewClick,
  onPageChange,
}: MyTripsViewProps) {
  const totalTripsCount = upcomingCount + completedCount

  return (
    <main className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 flex flex-col gap-6">
      {/* Header & Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 pb-2 border-b border-slate-100">
        <div>
          <div className="flex items-center gap-2.5">
            <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Mis Viajes</h1>
            {!isLoading && !error && totalTripsCount > 0 && (
              <span className="bg-sky-50 border border-sky-200/60 text-sky-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
                {totalTripsCount} {totalTripsCount === 1 ? "viaje" : "viajes"}
              </span>
            )}
          </div>
          <p className="text-xs sm:text-sm text-slate-500 mt-0.5">
            Consultá el estado de tus paquetes comprados y dejá tus reseñas
          </p>
        </div>

        {/* Tab Controls */}
        <div className="flex items-center gap-2 bg-slate-100/80 p-1 rounded-xl self-start sm:self-auto">
          <button
            type="button"
            onClick={() => onTabChange("upcoming")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "upcoming"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Próximos</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "upcoming"
                  ? "bg-primary/10 text-primary"
                  : "bg-slate-200/70 text-slate-600"
              }`}
            >
              {upcomingCount}
            </span>
          </button>

          <button
            type="button"
            onClick={() => onTabChange("completed")}
            className={`px-3.5 py-1.5 rounded-lg text-xs font-semibold transition-all cursor-pointer flex items-center gap-1.5 ${
              activeTab === "completed"
                ? "bg-white text-primary shadow-xs"
                : "text-slate-600 hover:text-slate-900"
            }`}
          >
            <span>Finalizados</span>
            <span
              className={`px-1.5 py-0.2 rounded-full text-[10px] font-bold ${
                activeTab === "completed"
                  ? "bg-primary/10 text-primary"
                  : "bg-slate-200/70 text-slate-600"
              }`}
            >
              {completedCount}
            </span>
          </button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading ? (
        <div role="status" className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-600">Cargando tus viajes...</p>
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-error/20 bg-white p-8 text-center shadow-2xs">
          <h2 className="text-lg font-semibold text-slate-800">No pudimos cargar tus viajes</h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Button onClick={onRetry} className="mt-5 rounded-xl px-5 py-2.5 h-auto cursor-pointer">
            <RefreshCw aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      ) : trips.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            {activeTab === "upcoming" ? (
              <Plane className="w-7 h-7" aria-hidden="true" />
            ) : (
              <Compass className="w-7 h-7" aria-hidden="true" />
            )}
          </div>
          <h2 className="text-base font-bold text-slate-800">
            {activeTab === "upcoming" ? "No tenés viajes próximos" : "No tenés viajes finalizados todavía"}
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-5">
            {activeTab === "upcoming"
              ? "Explorá los paquetes disponibles y empezá a planear tu próxima aventura."
              : "Acá vas a encontrar los viajes que ya realizaste para recordar tus experiencias y dejar tus opiniones."}
          </p>
          <Button onClick={onExplore} className="rounded-xl px-5 py-2.5 h-auto cursor-pointer">
            Explorar paquetes
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {trips.map((trip) => (
              <MyTripCard
                key={trip.id}
                trip={trip}
                onViewDetails={onViewDetails}
                onReviewClick={onReviewClick}
                isReviewed={reviewedPackageIds.includes(trip.travelPackage.id)}
              />
            ))}
          </div>

          {totalPages > 1 && onPageChange && (
            <div className="mt-6 flex justify-center">
              <PackagePagination
                currentPage={page}
                totalPages={totalPages}
                onPageChange={onPageChange}
              />
            </div>
          )}
        </>
      )}
    </main>
  )
}
