import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { toast } from "react-toastify"
import { useAuth } from "./useAuth"
import { useAuthStore } from "../stores/auth"
import { useAuthModalStore } from "../stores/authModal"
import type { LoginCredentials, RegisterAgencyData, RegisterBuyerData, User } from "../models/auth"
import type { AgencyRegistrationResponseDTO } from "../types/auth"

const mockNavigate = vi.fn()
vi.mock("react-router-dom", () => ({
  useNavigate: () => mockNavigate,
}))

vi.mock("react-toastify", () => ({
  toast: {
    error: vi.fn(),
    success: vi.fn(),
    info: vi.fn(),
    warning: vi.fn(),
  },
}))

vi.mock("../stores/auth", () => ({
  useAuthStore: vi.fn(),
}))

vi.mock("../stores/authModal", () => ({
  useAuthModalStore: vi.fn(),
}))

describe("useAuth hook", () => {
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

  const validCredentials: LoginCredentials = {
    email: "user@test.com",
    password: "password123",
  }

  const buyerData: RegisterBuyerData = {
    firstName: "Juan",
    lastName: "Pérez",
    email: "viajero@gmail.com",
    password: "password123",
    nationalId: "12345678",
    phoneNumber: "1123456789",
  }

  const agencyData: RegisterAgencyData = {
    businessName: "Viajes del Sol",
    taxId: "30-12345678-9",
    email: "contacto@agencia.com",
    password: "password123",
  }

  const agencyPendingResponse: AgencyRegistrationResponseDTO = {
    id: 10,
    email: "contacto@agencia.com",
    businessName: "Viajes del Sol",
    taxId: "30-12345678-9",
    status: "PENDING",
    message: "Postulación recibida",
  }

  let mockLogin: ReturnType<typeof vi.fn>
  let mockRegisterBuyer: ReturnType<typeof vi.fn>
  let mockRegisterAgency: ReturnType<typeof vi.fn>
  let mockLogout: ReturnType<typeof vi.fn>
  let mockOpenModal: ReturnType<typeof vi.fn>
  let mockCloseModal: ReturnType<typeof vi.fn>
  let mockSetModalMode: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockLogin = vi.fn()
    mockRegisterBuyer = vi.fn()
    mockRegisterAgency = vi.fn().mockResolvedValue(agencyPendingResponse)
    mockLogout = vi.fn()
    mockOpenModal = vi.fn()
    mockCloseModal = vi.fn()
    mockSetModalMode = vi.fn()

    const authStoreState = {
      user: null as User | null,
      isAuthenticated: false,
      isLoading: false,
      login: mockLogin,
      registerBuyer: mockRegisterBuyer,
      registerAgency: mockRegisterAgency,
      logout: mockLogout,
    }

    vi.mocked(useAuthStore).mockReturnValue(authStoreState as any)
    ;(useAuthStore as any).getState = () => authStoreState

    vi.mocked(useAuthModalStore).mockReturnValue({
      isOpen: false,
      mode: "login",
      redirectPath: null,
      openModal: mockOpenModal,
      closeModal: mockCloseModal,
      setMode: mockSetModalMode,
    })
  })

  it("redirects to /admin/panel and shows success toast when logging in as ADMIN", async () => {
    // arrange
    const expectedRoute = "/admin/panel"
    mockLogin.mockImplementation(async () => {
      const state = {
        user: mockAdminUser,
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        registerBuyer: mockRegisterBuyer,
        registerAgency: mockRegisterAgency,
        logout: mockLogout,
      }
      vi.mocked(useAuthStore).mockReturnValue(state as any)
      ;(useAuthStore as any).getState = () => state
    })
    const { result } = renderHook(() => useAuth())

    // act
    await act(async () => {
      await result.current.login(validCredentials)
    })

    // assert
    expect(mockCloseModal).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith(expectedRoute)
    expect(toast.success).toHaveBeenCalledWith("¡Bienvenido! Sesión iniciada correctamente.")
  })

  it("redirects to /agency/panel and shows success toast when logging in as AGENCY", async () => {
    // arrange
    const expectedRoute = "/agency/panel"
    mockLogin.mockImplementation(async () => {
      const state = {
        user: mockAgencyUser,
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        registerBuyer: mockRegisterBuyer,
        registerAgency: mockRegisterAgency,
        logout: mockLogout,
      }
      vi.mocked(useAuthStore).mockReturnValue(state as any)
      ;(useAuthStore as any).getState = () => state
    })
    const { result } = renderHook(() => useAuth())

    // act
    await act(async () => {
      await result.current.login(validCredentials)
    })

    // assert
    expect(mockCloseModal).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith(expectedRoute)
    expect(toast.success).toHaveBeenCalledWith("¡Bienvenido! Sesión iniciada correctamente.")
  })

  it("redirects to custom target path when logging in as BUYER", async () => {
    // arrange
    const targetRedirectPath = "/cart"
    mockLogin.mockImplementation(async () => {
      const state = {
        user: mockBuyerUser,
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        registerBuyer: mockRegisterBuyer,
        registerAgency: mockRegisterAgency,
        logout: mockLogout,
      }
      vi.mocked(useAuthStore).mockReturnValue(state as any)
      ;(useAuthStore as any).getState = () => state
    })
    const { result } = renderHook(() => useAuth())

    // act
    await act(async () => {
      await result.current.login(validCredentials, targetRedirectPath)
    })

    // assert
    expect(mockCloseModal).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith(targetRedirectPath)
    expect(toast.success).toHaveBeenCalledWith("¡Bienvenido! Sesión iniciada correctamente.")
  })

  it("surfaces error feedback via toast when login fails", async () => {
    // arrange
    const errorMessage = "Credenciales incorrectas"
    mockLogin.mockRejectedValue(new Error(errorMessage))
    const { result } = renderHook(() => useAuth())

    // act
    await act(async () => {
      await result.current.login(validCredentials)
    })

    // assert
    expect(toast.error).toHaveBeenCalledWith(errorMessage)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("registers a buyer, shows success toast and redirects to destination", async () => {
    // arrange
    const expectedRoute = "/home"
    mockRegisterBuyer.mockImplementation(async () => {
      const state = {
        user: mockBuyerUser,
        isAuthenticated: true,
        isLoading: false,
        login: mockLogin,
        registerBuyer: mockRegisterBuyer,
        registerAgency: mockRegisterAgency,
        logout: mockLogout,
      }
      vi.mocked(useAuthStore).mockReturnValue(state as any)
      ;(useAuthStore as any).getState = () => state
    })
    const { result } = renderHook(() => useAuth())

    // act
    await act(async () => {
      await result.current.registerBuyer(buyerData)
    })

    // assert
    expect(mockRegisterBuyer).toHaveBeenCalledWith(buyerData)
    expect(mockCloseModal).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith(expectedRoute)
    expect(toast.success).toHaveBeenCalledWith("¡Cuenta creada con éxito! Bienvenido a TusViajes.")
  })

  it("surfaces error feedback via toast when buyer registration fails", async () => {
    // arrange
    const errorMessage = "El email ya está registrado"
    mockRegisterBuyer.mockRejectedValue(new Error(errorMessage))
    const { result } = renderHook(() => useAuth())

    // act
    await act(async () => {
      await result.current.registerBuyer(buyerData)
    })

    // assert
    expect(toast.error).toHaveBeenCalledWith(errorMessage)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("registers an agency and surfaces pending approval success message via toast", async () => {
    // arrange
    const expectedMessage = "Postulación recibida"
    const { result } = renderHook(() => useAuth())

    // act
    await act(async () => {
      await result.current.registerAgency(agencyData)
    })

    // assert
    expect(mockRegisterAgency).toHaveBeenCalledWith(agencyData)
    expect(toast.success).toHaveBeenCalledWith(expectedMessage)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("surfaces error feedback via toast when agency registration fails", async () => {
    // arrange
    const errorMessage = "El CUIT ya está registrado"
    mockRegisterAgency.mockRejectedValue(new Error(errorMessage))
    const { result } = renderHook(() => useAuth())

    // act
    await act(async () => {
      await result.current.registerAgency(agencyData)
    })

    // assert
    expect(toast.error).toHaveBeenCalledWith(errorMessage)
    expect(mockNavigate).not.toHaveBeenCalled()
  })

  it("calls store logout and redirects to /home", () => {
    // arrange
    const expectedRoute = "/home"
    const { result } = renderHook(() => useAuth())

    // act
    act(() => {
      result.current.logout()
    })

    // assert
    expect(mockLogout).toHaveBeenCalledTimes(1)
    expect(mockNavigate).toHaveBeenCalledWith(expectedRoute)
  })
})
