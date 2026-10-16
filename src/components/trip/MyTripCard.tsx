import { ArrowRight, Calendar, CheckCircle2, Clock, Hotel as HotelIcon, Plane, ShoppingBag, Star } from "lucide-react"
import type { BuyerPurchase } from "../../models/purchase"
import type { TravelPackage } from "../../models/package"
import { Button } from "../ui/button"

export interface MyTripCardProps {
  trip: BuyerPurchase
  onViewDetails: (pkg: TravelPackage) => void
  onReviewClick: (trip: BuyerPurchase) => void
  isReviewed?: boolean
}

export function MyTripCard({
  trip,
  onViewDetails,
  onReviewClick,
  isReviewed = false,
}: MyTripCardProps) {
  const pkg = trip.travelPackage

  const renderStatusBadge = () => {
    switch (trip.status) {
      case "COMPLETED":
        return (
          <span className="inline-flex items-center gap-1 bg-slate-900/80 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs">
            <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" aria-hidden="true" />
            Finalizado
          </span>
        )
      case "IN_PROGRESS":
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-600/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs">
            <Clock className="w-3.5 h-3.5 animate-pulse" aria-hidden="true" />
            En curso
          </span>
        )
      case "UPCOMING":
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-primary/90 backdrop-blur-xs text-white px-2.5 py-1 rounded-full text-xs font-semibold shadow-xs">
            <Clock className="w-3.5 h-3.5" aria-hidden="true" />
            Próximo
          </span>
        )
    }
  }

  return (
    <article className="w-full bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs hover:shadow-md transition-shadow flex flex-col justify-between">
      <div className="relative h-44 bg-slate-100 overflow-hidden">
        {pkg.hotel.photoUrl ? (
          <img src={pkg.hotel.photoUrl} alt={pkg.hotel.name} className="w-full h-full object-cover" />
        ) : (
          <div className="w-full h-full flex items-center justify-center bg-sky-50 text-sky-400">
            <HotelIcon className="w-10 h-10" aria-hidden="true" />
          </div>
        )}
        <div className="absolute top-3 left-3">{renderStatusBadge()}</div>
        <div className="absolute top-3 right-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-bold text-primary shadow-xs">
          USD ${trip.price}
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
              {pkg.initialDate.toLocaleDateString("es-AR")} - {pkg.finalDate.toLocaleDateString("es-AR")} ({pkg.nights} {pkg.nights === 1 ? "noche" : "noches"})
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <Plane className="w-3 h-3" aria-hidden="true" />
              Vuelos:
            </span>
            <span className="font-medium text-slate-700 text-right">
              {pkg.departureFlight.flightNumber} / {pkg.arrivalFlight.flightNumber}
            </span>
          </div>
          <div className="flex items-center justify-between gap-2">
            <span className="text-slate-400 flex items-center gap-1">
              <ShoppingBag className="w-3 h-3" aria-hidden="true" />
              Comprado:
            </span>
            <span className="font-medium text-slate-500 text-right">
              {trip.purchasedAt.toLocaleDateString("es-AR")}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-between gap-2 pt-3 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            onClick={() => onViewDetails(pkg)}
            className="rounded-xl border-slate-200 text-slate-700 hover:bg-slate-50 text-xs px-3 py-1.5 h-auto cursor-pointer"
          >
            Ver detalle
            <ArrowRight className="size-3.5" aria-hidden="true" />
          </Button>

          {trip.isCompleted ? (
            isReviewed ? (
              <span className="rounded-xl bg-emerald-50 text-emerald-700 border border-emerald-200/60 text-xs px-3 py-1.5 h-auto flex items-center gap-1.5 font-medium shadow-2xs">
                <CheckCircle2 className="size-3.5 text-emerald-600" aria-hidden="true" />
                Reseña enviada
              </span>
            ) : (
              <Button
                type="button"
                onClick={() => onReviewClick(trip)}
                className="rounded-xl bg-amber-500 hover:bg-amber-600 text-white text-xs px-3 py-1.5 h-auto shadow-xs cursor-pointer flex items-center gap-1.5"
              >
                <Star className="size-3.5 fill-current" aria-hidden="true" />
                Dejar reseña
              </Button>
            )
          ) : (
            <div title="Disponible al finalizar el viaje">
              <Button
                type="button"
                variant="outline"
                disabled
                className="rounded-xl border-slate-200 text-slate-400 bg-slate-50 text-xs px-3 py-1.5 h-auto cursor-not-allowed opacity-60 flex items-center gap-1.5"
              >
                <Star className="size-3.5" aria-hidden="true" />
                Dejar reseña
              </Button>
            </div>
          )}
        </div>
      </div>
    </article>
  )
}
