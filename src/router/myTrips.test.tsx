import { fireEvent, render, screen } from "@testing-library/react"
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest"
import { AppRouter } from "."
import { Header } from "../components/layout/header"
import { useHeader } from "../hooks/useHeader"
import { useAuth } from "../hooks/useAuth"
import { useMyTripsStore } from "../stores/myTrips"
import { buyerDataSource } from "../datasources/buyer"
import { reviewDataSource } from "../datasources/review"
import { favoritePackage, favoritePackageDTO } from "../tests/fixtures/package"
import { handleViewDetails } from "./packageDetails"
import type { BuyerPurchasesPageDTO } from "../types/buyer"
import type { TravelPackageResponseDTO } from "../types/package"

vi.mock("../hooks/useAuth", () => ({ useAuth: vi.fn() }))
vi.mock("./packageDetails", () => ({ handleViewDetails: vi.fn() }))
vi.mock("../datasources/buyer", () => ({
  buyerDataSource: { getMyPurchases: vi.fn() },
}))
vi.mock("../datasources/review", () => ({
  reviewDataSource: { createReview: vi.fn(), getMyReviews: vi.fn() },
}))
vi.mock("react-toastify", () => ({ toast: { error: vi.fn(), success: vi.fn() } }))
vi.mock("../components/auth/AuthModal", () => ({ default: () => null }))
vi.mock("../pages/home", () => ({
  default: function Home() {
    return <Header {...useHeader()} />
  },
}))
vi.mock("../pages/login", () => ({ default: () => <h1>Iniciar sesión</h1> }))
vi.mock("../pages/favorites", () => ({ default: () => null }))
vi.mock("../pages/adminPanel", () => ({ default: () => null }))
vi.mock("../pages/agencyPanel", () => ({ default: () => null }))

describe("MyTrips navigation and page integration", () => {
  const mockPageDTO: BuyerPurchasesPageDTO = {
    content: [
      {
        id: 101,
        price: 950,
        purchasedAt: "2026-09-01T12:00:00Z",
        travelPackage: favoritePackageDTO,
      },
    ],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
    first: true,
    last: true,
    empty: false,
  }

  beforeEach(() => {
    vi.useFakeTimers({ toFake: ["Date"] })
    vi.setSystemTime(new Date("2026-10-12T12:00:00Z"))
    vi.resetAllMocks()
    useMyTripsStore.getState().reset()
    window.history.replaceState(null, "", "/home")
    vi.mocked(useAuth).mockReturnValue({
      isAuthenticated: true,
      user: { id: 7, email: "buyer@example.com", role: "BUYER" },
      modal: { open: vi.fn() },
      logout: vi.fn(),
    } as unknown as ReturnType<typeof useAuth>)
    vi.mocked(buyerDataSource.getMyPurchases).mockResolvedValue(mockPageDTO)
    vi.mocked(reviewDataSource.getMyReviews).mockResolvedValue({
      content: [],
      totalElements: 0,
      totalPages: 0,
      size: 100,
      number: 0,
    })
  })

  afterEach(() => {
    vi.useRealTimers()
  })

  it("navigates to /my-trips when clicking 'Mis Viajes' in the navbar", async () => {
    // arrange
    render(<AppRouter />)

    // act
    fireEvent.click(screen.getByRole("button", { name: "Mis Viajes" }))

    // assert
    await screen.findByText(favoritePackageDTO.name)
    expect(window.location.pathname).toBe("/my-trips")
    expect(screen.getByRole("heading", { name: "Mis Viajes" })).toBeInTheDocument()
    expect(buyerDataSource.getMyPurchases).toHaveBeenCalledTimes(1)
  })

  it("loads the buyer's trips when opening /my-trips directly", async () => {
    // arrange
    window.history.replaceState(null, "", "/my-trips")

    // act
    render(<AppRouter />)

    // assert
    await screen.findByText(favoritePackageDTO.name)
    expect(buyerDataSource.getMyPurchases).toHaveBeenCalledTimes(1)
  })

  it("retries a failed trips request from the view", async () => {
    // arrange
    window.history.replaceState(null, "", "/my-trips")
    vi.mocked(buyerDataSource.getMyPurchases).mockRejectedValueOnce(new Error("Error de conexión"))
    render(<AppRouter />)

    // act
    fireEvent.click(await screen.findByRole("button", { name: /Reintentar/ }))

    // assert
    await screen.findByText(favoritePackageDTO.name)
    expect(screen.queryByRole("alert")).not.toBeInTheDocument()
    expect(buyerDataSource.getMyPurchases).toHaveBeenCalledTimes(2)
  })

  it("triggers package detail action from the trip card", async () => {
    // arrange
    window.history.replaceState(null, "", "/my-trips")
    render(<AppRouter />)

    // act
    fireEvent.click(await screen.findByRole("button", { name: "Ver detalle" }))

    // assert
    expect(handleViewDetails).toHaveBeenCalledWith(favoritePackage)
  })

  it("redirects unauthenticated visitor to login when opening /my-trips directly", async () => {
    // arrange
    window.history.replaceState(null, "", "/my-trips")
    vi.mocked(useAuth).mockReturnValue({
      ...vi.mocked(useAuth)(),
      isAuthenticated: false,
      user: null,
    })

    // act
    render(<AppRouter />)

    // assert
    await screen.findByRole("heading", { name: "Iniciar sesión" })
    expect(window.location.pathname).toBe("/login")
    expect(buyerDataSource.getMyPurchases).not.toHaveBeenCalled()
  })

  it("opens review modal from completed trips and displays 'Reseña enviada' after submission", async () => {
    // arrange
    const completedPackageDTO: TravelPackageResponseDTO = {
      ...favoritePackageDTO,
      id: 102,
      name: "Viaje Histórico Bariloche",
      initialDate: "2024-01-10T10:00:00Z",
      finalDate: "2024-01-17T10:00:00Z",
    }
    const completedPageDTO: BuyerPurchasesPageDTO = {
      content: [
        {
          id: 201,
          price: 950,
          purchasedAt: "2024-01-01T12:00:00Z",
          travelPackage: completedPackageDTO,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false,
    }
    window.history.replaceState(null, "", "/my-trips")
    vi.mocked(buyerDataSource.getMyPurchases).mockResolvedValue(completedPageDTO)
    vi.mocked(reviewDataSource.createReview).mockResolvedValue({
      id: 501,
      buyerId: 7,
      travelPackageId: 102,
      score: 9,
      comment: "Excelente todo!",
      createdAt: new Date().toISOString(),
    })
    render(<AppRouter />)

    // act - switch to Finalizados
    fireEvent.click(await screen.findByRole("button", { name: /Finalizados/ }))

    // act - click Dejar reseña
    const reviewButton = await screen.findByRole("button", { name: "Dejar reseña" })
    fireEvent.click(reviewButton)

    // assert - modal opened
    expect(screen.getByRole("heading", { name: "¿Cómo fue tu viaje?" })).toBeInTheDocument()

    // act - select score 9 and add comment
    const score9 = screen.getByRole("radio", { name: "Puntaje 9 de 10" })
    fireEvent.click(score9)
    fireEvent.change(screen.getByPlaceholderText(/Contanos qué te pareció/), {
      target: { value: "Excelente todo!" },
    })
    fireEvent.click(screen.getByRole("button", { name: "Publicar reseña" }))

    // assert
    await screen.findByText("Reseña enviada")
    expect(reviewDataSource.createReview).toHaveBeenCalledWith(102, {
      score: 9,
      comment: "Excelente todo!",
    })
  })

  it("displays 'Reseña enviada' when package was previously reviewed on server", async () => {
    // arrange
    const completedPackageDTO: TravelPackageResponseDTO = {
      ...favoritePackageDTO,
      id: 105,
      name: "Paquete Ya Reseñado",
      initialDate: "2024-01-10T10:00:00Z",
      finalDate: "2024-01-17T10:00:00Z",
    }
    const completedPageDTO: BuyerPurchasesPageDTO = {
      content: [
        {
          id: 205,
          price: 950,
          purchasedAt: "2024-01-01T12:00:00Z",
          travelPackage: completedPackageDTO,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false,
    }
    window.history.replaceState(null, "", "/my-trips")
    vi.mocked(buyerDataSource.getMyPurchases).mockResolvedValue(completedPageDTO)
    vi.mocked(reviewDataSource.getMyReviews).mockResolvedValue({
      content: [
        {
          id: 999,
          buyerId: 7,
          travelPackageId: 105,
          score: 10,
          comment: "Previamente reseñado",
          createdAt: "2024-01-20T10:00:00Z",
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 100,
      number: 0,
    })

    // act
    render(<AppRouter />)
    fireEvent.click(await screen.findByRole("button", { name: /Finalizados/ }))

    // assert
    await screen.findByText("Reseña enviada")
    expect(screen.queryByRole("button", { name: "Dejar reseña" })).not.toBeInTheDocument()
    expect(reviewDataSource.getMyReviews).toHaveBeenCalled()
  })
})
