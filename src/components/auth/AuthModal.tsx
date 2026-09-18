import { X } from "lucide-react"
import { useAuth } from "../../hooks/useAuth"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog"
import { LoginForm } from "./LoginForm"
import { RegisterAgencyForm } from "./RegisterAgencyForm"
import { RegisterBuyerForm } from "./RegisterBuyerForm"

export function AuthModal() {
  const {
    modal,
    login,
    registerBuyer,
    registerAgency,
    isLoading,
  } = useAuth()

  const getHeaderInfo = () => {
    switch (modal.mode) {
      case "register_buyer":
        return {
          title: "Crear cuenta",
          description: "Registrate para explorar y guardar tus viajes.",
        }
      case "register_agency":
        return {
          title: "Postulate como Agencia",
          description: "Publicá y ofrecé tus paquetes turísticos en Tus Viajes.",
        }
      case "login":
      default:
        return {
          title: "Iniciar Sesión",
          description: "Ingresá a tu cuenta para continuar con tu reserva.",
        }
    }
  }

  const { title, description } = getHeaderInfo()

  return (
    <Dialog
      open={modal.isOpen}
      onOpenChange={(open) => {
        if (!open) {
          modal.close()
        }
      }}
    >
      <DialogContent>
        {/* Close Button */}
        <button
          type="button"
          onClick={() => modal.close()}
          className="absolute right-5 top-5 rounded-full p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-600 transition-colors cursor-pointer"
          aria-label="Cerrar"
        >
          <X className="h-5 w-5" />
        </button>

        <DialogHeader className="pr-8">
          <DialogTitle>{title}</DialogTitle>
          <DialogDescription>{description}</DialogDescription>
        </DialogHeader>

        <div className="mt-2">
          {modal.mode === "login" && (
            <LoginForm
              onSubmit={login}
              isLoading={isLoading}
              onSwitchToRegisterBuyer={() => modal.setMode("register_buyer")}
              onSwitchToRegisterAgency={() => modal.setMode("register_agency")}
            />
          )}

          {modal.mode === "register_buyer" && (
            <RegisterBuyerForm
              onSubmit={registerBuyer}
              isLoading={isLoading}
              onSwitchToLogin={() => modal.setMode("login")}
            />
          )}

          {modal.mode === "register_agency" && (
            <RegisterAgencyForm
              onSubmit={registerAgency}
              isLoading={isLoading}
              onSwitchToLogin={() => modal.setMode("login")}
            />
          )}
        </div>
      </DialogContent>
    </Dialog>
  )
}

export default AuthModal
