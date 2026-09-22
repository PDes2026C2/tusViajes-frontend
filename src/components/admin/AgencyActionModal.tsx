import { AlertTriangle, CheckCircle2, Loader2, X } from "lucide-react"
import type { Agency } from "@/models/package"
import { Button } from "../ui/button"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"

export interface AgencyActionModalProps {
  isOpen: boolean
  agency: Agency | null
  actionType: "authorize" | "reject" | null
  isProcessing?: boolean
  onClose: () => void
  onConfirm: () => void
}

export function AgencyActionModal({
  isOpen,
  agency,
  actionType,
  isProcessing = false,
  onClose,
  onConfirm,
}: AgencyActionModalProps) {
  if (!agency || !actionType) return null

  const isAuthorize = actionType === "authorize"

  return (
    <Dialog
      open={isOpen}
      onOpenChange={(open) => {
        if (!open && !isProcessing) {
          onClose()
        }
      }}
    >
      <DialogContent className="max-w-md">
        {/* Close Button */}
        <button
          type="button"
          onClick={onClose}
          disabled={isProcessing}
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer disabled:opacity-50"
          aria-label="Cerrar"
        >
          <X className="h-4 w-4" />
        </button>

        <div className="flex items-start gap-4">
          <div
            className={`w-11 h-11 rounded-2xl flex items-center justify-center shrink-0 ${
              isAuthorize
                ? "bg-primary/10 text-primary border border-primary/20"
                : "bg-error/10 text-error border border-error/20"
            }`}
          >
            {isAuthorize ? (
              <CheckCircle2 className="w-5 h-5" />
            ) : (
              <AlertTriangle className="w-5 h-5" />
            )}
          </div>

          <DialogHeader className="pr-4">
            <DialogTitle className="text-base font-semibold text-slate-900">
              {isAuthorize ? "Aprobar agencia" : "Rechazar agencia"}
            </DialogTitle>
            <DialogDescription className="mt-1.5 text-xs text-slate-500">
              {isAuthorize
                ? `¿Confirmás la aprobación de "${agency.businessName}"? Podrá comenzar a publicar paquetes turísticos de inmediato.`
                : `¿Estás seguro de que deseás rechazar a "${agency.businessName}"? La agencia no podrá operar en la plataforma.`}
            </DialogDescription>
          </DialogHeader>
        </div>

        <div className="bg-slate-50 rounded-xl p-3.5 border border-slate-100 text-xs text-slate-600 space-y-1">
          <div>
            <span className="font-medium text-slate-700">Razón Social:</span>{" "}
            {agency.businessName}
          </div>
          <div>
            <span className="font-medium text-slate-700">CUIT:</span>{" "}
            <span className="font-mono">{agency.taxId}</span>
          </div>
          <div>
            <span className="font-medium text-slate-700">Email:</span>{" "}
            {agency.email}
          </div>
        </div>

        <div className="flex items-center justify-end gap-2 pt-2">
          <Button
            type="button"
            variant="outline"
            disabled={isProcessing}
            onClick={onClose}
            className="rounded-xl px-4 py-1.5 text-xs font-medium cursor-pointer"
          >
            Cancelar
          </Button>

          <Button
            type="button"
            disabled={isProcessing}
            onClick={onConfirm}
            className={`rounded-xl px-4 py-1.5 text-xs font-medium text-white cursor-pointer shadow-xs ${
              isAuthorize
                ? "bg-primary hover:bg-primary/90"
                : "bg-error hover:bg-error/90"
            }`}
          >
            {isProcessing ? (
              <>
                <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
                Procesando...
              </>
            ) : isAuthorize ? (
              "Confirmar Aprobación"
            ) : (
              "Confirmar Rechazo"
            )}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  )
}
