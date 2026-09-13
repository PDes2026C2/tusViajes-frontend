import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { IdCard, Loader2, Lock, Mail, Phone, User as UserIcon } from "lucide-react"
import { registerBuyerSchema, type RegisterBuyerFormData } from "../../models/auth.schema"
import type { RegisterBuyerData } from "../../models/auth"
import { Button } from "../ui/button"

interface RegisterBuyerFormProps {
  onSubmit: (data: RegisterBuyerData) => Promise<unknown> | void
  isLoading?: boolean
  error?: string | null
  onSwitchToLogin?: () => void
}

export function RegisterBuyerForm({
  onSubmit,
  isLoading = false,
  error,
  onSwitchToLogin,
}: RegisterBuyerFormProps) {
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<RegisterBuyerFormData>({
    resolver: zodResolver(registerBuyerSchema),
    defaultValues: {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      nationalId: "",
      phoneNumber: "",
    },
    mode: "onBlur",
  })

  const handleFormSubmit = async (data: RegisterBuyerFormData) => {
    await onSubmit(data)
  }

  return (
    <form onSubmit={handleSubmit(handleFormSubmit)} className="flex flex-col gap-3.5 text-left">
      {error && (
        <div className="rounded-xl bg-red-50 border border-red-200 p-3 text-sm text-red-700">
          {error}
        </div>
      )}

      {/* Nombre y Apellido */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
            Nombre
          </label>
          <div className="relative flex items-center">
            <UserIcon className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Juan"
              disabled={isLoading}
              {...register("firstName")}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
            />
          </div>
          {errors.firstName && (
            <span className="text-xs text-red-500">{errors.firstName.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
            Apellido
          </label>
          <div className="relative flex items-center">
            <UserIcon className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="Pérez"
              disabled={isLoading}
              {...register("lastName")}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
            />
          </div>
          {errors.lastName && (
            <span className="text-xs text-red-500">{errors.lastName.message}</span>
          )}
        </div>
      </div>

      {/* DNI y Teléfono */}
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
            DNI / Documento
          </label>
          <div className="relative flex items-center">
            <IdCard className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="text"
              placeholder="12345678"
              disabled={isLoading}
              {...register("nationalId")}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
            />
          </div>
          {errors.nationalId && (
            <span className="text-xs text-red-500">{errors.nationalId.message}</span>
          )}
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
            Teléfono
          </label>
          <div className="relative flex items-center">
            <Phone className="absolute left-3.5 h-4 w-4 text-slate-400 pointer-events-none" />
            <input
              type="tel"
              placeholder="11 1234-5678"
              disabled={isLoading}
              {...register("phoneNumber")}
              className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
            />
          </div>
          {errors.phoneNumber && (
            <span className="text-xs text-red-500">{errors.phoneNumber.message}</span>
          )}
        </div>
      </div>

      {/* Email */}
      <div className="flex flex-col gap-1">
        <label className="text-xs font-semibold tracking-wider text-slate-600 uppercase">
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
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
          />
        </div>
        {errors.email && (
          <span className="text-xs text-red-500">{errors.email.message}</span>
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
            className="w-full rounded-xl border border-slate-200 bg-white pl-10 pr-3 py-2 text-sm text-slate-800 placeholder:text-slate-400 focus:border-primary focus:outline-hidden focus:ring-2 focus:ring-primary/20 transition-all disabled:opacity-50"
          />
        </div>
        {errors.password && (
          <span className="text-xs text-red-500">{errors.password.message}</span>
        )}
      </div>

      {/* Submit button */}
      <Button
        type="submit"
        disabled={isLoading}
        className="w-full rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold py-3 h-auto shadow-sm flex items-center justify-center gap-2 cursor-pointer transition-all mt-2"
      >
        {isLoading && <Loader2 className="h-4 w-4 animate-spin" />}
        <span>{isLoading ? "Creando cuenta..." : "Crear mi cuenta"}</span>
      </Button>

      {/* Switcher */}
      <div className="pt-2 border-t border-slate-100 text-center text-sm text-slate-600">
        ¿Ya tenés cuenta?{" "}
        <button
          type="button"
          onClick={onSwitchToLogin}
          className="text-primary font-semibold hover:underline cursor-pointer"
        >
          Iniciar sesión
        </button>
      </div>
    </form>
  )
}
