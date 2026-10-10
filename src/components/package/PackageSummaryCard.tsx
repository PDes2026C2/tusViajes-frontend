import type { ReactNode } from "react"
import { Calendar, Hotel as HotelIcon, Plane } from "lucide-react"
import type { AgencyPackageItem } from "../../models/agency"

export interface PackageSummaryCardProps {
  packageData: AgencyPackageItem
  imageAction?: ReactNode
  children?: ReactNode
}

export function PackageSummaryCard({ packageData: pkg, imageAction, children }: PackageSummaryCardProps) {
  return (
    <article className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {pkg.hotel.photoUrl ? (
          <img src={pkg.hotel.photoUrl} alt={pkg.hotel.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sky-50 text-sky-400">
            <HotelIcon className="w-10 h-10" aria-hidden="true" />
          </div>
        )}
        {imageAction && <div className="absolute top-3 left-3">{imageAction}</div>}
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-primary shadow-xs">
          USD ${pkg.price}
        </div>
        <div className="absolute bottom-3 left-3 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-lg text-xs font-medium flex items-center gap-1.5">
          <HotelIcon className="w-3.5 h-3.5" aria-hidden="true" />
          <span>{pkg.hotel.name}</span>
        </div>
      </div>

      <div className="p-5 flex-1 flex flex-col justify-between gap-4">
        <div>
          <h3 className="text-base font-bold text-slate-900 leading-snug line-clamp-1">{pkg.name}</h3>
          <p className="text-xs text-slate-500 mt-1 line-clamp-2">
            {pkg.description || "Sin descripción proporcionada."}
          </p>
        </div>

        <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 text-xs text-slate-600">
          <div className="flex items-center justify-between">
            <span className="text-slate-400">Destino:</span>
            <span className="font-semibold text-slate-800">{pkg.hotel.city.name}</span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Calendar className="w-3 h-3" aria-hidden="true" />
              Fechas:
            </span>
            <span className="font-medium text-slate-700 text-right">
              {pkg.startDate.toLocaleDateString("es-AR")} - {pkg.endDate.toLocaleDateString("es-AR")} ({pkg.nights}n)
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Plane className="w-3 h-3" aria-hidden="true" />
              Vuelos:
            </span>
            <span className="font-medium text-slate-700 text-right">
              {pkg.departureFlight.flightNumber} / {pkg.returnFlight.flightNumber}
            </span>
          </div>
        </div>

        {children && (
          <div className="flex items-center justify-end gap-2 pt-3 border-t border-slate-100">
            {children}
          </div>
        )}
      </div>
    </article>
  )
}
