import { AlertTriangle, Loader2 } from "lucide-react"
import type { AgencyPackageItem } from "../../models/agency"
import { Button } from "../ui/button"

export interface PackageDeleteModalProps {
  isOpen: boolean
  packageItem: AgencyPackageItem | null
  isDeleting: boolean
  onClose: () => void
  onConfirm: () => void
}

export function PackageDeleteModal({
  isOpen,
  packageItem,
  isDeleting,
  onClose,
  onConfirm,
}: PackageDeleteModalProps) {
  if (!isOpen || !packageItem) return null

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-modal-title"
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-slate-900/50 backdrop-blur-xs animate-in fade-in duration-200"
    >
      <div className="bg-white rounded-3xl p-6 sm:p-8 max-w-md w-full shadow-2xl border border-slate-100 flex flex-col gap-6">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-2xl bg-error/10 text-error flex items-center justify-center shrink-0">
            <AlertTriangle className="w-6 h-6" />
          </div>
          <div>
            <h3
              id="delete-modal-title"
              className="text-lg font-bold text-slate-900"
            >
              ¿Eliminar paquete de viaje?
            </h3>
            <p className="text-sm text-slate-500 mt-1">
              Estás por eliminar permanentemente el paquete{" "}
              <strong className="text-slate-800">
                "{packageItem.name}"
              </strong>
              . Esta acción no se puede deshacer.
            </p>
          </div>
        </div>

        <div className="p-3.5 bg-slate-50 border border-slate-100 rounded-2xl text-xs text-slate-600 flex flex-col gap-1">
          <div className="flex justify-between">
            <span className="text-slate-400">Hotel:</span>
            <span className="font-medium text-slate-700">
              {packageItem.hotel.name} ({packageItem.hotel.city.name})
            </span>
          </div>
          <div className="flex justify-between">
            <span className="text-slate-400">Precio:</span>
            <span className="font-semibold text-slate-900">
              USD ${packageItem.price}
            </span>
          </div>
        </div>

        <div className="flex items-center justify-end gap-3 pt-2 border-t border-slate-100">
          <Button
            type="button"
            variant="outline"
            disabled={isDeleting}
            onClick={onClose}
            className="rounded-xl px-4 py-2 text-sm text-slate-600 hover:bg-slate-100 cursor-pointer"
          >
            Cancelar
          </Button>
          <Button
            type="button"
            disabled={isDeleting}
            onClick={onConfirm}
            className="rounded-xl px-5 py-2 text-sm bg-error hover:bg-error/90 text-white font-semibold flex items-center gap-2 cursor-pointer shadow-sm"
          >
            {isDeleting && <Loader2 className="w-4 h-4 animate-spin" />}
            <span>{isDeleting ? "Eliminando..." : "Eliminar paquete"}</span>
          </Button>
        </div>
      </div>
    </div>
  )
}
