import {
  AlertCircle,
  CheckCircle2,
  RefreshCw,
  Search,
  X,
} from "lucide-react"
import type { Agency } from "@/models/package"
import { Button } from "../ui/button"
import { PendingAgencyCard } from "./PendingAgencyCard"

export interface PendingAgenciesListProps {
  agencies: Agency[]
  isLoading: boolean
  processingAgencyId: number | null
  searchQuery: string
  error: string | null
  onSearchChange: (query: string) => void
  onAuthorize: (agency: Agency) => void
  onReject: (agency: Agency) => void
  onRefresh: () => void
}

export function PendingAgenciesList({
  agencies,
  isLoading,
  processingAgencyId,
  searchQuery,
  error,
  onSearchChange,
  onAuthorize,
  onReject,
  onRefresh,
}: PendingAgenciesListProps) {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Controls / Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <h2 className="text-base font-semibold text-slate-800">
            Solicitudes pendientes
          </h2>
          <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
            {agencies.length}
          </span>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-72">
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
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            disabled={isLoading}
            className="rounded-xl px-3 py-2 text-xs font-medium border-slate-200 text-slate-600 hover:bg-slate-50 cursor-pointer shrink-0"
            title="Actualizar listado"
          >
            <RefreshCw
              className={`w-3.5 h-3.5 mr-1.5 ${
                isLoading ? "animate-spin text-primary" : ""
              }`}
            />
            <span className="hidden sm:inline">Actualizar</span>
          </Button>
        </div>
      </div>

      {/* Error State */}
      {error && !isLoading && (
        <div className="bg-error/5 border border-error/20 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs sm:text-sm text-error">
          <div className="flex items-center gap-3">
            <AlertCircle className="w-4 h-4 text-error shrink-0" />
            <span>{error}</span>
          </div>
          <Button
            type="button"
            variant="outline"
            onClick={onRefresh}
            className="rounded-xl border-error/20 text-error hover:bg-error/10 text-xs px-3 py-1.5 h-auto cursor-pointer shrink-0"
          >
            Reintentar
          </Button>
        </div>
      )}

      {/* Loading Skeletons */}
      {isLoading && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {[1, 2, 3].map((index) => (
            <div
              key={index}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col justify-between gap-4 animate-pulse"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-10 h-10 rounded-xl bg-slate-100" />
                  <div className="space-y-1.5">
                    <div className="h-4 w-28 bg-slate-200 rounded-md" />
                    <div className="h-3 w-16 bg-slate-100 rounded-md" />
                  </div>
                </div>
                <div className="h-5 w-16 bg-slate-100 rounded-full" />
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-3">
                <div className="h-3.5 w-3/4 bg-slate-100 rounded-md" />
                <div className="h-3.5 w-1/2 bg-slate-100 rounded-md" />
              </div>

              <div className="flex justify-end gap-2 pt-2 border-t border-slate-100">
                <div className="h-7 w-16 bg-slate-100 rounded-xl" />
                <div className="h-7 w-16 bg-slate-200 rounded-xl" />
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && agencies.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto w-full shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-primary/10 text-primary flex items-center justify-center mb-4 border border-primary/20">
            <CheckCircle2 className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            {searchQuery
              ? "No se encontraron resultados"
              : "¡No hay agencias pendientes!"}
          </h3>
          <p className="text-xs text-slate-500 mt-1.5 max-w-sm">
            {searchQuery
              ? `No hay agencias que coincidan con el término "${searchQuery}".`
              : "Todas las solicitudes de registro han sido procesadas correctamente."}
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
          {agencies.map((agency) => (
            <PendingAgencyCard
              key={agency.id}
              agency={agency}
              isProcessing={processingAgencyId === agency.id}
              onAuthorize={onAuthorize}
              onReject={onReject}
            />
          ))}
        </div>
      )}
    </div>
  )
}
