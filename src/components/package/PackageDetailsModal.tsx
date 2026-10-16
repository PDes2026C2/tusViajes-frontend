import { Hotel as HotelIcon, Plane, X } from "lucide-react"
import { useState } from "react"
import type { Flight, TravelPackage } from "../../models/package"
import { Dialog, DialogContent, DialogDescription, DialogTitle } from "../ui/dialog"

interface PackageDetailsModalProps {
  packageData: TravelPackage | null
  onClose: () => void
}

const dateFormatter = new Intl.DateTimeFormat("es-AR", { dateStyle: "long" })
const flightDateFormatter = new Intl.DateTimeFormat("es-AR", {
  dateStyle: "medium",
  timeStyle: "short",
})
const priceFormatter = new Intl.NumberFormat("es-AR", {
  style: "currency",
  currency: "USD",
  currencyDisplay: "code",
})

function HotelPhoto({ name, photoUrl }: { name: string; photoUrl: string }) {
  const [failed, setFailed] = useState(false)

  return (
    <div className="flex min-h-32 items-center justify-center bg-slate-50">
      {photoUrl && !failed ? (
        <img
          src={photoUrl}
          alt={name}
          onError={() => setFailed(true)}
          className="max-h-72 w-auto max-w-full object-contain"
        />
      ) : (
        <div className="flex flex-col items-center gap-2 py-6 text-slate-500">
          <HotelIcon className="size-8" aria-hidden="true" />
          <p className="text-xs">Foto no disponible</p>
        </div>
      )}
    </div>
  )
}

function FlightDetails({ title, flight }: { title: string; flight: Flight }) {
  return (
    <section className="rounded-2xl border border-slate-200 bg-slate-50 p-4">
      <h3 className="flex items-center gap-2 font-semibold text-slate-900">
        <Plane className="size-4 text-primary" aria-hidden="true" />
        {title}
      </h3>
      <p className="mt-1 text-xs text-slate-500">Vuelo {flight.flightNumber}</p>
      <dl className="mt-3 grid gap-3 text-sm">
        <div>
          <dt className="text-xs text-slate-500">Salida</dt>
          <dd className="font-medium text-slate-800">
            {flight.originCity.name}, {flight.originCity.country.name}
            <time className="block text-xs font-normal text-slate-600" dateTime={flight.departureTime.toISOString()}>
              {flightDateFormatter.format(flight.departureTime)}
            </time>
          </dd>
        </div>
        <div>
          <dt className="text-xs text-slate-500">Llegada</dt>
          <dd className="font-medium text-slate-800">
            {flight.destinationCity.name}, {flight.destinationCity.country.name}
            <time className="block text-xs font-normal text-slate-600" dateTime={flight.arrivalTime.toISOString()}>
              {flightDateFormatter.format(flight.arrivalTime)}
            </time>
          </dd>
        </div>
      </dl>
    </section>
  )
}

export function PackageDetailsModal({ packageData, onClose }: PackageDetailsModalProps) {
  if (!packageData) return null

  const pkg = packageData

  return (
    <Dialog open onOpenChange={(open) => { if (!open) onClose() }}>
      <DialogContent aria-modal="true" className="max-w-2xl gap-6">
        <button
          type="button"
          onClick={onClose}
          aria-label="Cerrar detalle"
          className="absolute right-4 top-4 rounded-full p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-800 cursor-pointer"
        >
          <X className="size-5" aria-hidden="true" />
        </button>

        <div className="pr-10">
          <p className="mb-1 text-xs font-semibold uppercase tracking-wide text-primary">Detalle del viaje</p>
          <DialogTitle>{pkg.name}</DialogTitle>
          <DialogDescription className="mt-2 whitespace-pre-wrap wrap-break-word">
            {pkg.description || "Sin descripción proporcionada."}
          </DialogDescription>
        </div>

        <section aria-label="Estadía" className="shrink-0 overflow-hidden rounded-2xl border border-slate-200">
          <HotelPhoto key={pkg.hotel.photoUrl} name={pkg.hotel.name} photoUrl={pkg.hotel.photoUrl} />
          <div className="p-4">
            <p className="mb-1 text-xs text-slate-500">Hotel</p>
            <h3 className="font-semibold text-slate-900">{pkg.hotel.name}</h3>
            <p className="mt-1 text-sm text-slate-600">{pkg.hotel.city.name}, {pkg.hotel.city.country.name}</p>
            {pkg.hotel.services?.trim() && (
              <div className="mt-3 text-sm">
                <h4 className="font-medium text-slate-800">Servicios del hotel</h4>
                <p className="mt-1 whitespace-pre-wrap wrap-break-word text-slate-600">{pkg.hotel.services}</p>
              </div>
            )}
            <dl className="mt-4 grid gap-3 text-sm sm:grid-cols-3">
              <div>
                <dt className="text-xs text-slate-500">Inicio del viaje</dt>
                <dd>{dateFormatter.format(pkg.initialDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Fin del viaje</dt>
                <dd>{dateFormatter.format(pkg.finalDate)}</dd>
              </div>
              <div>
                <dt className="text-xs text-slate-500">Estadía</dt>
                <dd>{pkg.nights} {pkg.nights === 1 ? "noche" : "noches"}</dd>
              </div>
            </dl>
          </div>
        </section>

        <div className="grid gap-3 sm:grid-cols-2">
          <FlightDetails title="Vuelo de ida" flight={pkg.departureFlight} />
          <FlightDetails title="Vuelo de vuelta" flight={pkg.arrivalFlight} />
        </div>

        <section aria-label="Agencia" className="text-sm">
          <h3 className="font-semibold text-slate-900">Agencia</h3>
          <p className="mt-1 text-slate-700">{pkg.agency.businessName}</p>
          <a href={`mailto:${pkg.agency.email}`} className="text-primary underline underline-offset-2 wrap-break-word">
            {pkg.agency.email}
          </a>
        </section>

        <div className="flex flex-wrap items-center justify-between gap-4 border-t border-slate-200 pt-4">
          <div>
            <p className="text-xs text-slate-500">Precio del paquete</p>
            <p className="text-xl font-bold text-primary">{priceFormatter.format(pkg.price)}</p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
