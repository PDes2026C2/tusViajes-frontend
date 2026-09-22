import {
  AlertCircle,
  Building2,
  CheckCircle2,
  FileText,
  Mail,
  RefreshCw,
  Search,
  X,
  XCircle,
} from "lucide-react"
import type { AgencyStatusFilter } from "../../hooks/useAdmin"
import { Button } from "../ui/button"
import { PendingAgencyCard } from "./PendingAgencyCard"
import type { Agency } from "@/models/package"

export interface AdminAgenciesViewProps {
  agencies: Agency[]
  isLoading?: boolean
  processingAgencyId?: number | null
  searchQuery: string
  statusFilter: AgencyStatusFilter
  error?: string | null
  pendingCount?: number
  onSearchChange: (query: string) => void
  onStatusFilterChange: (status: AgencyStatusFilter) => void
  onAuthorize: (agency: Agency) => void
  onReject: (agency: Agency) => void
  onRefresh?: () => void
}

export function AdminAgenciesView({
  agencies,
  isLoading = false,
  processingAgencyId = null,
  searchQuery,
  statusFilter,
  error = null,
  pendingCount = 0,
  onSearchChange,
  onStatusFilterChange,
  onAuthorize,
  onReject,
  onRefresh,
}: AdminAgenciesViewProps) {
  const filterOptions: { id: AgencyStatusFilter; label: string; badge?: number }[] = [
    { id: "ALL", label: "Todas" },
    {
      id: "PENDING",
      label: "Pendientes",
      badge: pendingCount > 0 ? pendingCount : undefined,
    },
    { id: "AUTHORIZED", label: "Autorizadas" },
    { id: "REJECTED", label: "Rechazadas" },
  ]

  return (
    <div className="w-full flex flex-col gap-6">
      {/* Controls / Filter Header */}
      <div className="flex flex-col gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
              <Building2 className="w-4 h-4" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h2 className="text-base font-semibold text-slate-800">Listado de Agencias</h2>
                <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {agencies.length}
                </span>
              </div>
              <p className="text-xs text-slate-400">
                Supervisá y autorizá las agencias registradas en la plataforma
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            {/* Search Input */}
            <div className="relative flex-1 sm:w-64">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
              <input
                type="text"
                value={searchQuery}
                onChange={(e) => onSearchChange(e.target.value)}
                placeholder="Buscar por nombre o CUIT..."
                className="w-full pl-9 pr-8 py-2 text-xs rounded-xl border border-slate-200 bg-slate-50/50 focus:bg-white focus:outline-none focus:ring-2 focus:ring-primary/20 focus:border-primary transition-all text-slate-800 placeholder:text-slate-400"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => onSearchChange("")}
                  className="absolute right-2.5 top-1/2 -translate-y-1/2 text-slate-400 hover:text-slate-600 cursor-pointer"
                  aria-label="Borrar texto de búsqueda"
                >
                  <X className="w-3.5 h-3.5" />
                </button>
              )}
            </div>

            {/* Refresh Button */}
            {onRefresh && (
              <Button
                type="button"
                variant="outline"
                onClick={onRefresh}
                disabled={isLoading}
                className="rounded-xl px-3 py-2 text-xs font-medium border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"
                title="Actualizar agencias"
              >
                <RefreshCw
                  className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin text-primary" : ""}`}
                />
                <span className="hidden sm:inline">Actualizar</span>
              </Button>
            )}
          </div>
        </div>

        {/* Status Filter Pills */}
        <div className="flex items-center gap-2 pt-2 border-t border-slate-100 overflow-x-auto">
          <span className="text-xs font-medium text-slate-400 mr-1">Estado:</span>
          {filterOptions.map((opt) => {
            const isSelected = statusFilter === opt.id
            return (
              <button
                key={opt.id}
                type="button"
                onClick={() => onStatusFilterChange(opt.id)}
                className={`flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-medium transition-all cursor-pointer ${
                  isSelected
                    ? "bg-primary text-white shadow-xs"
                    : "bg-slate-100 text-slate-600 hover:bg-slate-200"
                }`}
              >
                <span>{opt.label}</span>
                {opt.badge !== undefined && (
                  <span
                    className={`ml-1 px-1.5 py-0.2 rounded-full text-[10px] font-medium ${
                      isSelected ? "bg-white text-primary" : "bg-error/10 text-error"
                    }`}
                  >
                    {opt.badge}
                  </span>
                )}
              </button>
            )
          })}
        </div>
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-error/5 border border-error/20 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs sm:text-sm text-error">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-error shrink-0" />
            <span>{error}</span>
          </div>
          {onRefresh && (
            <Button
              type="button"
              variant="outline"
              onClick={onRefresh}
              className="rounded-xl border-error/20 text-error hover:bg-error/10 text-xs px-3 py-1.5 h-auto cursor-pointer shrink-0"
            >
              Reintentar
            </Button>
          )}
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5 animate-pulse">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start justify-between">
                <div className="w-10 h-10 rounded-xl bg-slate-100" />
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
              </div>
              <div className="space-y-2 border-t border-slate-100 pt-3">
                <div className="h-3.5 w-3/4 bg-slate-100 rounded-md" />
                <div className="h-3.5 w-1/2 bg-slate-100 rounded-md" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && agencies.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto w-full shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4 border border-slate-200">
            <Building2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            {searchQuery ? "No se encontraron resultados" : "No hay agencias en esta vista"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-sm">
            {searchQuery
              ? `No hay agencias que coincidan con "${searchQuery}".`
              : "No se registran agencias bajo el filtro seleccionado."}
          </p>
          {searchQuery && (
            <Button
              type="button"
              variant="outline"
              onClick={() => onSearchChange("")}
              className="mt-4 rounded-xl text-xs font-medium border-slate-200 cursor-pointer"
            >
              Limpiar búsqueda
            </Button>
          )}
        </div>
      )}

      {/* Agencies Grid */}
      {!isLoading && agencies.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {agencies.map((agency) => {
            if (agency.status === "PENDING") {
              return (
                <PendingAgencyCard
                  key={agency.id}
                  agency={agency}
                  isProcessing={processingAgencyId === agency.id}
                  onAuthorize={onAuthorize}
                  onReject={onReject}
                />
              )
            }

            const isAuthorized = agency.status === "AUTHORIZED"

            return (
              <div
                key={agency.id}
                className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
              >
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 rounded-xl flex items-center justify-center shrink-0 ${
                        isAuthorized
                          ? "bg-primary/10 text-primary border border-primary/20"
                          : "bg-error/10 text-error border border-error/20"
                      }`}
                    >
                      <Building2 className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-xs sm:text-sm font-medium text-slate-900 leading-tight">
                        {agency.businessName}
                      </h3>
                      <span className="text-[11px] text-slate-400 font-mono">
                        ID #{agency.id}
                      </span>
                    </div>
                  </div>

                  {isAuthorized ? (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                      <CheckCircle2 className="w-3.5 h-3.5" />
                      Autorizada
                    </span>
                  ) : (
                    <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error border border-error/20">
                      <XCircle className="w-3.5 h-3.5" />
                      Rechazada
                    </span>
                  )}
                </div>

                <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                  <div className="flex items-center gap-2">
                    <FileText className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500 font-medium">CUIT:</span>
                    <span className="font-mono text-slate-800">{agency.taxId}</span>
                  </div>

                  <div className="flex items-center gap-2">
                    <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-500 font-medium">Email:</span>
                    <span className="text-slate-800 truncate" title={agency.email}>
                      {agency.email}
                    </span>
                  </div>
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-slate-100 text-[11px] text-slate-400">
                  <span>Estado del registro</span>
                  <span className="font-medium text-slate-700">
                    {isAuthorized ? "Habilitada para publicar" : "No habilitada"}
                  </span>
                </div>
              </div>
            )
          })}
        </div>
      )}
    </div>
  )
}
