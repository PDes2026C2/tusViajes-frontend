import { z } from "zod"

export const loginSchema = z.object({
  email: z.string().trim().min(1, "El email es obligatorio").email("Formato de email invalido"),
  password: z.string().min(1, "La contraseña es obligatoria"),
})

export const registerBuyerSchema = z.object({
  firstName: z.string().trim().min(1, "El nombre es obligatorio "),
  lastName: z.string().trim().min(1, "El apellido es obligatorio"),
  email: z.string().trim().min(1, "El email es obligatorio").email("Email invalido"),
  password: z.string().min(8, "La contraseña debe contener al menos 8 carácteres"),
  nationalId: z.string().trim().min(1, "EL DNI es obligatorio").max(8, "El DNI es invalido").regex(/^\d+$/, "El DNI debe ser numerico"),
  phoneNumber: z.string().trim().min(1, "El telefono es obligatorio").length(10, "El telefono debe tener 10 carácteres"),
})

export const registerAgencySchema = z.object({
  businessName: z.string().trim().min(1, "La razon social es obligatoria"),
  taxId: z.string().trim().min(1, "EL CUIT es obligatorio"),
  email: z.string().trim().min(1, "El email es obligatorio").email("Email invalido"),
  password: z.string().min(8, "La contraseña debe contener al menos 8 carácteres"),
})

export type LoginFormData = z.infer<typeof loginSchema>
export type RegisterBuyerFormData = z.infer<typeof registerBuyerSchema>
export type RegisterAgencyFormData = z.infer<typeof registerAgencySchema>
