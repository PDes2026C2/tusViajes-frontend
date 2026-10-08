import {
  Calendar,
  DollarSign,
  Hotel as HotelIcon,
  Loader2,
  Mail,
  Receipt,
  RefreshCw,
  Search,
  User,
  Users,
} from "lucide-react"
import type { AgencyMetricsSummary, AgencySale } from "../../models/agency"
import { Button } from "../ui/button"

export interface AgencySalesViewProps {
  sales: AgencySale[]
  isLoading: boolean
  searchQuery: string
  onSearchChange: (query: string) => void
  metrics: AgencyMetricsSummary
  onRefresh: () => void
}

export function AgencySalesView({
  sales,
  isLoading,
  searchQuery,
  onSearchChange,
  metrics,
  onRefresh,
}: AgencySalesViewProps) {
  return (
    <div className="flex flex-col gap-6">
      {/* Top Metric Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
        {/* Total Recaudado */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Total Facturado
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              USD ${metrics.totalRevenue.toLocaleString()}
            </div>
            <span className="text-[11px] text-emerald-600 font-medium">
              Ventas acumuladas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-emerald-500/10 text-emerald-600 flex items-center justify-center">
            <DollarSign className="w-6 h-6" />
          </div>
        </div>

        {/* Total Ventas */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Paquetes Vendidos
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {metrics.totalSales}
            </div>
            <span className="text-[11px] text-primary font-medium">
              Transacciones confirmadas
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center">
            <Receipt className="w-6 h-6" />
          </div>
        </div>

        {/* Clientes Únicos */}
        <div className="bg-white p-5 rounded-2xl border border-slate-200 shadow-2xs flex items-center justify-between">
          <div>
            <span className="text-xs font-semibold text-slate-500 uppercase tracking-wider">
              Clientes Únicos
            </span>
            <div className="text-2xl font-bold text-slate-900 mt-1">
              {metrics.uniqueClients}
            </div>
            <span className="text-[11px] text-sky-600 font-medium">
              Viajeros registrados
            </span>
          </div>
          <div className="w-12 h-12 rounded-2xl bg-sky-500/10 text-sky-600 flex items-center justify-center">
            <Users className="w-6 h-6" />
          </div>
        </div>
      </div>

      {/* Action / Search Bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 sm:p-5 rounded-2xl border border-slate-200 shadow-2xs">
        <div className="relative flex-1 max-w-md">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400" />
          <input
            type="text"
            placeholder="Buscar por cliente, email, DNI o paquete..."
            value={searchQuery}
            onChange={(e) => onSearchChange(e.target.value)}
            className="w-full pl-10 pr-4 py-2 text-sm bg-slate-50 border border-slate-200 rounded-xl focus:outline-hidden focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 placeholder:text-slate-400"
          />
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={onRefresh}
          disabled={isLoading}
          className="rounded-xl border-slate-200 text-slate-600 hover:bg-slate-50 text-xs px-3.5 py-2.5 h-auto flex items-center gap-1.5 self-end sm:self-auto cursor-pointer"
        >
          <RefreshCw
            className={`w-3.5 h-3.5 ${isLoading ? "animate-spin" : ""}`}
          />
          <span>Actualizar Ventas</span>
        </Button>
      </div>

      {/* Loading State */}
      {isLoading && sales.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-slate-200">
          <Loader2 className="w-8 h-8 text-primary animate-spin mb-3" />
          <p className="text-sm font-medium text-slate-600">
            Cargando historial de ventas...
          </p>
        </div>
      )}

      {/* Empty State */}
      {!isLoading && sales.length === 0 && (
        <div className="flex flex-col items-center justify-center p-12 bg-white rounded-3xl border border-dashed border-slate-200 text-center">
          <div className="w-14 h-14 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4">
            <Receipt className="w-7 h-7" />
          </div>
          <h3 className="text-base font-bold text-slate-800">
            No se registraron ventas
          </h3>
          <p className="text-xs sm:text-sm text-slate-500 max-w-sm mt-1">
            {searchQuery
              ? `No hay ventas coincidentes con "${searchQuery}".`
              : "Aún no se han realizado compras sobre los paquetes de tu agencia."}
          </p>
        </div>
      )}

      {/* Sales Table */}
      {!isLoading && sales.length > 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 overflow-hidden shadow-2xs">
          <div className="overflow-x-auto">
            <table className="w-full text-left border-collapse text-xs sm:text-sm">
              <thead>
                <tr className="border-b border-slate-200 bg-slate-50/70 text-slate-500 font-semibold uppercase text-[11px] tracking-wider">
                  <th className="py-3.5 px-4">Cliente</th>
                  <th className="py-3.5 px-4">Paquete / Destino</th>
                  <th className="py-3.5 px-4">Hotel</th>
                  <th className="py-3.5 px-4">Fechas</th>
                  <th className="py-3.5 px-4 text-right">Monto</th>
                  <th className="py-3.5 px-4 text-right">Fecha Compra</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-100 text-slate-700">
                {sales.map((sale) => (
                  <tr
                    key={sale.id}
                    className="hover:bg-slate-50/60 transition-colors"
                  >
                    {/* Buyer */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-2.5">
                        <div className="w-8 h-8 rounded-full bg-slate-100 text-slate-600 flex items-center justify-center font-bold text-xs shrink-0">
                          <User className="w-4 h-4" />
                        </div>
                        <div className="flex flex-col">
                          <strong className="text-slate-900 font-semibold">
                            {sale.buyer.fullName}
                          </strong>
                          {sale.buyer.email && (
                            <span className="text-[11px] text-slate-500 flex items-center gap-1">
                              <Mail className="w-3 h-3 text-slate-400" />
                              {sale.buyer.email}
                            </span>
                          )}
                          {sale.buyer.nationalId && sale.buyer.nationalId !== "-" && (
                            <span className="text-[10px] text-slate-400">
                              DNI: {sale.buyer.nationalId}
                            </span>
                          )}
                        </div>
                      </div>
                    </td>

                    {/* Travel Package */}
                    <td className="py-4 px-4 font-medium text-slate-900">
                      <div className="flex flex-col">
                        <span>{sale.travelPackage.name}</span>
                        <span className="text-[11px] text-slate-500 font-normal">
                          {sale.travelPackage.destinationCityName}
                        </span>
                      </div>
                    </td>

                    {/* Hotel */}
                    <td className="py-4 px-4">
                      <div className="flex items-center gap-1.5 text-slate-700">
                        <HotelIcon className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                        <span>{sale.travelPackage.hotelName}</span>
                      </div>
                    </td>

                    {/* Dates */}
                    <td className="py-4 px-4 text-xs text-slate-600">
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400 shrink-0" />
                        <span>
                          {sale.travelPackage.initialDate.toLocaleDateString("es-AR")} -{" "}
                          {sale.travelPackage.finalDate.toLocaleDateString("es-AR")}
                        </span>
                      </div>
                    </td>

                    {/* Price */}
                    <td className="py-4 px-4 text-right">
                      <span className="font-bold text-emerald-600 bg-emerald-50 px-2.5 py-1 rounded-full text-xs">
                        USD ${sale.price.toLocaleString()}
                      </span>
                    </td>

                    {/* Purchased At */}
                    <td className="py-4 px-4 text-right text-xs text-slate-500">
                      <span>{sale.purchasedAt.toLocaleDateString("es-AR")}</span>
                      <div className="text-[10px] text-slate-400">
                        {sale.purchasedAt.toLocaleTimeString("es-AR", {
                          hour: "2-digit",
                          minute: "2-digit",
                        })}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      )}
    </div>
  )
}
