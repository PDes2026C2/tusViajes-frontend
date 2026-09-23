import React, { useEffect, useState } from "react"
import { AlertCircle, Calendar, DollarSign, Loader2, Plane, X } from "lucide-react"
import type {
  AgencyFlight,
  AgencyPackageItem,
  PackageFormData,
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
      const today = new Date()
      const in7 = new Date(today.getTime() + 7 * 24 * 3600 * 1000)

      setName("")
      setDescription("")
      setPrice("")
      setStartDate(
        presetDepartureFlight
          ? presetDepartureFlight.departureDate.toISOString().slice(0, 10)
          : today.toISOString().slice(0, 10)
      )
      setEndDate(in7.toISOString().slice(0, 10))
      setHotelId(hotels[0]?.id || "")
      setDepartureFlightId(presetDepartureFlight?.id || flights[0]?.id || "")
      setReturnFlightId(flights[1]?.id || "")
      setClientError(null)
    }
  }, [editingPackage, presetDepartureFlight, hotels, flights, isOpen])

  if (!isOpen) return null

  const selectedHotel = hotels.find((h) => h.id === Number(hotelId))
  const selectedDepFlight = flights.find(
    (f) => f.id === Number(departureFlightId)
  )
  const selectedRetFlight = flights.find((f) => f.id === Number(returnFlightId))

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
      startDate,
      endDate,
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
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Nombre del paquete *
                </label>
                <input
                  type="text"
                  placeholder="Ej. Escapada a Bariloche Soñada"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all"
                />
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Precio (USD) *
                </label>
                <div className="relative flex items-center">
                  <DollarSign className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
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

            {/* Fechas */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Fecha de inicio *
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="date"
                    value={startDate}
                    onChange={(e) => setStartDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                  Fecha de fin *
                </label>
                <div className="relative flex items-center">
                  <Calendar className="w-4 h-4 text-slate-400 absolute left-3 pointer-events-none" />
                  <input
                    type="date"
                    value={endDate}
                    onChange={(e) => setEndDate(e.target.value)}
                    required
                    className="w-full rounded-xl border border-slate-200 bg-white pl-9 pr-3 py-2 text-sm text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                  />
                </div>
              </div>
            </div>

            {/* Hotel */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Hotel asignado *
              </label>
              <select
                value={hotelId}
                onChange={(e) => setHotelId(e.target.value)}
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
              {selectedHotel && (
                <span className="text-[11px] text-slate-500">
                  Ciudad destino requerida:{" "}
                  <strong className="text-primary font-semibold">
                    {selectedHotel.city.name}
                  </strong>
                </span>
              )}
            </div>

            {/* Vuelos de Ida y Vuelta */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-primary rotate-45" />
                  <span>Vuelo de Ida *</span>
                </label>
                <select
                  value={departureFlightId}
                  onChange={(e) => setDepartureFlightId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="" disabled>
                    -- Seleccionar Vuelo Ida --
                  </option>
                  {flights.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.flightNumber} ({f.originCity.name} ➔ {f.destinationCity.name}) - {f.airline}
                    </option>
                  ))}
                </select>
                {selectedDepFlight && (
                  <span className="text-[10px] text-slate-400">
                    Llega a: {selectedDepFlight.destinationCity.name} | Asientos: {selectedDepFlight.availableSeats}
                  </span>
                )}
              </div>

              <div className="flex flex-col gap-1">
                <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600 flex items-center gap-1.5">
                  <Plane className="w-3.5 h-3.5 text-slate-500 -rotate-135" />
                  <span>Vuelo de Vuelta *</span>
                </label>
                <select
                  value={returnFlightId}
                  onChange={(e) => setReturnFlightId(e.target.value)}
                  required
                  className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs text-slate-800 focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all cursor-pointer"
                >
                  <option value="" disabled>
                    -- Seleccionar Vuelo Vuelta --
                  </option>
                  {flights.map((f) => (
                    <option key={f.id} value={f.id}>
                      {f.flightNumber} ({f.originCity.name} ➔ {f.destinationCity.name}) - {f.airline}
                    </option>
                  ))}
                </select>
                {selectedRetFlight && (
                  <span className="text-[10px] text-slate-400">
                    Sale de: {selectedRetFlight.originCity.name} | Asientos: {selectedRetFlight.availableSeats}
                  </span>
                )}
              </div>
            </div>

            {/* Descripción */}
            <div className="flex flex-col gap-1">
              <label className="text-[11px] font-semibold uppercase tracking-wider text-slate-600">
                Descripción del viaje
              </label>
              <textarea
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
