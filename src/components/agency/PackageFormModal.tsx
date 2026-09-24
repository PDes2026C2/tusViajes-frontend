import React, { useEffect, useMemo, useState } from "react"
import { AlertCircle, Calendar, DollarSign, Loader2, Plane, X } from "lucide-react"
import {
  type AgencyFlight,
  type AgencyPackageItem,
  type PackageFormData,
} from "../../models/agency"
import type { Hotel } from "../../models/package"
import { Button } from "../ui/button"

export interface PackageFormModalProps {
  isOpen: boolean
  editingPackage: AgencyPackageItem | null
  presetDepartureFlight: AgencyFlight | null
  hotels: Hotel[]
  flights: AgencyFlight[]
  isSubmitting: boolean
  onClose: () => void
  onSubmit: (data: PackageFormData) => Promise<void>
}

export function PackageFormModal({
  isOpen,
  editingPackage,
  presetDepartureFlight,
  hotels,
  flights,
  isSubmitting,
  onClose,
  onSubmit,
}: PackageFormModalProps) {
  const [name, setName] = useState("")
  const [description, setDescription] = useState("")
  const [price, setPrice] = useState<number | string>("")
  const [startDate, setStartDate] = useState("")
  const [endDate, setEndDate] = useState("")
  const [hotelId, setHotelId] = useState<number | string>("")
  const [departureFlightId, setDepartureFlightId] = useState<number | string>("")
  const [returnFlightId, setReturnFlightId] = useState<number | string>("")
  const [clientError, setClientError] = useState<string | null>(null)

  useEffect(() => {
    if (editingPackage) {
      setName(editingPackage.name)
      setDescription(editingPackage.description || "")
      setPrice(editingPackage.price)
      setStartDate(editingPackage.startDate.toISOString().slice(0, 10))
      setEndDate(editingPackage.endDate.toISOString().slice(0, 10))
      setHotelId(editingPackage.hotel.id)
      setDepartureFlightId(editingPackage.departureFlight.id)
      setReturnFlightId(editingPackage.returnFlight.id)
      setClientError(null)
    } else {
      setName("")
      setDescription("")
      setPrice("")
      setStartDate(
        presetDepartureFlight
          ? presetDepartureFlight.arrivalDate.toISOString().slice(0, 10)
          : ""
      )
      setEndDate("")
      const matchingHotel = presetDepartureFlight
        ? hotels.find((h) => h.city.id === presetDepartureFlight.destinationCity.id)
        : null
      setHotelId(matchingHotel?.id || "")
      setDepartureFlightId(presetDepartureFlight?.id || "")
      setReturnFlightId("")
      setClientError(null)
    }
  }, [editingPackage, presetDepartureFlight, hotels, flights, isOpen])

  const selectedHotel = useMemo(
    () => hotels.find((h) => h.id === Number(hotelId)),
    [hotels, hotelId]
  )
  const selectedDepFlight = useMemo(
    () => flights.find((f) => f.id === Number(departureFlightId)),
    [flights, departureFlightId]
  )
  const selectedRetFlight = useMemo(
    () => flights.find((f) => f.id === Number(returnFlightId)),
    [flights, returnFlightId]
  )

  // Desbloqueo y filtrado del vuelo de ida: requiere hotel seleccionado
  const canSelectDeparture = Boolean(hotelId && selectedHotel)

  const availableDepartureFlights = useMemo(() => {
    if (!canSelectDeparture || !selectedHotel) return []
    return flights
      .filter((f) => {
        const cityMatches = f.destinationCity.id === selectedHotel.city.id
        const hasSeats = f.availableSeats > 0
        return cityMatches && hasSeats
      })
      .sort((a, b) => new Date(a.arrivalDate).getTime() - new Date(b.arrivalDate).getTime())
  }, [flights, canSelectDeparture, selectedHotel])

  // Desbloqueo y filtrado del vuelo de vuelta: requiere hotel y vuelo de ida elegido
  const canSelectReturn = Boolean(
    hotelId && selectedHotel && departureFlightId && selectedDepFlight
  )

  const availableReturnFlights = useMemo(() => {
    if (!canSelectReturn || !selectedHotel || !selectedDepFlight) return []
    const arrivalTime = new Date(selectedDepFlight.arrivalDate).getTime()
    return flights
      .filter((f) => {
        const originMatches = f.originCity.id === selectedHotel.city.id
        const destMatches = f.destinationCity.id === selectedDepFlight.originCity.id
        const isAfter = new Date(f.departureDate).getTime() >= arrivalTime
        const notSameFlight = f.id !== selectedDepFlight.id
        const hasSeats = f.availableSeats > 0
        return originMatches && destMatches && isAfter && notSameFlight && hasSeats
      })
      .sort((a, b) => new Date(a.departureDate).getTime() - new Date(b.departureDate).getTime())
  }, [flights, canSelectReturn, selectedHotel, selectedDepFlight])

  // Cálculo de noches de estadía entre llegada de ida y salida de regreso
  const nights = useMemo(() => {
    if (!selectedDepFlight || !selectedRetFlight) return null
    const arrival = new Date(selectedDepFlight.arrivalDate)
    const departure = new Date(selectedRetFlight.departureDate)
    const diffDays = Math.round(
      (departure.getTime() - arrival.getTime()) / (1000 * 60 * 60 * 24)
    )
    return diffDays >= 0 ? diffDays : 0
  }, [selectedDepFlight, selectedRetFlight])

  // Manejadores con reseteo inteligente y auto-llenado de fechas
  const handleHotelChange = (newHotelId: string) => {
    setHotelId(newHotelId)
    setDepartureFlightId("")
    setReturnFlightId("")
    setStartDate("")
    setEndDate("")
  }

  const handleDepartureFlightChange = (newDepFlightId: string) => {
    setDepartureFlightId(newDepFlightId)
    const dep = flights.find((f) => f.id === Number(newDepFlightId))
    if (dep) {
      setStartDate(dep.arrivalDate.toISOString().slice(0, 10))
    } else {
      setStartDate("")
    }
    setReturnFlightId("")
    setEndDate("")
  }

  const handleReturnFlightChange = (newRetFlightId: string) => {
    setReturnFlightId(newRetFlightId)
    const ret = flights.find((f) => f.id === Number(newRetFlightId))
    if (ret) {
      setEndDate(ret.departureDate.toISOString().slice(0, 10))
    } else {
      setEndDate("")
    }
  }

  if (!isOpen) return null

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setClientError(null)

    if (!name.trim()) {
      setClientError("El nombre del paquete es obligatorio.")
      return
    }
    if (!price || Number(price) <= 0) {
      setClientError("El precio debe ser un número mayor a 0.")
      return
    }
    if (!startDate || !endDate) {
      setClientError("Las fechas de inicio y fin son obligatorias.")
      return
    }

    const start = new Date(`${startDate}T00:00:00`)
    const end = new Date(`${endDate}T23:59:59`)

    if (end <= start) {
      setClientError("La fecha de fin debe ser posterior a la fecha de inicio.")
      return
    }
    if (!hotelId) {
      setClientError("Debes seleccionar un hotel.")
      return
    }
    if (!departureFlightId) {
      setClientError("Debes seleccionar un vuelo de ida.")
      return
    }
    if (!returnFlightId) {
      setClientError("Debes seleccionar un vuelo de vuelta.")
      return
    }
    if (departureFlightId === returnFlightId) {
      setClientError("El vuelo de ida y de vuelta no pueden ser el mismo.")
      return
    }

    // Business rule validation: hotel city must match flights
    if (
      selectedHotel &&
      selectedDepFlight &&
      selectedHotel.city.id !== selectedDepFlight.destinationCity.id
    ) {
      setClientError(
        `La ciudad del hotel (${selectedHotel.city.name}) debe coincidir con el destino del vuelo de ida (${selectedDepFlight.destinationCity.name}).`
      )
      return
    }

    if (
      selectedHotel &&
      selectedRetFlight &&
      selectedHotel.city.id !== selectedRetFlight.originCity.id
    ) {
      setClientError(
        `La ciudad del hotel (${selectedHotel.city.name}) debe coincidir con el origen del vuelo de vuelta (${selectedRetFlight.originCity.name}).`
      )
      return
    }

    const formData: PackageFormData = {
      name: name.trim(),
      description: description.trim(),
      price: Number(price),
      startDate: selectedDepFlight ? selectedDepFlight.arrivalDate : startDate,
      endDate: selectedRetFlight ? selectedRetFlight.departureDate : endDate,
      hotelId: Number(hotelId),
      departureFlightId: Number(departureFlightId),
      returnFlightId: Number(returnFlightId),
    }

    await onSubmit(formData)
  }

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="package-form-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-3 sm:p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-2xl sm:rounded-3xl max-w-2xl w-full max-h-[88vh] shadow-2xl border border-slate-100 flex flex-col overflow-hidden">
        {/* Header (Fijo) */}
        <div className="flex items-center justify-between border-b border-slate-100 px-5 sm:px-6 py-3.5 sm:py-4 shrink-0 bg-white">
          <div>
            <h2
              id="package-form-title"
              className="text-lg sm:text-xl font-bold text-slate-900"
            >
              {editingPackage ? "Editar Paquete de Viaje" : "Crear Nuevo Paquete"}
            </h2>
            <p className="text-xs text-slate-500 mt-0.5">
              Definí el hotel y los vuelos de ida y vuelta para ofrecer a los viajeros.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="p-1.5 sm:p-2 rounded-xl text-slate-400 hover:text-slate-600 hover:bg-slate-100 transition-colors cursor-pointer"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Formulario con cuerpo scrolleable y footer fijo */}
        <form onSubmit={handleSubmit} className="flex flex-col flex-1 overflow-hidden min-h-0 text-left">
          {/* Cuerpo Scrolleable */}
          <div className="flex-1 overflow-y-auto px-5 sm:px-6 py-4 flex flex-col gap-3.5">
            {clientError && (
              <div className="p-2.5 sm:p-3 bg-error/10 border border-error/20 rounded-xl flex items-center gap-2.5 text-error text-xs font-medium shrink-0">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{clientError}</span>
              </div>
            )}

            {/* Nombre y Precio */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
              <div className="sm:col-span-2 flex flex-col gap-1">
                <label
                  htmlFor="package-name"
                  className="text-[11px] font-semibold uppercase tracking-wider text-slate-600"
                >
                  Nombre del paquete *
                </label>
                <input
                  id="package-name"
                  type="text"
                  placeholder="Ej. Escapada a Bariloche Soñada"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="package-price"
                  className="text-[11px] font-semibold uppercase tracking-wider text-slate-600"
                >
                  Precio (USD) *
                </label>
                <div className="relative flex items-center">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    id="package-price"
                    type="number"
                    placeholder="950"
                    min="1"
                    step="0.01"
                    value={price}
                    onChange={(e) => setPrice(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                  />
                </div>
              </div>
            </div>

            {/* Hotel Asignado (determina destino de los vuelos) */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="package-hotel"
                className="text-[11px] font-semibold uppercase tracking-wider text-slate-600"
              >
                Hotel asignado *
              </label>
              <select
                id="package-hotel"
                value={hotelId}
                onChange={(e) => handleHotelChange(e.target.value)}
                required
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
              >
                <option value="" disabled>
                  -- Seleccionar Hotel --
                </option>
                {hotels.map((hotel) => (
                  <option key={hotel.id} value={hotel.id}>
                    {hotel.name} ({hotel.city.name}, {hotel.city.country.name})
                  </option>
                ))}
              </select>
              {selectedHotel ? (
                <span className="text-[11px] text-slate-500">
                  Ciudad destino requerida:{" "}
                  <strong className="text-primary font-semibold">
                    {selectedHotel.city.name}
                  </strong>
                </span>
              ) : (
                <span className="text-[10px] text-slate-400">
                  Selecciona un hotel para ver los vuelos que llegan a esa ciudad.
                </span>
              )}
            </div>

            {/* Vuelos de Ida y Vuelta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {/* Vuelo de Ida */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="package-departure-flight"
                  className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-primary rotate-45" />
                    <span>Vuelo de Ida *</span>
                  </span>
                  {!canSelectDeparture && (
                    <span className="text-[10px] text-amber-600 font-normal lowercase">
                      (bloqueado)
                    </span>
                  )}
                </label>
                <select
                  id="package-departure-flight"
                  value={departureFlightId}
                  onChange={(e) => handleDepartureFlightChange(e.target.value)}
                  disabled={!canSelectDeparture || availableDepartureFlights.length === 0}
                  required
                  className={`w-full rounded-xl border px-3 py-2 text-xs transition-all ${
                    !canSelectDeparture || availableDepartureFlights.length === 0
                      ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                  }`}
                >
                  {!canSelectDeparture ? (
                    <option value="" disabled>
                      -- Primero selecciona un hotel --
                    </option>
                  ) : availableDepartureFlights.length === 0 ? (
                    <option value="" disabled>
                      -- No hay vuelos que lleguen a {selectedHotel?.city.name} --
                    </option>
                  ) : (
                    <>
                      <option value="" disabled>
                        -- Seleccionar Vuelo Ida ({availableDepartureFlights.length} disp.) --
                      </option>
                      {availableDepartureFlights.map((f) => {
                        const arrivalDateStr = f.arrivalDate.toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                        const arrivalTimeStr = f.arrivalDate.toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        return (
                          <option key={f.id} value={f.id}>
                            {f.flightNumber} ({f.originCity.name} ➔ {f.destinationCity.name}) | Llega: {arrivalDateStr} {arrivalTimeStr} ({f.availableSeats} disp.)
                          </option>
                        )
                      })}
                    </>
                  )}
                </select>
                {selectedDepFlight ? (
                  <span className="text-[10px] text-slate-500">
                    Llega a {selectedDepFlight.destinationCity.name} el {selectedDepFlight.arrivalDate.toLocaleDateString()} a las {selectedDepFlight.arrivalDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Asientos: {selectedDepFlight.availableSeats}
                  </span>
                ) : !canSelectDeparture ? (
                  <span className="text-[10px] text-slate-400">
                    Elige un hotel para ver vuelos con llegada a esa ciudad.
                  </span>
                ) : availableDepartureFlights.length === 0 ? (
                  <span className="text-[10px] text-rose-500 font-medium">
                    No hay vuelos con llegada a {selectedHotel?.city.name}.
                  </span>
                ) : null}
              </div>

              {/* Vuelo de Vuelta */}
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="package-return-flight"
                  className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center justify-between"
                >
                  <span className="flex items-center gap-1.5">
                    <Plane className="w-3.5 h-3.5 text-slate-500 -rotate-135" />
                    <span>Vuelo de Vuelta *</span>
                  </span>
                  {!canSelectReturn && (
                    <span className="text-[10px] text-amber-600 font-normal lowercase">
                      (bloqueado)
                    </span>
                  )}
                </label>
                <select
                  id="package-return-flight"
                  value={returnFlightId}
                  onChange={(e) => handleReturnFlightChange(e.target.value)}
                  disabled={!canSelectReturn || availableReturnFlights.length === 0}
                  required
                  className={`w-full rounded-xl border px-3 py-2 text-xs transition-all ${
                    !canSelectReturn || availableReturnFlights.length === 0
                      ? "border-slate-200 bg-slate-100 text-slate-400 cursor-not-allowed"
                      : "border-slate-200 bg-white text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary cursor-pointer"
                  }`}
                >
                  {!canSelectDeparture ? (
                    <option value="" disabled>
                      -- Requiere hotel y vuelo de ida --
                    </option>
                  ) : !departureFlightId ? (
                    <option value="" disabled>
                      -- Primero selecciona el vuelo de ida --
                    </option>
                  ) : availableReturnFlights.length === 0 ? (
                    <option value="" disabled>
                      -- No hay vuelos de regreso a {selectedDepFlight?.originCity.name} posteriores a la ida --
                    </option>
                  ) : (
                    <>
                      <option value="" disabled>
                        -- Seleccionar Vuelo Vuelta ({availableReturnFlights.length} disp.) --
                      </option>
                      {availableReturnFlights.map((f) => {
                        const departureDateStr = f.departureDate.toLocaleDateString("es-AR", {
                          day: "2-digit",
                          month: "2-digit",
                          year: "numeric",
                        })
                        const departureTimeStr = f.departureDate.toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })
                        const stayNights = selectedDepFlight
                          ? Math.max(
                              0,
                              Math.round(
                                (new Date(f.departureDate).getTime() -
                                  new Date(selectedDepFlight.arrivalDate).getTime()) /
                                  (1000 * 60 * 60 * 24)
                              )
                            )
                          : 0
                        return (
                          <option key={f.id} value={f.id}>
                            {f.flightNumber} ({f.originCity.name} ➔ {f.destinationCity.name}) | Sale: {departureDateStr} {departureTimeStr} ({stayNights} noches)
                          </option>
                        )
                      })}
                    </>
                  )}
                </select>
                {selectedRetFlight ? (
                  <span className="text-[10px] text-slate-500">
                    Sale de {selectedRetFlight.originCity.name} el {selectedRetFlight.departureDate.toLocaleDateString()} a las {selectedRetFlight.departureDate.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })} | Asientos: {selectedRetFlight.availableSeats}
                  </span>
                ) : !departureFlightId ? (
                  <span className="text-[10px] text-slate-400">
                    Requiere haber elegido el vuelo de ida.
                  </span>
                ) : availableReturnFlights.length === 0 ? (
                  <span className="text-[10px] text-rose-500 font-medium">
                    No hay vuelos de regreso disponibles a {selectedDepFlight?.originCity.name}.
                  </span>
                ) : null}
              </div>
            </div>

            {/* Fechas de Viaje (Autocompletadas con los vuelos seleccionados) */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label
                  htmlFor="package-start-date"
                  className="text-[11px] font-semibold uppercase tracking-wider text-slate-600"
                >
                  Fecha de inicio (Llegada) *
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    id="package-start-date"
                    type="date"
                    value={startDate}
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-700 cursor-not-allowed font-medium select-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400">
                  {selectedDepFlight
                    ? `Llegada de ${selectedDepFlight.flightNumber}: ${selectedDepFlight.arrivalDate.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} hs`
                    : "Se autocompleta con el vuelo de ida"}
                </span>
              </div>

              <div className="flex flex-col gap-1">
                <label
                  htmlFor="package-end-date"
                  className="text-[11px] font-semibold uppercase tracking-wider text-slate-600"
                >
                  Fecha de fin (Regreso) *
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    id="package-end-date"
                    type="date"
                    value={endDate}
                    readOnly
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 pl-9 pr-3 py-2 text-sm text-slate-700 cursor-not-allowed font-medium select-none"
                  />
                </div>
                <span className="text-[10px] text-slate-400">
                  {selectedRetFlight
                    ? `Salida de ${selectedRetFlight.flightNumber}: ${selectedRetFlight.departureDate.toLocaleTimeString("es-AR", { hour: "2-digit", minute: "2-digit" })} hs`
                    : "Se autocompleta con el vuelo de vuelta"}
                </span>
              </div>
            </div>

            {/* Badge de resumen de estadía */}
            {selectedDepFlight && selectedRetFlight && nights !== null && (
              <div className="flex items-center justify-between p-3 rounded-xl bg-primary/5 border border-primary/20 text-xs">
                <div className="flex items-center gap-2 text-primary font-semibold">
                  <Calendar className="w-4 h-4" />
                  <span>Duración calculada del paquete:</span>
                </div>
                <span className="bg-primary text-white font-bold px-2.5 py-0.5 rounded-full text-xs">
                  {nights} {nights === 1 ? "noche" : "noches"} de estadía
                </span>
              </div>
            )}

            {/* Descripción */}
            <div className="flex flex-col gap-1">
              <label
                htmlFor="package-description"
                className="text-[11px] font-semibold uppercase tracking-wider text-slate-600"
              >
                Descripción del viaje
              </label>
              <textarea
                id="package-description"
                rows={2}
                placeholder="Detalle de actividades, comidas incluidas o características del paquete..."
                value={description}
                onChange={(e) => setDescription(e.target.value)}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all resize-none"
              />
            </div>
          </div>

          {/* Footer / Acciones (Fijo) */}
          <div className="flex items-center justify-end gap-2.5 px-5 sm:px-6 py-3 border-t border-slate-100 bg-slate-50/70 shrink-0">
            <Button
              type="button"
              variant="outline"
              disabled={isSubmitting}
              onClick={onClose}
              className="rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer"
            >
              Cancelar
            </Button>
            <Button
              type="submit"
              disabled={isSubmitting}
              className="rounded-xl px-5 py-2 text-sm bg-primary hover:bg-primary/90 text-white font-semibold flex items-center gap-2 cursor-pointer shadow-xs"
            >
              {isSubmitting && <Loader2 className="w-4 h-4 animate-spin" />}
              <span>
                {isSubmitting
                  ? "Guardando..."
                  : editingPackage
                  ? "Guardar Cambios"
                  : "Crear Paquete"}
              </span>
            </Button>
          </div>
        </form>
      </div>
    </div>
  )
}
