import { useEffect, useRef, useState } from "react"
import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import { purchaseDataSource } from "../datasources/purchase"
import { buyerDataSource } from "../datasources/buyer"
import type { TravelPackage } from "../models/package"
import { useAuth } from "./useAuth"

export function usePurchasePackage(pkg: TravelPackage, onClose: () => void) {
  const { user, isAuthenticated, modal } = useAuth()
  const navigate = useNavigate()
  const [isConfirming, setIsConfirming] = useState(false)
  const [isPurchasing, setIsPurchasing] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [purchaseStatus, setPurchaseStatus] = useState<"checking" | "available" | "purchased" | "error">("checking")
  const [checkAttempt, setCheckAttempt] = useState(0)
  const pending = useRef(false)
  const active = useRef(true)

  useEffect(() => {
    let ignore = false
    active.current = true
    if (isAuthenticated && user?.role === "BUYER") {
      buyerDataSource.hasPurchasedPackage(pkg.id).then((purchased) => {
        if (!ignore) setPurchaseStatus(purchased ? "purchased" : "available")
      }).catch(() => {
        if (!ignore) setPurchaseStatus("error")
      })
    }
    return () => { ignore = true; active.current = false }
  }, [pkg.id, isAuthenticated, user?.id, user?.role, checkAttempt])

  const retryPurchaseCheck = () => {
    if (pending.current) return
    setPurchaseStatus("checking")
    setCheckAttempt((attempt) => attempt + 1)
  }

  const viewMyTrips = () => {
    onClose()
    void navigate("/my-trips")
  }

  const startPurchase = () => {
    if (pending.current) return
    if (!isAuthenticated) {
      onClose()
      modal.open("login")
      return
    }
    if (user?.role !== "BUYER" || purchaseStatus !== "available") return
    setError(null)
    setIsConfirming(true)
  }

  const cancelPurchase = () => {
    if (pending.current) return
    setError(null)
    setIsConfirming(false)
  }

  const confirmPurchase = async () => {
    if (!isConfirming || pending.current || !isAuthenticated || user?.role !== "BUYER" || purchaseStatus !== "available") return
    if (pkg.initialDate.getTime() <= Date.now()) {
      setError("Este viaje ya comenzó y no se puede comprar.")
      return
    }

    pending.current = true
    setIsPurchasing(true)
    setError(null)
    try {
      await purchaseDataSource.purchasePackage(pkg.id)
      if (!active.current) return
      setIsConfirming(false)
      setPurchaseStatus("purchased")
      toast.success("¡Compra realizada! Encontrá tu paquete en Mis viajes.")
      onClose()
      void navigate("/my-trips")
    } catch (err: unknown) {
      if (active.current) {
        const message = err instanceof Error ? err.message : "No pudimos completar la compra. Intentá nuevamente."
        const normalizedMessage = message.normalize("NFD").replace(/[\u0300-\u036f]/g, "").toLowerCase()
        if (normalizedMessage.includes("ya adquirio") || normalizedMessage.includes("ya compro")) {
          setPurchaseStatus("purchased")
          setIsConfirming(false)
          setError(null)
        } else {
          setError(message)
        }
      }
    } finally {
      pending.current = false
      if (active.current) setIsPurchasing(false)
    }
  }

  return {
    canPurchase: !isAuthenticated || user?.role === "BUYER",
    requiresLogin: !isAuthenticated,
    isConfirming,
    isPurchasing,
    error,
    purchaseStatus,
    retryPurchaseCheck,
    viewMyTrips,
    startPurchase,
    cancelPurchase,
    confirmPurchase,
  }
}
