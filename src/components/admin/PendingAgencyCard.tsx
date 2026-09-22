import { Building2, Check, Clock, FileText, Loader2, Mail, X } from "lucide-react"
import type { Agency } from "@/models/package"
import { Button } from "../ui/button"

export interface PendingAgencyCardProps {
  agency: Agency
  isProcessing?: boolean
  onAuthorize: (agency: Agency) => void
  onReject: (agency: Agency) => void
}

export function PendingAgencyCard({
  agency,
  isProcessing = false,
  onAuthorize,
  onReject,
}: PendingAgencyCardProps) {
  return (
    <div className="bg-white rounded-2xl border border-slate-200 p-5 shadow-xs hover:shadow-md transition-all duration-200 flex flex-col justify-between gap-4">
      <div className="flex items-start justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
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

        <span className="inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-medium bg-slate-100 text-slate-700 border border-slate-200/80">
          <Clock className="w-3.5 h-3.5" />
          Pendiente
        </span>
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

      <div className="flex items-center justify-end gap-2 pt-2 border-t border-slate-100">
        <Button
          type="button"
          variant="outline"
          disabled={isProcessing}
          onClick={() => onReject(agency)}
          className="rounded-xl border-slate-200 text-error hover:text-error hover:bg-error/10 hover:border-error/30 font-medium px-3.5 py-1.5 h-auto text-xs transition-colors cursor-pointer"
        >
          <X className="w-3.5 h-3.5 mr-1" />
          Rechazar
        </Button>

        <Button
          type="button"
          disabled={isProcessing}
          onClick={() => onAuthorize(agency)}
          className="rounded-xl bg-primary hover:bg-primary/90 text-white font-medium px-3.5 py-1.5 h-auto text-xs shadow-xs transition-colors cursor-pointer"
        >
          {isProcessing ? (
            <>
              <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" />
              Procesando...
            </>
          ) : (
            <>
              <Check className="w-3.5 h-3.5 mr-1" />
              Aprobar
            </>
          )}
        </Button>
      </div>
    </div>
  )
}
