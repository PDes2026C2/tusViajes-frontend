import { renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useHeader } from "./useHeader"
import { useAuth } from "./useAuth"
import type { User } from "../models/auth"

const mockNavigate = vi.fn()
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock("./useAuth", () => ({
  useAuth: vi.fn(),
}))

describe("useHeader hook", () => {
  const mockAdminUser: User = {
    id: 1,
    email: "admin@tusviajes.com",
    role: "ADMIN",
  }

  const mockAgencyUser: User = {
    id: 2,
    email: "contacto@agencia.com",
    role: "AGENCY",
  }

  const mockBuyerUser: User = {
    id: 3,
    email: "viajero@gmail.com",
    role: "BUYER",
  }

  let mockOpenModal: ReturnType<typeof vi.fn>
  let mockLogout: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockOpenModal = vi.fn()
    mockLogout = vi.fn()

    vi.mocked(useAuth).mockReturnValue({
      user: null,
      isAuthenticated: false,
      isLoading: false,
      error: null,
      agencySuccessMessage: null,
      clearFeedback: vi.fn(),
      modal: {
        isOpen: false,
        mode: "login",
        redirectPath: null,
        open: mockOpenModal,
        close: vi.fn(),
        setMode: vi.fn(),
      },
      login: vi.fn(),
      registerBuyer: vi.fn(),
      registerAgency: vi.fn(),
      logout: mockLogout,
    } as any)
  })

  it("returns default state for unauthenticated visitor", () => {
    // arrange
    const { result } = renderHook(() => useHeader())

    // act & assert
    expect(result.current.isAuthenticated).toBe(false)
    expect(result.current.userEmail).toBeUndefined()
    expect(result.current.userRole).toBeUndefined()
  })

  it("navigates to /home when onNavigateHome is triggered", () => {
    // arrange
    const expectedRoute = "/home"
    const { result } = renderHook(() => useHeader())

    // act
    result.current.onNavigateHome()

    // assert
    expect(mockNavigate).toHaveBeenCalledWith(expectedRoute)
  })

  it("opens login modal with /my-trips redirect when clicking My Trips while unauthenticated", () => {
    // arrange
    const expectedModalMode = "login"
    const expectedRedirect = "/my-trips"
    const { result } = renderHook(() => useHeader())

    // act
    result.current.onMyTripsClick()

    // assert
    expect(mockOpenModal).toHaveBeenCalledWith(expectedModalMode, expectedRedirect)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("navigates to /my-trips when clicking My Trips while authenticated", () => {
    // arrange
    const expectedRoute = "/my-trips"
    vi.mocked(useAuth).mockReturnValue({
      user: mockBuyerUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      agencySuccessMessage: null,
      clearFeedback: vi.fn(),
      modal: {
        isOpen: false,
        mode: "login",
        redirectPath: null,
        open: mockOpenModal,
        close: vi.fn(),
        setMode: vi.fn(),
      },
      login: vi.fn(),
      registerBuyer: vi.fn(),
      registerAgency: vi.fn(),
      logout: mockLogout,
    } as any)
    const { result } = renderHook(() => useHeader())

    // act
    result.current.onMyTripsClick()

    // assert
    expect(mockNavigate).toHaveBeenCalledWith(expectedRoute)
    expect(mockOpenModal).not.toHaveBeenCalled()
  })

  it("opens register_agency modal when onAgencyClick is called while unauthenticated", () => {
    // arrange
    const expectedModalMode = "register_agency"
    const { result } = renderHook(() => useHeader())

    // act
    result.current.onAgencyClick()

    // assert
    expect(mockOpenModal).toHaveBeenCalledWith(expectedModalMode)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("navigates to /agency/panel when onAgencyClick is called as AGENCY", () => {
    // arrange
    const expectedRoute = "/agency/panel"
    vi.mocked(useAuth).mockReturnValue({
      user: mockAgencyUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      agencySuccessMessage: null,
      clearFeedback: vi.fn(),
      modal: {
        isOpen: false,
        mode: "login",
        redirectPath: null,
        open: mockOpenModal,
        close: vi.fn(),
        setMode: vi.fn(),
      },
      login: vi.fn(),
      registerBuyer: vi.fn(),
      registerAgency: vi.fn(),
      logout: mockLogout,
    } as any)
    const { result } = renderHook(() => useHeader())

    // act
    result.current.onAgencyClick()

    // assert
    expect(mockNavigate).toHaveBeenCalledWith(expectedRoute)
    expect(mockOpenModal).not.toHaveBeenCalled()
  })

  it("navigates to /admin/panel when onAgencyClick is called as ADMIN", () => {
    // arrange
    const expectedRoute = "/admin/panel"
    vi.mocked(useAuth).mockReturnValue({
      user: mockAdminUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      agencySuccessMessage: null,
      clearFeedback: vi.fn(),
      modal: {
        isOpen: false,
        mode: "login",
        redirectPath: null,
        open: mockOpenModal,
        close: vi.fn(),
        setMode: vi.fn(),
      },
      login: vi.fn(),
      registerBuyer: vi.fn(),
      registerAgency: vi.fn(),
      logout: mockLogout,
    } as any)
    const { result } = renderHook(() => useHeader())

    // act
    result.current.onAgencyClick()

    // assert
    expect(mockNavigate).toHaveBeenCalledWith(expectedRoute)
    expect(mockOpenModal).not.toHaveBeenCalled()
  })

  it("opens register_agency modal when onAgencyClick is called as BUYER", () => {
    // arrange
    const expectedModalMode = "register_agency"
    vi.mocked(useAuth).mockReturnValue({
      user: mockBuyerUser,
      isAuthenticated: true,
      isLoading: false,
      error: null,
      agencySuccessMessage: null,
      clearFeedback: vi.fn(),
      modal: {
        isOpen: false,
        mode: "login",
        redirectPath: null,
        open: mockOpenModal,
        close: vi.fn(),
        setMode: vi.fn(),
      },
      login: vi.fn(),
      registerBuyer: vi.fn(),
      registerAgency: vi.fn(),
      logout: mockLogout,
    } as any)
    const { result } = renderHook(() => useHeader())

    // act
    result.current.onAgencyClick()

    // assert
    expect(mockOpenModal).toHaveBeenCalledWith(expectedModalMode)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("navigates to /admin/panel when onAdminClick is triggered", () => {
    // arrange
    const expectedRoute = "/admin/panel"
    const { result } = renderHook(() => useHeader())

    // act
    result.current.onAdminClick()

    // assert
    expect(mockNavigate).toHaveBeenCalledWith(expectedRoute)
  })

  it("opens login modal when onLoginClick is triggered", () => {
    // arrange
    const expectedModalMode = "login"
    const { result } = renderHook(() => useHeader())

    // act
    result.current.onLoginClick()

    // assert
    expect(mockOpenModal).toHaveBeenCalledWith(expectedModalMode)
  })

  it("calls logout when onLogoutClick is triggered", () => {
    // arrange
    const { result } = renderHook(() => useHeader())

    // act
    result.current.onLogoutClick()

    // assert
    expect(mockLogout).toHaveBeenCalledTimes(1)
  })
})
