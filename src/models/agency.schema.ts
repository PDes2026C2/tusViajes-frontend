import { z } from "zod"

export const packageFormSchema = z
  .object({
    name: z.string().min(3, "El nombre debe tener al menos 3 caracteres"),
    description: z.string().optional(),
    price: z.coerce.number().positive("El precio debe ser mayor a 0"),
    startDate: z.date(),
    endDate: z.date(),
    hotelId: z.coerce.number().positive("Selecciona un hotel"),
    departureFlightId: z.coerce.number().positive("Selecciona un vuelo de salida"),
    returnFlightId: z.coerce.number().positive("Selecciona un vuelo de llegada"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "La fecha de fin debe ser posterior a la fecha de inicio",
    path: ["endDate"],
  })
  .refine((data) => data.departureFlightId !== data.returnFlightId, {
    message: "El vuelo de salida debe ser distinto al vuelo de llegada",
    path: ["returnFlightId"],
  })

export type PackageFormValues = z.infer<typeof packageFormSchema>

export const flightFilterSchema = z.object({
  originCityId: z.coerce.number().optional(),
  destinationCityId: z.coerce.number().optional(),
  departureDateFrom: z.date().optional(),
  departureDateTo: z.date().optional(),
  onlyAvailable: z.boolean().default(true),
})

export type FlightFilterValues = z.infer<typeof flightFilterSchema>
