import { z } from "zod"

export const reviewSchema = z.object({
  score: z
    .number({ message: "Se debe ingresar un puntaje" })
    .int("El puntaje debe ser un número entero")
    .min(1, "El puntaje debe ser al menos 1")
    .max(10, "El puntaje no puede ser mayor a 10"),
  comment: z
    .string()
    .max(1000, "El comentario no puede exceder los 1000 caracteres")
    .optional(),
})

export type ReviewFormData = z.infer<typeof reviewSchema>
