import { Mail, Phone, RefreshCw, Search, UserCheck, Users, X } from "lucide-react"
import type { Buyer } from "../../models/admin"
import { Button } from "../ui/button"

export interface AdminUsersViewProps {
  buyers: Buyer[]
  searchQuery: string
  isLoading?: boolean
  error?: string | null
  onSearchChange: (query: string) => void
  onRefresh?: () => void
}

export function AdminUsersView({
  buyers,
  searchQuery,
  isLoading = false,
  error = null,
  onSearchChange,
  onRefresh,
}: AdminUsersViewProps) {
  return (
    <div className="w-full flex flex-col gap-6">
      {/* Controls / Filter Header */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-4 bg-white p-4 rounded-2xl border border-slate-200/80 shadow-xs">
        <div className="flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-slate-100 text-slate-700 flex items-center justify-center shrink-0">
            <Users className="w-4 h-4" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h2 className="text-base font-semibold text-slate-800">Listado de Usuarios</h2>
              <span className="inline-flex items-center justify-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                {buyers.length}
              </span>
            </div>
            <p className="text-xs text-slate-400">
              Compradores registrados en la plataforma TusViajes
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          {/* Search Input */}
          <div className="relative flex-1 sm:w-72">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Buscar por nombre, email o DNI..."
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
              title="Actualizar listado de usuarios"
            >
              <RefreshCw
                className={`w-3.5 h-3.5 mr-1.5 ${isLoading ? "animate-spin text-primary" : ""}`}
              />
              <span className="hidden sm:inline">Actualizar</span>
            </Button>
          )}
        </div>
      </div>

      {/* Error state */}
      {error && !isLoading && (
        <div className="bg-error/5 border border-error/20 rounded-2xl p-4 flex items-center justify-between gap-4 text-xs sm:text-sm text-error">
          <span>{error}</span>
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
          {[1, 2, 3, 4, 5, 6].map((idx) => (
            <div
              key={idx}
              className="bg-white rounded-2xl border border-slate-200 p-5 flex flex-col gap-3"
            >
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-full bg-slate-100" />
                <div className="space-y-1.5 flex-1">
                  <div className="h-4 bg-slate-200 rounded-md w-3/4" />
                  <div className="h-3 bg-slate-100 rounded-md w-1/2" />
                </div>
              </div>
              <div className="h-3 bg-slate-100 rounded-md w-full mt-2" />
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {!isLoading && buyers.length === 0 && (
        <div className="bg-white rounded-2xl border border-slate-200 p-12 text-center flex flex-col items-center justify-center max-w-lg mx-auto w-full shadow-xs">
          <div className="w-12 h-12 rounded-2xl bg-slate-100 text-slate-400 flex items-center justify-center mb-4 border border-slate-200">
            <Users className="w-6 h-6" />
          </div>
          <h3 className="text-sm font-semibold text-slate-800">
            {searchQuery ? "No se encontraron usuarios" : "No hay usuarios registrados"}
          </h3>
          <p className="text-xs text-slate-500 mt-1 max-w-xs">
            {searchQuery
              ? `No hay usuarios que coincidan con "${searchQuery}".`
              : "Aún no se han registrado compradores en la plataforma."}
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

      {/* Users Grid */}
      {!isLoading && buyers.length > 0 && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
          {buyers.map((buyer) => (
            <div
              key={buyer.id}
              className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4"
            >
              <div className="flex items-start gap-3">
                <div className="w-9 h-9 rounded-full bg-slate-100 text-slate-700 flex items-center justify-center font-medium text-xs shrink-0">
                  {buyer.firstName.charAt(0).toUpperCase()}
                  {buyer.lastName.charAt(0).toUpperCase()}
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-xs sm:text-sm font-medium text-slate-900 truncate">
                    {buyer.firstName} {buyer.lastName}
                  </h3>
                  <span className="text-[11px] text-slate-400 font-mono">
                    ID #{buyer.id}
                  </span>
                </div>
                <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-[11px] font-medium bg-primary/10 text-primary border border-primary/20 shrink-0">
                  <UserCheck className="w-3 h-3" />
                  Comprador
                </span>
              </div>

              <div className="space-y-1.5 border-t border-slate-100 pt-3 text-xs text-slate-600">
                <div className="flex items-center gap-2">
                  <Mail className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                  <span className="text-slate-800 truncate" title={buyer.email}>
                    {buyer.email}
                  </span>
                </div>

                {buyer.nationalId && (
                  <div className="flex items-center gap-2">
                    <span className="text-slate-400 font-medium">DNI:</span>
                    <span className="font-mono text-slate-800">{buyer.nationalId}</span>
                  </div>
                )}

                {buyer.phoneNumber && (
                  <div className="flex items-center gap-2">
                    <Phone className="w-3.5 h-3.5 text-slate-400 shrink-0" />
                    <span className="text-slate-800">{buyer.phoneNumber}</span>
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  )
}
