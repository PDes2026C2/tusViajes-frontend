import { useState } from "react"
import { useNavigate } from "react-router-dom"
import type { LoginCredentials, RegisterAgencyData, RegisterBuyerData, User } from "../models/auth"
import { useAuthStore } from "../stores/auth"
import { useAuthModalStore, type AuthModalMode } from "../stores/authModal"
import type { AgencyRegistrationResponseDTO } from "../types/auth"

interface AuthFeedbackState {
  error: string | null
  agencySuccessMessage: string | null
}

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

  const [feedback, setFeedback] = useState<AuthFeedbackState>({
    error: null,
    agencySuccessMessage: null,
  })

  const clearFeedback = () => {
    setFeedback({
      error: null,
      agencySuccessMessage: null,
    })
  }

  const executeRoleRedirect = (currentUser: User, customRedirect?: string) => {
    switch (currentUser.role) {
      case "ADMIN":
        navigate("/admin/panel")
        break
      case "AGENCY":
        navigate("/agency/panel")
        break
      case "BUYER":
      default:
        navigate(customRedirect || modalRedirectPath || "/home")
        break
    }
  }

  const handleLogin = async (
    credentials: LoginCredentials,
    customRedirect?: string
  ): Promise<boolean> => {
    clearFeedback()
    try {
      await storeLogin(credentials)
      const loggedUser = useAuthStore.getState().user
      if (loggedUser) {
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
      setFeedback({ error: message, agencySuccessMessage: null })
      return false
    }
  }

  const handleRegisterBuyer = async (
    data: RegisterBuyerData,
    customRedirect?: string
  ): Promise<boolean> => {
    clearFeedback()
    try {
      await storeRegisterBuyer(data)
      const registeredUser = useAuthStore.getState().user
      if (registeredUser) {
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
      setFeedback({ error: message, agencySuccessMessage: null })
      return false
    }
  }

  const handleRegisterAgency = async (
    data: RegisterAgencyData
  ): Promise<AgencyRegistrationResponseDTO | undefined> => {
    clearFeedback()
    try {
      const response = await storeRegisterAgency(data)
      setFeedback({
        error: null,
        agencySuccessMessage:
          response.message ||
          "Tu postulación ha sido enviada con éxito. Un administrador revisará tu solicitud.",
      })
      return response
    } catch (err: unknown) {
      const message =
        err instanceof Error
          ? err.message
          : "Error al registrar la agencia."
      setFeedback({ error: message, agencySuccessMessage: null })
      return undefined
    }
  }

  const handleLogout = () => {
    clearFeedback()
    storeLogout()
    navigate("/home")
  }

  return {
    // Session state
    user,
    isAuthenticated,
    isLoading,

    // Feedback
    error: feedback.error,
    agencySuccessMessage: feedback.agencySuccessMessage,
    clearFeedback,

    // Modal controls
    modal: {
      isOpen: isModalOpen,
      mode: modalMode,
      redirectPath: modalRedirectPath,
      open: (mode?: AuthModalMode, redirectPath?: string) => {
        clearFeedback()
        openModal(mode, redirectPath)
      },
      close: () => {
        clearFeedback()
        closeModal()
      },
      setMode: (mode: AuthModalMode) => {
        clearFeedback()
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
