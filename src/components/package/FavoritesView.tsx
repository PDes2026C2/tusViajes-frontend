import { ArrowRight, Heart, Loader2, RefreshCw } from "lucide-react"
import type { TravelPackage } from "../../models/package"
import { Button } from "../ui/button"
import { PackageSummaryCard } from "./PackageSummaryCard"

export interface FavoritesViewProps {
  packages: TravelPackage[]
  isLoading: boolean
  error: string | null
  onRetry: () => void
  onExplore: () => void
  pendingFavoriteIds: number[]
  onRemoveFavorite: (pkg: TravelPackage) => void
  onViewDetails: (pkg: TravelPackage) => void
}

export function FavoritesView({
  packages, isLoading, error, onRetry, onExplore,
  pendingFavoriteIds, onRemoveFavorite, onViewDetails,
}: FavoritesViewProps) {
  return (
    <main className="mx-auto max-w-6xl w-full px-4 sm:px-6 py-8 flex flex-col gap-6">
      <div className="flex items-center gap-2.5">
        <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">Paquetes guardados</h1>
        {!isLoading && !error && packages.length > 0 && (
          <span className="bg-sky-50 border border-sky-200/60 text-sky-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
            {packages.length} {packages.length === 1 ? "paquete" : "paquetes"}
          </span>
        )}
      </div>

      {isLoading ? (
        <div role="status" className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" aria-hidden="true" />
          <p className="text-sm font-medium text-slate-600">Cargando tus favoritos...</p>
        </div>
      ) : error ? (
        <div role="alert" className="rounded-2xl border border-error/20 bg-white p-8 text-center shadow-2xs">
          <h2 className="text-lg font-semibold text-slate-800">No pudimos cargar tus favoritos</h2>
          <p className="mt-2 text-sm text-slate-500">{error}</p>
          <Button onClick={onRetry} className="mt-5 rounded-xl px-5 py-2.5 h-auto cursor-pointer">
            <RefreshCw aria-hidden="true" />
            Reintentar
          </Button>
        </div>
      ) : packages.length === 0 ? (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Heart className="w-7 h-7" aria-hidden="true" />
          </div>
          <h2 className="text-base font-bold text-slate-800">Todavía no tenés favoritos</h2>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-5">
            Explorá los paquetes y guardá los que más te gusten para encontrarlos acá.
          </p>
          <Button onClick={onExplore} className="rounded-xl px-5 py-2.5 h-auto cursor-pointer">
            Explorar paquetes
            <ArrowRight aria-hidden="true" />
          </Button>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <PackageSummaryCard
              key={pkg.id}
              packageData={{
                ...pkg,
                startDate: pkg.initialDate,
                endDate: pkg.finalDate,
                returnFlight: pkg.arrivalFlight,
              }}
              imageAction={(
                <Button
                  type="button"
                  variant="outline"
                  size="icon"
                  aria-label={`Quitar ${pkg.name} de favoritos`}
                  title="Quitar de favoritos"
                  disabled={pendingFavoriteIds.includes(pkg.id)}
                  aria-busy={pendingFavoriteIds.includes(pkg.id)}
                  onClick={() => onRemoveFavorite(pkg)}
                  className="rounded-full border-white/80 bg-white/95 text-primary shadow-xs hover:bg-white hover:text-primary/80 cursor-pointer"
                >
                  {pendingFavoriteIds.includes(pkg.id)
                    ? <Loader2 className="size-4 animate-spin" aria-hidden="true" />
                    : <Heart className="size-4 fill-current" aria-hidden="true" />}
                </Button>
              )}
            >
              <Button
                type="button"
                variant="outline"
                onClick={() => onViewDetails(pkg)}
                className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs px-3 py-1.5 h-auto cursor-pointer"
              >
                Ver detalle
                <ArrowRight className="size-3.5" aria-hidden="true" />
              </Button>
            </PackageSummaryCard>
          ))}
        </div>
      )}
    </main>
  )
}
