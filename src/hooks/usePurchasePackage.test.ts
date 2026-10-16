import { act, renderHook, waitFor } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi, type Mock } from "vitest"
import { toast } from "react-toastify"
import { useAuth } from "./useAuth"
import { usePurchasePackage } from "./usePurchasePackage"
import { purchaseDataSource } from "../datasources/purchase"
import { buyerDataSource } from "../datasources/buyer"
import { favoritePackage, favoritePackageDTO } from "../tests/fixtures/package"
import type { BuyerPurchaseResponseDTO } from "../types/buyer"

const navigate = vi.fn()
vi.mock("react-router-dom", () => ({ useNavigate: () => navigate }))
vi.mock("./useAuth", () => ({ useAuth: vi.fn() }))
vi.mock("../datasources/purchase", () => ({ purchaseDataSource: { purchasePackage: vi.fn() } }))
vi.mock("../datasources/buyer", () => ({ buyerDataSource: { hasPurchasedPackage: vi.fn() } }))
vi.mock("react-toastify", () => ({ toast: { success: vi.fn() } }))

describe("usePurchasePackage", () => {
  let onClose: Mock<() => void>
  let openLogin: ReturnType<typeof vi.fn>
  let purchasedPackage: BuyerPurchaseResponseDTO

  beforeEach(() => {
    vi.resetAllMocks()
    vi.spyOn(Date, "now").mockReturnValue(new Date("2026-10-01T12:00:00Z").getTime())
    onClose = vi.fn()
    openLogin = vi.fn()
    purchasedPackage = { id: 501, price: 950, purchasedAt: "2026-10-01T12:00:00", travelPackage: favoritePackageDTO }
    vi.mocked(useAuth).mockReturnValue({
      user: { id: 7, email: "buyer@example.com", role: "BUYER" },
      isAuthenticated: true,
      modal: { open: openLogin },
    } as unknown as ReturnType<typeof useAuth>)
    vi.mocked(purchaseDataSource.purchasePackage).mockResolvedValue(purchasedPackage)
    vi.mocked(buyerDataSource.hasPurchasedPackage).mockResolvedValue(false)
  })

  afterEach(() => { vi.restoreAllMocks() })

  async function renderAvailablePackage(pkg = favoritePackage) {
    const hook = renderHook(() => usePurchasePackage(pkg, onClose))
    await waitFor(() => expect(hook.result.current.purchaseStatus).toBe("available"))
    return hook
  }

  it("requires explicit confirmation and can cancel without making a purchase", async () => {
    // arrange
    const { result } = await renderAvailablePackage()

    // act
    await act(async () => { await result.current.confirmPurchase() })
    act(() => { result.current.startPurchase() })

    // assert
    expect(result.current.isConfirming).toBe(true)
    expect(purchaseDataSource.purchasePackage).not.toHaveBeenCalled()

    // act
    act(() => { result.current.cancelPurchase() })

    // assert
    expect(result.current.isConfirming).toBe(false)
    expect(onClose).not.toHaveBeenCalled()
    expect(purchaseDataSource.purchasePackage).not.toHaveBeenCalled()
  })

  it("sends visitors to login without creating a purchase", () => {
    // arrange
    vi.mocked(useAuth).mockReturnValue({ ...vi.mocked(useAuth)(), user: null, isAuthenticated: false })
    const { result } = renderHook(() => usePurchasePackage(favoritePackage, onClose))

    // act
    act(() => { result.current.startPurchase() })

    // assert
    expect(result.current.requiresLogin).toBe(true)
    expect(openLogin).toHaveBeenCalledWith("login")
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(purchaseDataSource.purchasePackage).not.toHaveBeenCalled()
  })

  it.each(["AGENCY", "ADMIN"] as const)("prevents purchases by %s accounts", async (role) => {
    // arrange
    vi.mocked(useAuth).mockReturnValue({ ...vi.mocked(useAuth)(), user: { id: 8, email: "other@example.com", role } })
    const { result } = renderHook(() => usePurchasePackage(favoritePackage, onClose))

    // act
    act(() => { result.current.startPurchase() })
    await act(async () => { await result.current.confirmPurchase() })

    // assert
    expect(result.current.canPurchase).toBe(false)
    expect(result.current.isConfirming).toBe(false)
    expect(purchaseDataSource.purchasePackage).not.toHaveBeenCalled()
  })

  it("creates the purchase and opens Mis viajes after success", async () => {
    // arrange
    const { result } = await renderAvailablePackage()
    act(() => { result.current.startPurchase() })

    // act
    await act(async () => { await result.current.confirmPurchase() })

    // assert
    expect(purchaseDataSource.purchasePackage).toHaveBeenCalledExactlyOnceWith(favoritePackage.id)
    expect(onClose).toHaveBeenCalledTimes(1)
    expect(toast.success).toHaveBeenCalledWith("¡Compra realizada! Encontrá tu paquete en Mis viajes.")
    expect(navigate).toHaveBeenCalledWith("/my-trips")
    expect(result.current.isConfirming).toBe(false)
    expect(result.current.isPurchasing).toBe(false)
  })

  it("prevents duplicate submissions and cancellation while a request is pending", async () => {
    // arrange
    let finishPurchase!: (purchase: BuyerPurchaseResponseDTO) => void
    vi.mocked(purchaseDataSource.purchasePackage).mockReturnValue(new Promise(resolve => { finishPurchase = resolve }))
    const { result } = await renderAvailablePackage()
    act(() => { result.current.startPurchase() })
    let pendingPurchase!: Promise<void>

    // act
    act(() => {
      pendingPurchase = result.current.confirmPurchase()
      void result.current.confirmPurchase()
      result.current.cancelPurchase()
    })

    // assert
    expect(purchaseDataSource.purchasePackage).toHaveBeenCalledTimes(1)
    expect(result.current.isPurchasing).toBe(true)
    expect(result.current.isConfirming).toBe(true)

    // act
    await act(async () => { finishPurchase(purchasedPackage); await pendingPurchase })

    // assert
    expect(navigate).toHaveBeenCalledTimes(1)
    expect(result.current.isPurchasing).toBe(false)
  })

  it.each([
    "Uno de los vuelos asociados no cuenta con cupo disponible",
    "No se pudo conectar con el servidor",
  ])("keeps confirmation open on error and allows retrying: %s", async (message) => {
    // arrange
    vi.mocked(purchaseDataSource.purchasePackage).mockRejectedValueOnce(new Error(message))
    const { result } = await renderAvailablePackage()
    act(() => { result.current.startPurchase() })

    // act
    await act(async () => { await result.current.confirmPurchase() })

    // assert
    expect(result.current.error).toBe(message)
    expect(result.current.isConfirming).toBe(true)
    expect(result.current.isPurchasing).toBe(false)
    expect(navigate).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()

    // act
    await act(async () => { await result.current.confirmPurchase() })

    // assert
    expect(result.current.error).toBeNull()
    expect(navigate).toHaveBeenCalledWith("/my-trips")
  })

  it("rejects a package that has already started without submitting it", async () => {
    // arrange
    const startedPackage = { ...favoritePackage, initialDate: new Date("2026-09-01T12:00:00Z") }
    const { result } = await renderAvailablePackage(startedPackage)
    act(() => { result.current.startPurchase() })

    // act
    await act(async () => { await result.current.confirmPurchase() })

    // assert
    expect(result.current.error).toBe("Este viaje ya comenzó y no se puede comprar.")
    expect(purchaseDataSource.purchasePackage).not.toHaveBeenCalled()
  })

  it("does not navigate or notify after the purchase view has unmounted", async () => {
    // arrange
    let finishPurchase!: (purchase: BuyerPurchaseResponseDTO) => void
    vi.mocked(purchaseDataSource.purchasePackage).mockReturnValue(new Promise(resolve => { finishPurchase = resolve }))
    const { result, unmount } = await renderAvailablePackage()
    act(() => { result.current.startPurchase() })
    let pendingPurchase!: Promise<void>
    act(() => { pendingPurchase = result.current.confirmPurchase() })

    // act
    unmount()
    await act(async () => { finishPurchase(purchasedPackage); await pendingPurchase })

    // assert
    expect(toast.success).not.toHaveBeenCalled()
    expect(navigate).not.toHaveBeenCalled()
    expect(onClose).not.toHaveBeenCalled()
  })

  it("blocks an existing purchase and offers navigation to Mis viajes", async () => {
    // arrange
    vi.mocked(buyerDataSource.hasPurchasedPackage).mockResolvedValue(true)
    const { result } = renderHook(() => usePurchasePackage(favoritePackage, onClose))
    await waitFor(() => expect(result.current.purchaseStatus).toBe("purchased"))

    // act
    act(() => { result.current.startPurchase() })
    await act(async () => { await result.current.confirmPurchase() })
    act(() => { result.current.viewMyTrips() })

    // assert
    expect(result.current.isConfirming).toBe(false)
    expect(purchaseDataSource.purchasePackage).not.toHaveBeenCalled()
    expect(navigate).toHaveBeenCalledWith("/my-trips")
  })

  it("blocks buying while ownership is unknown and allows retrying a failed lookup", async () => {
    // arrange
    vi.mocked(buyerDataSource.hasPurchasedPackage).mockRejectedValueOnce(new Error("Servicio no disponible"))
    const { result } = renderHook(() => usePurchasePackage(favoritePackage, onClose))

    // act
    act(() => { result.current.startPurchase() })
    await waitFor(() => expect(result.current.purchaseStatus).toBe("error"))
    act(() => { result.current.startPurchase() })

    // assert
    expect(result.current.isConfirming).toBe(false)
    expect(purchaseDataSource.purchasePackage).not.toHaveBeenCalled()

    // act
    act(() => { result.current.retryPurchaseCheck() })
    await waitFor(() => expect(result.current.purchaseStatus).toBe("available"))

    // assert
    expect(buyerDataSource.hasPurchasedPackage).toHaveBeenCalledTimes(2)
  })

  it("recognizes a purchase completed in another tab instead of offering another retry", async () => {
    // arrange
    vi.mocked(purchaseDataSource.purchasePackage).mockRejectedValueOnce(new Error("El comprador ya adquirió este paquete de viaje"))
    const { result } = await renderAvailablePackage()
    act(() => { result.current.startPurchase() })

    // act
    await act(async () => { await result.current.confirmPurchase() })
    await act(async () => { await result.current.confirmPurchase() })

    // assert
    expect(result.current.purchaseStatus).toBe("purchased")
    expect(result.current.isConfirming).toBe(false)
    expect(result.current.error).toBeNull()
    expect(purchaseDataSource.purchasePackage).toHaveBeenCalledTimes(1)
    expect(navigate).not.toHaveBeenCalled()
  })
})
