import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Loader2, Lock, Mail } from "lucide-react"
import { cn } from "cn"
import { loginSchema, type LoginFormData } from "../../models/auth.schema"
import type { LoginCredentials } from "../../models/auth"
import { Button } from "../ui/button"

interface LoginFormProps {
  onSubmit: (credentials: LoginCredentials) => Promise<unknown> | void
  isLoading?: boolean
  onSwitchToRegisterBuyer?: () => void
  onSwitchToRegisterAgency?: () => void
}

export function LoginForm({
  onSubmit,
  isLoading = false,
  onSwitchToRegisterBuyer,
  onSwitchToRegisterAgency,
}: LoginFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<LoginFormData>({
    resolver: zodResolver(loginSchema),
    defaultValues: {
      email: "",
      password: "",
    },
    mode: "onBlur",
  })

  const handleFormSubmit = async (data: LoginFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-4 text-left">

      {/* Email */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="email" className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
          Correo electrónico
        </label>
        <div className="relative flex items-center">
          <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="email"
            placeholder="tu@email.com"
            autoComplete="email"
            disabled={isLoading}
            {...register("email")}
            className={cn(
              "w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all disabled:opacity-50",
              errors.email
                ? "border-error focus:border-error focus:ring-error/20"
                : "border-slate-200 focus:border-primary focus:ring-primary/20"
            )}
            id="email"
          />
        </div>
        {errors.email && (
          <span className="text-xs text-error font-medium">{errors.email.message}</span>
        )}
      </div>

      {/* Password */}
      <div className="flex flex-col gap-1.5">
        <label htmlFor="password" className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
          Contraseña
        </label>
        <div className="relative flex items-center">
          <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="password"
            placeholder="••••••••"
            autoComplete="current-password"
            disabled={isLoading}
            {...register("password")}
            className={cn(
              "w-full rounded-xl border bg-white pl-10 pr-4 py-2.5 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all disabled:opacity-50",
              errors.password
                ? "border-error focus:border-error focus:ring-error/20"
                : "border-slate-200 focus:border-primary focus:ring-primary/20"
            )}
            id="password"
          />
        </div>
        {errors.password && (
          <span className="text-xs text-error font-medium">{errors.password.message}</span>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold py-3 h-auto shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{isLoading ? "Iniciando sesión..." : "Iniciar sesión"}</span>
      </Button>

      {/* Switchers */}
      <div className="flex flex-col gap-2 pt-3 border-t border-slate-100 text-center text-sm text-slate-600">
        <div>
          ¿No tenés cuenta?{" "}
          <button
            type="button"
            onClick={onSwitchToRegisterBuyer}
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            Registrate como viajero
          </button>
        </div>
        <div>
          ¿Tenés una agencia de viajes?{" "}
          <button
            type="button"
            onClick={onSwitchToRegisterAgency}
            className="text-primary font-semibold hover:underline cursor-pointer"
          >
            Postulate como Agencia
          </button>
        </div>
      </div>
    </form>
  )
}
