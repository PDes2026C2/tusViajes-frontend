import { useEffect, useState } from "react"
import { useLocation, useNavigate } from "react-router-dom"
import { LoginForm } from "../components/auth/LoginForm"
import { RegisterAgencyForm } from "../components/auth/RegisterAgencyForm"
import { RegisterBuyerForm } from "../components/auth/RegisterBuyerForm"
import { Header } from "../components/layout/header"
import { useAuth } from "../hooks/useAuth"
import { useHeader } from "../hooks/useHeader"

type PageTab = "login" | "register_buyer" | "register_agency"

export function LoginPage() {
  const [activeTab, setActiveTab] = useState<PageTab>("login")
  const location = useLocation()
  const navigate = useNavigate()
  const headerProps = useHeader()

  const {
    user,
    isAuthenticated,
    isLoading,
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

  const handleTabChange = (tab: PageTab) => {
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
    <div className="min-h-screen bg-slate-50/60 flex flex-col">
      <Header {...headerProps} />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          {/* Header tabs */}
          <div className="flex border-b border-slate-100 pb-4 mb-6 gap-2">
            <button
              type="button"
              onClick={() => handleTabChange("login")}
              className={`pb-2 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
                activeTab === "login"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Iniciar Sesión
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("register_buyer")}
              className={`pb-2 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
                activeTab === "register_buyer"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Crear Cuenta
            </button>
            <button
              type="button"
              onClick={() => handleTabChange("register_agency")}
              className={`pb-2 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
                activeTab === "register_agency"
                  ? "border-primary text-primary"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Soy Agencia
            </button>
          </div>

          {/* Form views */}
          <div>
            {activeTab === "login" && (
              <LoginForm
                onSubmit={handleLoginSubmit}
                isLoading={isLoading}
                onSwitchToRegisterBuyer={() => handleTabChange("register_buyer")}
                onSwitchToRegisterAgency={() => handleTabChange("register_agency")}
              />
            )}

            {activeTab === "register_buyer" && (
              <RegisterBuyerForm
                onSubmit={handleRegisterBuyerSubmit}
                isLoading={isLoading}
                onSwitchToLogin={() => handleTabChange("login")}
              />
            )}

            {activeTab === "register_agency" && (
              <RegisterAgencyForm
                onSubmit={registerAgency}
                isLoading={isLoading}
                onSwitchToLogin={() => handleTabChange("login")}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}

export default LoginPage
