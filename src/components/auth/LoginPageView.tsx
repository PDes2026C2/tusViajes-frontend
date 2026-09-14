import type { LoginCredentials, RegisterBuyerData } from "../../models/auth"
import type { HeaderProps } from "../layout/header"
import { Header } from "../layout/header"
import { LoginForm } from "./LoginForm"
import { RegisterAgencyForm } from "./RegisterAgencyForm"
import { RegisterBuyerForm } from "./RegisterBuyerForm"

export type AuthPageTab = "login" | "register_buyer" | "register_agency"

interface LoginPageViewProps {
  headerProps: HeaderProps
  activeTab: AuthPageTab
  isLoading: boolean
  error: string | null
  agencySuccessMessage: string | null
  onTabChange: (tab: AuthPageTab) => void
  onLoginSubmit: (credentials: LoginCredentials) => Promise<void> | void
  onRegisterBuyerSubmit: (data: RegisterBuyerData) => Promise<void> | void
  onRegisterAgencySubmit: Parameters<typeof RegisterAgencyForm>[0]["onSubmit"]
}

export function LoginPageView({
  headerProps,
  activeTab,
  isLoading,
  error,
  agencySuccessMessage,
  onTabChange,
  onLoginSubmit,
  onRegisterBuyerSubmit,
  onRegisterAgencySubmit,
}: LoginPageViewProps) {
  return (
    <div className="min-h-screen bg-slate-50/60 flex flex-col">
      <Header {...headerProps} />

      <main className="flex-1 flex items-center justify-center px-4 py-12">
        <div className="w-full max-w-lg bg-white border border-slate-200 rounded-3xl p-6 sm:p-8 shadow-sm">
          <div className="flex border-b border-slate-100 pb-4 mb-6 gap-2">
            <button
              type="button"
              onClick={() => onTabChange("login")}
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
              onClick={() => onTabChange("register_buyer")}
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
              onClick={() => onTabChange("register_agency")}
              className={`pb-2 text-sm font-semibold border-b-2 cursor-pointer transition-colors ${
                activeTab === "register_agency"
                  ? "border-[#084d6e] text-[#084d6e]"
                  : "border-transparent text-slate-500 hover:text-slate-800"
              }`}
            >
              Soy Agencia
            </button>
          </div>

          <div>
            {activeTab === "login" && (
              <LoginForm
                onSubmit={onLoginSubmit}
                isLoading={isLoading}
                error={error}
                onSwitchToRegisterBuyer={() => onTabChange("register_buyer")}
                onSwitchToRegisterAgency={() => onTabChange("register_agency")}
              />
            )}

            {activeTab === "register_buyer" && (
              <RegisterBuyerForm
                onSubmit={onRegisterBuyerSubmit}
                isLoading={isLoading}
                error={error}
                onSwitchToLogin={() => onTabChange("login")}
              />
            )}

            {activeTab === "register_agency" && (
              <RegisterAgencyForm
                onSubmit={onRegisterAgencySubmit}
                isLoading={isLoading}
                error={error}
                successMessage={agencySuccessMessage}
                onSwitchToLogin={() => onTabChange("login")}
              />
            )}
          </div>
        </div>
      </main>
    </div>
  )
}
