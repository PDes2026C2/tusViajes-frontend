import {
  Calendar,
  Clock,
  Loader2,
  Plane,
  PlusCircle,
  RefreshCw,
  Users,
} from "lucide-react"
import type { AgencyFlight } from "../../models/agency"
import { Button } from "../ui/button"

export interface AgencyFlightsViewProps {
  flights: AgencyFlight[]
  isLoading: boolean
  destinationCityId?: number
  originCityId?: number
  onlyAvailable: boolean
  onDestinationChange: (cityId?: number) => void
  onOriginChange: (cityId?: number) => void
  onOnlyAvailableToggle: () => void
  onUseFlightInPackage: (flight: AgencyFlight) => void
  onRefresh: () => void
}

export function AgencyFlightsView({
  flights,
  isLoading,
  destinationCityId,
  originCityId,
  onDestinationChange,
  onOriginChange,
  onUseFlightInPackage,
  onRefresh,
}: AgencyFlightsViewProps) {
  // Extract unique origins and destinations from available flights
  const originCities = Array.from(
    new Map(flights.map((f) => [f.originCity.id, f.originCity])).values()
  )
  const destinationCities = Array.from(
    new Map(flights.map((f) => [f.destinationCity.id, f.destinationCity])).values()
  )

  return (
    <div className="flex flex-col gap-6">
      {/* Filters Bar */}
      <div className="flex flex-col lg:flex-row items-stretch lg:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 flex-1">
          {/* Origen */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Origen
            </label>
            <select
              value={originCityId || ""}
              onChange={(e) =>
                onOriginChange(e.target.value ? Number(e.target.value) : undefined)
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">Todos los orígenes</option>
              {originCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} ({city.country.name})
                </option>
              ))}
            </select>
          </div>

          {/* Destino */}
          <div className="flex flex-col gap-1">
            <label className="text-[11px] font-semibold text-slate-500 uppercase tracking-wider">
              Destino
            </label>
            <select
              value={destinationCityId || ""}
              onChange={(e) =>
                onDestinationChange(
                  e.target.value ? Number(e.target.value) : undefined
                )
              }
              className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
            >
              <option value="">Todos los destinos</option>
              {destinationCities.map((city) => (
                <option key={city.id} value={city.id}>
                  {city.name} ({city.country.name})
                </option>
              ))}
            </select>
          </div>

        </div>

        <div className="self-end lg:self-auto">
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
            <span>Actualizar Vuelos</span>
          </Button>
        </div>
      </div>

      {/* Loading state */}
      {isLoading && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-600">
            Consultando vuelos disponibles...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && flights.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Plane className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No se encontraron vuelos
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1">
            Intentá modificar los filtros de origen o destino para ver más resultados.
          </p>
        </div>
      )}

      {/* Flights List */}
      {!isLoading && flights.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          {flights.map((flight) => {
            const isFull = flight.availableSeats <= 0
            const isLowAvailability =
              flight.availableSeats > 0 && flight.availableSeats <= 10

            return (
              <div
                key={flight.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-2xs hover:shadow-md transition-all flex flex-col justify-between gap-4"
              >
                {/* Header */}
                <div className="flex items-center justify-between border-b border-slate-100 pb-3">
                  <div className="flex items-center gap-2.5">
                    <div className="w-9 h-9 rounded-xl bg-primary/10 text-primary flex items-center justify-center font-bold text-xs">
                      <Plane className="w-4 h-4 rotate-45" />
                    </div>
                    <div>
                      <h4 className="text-sm font-bold text-slate-900 leading-tight">
                        {flight.flightNumber}
                      </h4>
                      <span className="text-[11px] font-medium text-slate-500">
                        {flight.airline}
                      </span>
                    </div>
                  </div>

                  {/* Availability Pill */}
                  <div
                    className={`px-2.5 py-1 rounded-full text-xs font-semibold flex items-center gap-1.5 ${
                      isFull
                        ? "bg-error/10 text-error border border-error/20"
                        : isLowAvailability
                        ? "bg-amber-500/10 text-amber-600 border border-amber-500/20"
                        : "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                    }`}
                  >
                    <Users className="w-3 h-3" />
                    <span>
                      {isFull
                        ? "Completo"
                        : `${flight.availableSeats} disp. (${flight.capacity} tot.)`}
                    </span>
                  </div>
                </div>

                {/* Route & Times */}
                <div className="grid grid-cols-2 gap-3 text-xs bg-slate-50/70 p-3.5 rounded-xl border border-slate-100">
                  <div className="flex flex-col">
                    <span className="text-slate-400 font-medium">Origen:</span>
                    <strong className="text-slate-800 text-sm font-semibold">
                      {flight.originCity.name}
                    </strong>
                    <span className="text-slate-500 text-[11px] flex items-center gap-1 mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {flight.departureDate.toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1">
                      <Calendar className="w-2.5 h-2.5 text-slate-400" />
                      {flight.departureDate.toLocaleDateString("es-AR")}
                    </span>
                  </div>

                  <div className="flex flex-col text-right">
                    <span className="text-slate-400 font-medium">Destino:</span>
                    <strong className="text-slate-800 text-sm font-semibold">
                      {flight.destinationCity.name}
                    </strong>
                    <span className="text-slate-500 text-[11px] flex items-center gap-1 justify-end mt-1">
                      <Clock className="w-3 h-3 text-slate-400" />
                      {flight.arrivalDate.toLocaleTimeString("es-AR", {
                        hour: "2-digit",
                        minute: "2-digit",
                      })}
                    </span>
                    <span className="text-[10px] text-slate-400 flex items-center gap-1 justify-end">
                      <Calendar className="w-2.5 h-2.5 text-slate-400" />
                      {flight.arrivalDate.toLocaleDateString("es-AR")}
                    </span>
                  </div>
                </div>

                {/* Action button */}
                <div className="flex items-center justify-between pt-2">
                  <span className="text-xs font-semibold text-slate-900">
                    {flight.price ? `USD $${flight.price} / asiento` : "Tarifa estándar"}
                  </span>
                  <Button
                    type="button"
                    disabled={isFull}
                    onClick={() => onUseFlightInPackage(flight)}
                    className="rounded-xl bg-primary hover:bg-primary/90 text-white text-xs font-medium px-4 py-2 h-auto flex items-center gap-1.5 cursor-pointer shadow-2xs disabled:opacity-50"
                  >
                    <PlusCircle className="w-3.5 h-3.5" />
                    <span>Usar en nuevo paquete</span>
                  </Button>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
