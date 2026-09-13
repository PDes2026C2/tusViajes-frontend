import { useNavigate } from "react-router-dom"
import { useAuth } from "./useAuth"
import type { Role } from "../models/auth"

export interface UseHeaderOptions {
  cartCount?: number
}

export function useHeader(options: UseHeaderOptions = {}) {
  const { cartCount = 0 } = options
  const navigate = useNavigate()
  const { user, isAuthenticated, modal, logout } = useAuth()

  const handleNavigateHome = () => {
    navigate("/home")
  }

  const handleMyTripsClick = () => {
    if (!isAuthenticated) {
      modal.open("login", "/my-trips")
    } else {
      navigate("/my-trips")
    }
  }

  const handleCartClick = () => {
    if (!isAuthenticated) {
      modal.open("login", "/cart")
    } else {
      navigate("/cart")
    }
  }

  const handleAgencyClick = () => {
    if (!isAuthenticated) {
      modal.open("register_agency")
    } else if (user?.role === "AGENCY") {
      navigate("/agency/panel")
    } else if (user?.role === "ADMIN") {
      navigate("/admin/panel")
    } else {
      modal.open("register_agency")
    }
  }

  const handleAdminClick = () => {
    navigate("/admin/panel")
  }

  const handleLoginClick = () => {
    modal.open("login")
  }

  const handleLogoutClick = () => {
    logout()
  }

  return {
    cartCount,
    isAuthenticated,
    userEmail: user?.email,
    userRole: user?.role as Role | undefined,
    onNavigateHome: handleNavigateHome,
    onMyTripsClick: handleMyTripsClick,
    onCartClick: handleCartClick,
    onAgencyClick: handleAgencyClick,
    onAdminClick: handleAdminClick,
    onLoginClick: handleLoginClick,
    onLogoutClick: handleLogoutClick,
  }
}

export type HeaderViewProps = ReturnType<typeof useHeader>
