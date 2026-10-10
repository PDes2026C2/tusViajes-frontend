import { useNavigate } from "react-router-dom"
import { useAuth } from "./useAuth"
import type { Role } from "../models/auth"

export function useHeader() {
  const navigate = useNavigate()
  const { user, isAuthenticated, modal, logout } = useAuth()

  const handleNavigateHome = () => {
    void navigate("/home")
  }

  const handleMyTripsClick = () => {
    if (!isAuthenticated) {
      modal.open("login", "/my-trips")
    } else {
      void navigate("/my-trips")
    }
  }

  const handleFavoritesClick = () => {
    if (!isAuthenticated) {
      modal.open("login", "/favorites")
    } else if (user?.role === "BUYER") {
      void navigate("/favorites")
    }
  }

  const handleAgencyClick = () => {
    if (!isAuthenticated) {
      modal.open("register_agency")
    } else if (user?.role === "AGENCY") {
      void navigate("/agency/panel")
    } else if (user?.role === "ADMIN") {
      void navigate("/admin/panel")
    } else {
      modal.open("register_agency")
    }
  }

  const handleAdminClick = () => {
    void navigate("/admin/panel")
  }

  const handleLoginClick = () => {
    modal.open("login")
  }

  const handleLogoutClick = () => {
    logout()
  }

  return {
    isAuthenticated,
    userEmail: user?.email,
    userRole: user?.role as Role | undefined,
    onNavigateHome: handleNavigateHome,
    onMyTripsClick: handleMyTripsClick,
    onFavoritesClick: handleFavoritesClick,
    onAgencyClick: handleAgencyClick,
    onAdminClick: handleAdminClick,
    onLoginClick: handleLoginClick,
    onLogoutClick: handleLogoutClick,
  }
}

export type HeaderViewProps = ReturnType<typeof useHeader>
