import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LoginPageView, type AuthPageTab } from "../components/auth/LoginPageView"
import { useAuth } from "../hooks/useAuth"
import { useHeader } from "../hooks/useHeader"

export function LoginPage() {
  const [activeTab, setActiveTab] = useState<AuthPageTab>("login")
  const location = useLocation()
  const navigate = useNavigate()
  const headerProps = useHeader()

  const {
    user,
    isAuthenticated,
    isLoading,
    error,
    agencySuccessMessage,
    clearFeedback,
    login,
    registerBuyer,
    registerAgency,
  } = useAuth()

  // Target path passed from ProtectedRoute (e.g., state="/cart")
  const targetRedirect = (location.state as string) || "/home"

  // If already logged in, redirect immediately according to role
  useEffect(() => {
    if (isAuthenticated && user) {
      if (user.role === "ADMIN") {
        navigate("/admin/panel", { replace: true })
      } else if (user.role === "AGENCY") {
        navigate("/agency/panel", { replace: true })
      } else {
        navigate(targetRedirect, { replace: true })
      }
    }
  }, [isAuthenticated, user, navigate, targetRedirect])

  const handleTabChange = (tab: AuthPageTab) => {
    clearFeedback()
    setActiveTab(tab)
  }

  const handleLoginSubmit = async (credentials: Parameters<typeof login>[0]) => {
    await login(credentials, targetRedirect)
  }

  const handleRegisterBuyerSubmit = async (
    data: Parameters<typeof registerBuyer>[0]
  ) => {
    await registerBuyer(data, targetRedirect)
  }

  return (
    <LoginPageView
      headerProps={headerProps}
      activeTab={activeTab}
      isLoading={isLoading}
      error={error}
      agencySuccessMessage={agencySuccessMessage}
      onTabChange={handleTabChange}
      onLoginSubmit={handleLoginSubmit}
      onRegisterBuyerSubmit={handleRegisterBuyerSubmit}
      onRegisterAgencySubmit={registerAgency}
    />
  )
}

export default LoginPage
