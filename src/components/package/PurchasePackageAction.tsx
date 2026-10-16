import { Loader2 } from "lucide-react"
import type { usePurchasePackage } from "../../hooks/usePurchasePackage"
import { Button } from "../ui/button"

export type PurchasePackageActionProps = ReturnType<typeof usePurchasePackage>

export function PurchasePackageAction({ action }: { action: PurchasePackageActionProps }) {
  if (!action.canPurchase) return null

  if (!action.requiresLogin && action.purchaseStatus === "purchased") {
    return (
      <div className="flex w-full flex-wrap items-center justify-between gap-3 rounded-xl bg-emerald-50 p-4">
        <p className="text-base font-semibold text-emerald-800">Ya compraste este paquete</p>
        <Button type="button" variant="outline" onClick={action.viewMyTrips} className="h-11 rounded-xl px-6 text-base font-semibold cursor-pointer">Ver en mis viajes</Button>
      </div>
    )
  }

  if (!action.requiresLogin && action.purchaseStatus === "checking") {
    return <p role="status" className="flex items-center gap-2 text-sm text-slate-500">
      <Loader2 className="size-4 animate-spin" aria-hidden="true" />
      Consultando tus compras...
    </p>
  }

  if (!action.requiresLogin && action.purchaseStatus === "error") {
    return <div className="flex w-full flex-col items-start gap-2">
      <p role="alert" className="text-sm text-error">No pudimos verificar si ya compraste este paquete.</p>
      <Button type="button" variant="outline" onClick={action.retryPurchaseCheck}>Reintentar consulta</Button>
    </div>
  }

  return (
    <div className="flex w-full flex-col gap-3">
      {action.isConfirming ? (
        <div className="rounded-xl border border-sky-200 bg-sky-50 p-4">
          <p className="font-semibold text-slate-900">¿Confirmás la compra de este paquete?</p>
          <div className="mt-4 flex flex-wrap justify-end gap-2">
            <Button type="button" variant="outline" disabled={action.isPurchasing} onClick={action.cancelPurchase}>
              Cancelar
            </Button>
            <Button type="button" disabled={action.isPurchasing} onClick={action.confirmPurchase} aria-busy={action.isPurchasing}>
              {action.isPurchasing && <Loader2 className="size-4 animate-spin" aria-hidden="true" />}
              {action.isPurchasing ? "Comprando..." : "Confirmar compra"}
            </Button>
          </div>
        </div>
      ) : (
        <Button type="button" onClick={action.startPurchase} className="self-end h-11 rounded-xl px-6 text-base font-semibold cursor-pointer">
          {action.requiresLogin ? "Iniciar sesión para comprar" : "Comprar paquete"}
        </Button>
      )}
      {action.error && <p role="alert" className="text-sm text-error">{action.error}</p>}
    </div>
  )
}
