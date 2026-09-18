import { ChevronLeft, ChevronRight } from "lucide-react"
import { Button } from "../ui/button"

export interface PackagePaginationProps {
  currentPage: number
  totalPages: number
  onPageChange: (page: number) => void
}

export function PackagePagination({
  currentPage,
  totalPages,
  onPageChange,
}: PackagePaginationProps) {
  if (totalPages <= 1) {
    return null
  }

  const isFirstPage = currentPage === 0
  const isLastPage = currentPage >= totalPages - 1

  return (
    <nav
      aria-label="Paginación de paquetes"
      className="flex justify-center items-center gap-2 mt-8 py-2"
    >
      {/* Botón Anterior */}
      <Button
        type="button"
        variant="outline"
        disabled={isFirstPage}
        onClick={() => onPageChange(currentPage - 1)}
        className="rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2 text-xs font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        aria-label="Página anterior"
      >
        <ChevronLeft className="w-4 h-4" />
        <span className="hidden sm:inline">Anterior</span>
      </Button>

      {/* Páginas numéricas */}
      <div className="flex items-center gap-1.5">
        {Array.from({ length: totalPages }, (_, index) => {
          const isActive = index === currentPage
          return (
            <Button
              key={index}
              type="button"
              variant={isActive ? "default" : "outline"}
              onClick={() => onPageChange(index)}
              className={`w-9 h-9 p-0 rounded-xl text-xs font-semibold cursor-pointer transition-all ${
                isActive
                  ? "bg-primary text-white shadow-xs hover:bg-primary/90"
                  : "border border-slate-200 text-slate-700 hover:bg-slate-50 hover:text-slate-900"
              }`}
              aria-current={isActive ? "page" : undefined}
            >
              {index + 1}
            </Button>
          )
        })}
      </div>

      {/* Botón Siguiente */}
      <Button
        type="button"
        variant="outline"
        disabled={isLastPage}
        onClick={() => onPageChange(currentPage + 1)}
        className="rounded-xl border border-slate-200 text-slate-700 hover:bg-slate-50 px-3 py-2 text-xs font-medium cursor-pointer disabled:opacity-40 disabled:cursor-not-allowed flex items-center gap-1"
        aria-label="Página siguiente"
      >
        <span className="hidden sm:inline">Siguiente</span>
        <ChevronRight className="w-4 h-4" />
      </Button>
    </nav>
  )
}
