import { useNavigate } from "react-router-dom"
import { toast } from "react-toastify"
import type { LoginCredentials, RegisterAgencyData, RegisterBuyerData, User } from "../models/auth"
import { useAuthStore } from "../stores/auth"
import { useAuthModalStore, type AuthModalMode } from "../stores/authModal"
import type { AgencyRegistrationResponseDTO } from "../types/auth"
import { getAuthRedirectPath } from "../utils/authRedirect"

export function useAuth() {
  const navigate = useNavigate()

  const {
    user,
    isAuthenticated,
    isLoading,
    login: storeLogin,
    registerBuyer: storeRegisterBuyer,
    registerAgency: storeRegisterAgency,
    logout: storeLogout,
  } = useAuthStore()

  const {
    isOpen: isModalOpen,
    mode: modalMode,
    redirectPath: modalRedirectPath,
    openModal,
    closeModal,
    setMode: setModalMode,
  } = useAuthModalStore()

  const executeRoleRedirect = (currentUser: User, customRedirect?: string) => {
    void navigate(getAuthRedirectPath(currentUser.role, customRedirect || modalRedirectPath))
  }

  const handleLogin = async (
    credentials: LoginCredentials,
    customRedirect?: string
  ): Promise<boolean> => {
    try {
      await storeLogin(credentials)
      const loggedUser = useAuthStore.getState().user
      if (loggedUser) {
        toast.success("¡Bienvenido! Sesión iniciada correctamente.")
        closeModal()
        executeRoleRedirect(loggedUser, customRedirect)
        return true
      }
      return false
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al iniciar sesión. Verifique sus credenciales."
      toast.error(message)
      return false
    }
  }

  const handleRegisterBuyer = async (
    data: RegisterBuyerData,
    customRedirect?: string
  ): Promise<boolean> => {
    try {
      await storeRegisterBuyer(data)
      const registeredUser = useAuthStore.getState().user
      if (registeredUser) {
        toast.success("¡Cuenta creada con éxito! Bienvenido a TusViajes.")
        closeModal()
        executeRoleRedirect(registeredUser, customRedirect)
        return true
      }
      return false
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al registrarse como comprador."
      toast.error(message)
      return false
    }
  }

  const handleRegisterAgency = async (
    data: RegisterAgencyData
  ): Promise<AgencyRegistrationResponseDTO | undefined> => {
    try {
      const response = await storeRegisterAgency(data)
      toast.success(
        response.message ||
          "Tu postulación ha sido enviada con éxito. Un administrador revisará tu solicitud."
      )
      return response
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al registrar la agencia."
      toast.error(message)
      return undefined
    }
  }

  const handleLogout = () => {
    storeLogout()
    toast.success("Sesión cerrada con éxito.")
    navigate("/home")
  }

  return {
    // Session state
    user,
    isAuthenticated,
    isLoading,

    // Modal controls
    modal: {
      isOpen: isModalOpen,
      mode: modalMode,
      redirectPath: modalRedirectPath,
      open: (mode?: AuthModalMode, redirectPath?: string) => {
        openModal(mode, redirectPath)
      },
      close: () => {
        closeModal()
      },
      setMode: (mode: AuthModalMode) => {
        setModalMode(mode)
      },
    },

    // Actions
    login: handleLogin,
    registerBuyer: handleRegisterBuyer,
    registerAgency: handleRegisterAgency,
    logout: handleLogout,
  }
}
