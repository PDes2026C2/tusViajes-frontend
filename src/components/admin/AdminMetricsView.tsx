import {
  BarChart2,
  Building2,
  MapPin,
  RefreshCw,
  Star,
  UserCheck,
  Users,
} from "lucide-react"
import type {
  TopAgency,
  TopBuyer,
  TopDestination,
  TopRatedDestination,
} from "../../models/admin"
import { Button } from "../ui/button"

export interface AdminMetricsViewProps {
  topBuyers: TopBuyer[]
  topRankedDestinations: TopDestination[]
  topAgencies: TopAgency[]
  topRatedDestinations: TopRatedDestination[]
  isLoading?: boolean
  onRefresh?: () => void
}

function getRankBadge(rank: number) {
  if (rank === 1) {
    return "bg-primary/10 text-primary border-primary/20 font-semibold"
  }
  return "bg-slate-100 text-slate-600 border-slate-200 font-medium"
}

export function AdminMetricsView({
  topBuyers,
  topRankedDestinations,
  topAgencies,
  topRatedDestinations,
  isLoading = false,
  onRefresh,
}: AdminMetricsViewProps) {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Header bar */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-5 rounded-2xl border border-slate-200/80 shadow-xs">
        <div>
          <h2 className="text-xl font-semibold text-slate-900 flex items-center gap-2">
            <BarChart2 className="w-5 h-5 text-primary" />
            Métricas y Rankings
          </h2>
          <p className="text-xs sm:text-sm text-slate-500 mt-1">
            Visualizá los mejores usuarios, destinos y agencias más activas de la plataforma.
          </p>
        </div>

        {onRefresh && (
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-xl px-4 py-2 text-xs font-medium border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"
            title="Actualizar métricas"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-2 ${isLoading ? "animate-spin text-primary" : ""}`}
            />
            Actualizar métricas
          </Button>
        )}
      </div>

      {/* Grid of 4 Top 5 Sections */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* 1. Top 5 Usuarios con más compras */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Users className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Usuarios con más compras
                  </h3>
                  <p className="text-xs text-slate-400">Top 5 compradores más frecuentes</p>
                </div>
              </div>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                Top 5
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-2 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-xl" />
                ))}
              </div>
            ) : topBuyers.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay datos de compras disponibles
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {topBuyers.slice(0, 5).map((item, index) => {
                  const rank = item.rank || index + 1
                  const buyer = item.buyer
                  return (
                    <li key={buyer.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-md border flex items-center justify-center text-xs shrink-0 ${getRankBadge(
                            rank
                          )}`}
                        >
                          {rank}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                            {buyer.firstName} {buyer.lastName}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{buyer.email}</p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 shrink-0">
                        <UserCheck className="w-3.5 h-3.5" />
                        {item.purchases} {item.purchases === 1 ? "compra" : "compras"}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* 2. Top 5 Destinos mejor rankeados */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <MapPin className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Destinos mejor rankeados
                  </h3>
                  <p className="text-xs text-slate-400">Top 5 ciudades más populares</p>
                </div>
              </div>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                Top 5
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-2 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-xl" />
                ))}
              </div>
            ) : topRankedDestinations.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay destinos rankeados disponibles
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {topRankedDestinations.slice(0, 5).map((dest, index) => {
                  const rank = dest.rank || index + 1
                  return (
                    <li key={dest.city.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-md border flex items-center justify-center text-xs shrink-0 ${getRankBadge(
                            rank
                          )}`}
                        >
                          {rank}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                            {dest.city.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {dest.city.country?.name}
                          </p>
                        </div>
                      </div>

                      <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 shrink-0">
                        Puesto #{rank}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* 3. Top 5 Agencias con más ventas */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Building2 className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Agencias con más ventas
                  </h3>
                  <p className="text-xs text-slate-400">Top 5 agencias líderes en ventas</p>
                </div>
              </div>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                Top 5
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-2 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-xl" />
                ))}
              </div>
            ) : topAgencies.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay datos de agencias disponibles
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {topAgencies.slice(0, 5).map((item, index) => {
                  const rank = item.rank || index + 1
                  const agency = item.agency
                  return (
                    <li key={agency.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-md border flex items-center justify-center text-xs shrink-0 ${getRankBadge(
                            rank
                          )}`}
                        >
                          {rank}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                            {agency.businessName}
                          </p>
                          <p className="text-xs text-slate-400 truncate">{agency.email}</p>
                        </div>
                      </div>

                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 shrink-0">
                        {item.sales} {item.sales === 1 ? "venta" : "ventas"}
                      </span>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>

        {/* 4. Top 5 Destinos mejor valorados (1 al 10) */}
        <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between border-b border-slate-100 pb-3 mb-3">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center">
                  <Star className="w-4 h-4" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-800">
                    Destinos mejor valorados
                  </h3>
                  <p className="text-xs text-slate-400">Escala de 1 a 10 estrellas</p>
                </div>
              </div>
              <span className="text-xs font-medium bg-slate-100 text-slate-600 px-2.5 py-0.5 rounded-full">
                Top 5
              </span>
            </div>

            {isLoading ? (
              <div className="space-y-3 py-2 animate-pulse">
                {[1, 2, 3, 4, 5].map((i) => (
                  <div key={i} className="h-10 bg-slate-100 rounded-xl" />
                ))}
              </div>
            ) : topRatedDestinations.length === 0 ? (
              <div className="py-8 text-center text-slate-400 text-xs">
                No hay valoraciones de destinos disponibles
              </div>
            ) : (
              <ul className="divide-y divide-slate-100">
                {topRatedDestinations.slice(0, 5).map((rated, index) => {
                  const rank = rated.rank || index + 1
                  return (
                    <li key={rated.city.id} className="py-2.5 flex items-center justify-between gap-3">
                      <div className="flex items-center gap-3 min-w-0">
                        <span
                          className={`w-6 h-6 rounded-md border flex items-center justify-center text-xs shrink-0 ${getRankBadge(
                            rank
                          )}`}
                        >
                          {rank}
                        </span>
                        <div className="min-w-0">
                          <p className="text-xs sm:text-sm font-medium text-slate-800 truncate">
                            {rated.city.name}
                          </p>
                          <p className="text-xs text-slate-400 truncate">
                            {rated.city.country?.name}
                          </p>
                        </div>
                      </div>

                      <div className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20 shrink-0">
                        <Star className="w-3.5 h-3.5 fill-primary text-primary" />
                        <span>{rated.stars.toFixed(1)}</span>
                        <span className="text-[10px] text-primary/70">/ 10</span>
                      </div>
                    </li>
                  )
                })}
              </ul>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
