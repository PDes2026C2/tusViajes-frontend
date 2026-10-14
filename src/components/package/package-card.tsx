import { useState } from "react"
import {
  ArrowRight,
  Building2,
  Calendar,
  Heart,
  LoaderCircle,
  Moon,
  PlaneLanding,
  PlaneTakeoff,
} from "lucide-react"
import type { TravelPackage } from "../../models/package"
import { Button } from "../ui/button"

export interface TravelPackageCardProps {
  packageData: TravelPackage
  onViewDetails?: (pkg: TravelPackage) => void
  isFavorite?: boolean
  isUpdatingFavorite?: boolean
  canAddFavorite?: boolean
  onAddFavorite?: (pkg: TravelPackage) => void
  onRemoveFavorite?: (pkg: TravelPackage) => void
}

function formatDate(date: Date): string {
  return new Intl.DateTimeFormat("es-AR", {
    day: "numeric",
    month: "short",
    year: "numeric",
  }).format(date)
}

function formatPrice(price: number): string {
  return new Intl.NumberFormat("es-AR", {
    style: "currency",
    currency: "ARS",
    maximumFractionDigits: 0,
  }).format(price)
}

export function TravelPackageCard({
  packageData,
  onViewDetails,
  isFavorite = false,
  isUpdatingFavorite = false,
  canAddFavorite = false,
  onAddFavorite,
  onRemoveFavorite,
}: TravelPackageCardProps) {
  const [isFavoriteActionHovered, setIsFavoriteActionHovered] = useState(false)
  const [isFavoriteActionFocused, setIsFavoriteActionFocused] = useState(false)
  const showRemoveFavorite = isFavorite && (isFavoriteActionHovered || isFavoriteActionFocused)
  const favoriteLabel = isUpdatingFavorite
    ? "Cargando..."
    : isFavorite ? showRemoveFavorite ? "Quitar de favoritos" : "En favoritos" : "Agregar a favoritos"
  const {
    name,
    description,
    price,
    initialDate,
    finalDate,
    nights,
    hotel,
    departureFlight,
    arrivalFlight,
  } = packageData

  const departureOrigin = departureFlight.originCity.name
  const departureDest = departureFlight.destinationCity.name
  const arrivalOrigin = arrivalFlight.originCity.name
  const arrivalDest = arrivalFlight.destinationCity.name

  return (
    <article className="w-full bg-white border border-slate-200 rounded-2xl shadow-xs hover:shadow-md transition-shadow overflow-hidden flex flex-col md:flex-row">
      {/* Hotel Image / Thumbnail */}
      <div className="md:w-60 h-48 md:h-auto shrink-0 relative bg-slate-100 flex items-center justify-center overflow-hidden">
        <img
          src={hotel.photoUrl}
          alt={hotel.name}
          className="w-full h-full object-cover"
          loading="lazy"
        />
        <div className="absolute top-3 left-3 bg-white/95 backdrop-blur-xs px-2.5 py-1 rounded-full text-xs font-semibold text-primary shadow-xs flex items-center gap-1.5">
          <Moon className="w-3.5 h-3.5 text-primary" />
          <span>{nights} {nights === 1 ? "noche" : "noches"}</span>
        </div>
      </div>

      {/* Main Details (Flights + Hotel) */}
      <div className="flex-1 p-5 md:p-6 flex flex-col justify-between gap-4 text-left">
        {/* Title & Description */}
        <div>
          <h3 className="text-lg md:text-xl font-bold text-slate-900 leading-snug">
            {name}
          </h3>
          {description && (
            <p className="text-xs md:text-sm text-slate-500 mt-1 line-clamp-2">
              {description}
            </p>
          )}
        </div>

        {/* Itinerary Blocks */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 pt-1 border-t border-slate-100">
          {/* Vuelo de Ida */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-sky-100 text-sky-700 flex items-center justify-center shrink-0 mt-0.5">
              <PlaneTakeoff className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-sky-700">
                  Vuelo de Ida
                </span>
                <span className="text-[11px] text-slate-400">
                  ({departureFlight.flightNumber})
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-800 truncate">
                {departureOrigin} → {departureDest}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formatDate(initialDate)}
              </span>
            </div>
          </div>

          {/* Vuelo de Vuelta */}
          <div className="flex items-start gap-3 p-2.5 rounded-xl bg-slate-50/70 border border-slate-100">
            <div className="w-8 h-8 rounded-lg bg-emerald-100 text-emerald-700 flex items-center justify-center shrink-0 mt-0.5">
              <PlaneLanding className="w-4 h-4" />
            </div>
            <div className="flex flex-col min-w-0">
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                  Vuelo de Vuelta
                </span>
                <span className="text-[11px] text-slate-400">
                  ({arrivalFlight.flightNumber})
                </span>
              </div>
              <span className="text-sm font-semibold text-slate-800 truncate">
                {arrivalOrigin} → {arrivalDest}
              </span>
              <span className="text-xs text-slate-500 flex items-center gap-1 mt-0.5">
                <Calendar className="w-3 h-3 text-slate-400" />
                {formatDate(finalDate)}
              </span>
            </div>
          </div>
        </div>

        {/* Hotel info row */}
        <div className="flex items-center gap-2.5 text-xs text-slate-600 bg-slate-50/50 p-2 rounded-lg border border-slate-100/80">
          <Building2 className="w-4 h-4 text-primary shrink-0" />
          <span className="font-semibold text-slate-800">{hotel.name}</span>
          <span className="text-slate-500">en {hotel.city.name}</span>
          <span className="text-slate-300">•</span>
          <span className="font-medium text-slate-600">
            {nights} {nights === 1 ? "noche de estadía" : "noches de estadía"}
          </span>
        </div>
      </div>

      {/* Right Column: Pricing & Call to Actions */}
      <div className="md:w-64 border-t md:border-t-0 md:border-l border-slate-100 p-5 md:p-6 bg-slate-50/40 flex flex-col justify-between items-stretch md:items-end text-right gap-4">
        <div>
          <span className="text-xs font-medium text-slate-500 block">
            Precio final por persona
          </span>
          <div className="text-2xl sm:text-3xl font-extrabold text-primary tracking-tight mt-0.5">
            {formatPrice(price)}
          </div>
          <span className="text-[11px] text-slate-400 block mt-0.5">
            Impuestos y tasas incluidos
          </span>
        </div>

        <div className="flex flex-col gap-2 w-full">
          {canAddFavorite && (onAddFavorite || onRemoveFavorite) && (
            <Button
              type="button"
              variant="outline"
              aria-label={isFavorite ? `Quitar de favoritos: ${name}` : `Agregar a favoritos: ${name}`}
              aria-pressed={isFavorite}
              aria-busy={isUpdatingFavorite}
              disabled={isUpdatingFavorite || (isFavorite ? !onRemoveFavorite : !onAddFavorite)}
              onClick={() => isFavorite ? onRemoveFavorite?.(packageData) : onAddFavorite?.(packageData)}
              onMouseEnter={() => setIsFavoriteActionHovered(true)}
              onMouseLeave={() => setIsFavoriteActionHovered(false)}
              onFocus={() => setIsFavoriteActionFocused(true)}
              onBlur={() => setIsFavoriteActionFocused(false)}
              className="w-full rounded-xl border-primary/20 text-primary font-semibold py-2.5 h-auto cursor-pointer"
            >
              {isUpdatingFavorite ? (
                <LoaderCircle className="w-4 h-4 animate-spin" aria-hidden="true" />
              ) : (
                <Heart className={`w-4 h-4 ${isFavorite && !showRemoveFavorite ? "fill-current" : ""}`} aria-hidden="true" />
              )}
              <span>{favoriteLabel}</span>
            </Button>
          )}
          {/* Boton principal: Ver detalle */}
          <Button
            type="button"
            onClick={() => onViewDetails?.(packageData)}
            className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold py-2.5 h-auto shadow-xs flex items-center justify-center gap-2 cursor-pointer transition-all"
          >
            <span>Ver detalle</span>
            <ArrowRight className="w-4 h-4" />
          </Button>
        </div>
      </div>
    </article>
  )
}
