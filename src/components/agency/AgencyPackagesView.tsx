import {
  Calendar,
  Edit2,
  Hotel as HotelIcon,
  Loader2,
  PackageOpen,
  Plane,
  Plus,
  RefreshCw,
  Search,
  Trash2,
} from "lucide-react"
import type { AgencyPackageItem } from "../../models/agency"
import { Button } from "../ui/button"

export interface AgencyPackagesViewProps {
  packages: AgencyPackageItem[]
  isLoading: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  onOpenCreate: () => void
  onOpenEdit: (pkg: AgencyPackageItem) => void
  onOpenDelete: (pkg: AgencyPackageItem) => void
  onRefresh: () => void
}

export function AgencyPackagesView({
  packages,
  isLoading,
  searchQuery,
  onSearchChange,
  onOpenCreate,
  onOpenEdit,
  onOpenDelete,
  onRefresh,
}: AgencyPackagesViewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Action Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por nombre, hotel o ciudad destino..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <div className="flex items-center gap-3 self-end sm:self-auto">
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-xs px-3.5 py-2.5 h-auto flex items-center gap-1.5 cursor-pointer"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
            />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>

          <Button
            type="button"
            onClick={onOpenCreate}
            className="rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-4 py-2.5 h-auto flex items-center gap-2 cursor-pointer shadow-sm"
          >
            <Plus className="w-4 h-4" />
            <span>Crear Paquete</span>
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && packages.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-600">
            Cargando tus paquetes...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && packages.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <PackageOpen className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No se encontraron paquetes
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1 mb-5">
            {searchQuery
              ? `No hay paquetes que coincidan con "${searchQuery}".`
              : "Todavía no creaste ningún paquete para tu agencia. ¡Comenzá a armar tu primera oferta!"}
          </p>
          <Button
            type="button"
            onClick={onOpenCreate}
            className="rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-semibold px-5 py-2.5 h-auto cursor-pointer"
          >
            Crear mi primer paquete
          </Button>
        </div>
      )}

      {/* Packages Grid */}
      {packages.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {packages.map((pkg) => (
            <div
              key={pkg.id}
              className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between"
            >
              {/* Hotel / Image banner */}
              <div className="relative h-44 bg-slate-100 overflow-hidden">
                {pkg.hotel.photoUrl ? (
                  <img
                    src={pkg.hotel.photoUrl}
                    alt={pkg.hotel.name}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <div className="w-full h-full flex items-center justify-center bg-sky-50 text-sky-400">
                    <HotelIcon className="w-10 h-10" />
                  </div>
                )}
                <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-primary shadow-xs">
                  USD ${pkg.price}
                </div>
                <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
                  <HotelIcon className="w-3.5 h-3.5" />
                  <span>{pkg.hotel.name}</span>
                </div>
              </div>

              {/* Package Details */}
              <div className="p-5 flex-1 flex flex-col justify-between gap-4">
                <div>
                  <h4 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">
                    {pkg.name}
                  </h4>
                  <p className="text-xs text-slate-500 mt-1 line-clamp-2">
                    {pkg.description || "Sin descripción proporcionada."}
                  </p>
                </div>

                <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
                  {/* Destination & Nights */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400">Destino:</span>
                    <span className="font-semibold text-slate-800">
                      {pkg.hotel.city.name}
                    </span>
                  </div>

                  {/* Dates */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Calendar className="w-3 h-3 text-slate-400" />
                      Fechas:
                    </span>
                    <span className="font-medium text-slate-700">
                      {pkg.startDate.toLocaleDateString("es-AR")} -{" "}
                      {pkg.endDate.toLocaleDateString("es-AR")} ({pkg.nights}n)
                    </span>
                  </div>

                  {/* Flights summary */}
                  <div className="flex items-center justify-between">
                    <span className="text-slate-400 flex items-center gap-1">
                      <Plane className="w-3 h-3 text-slate-400" />
                      Vuelos:
                    </span>
                    <span className="font-medium text-slate-700">
                      {pkg.departureFlight.flightNumber} /{" "}
                      {pkg.returnFlight.flightNumber}
                    </span>
                  </div>
                </div>

                {/* Actions */}
                <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenEdit(pkg)}
                    className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs px-3 py-1.5 h-auto flex items-center gap-1.5 cursor-pointer"
                  >
                    <Edit2 className="w-3.5 h-3.5" />
                    <span>Editar</span>
                  </Button>
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => onOpenDelete(pkg)}
                    className="rounded-xl border-error/20 text-error hover:bg-error/5 text-xs px-3 py-1.5 h-auto flex items-center gap-1.5 cursor-pointer"
                  >
                    <Trash2 className="w-3.5 h-3.5" />
                    <span>Eliminar</span>
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
