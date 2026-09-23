import { z } from "zod"

export const packageFormSchema = z
  .object({
    name: z.string().min(3, "Name must be at least 3 characters"),
    description: z.string().optional(),
    price: z.coerce.number().positive("Price must be greater than 0"),
    startDate: z.date(),
    endDate: z.date(),
    hotelId: z.coerce.number().positive("Please select a hotel"),
    departureFlightId: z.coerce.number().positive("Please select a departure flight"),
    returnFlightId: z.coerce.number().positive("Please select a return flight"),
  })
  .refine((data) => data.endDate > data.startDate, {
    message: "End date must be after start date",
    path: ["endDate"],
  })
  .refine((data) => data.departureFlightId !== data.returnFlightId, {
    message: "Departure and return flights cannot be the same flight",
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
