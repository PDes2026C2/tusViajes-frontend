import { Compass } from "lucide-react"
import type { TravelPackage } from "../../models/package"
import { TravelPackageCard } from "./package-card"
import { PackagePagination } from "./package-pagination"

export interface PackageListProps {
  packages: TravelPackage[]
  isLoading?: boolean
  currentPage?: number
  totalPages?: number
  totalElements?: number
  onAddToCart?: (pkg: TravelPackage) => void
  onViewDetails?: (pkg: TravelPackage) => void
  onPageChange?: (page: number) => void
}

function PackageListSkeleton() {
  return (
    <div className="flex flex-col gap-4">
      {Array.from({ length: 3 }).map((_, index) => (
        <div
          key={index}
          className="w-full bg-white border border-slate-200 rounded-2xl p-6 shadow-xs animate-pulse flex flex-col md:flex-row gap-6"
        >
          <div className="md:w-60 h-44 bg-slate-200 rounded-xl shrink-0" />
          <div className="flex-1 flex flex-col justify-between gap-4">
            <div className="space-y-2">
              <div className="h-6 bg-slate-200 rounded-md w-3/4" />
              <div className="h-4 bg-slate-100 rounded-md w-1/2" />
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="h-16 bg-slate-100 rounded-xl" />
              <div className="h-16 bg-slate-100 rounded-xl" />
            </div>
            <div className="h-8 bg-slate-100 rounded-lg w-2/3" />
          </div>
          <div className="md:w-64 flex flex-col justify-between items-end gap-4 border-t md:border-t-0 md:border-l border-slate-100 pt-4 md:pt-0 md:pl-6">
            <div className="space-y-2 w-full flex flex-col items-end">
              <div className="h-4 bg-slate-100 rounded-md w-28" />
              <div className="h-8 bg-slate-200 rounded-md w-36" />
            </div>
            <div className="w-full space-y-2">
              <div className="h-10 bg-slate-200 rounded-xl w-full" />
              <div className="h-9 bg-slate-100 rounded-xl w-full" />
            </div>
          </div>
        </div>
      ))}
    </div>
  )
}

export function PackageList({
  packages,
  isLoading = false,
  currentPage = 0,
  totalPages = 0,
  totalElements = 0,
  onAddToCart,
  onViewDetails,
  onPageChange,
}: PackageListProps) {
  return (
    <section className="w-full mt-8 text-left" aria-label="Listado de paquetes">
      {/* Header section */}
      <div className="flex justify-between items-center mb-4 px-1">
        <div className="flex items-center gap-2.5">
          <h2 className="text-xl md:text-2xl font-bold text-slate-800 tracking-tight">
            Paquetes disponibles
          </h2>
          {totalElements > 0 && (
            <span className="bg-sky-50 border border-sky-200/60 text-sky-800 text-xs font-semibold px-2.5 py-0.5 rounded-full">
              {totalElements} {totalElements === 1 ? "opción" : "opciones"}
            </span>
          )}
        </div>
      </div>

      {/* Loading state */}
      {isLoading && <PackageListSkeleton />}

      {/* Empty state */}
      {!isLoading && packages.length === 0 && (
        <div className="bg-white border border-slate-200 rounded-3xl p-10 md:p-14 text-center shadow-xs flex flex-col items-center justify-center">
          <div className="w-14 h-14 rounded-2xl bg-sky-50 text-primary flex items-center justify-center mb-4">
            <Compass className="w-7 h-7" />
          </div>
          <h3 className="text-lg font-bold text-slate-800">
            No encontramos paquetes para tu búsqueda
          </h3>
          <p className="text-sm text-slate-500 max-w-md mt-1.5 leading-relaxed">
            Probá cambiando los destinos o seleccionando un rango de fechas más amplio para encontrar tu viaje ideal.
          </p>
        </div>
      )}

      {/* Success / Packages List */}
      {!isLoading && packages.length > 0 && (
        <div className="flex flex-col gap-4">
          {packages.map((pkg) => (
            <TravelPackageCard
              key={pkg.id}
              packageData={pkg}
              onAddToCart={onAddToCart}
              onViewDetails={onViewDetails}
            />
          ))}

          {/* Centered Pagination */}
          {totalPages > 1 && onPageChange && (
            <PackagePagination
              currentPage={currentPage}
              totalPages={totalPages}
              onPageChange={onPageChange}
            />
          )}
        </div>
      )}
    </section>
  )
}
