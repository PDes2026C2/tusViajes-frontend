import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { Building2, CheckCircle2, FileText, Loader2, Lock, Mail } from "lucide-react"
import { cn } from "cn"
import { registerAgencySchema, type RegisterAgencyFormData } from "../../models/auth.schema"
import type { RegisterAgencyData } from "../../models/auth"
import { Button } from "../ui/button"

interface RegisterAgencyFormProps {
  onSubmit: (data: RegisterAgencyData) => Promise<unknown> | void
  isLoading?: boolean
  successMessage?: string | null
  onSwitchToLogin?: () => void
}

export function RegisterAgencyForm({
  onSubmit,
  isLoading = false,
  successMessage,
  onSwitchToLogin,
}: RegisterAgencyFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterAgencyFormData>({
    resolver: zodResolver(registerAgencySchema),
    defaultValues: {
      businessName: "",
      taxId: "",
      email: "",
      password: "",
    },
    mode: "onBlur",
  })

  const handleFormSubmit = async (data: RegisterAgencyFormData) => {
    await onSubmit(data)
  }

  // If agency successfully registered with pending authorization
  if (successMessage) {
    return (
      <div className="flex flex-col items-center text-center py-6 gap-4">
        <div className="w-16 h-16 rounded-full bg-emerald-100 flex items-center justify-center text-emerald-600">
          <CheckCircle2 className="w-10 h-10" />
        </div>
        <div className="flex flex-col gap-1.5">
          <h3 className="text-xl font-bold text-slate-900">
            ¡Postulación enviada con éxito!
          </h3>
          <p className="text-sm text-slate-600 max-w-sm">
            {successMessage}
          </p>
        </div>
        <Button
          type="button"
          onClick={onSwitchToLogin}
          className="rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold px-6 py-2.5 h-auto shadow-sm cursor-pointer mt-2"
        >
          Ir a Iniciar Sesión
        </Button>
      </div>
    )
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-3.5 text-left">

      {/* Razón Social */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
          Razón Social / Nombre Comercial
        </label>
        <div className="relative flex items-center">
          <Building2 className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="Viajes del Sol S.A."
            disabled={isLoading}
            {...register("businessName")}
            className={cn(
              "w-full rounded-xl border bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all disabled:opacity-50",
              errors.businessName
                ? "border-error focus:border-error focus:ring-error/20"
                : "border-slate-200 focus:border-primary focus:ring-primary/20"
            )}
          />
        </div>
        {errors.businessName && (
          <span className="text-xs text-error font-medium">{errors.businessName.message}</span>
        )}
      </div>

      {/* CUIT / Tax ID */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
          CUIT / Identificación Fiscal
        </label>
        <div className="relative flex items-center">
          <FileText className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="text"
            placeholder="30-12345678-9"
            disabled={isLoading}
            {...register("taxId")}
            className={cn(
              "w-full rounded-xl border bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all disabled:opacity-50",
              errors.taxId
                ? "border-error focus:border-error focus:ring-error/20"
                : "border-slate-200 focus:border-primary focus:ring-primary/20"
            )}
          />
        </div>
        {errors.taxId && (
          <span className="text-xs text-error font-medium">{errors.taxId.message}</span>
        )}
      </div>

      {/* Email corporativo */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
          Correo electrónico corporativo
        </label>
        <div className="relative flex items-center">
          <Mail className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="email"
            placeholder="contacto@agencia.com"
            autoComplete="email"
            disabled={isLoading}
            {...register("email")}
            className={cn(
              "w-full rounded-xl border bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all disabled:opacity-50",
              errors.email
                ? "border-error focus:border-error focus:ring-error/20"
                : "border-slate-200 focus:border-primary focus:ring-primary/20"
            )}
          />
        </div>
        {errors.email && (
          <span className="text-xs text-error font-medium">{errors.email.message}</span>
        )}
      </div>

      {/* Contraseña */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
          Contraseña
        </label>
        <div className="relative flex items-center">
          <Lock className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
          <input
            type="password"
            placeholder="••••••••"
            autoComplete="new-password"
            disabled={isLoading}
            {...register("password")}
            className={cn(
              "w-full rounded-xl border bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:outline-hidden focus:ring-2 transition-all disabled:opacity-50",
              errors.password
                ? "border-error focus:border-error focus:ring-error/20"
                : "border-slate-200 focus:border-primary focus:ring-primary/20"
            )}
          />
        </div>
        {errors.password && (
          <span className="text-xs text-error font-medium">{errors.password.message}</span>
        )}
      </div>

      {/* Info notice */}
      <div className="rounded-xl bg-sky-50 border border-sky-100 p-3 text-xs text-primary leading-relaxed">
        <strong>Nota:</strong> Tu postulación será evaluada por nuestro equipo administrativo antes de habilitar la publicación de paquetes.
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold py-3 h-auto shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all mt-1"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{isLoading ? "Enviando postulación..." : "Postular mi Agencia"}</span>
      </Button>

      {/* Switcher */}
      <div className="pt-2 border-t border-slate-100 text-center text-sm text-slate-600">
        ¿Ya tenés una agencia registrada?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary font-semibold hover:underline cursor-pointer"
        >
          Iniciá sesión
        </button>
      </div>
    </form>
  )
}
