import { z } from "zod"
import type { DateRange } from "react-day-picker"

export const searchPackageSchema = z
  .object({
    originCountryIso: z.string().optional(),
    originCityId: z.number().optional(),
    destinationCountryIso: z.string().optional(),
    destinationCityId: z.number().optional(),
    departureDateRange: z.custom<DateRange>().optional(),
    arrivalDateRange: z.custom<DateRange>().optional(),
  })
  .refine(
    (data) => {
      // Only check equality if both origins and destinations are selected
      if (
        data.originCountryIso &&
        data.destinationCountryIso &&
        data.originCityId &&
        data.destinationCityId
      ) {
        return !(
          data.originCountryIso === data.destinationCountryIso &&
          data.originCityId === data.destinationCityId
        )
      }
      return true
    },
    {
      message: "El origen y el destino no pueden ser iguales",
      path: ["destinationCityId"],
    }
  )

export type SearchPackageFormData = z.infer<typeof searchPackageSchema>
