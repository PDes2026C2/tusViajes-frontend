import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PurchasePackageAction, type PurchasePackageActionProps } from "./PurchasePackageAction"

describe("PurchasePackageAction", () => {
  let action: PurchasePackageActionProps

  beforeEach(() => {
    action = {
      canPurchase: true, requiresLogin: false, isConfirming: false, isPurchasing: false, error: null,
      startPurchase: vi.fn(), cancelPurchase: vi.fn(), confirmPurchase: vi.fn(),
      purchaseStatus: "available", retryPurchaseCheck: vi.fn(), viewMyTrips: vi.fn(),
    }
  })

  it("starts the purchase confirmation from the detail", () => {
    // arrange
    render(<PurchasePackageAction action={action} />)

    // act
    fireEvent.click(screen.getByRole("button", { name: "Comprar paquete" }))

    // assert
    expect(action.startPurchase).toHaveBeenCalledTimes(1)
    expect(action.confirmPurchase).not.toHaveBeenCalled()
  })

  it("offers login to visitors", () => {
    // arrange
    action.requiresLogin = true

    // act
    render(<PurchasePackageAction action={action} />)

    // assert
    expect(screen.getByRole("button", { name: "Iniciar sesión para comprar" })).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Comprar paquete" })).not.toBeInTheDocument()
  })

  it("hides the purchase action for accounts without permission", () => {
    // arrange
    action.canPurchase = false

    // act
    render(<PurchasePackageAction action={action} />)

    // assert
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("offers explicit confirmation and cancellation", () => {
    // arrange
    action.isConfirming = true
    render(<PurchasePackageAction action={action} />)

    // act
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }))
    fireEvent.click(screen.getByRole("button", { name: "Confirmar compra" }))

    // assert
    expect(action.cancelPurchase).toHaveBeenCalledTimes(1)
    expect(action.confirmPurchase).toHaveBeenCalledTimes(1)
  })

  it("disables both actions and announces that the purchase is being processed", () => {
    // arrange
    action.isConfirming = true
    action.isPurchasing = true
    render(<PurchasePackageAction action={action} />)

    // act
    fireEvent.click(screen.getByRole("button", { name: "Comprando..." }))
    fireEvent.click(screen.getByRole("button", { name: "Cancelar" }))

    // assert
    expect(screen.getByRole("button", { name: "Comprando..." })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Comprando..." })).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled()
    expect(action.confirmPurchase).not.toHaveBeenCalled()
    expect(action.cancelPurchase).not.toHaveBeenCalled()
  })

  it("shows the failure while keeping confirmation available for retry", () => {
    // arrange
    action.isConfirming = true
    action.error = "Uno de los vuelos está completo"

    // act
    render(<PurchasePackageAction action={action} />)

    // assert
    expect(screen.getByRole("alert")).toHaveTextContent(action.error)
    expect(screen.getByRole("button", { name: "Confirmar compra" })).toBeEnabled()
  })

  it("replaces buying with a purchased notice and an access to Mis viajes", () => {
    // arrange
    action.purchaseStatus = "purchased"
    render(<PurchasePackageAction action={action} />)

    // act
    fireEvent.click(screen.getByRole("button", { name: "Ver en mis viajes" }))

    // assert
    expect(screen.getByText("Ya compraste este paquete")).toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Comprar paquete" })).not.toBeInTheDocument()
    expect(action.viewMyTrips).toHaveBeenCalledTimes(1)
  })

  it("waits for ownership verification before showing a purchase button", () => {
    // arrange
    action.purchaseStatus = "checking"

    // act
    render(<PurchasePackageAction action={action} />)

    // assert
    expect(screen.getByRole("status")).toHaveTextContent("Consultando tus compras...")
    expect(screen.queryByRole("button")).not.toBeInTheDocument()
  })

  it("offers a lookup retry instead of buying when verification fails", () => {
    // arrange
    action.purchaseStatus = "error"
    render(<PurchasePackageAction action={action} />)

    // act
    fireEvent.click(screen.getByRole("button", { name: "Reintentar consulta" }))

    // assert
    expect(screen.getByRole("alert")).toHaveTextContent("No pudimos verificar si ya compraste este paquete.")
    expect(screen.queryByRole("button", { name: "Comprar paquete" })).not.toBeInTheDocument()
    expect(action.retryPurchaseCheck).toHaveBeenCalledTimes(1)
  })
})
