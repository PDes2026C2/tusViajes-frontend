import type {
  AgencyFlightDTO,
  AgencySaleDTO,
  HotelOptionDTO,
  TravelPackageCreateDTO,
} from "../types/agency"
import { locationMappers, type City } from "./location"
import type { Flight, Hotel } from "./package"

export interface AgencyPackageItem {
  id: number
  name: string
  description: string
  price: number
  startDate: Date
  endDate: Date
  nights: number
  hotel: Hotel
  departureFlight: Flight
  returnFlight: Flight
}

export interface AgencyFlight {
  id: number
  flightNumber: string
  airline: string
  originCity: City
  destinationCity: City
  departureDate: Date
  arrivalDate: Date
  capacity: number
  availableSeats: number
  price?: number
}

export interface AgencySale {
  id: number
  buyer: {
    id: number
    firstName: string
    lastName: string
    fullName: string
    email: string
    nationalId: string
  }
  travelPackage: {
    id: number
    name: string
    hotelName: string
    destinationCityName: string
    initialDate: Date
    finalDate: Date
  }
  price: number
  purchasedAt: Date
}

export interface AgencyMetricsSummary {
  totalRevenue: number
  totalSales: number
  uniqueClients: number
}

export interface PackageFormData {
  name: string
  description?: string
  price: number
  startDate: Date | string
  endDate: Date | string
  hotelId: number
  departureFlightId: number
  returnFlightId: number
}

export const formatLocalDateTime = (
  value: Date | string,
  defaultTime = "00:00:00"
): string => {
  if (!value) return ""
  const pad = (n: number) => String(n).padStart(2, "0")
  let dateStr = ""
  let timeStr = defaultTime

  if (typeof value === "string") {
    if (value.includes("T")) {
      const [d, t] = value.split("T")
      dateStr = d
      timeStr = t ? t.slice(0, 8) : defaultTime
    } else {
      dateStr = value
    }
  } else {
    dateStr = `${value.getFullYear()}-${pad(value.getMonth() + 1)}-${pad(value.getDate())}`
    timeStr = `${pad(value.getHours())}:${pad(value.getMinutes())}:${pad(value.getSeconds())}`
  }

  // If the date is today, ensure the time is strictly in the future so @FutureOrPresent in backend succeeds
  const now = new Date()
  const todayStr = `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}`
  if (dateStr === todayStr) {
    if (defaultTime === "23:59:59") {
      timeStr = "23:59:59"
    } else {
      const future = new Date(Date.now() + 5 * 60 * 1000)
      timeStr = `${pad(future.getHours())}:${pad(future.getMinutes())}:${pad(future.getSeconds())}`
    }
  }

  return `${dateStr}T${timeStr}`
}

export const isSameCalendarDay = (
  d1?: Date | string | null,
  d2?: Date | string | null
): boolean => {
  if (!d1 || !d2) return false
  const toDateParts = (d: Date | string): string => {
    if (typeof d === "string") {
      if (d.includes("T")) return d.split("T")[0]
      return d.slice(0, 10)
    }
    const pad = (n: number) => String(n).padStart(2, "0")
    return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`
  }
  return toDateParts(d1) === toDateParts(d2)
}

export const agencyMappers = {
  mapFlightDTOToModel: (dto: AgencyFlightDTO): AgencyFlight => {
    const prefix = dto.airline
      ? dto.airline
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "FL"
    const flightNumber = dto.flightNumber || `${prefix}-${dto.id}`

    return {
      id: dto.id,
      flightNumber,
      airline: dto.airline,
      originCity: locationMappers.mapCityDTOToModel(dto.originCity),
      destinationCity: locationMappers.mapCityDTOToModel(dto.destinationCity),
      departureDate: new Date(dto.departureDate),
      arrivalDate: new Date(dto.arrivalDate),
      capacity: dto.capacity ?? 180,
      availableSeats: dto.availableSeats ?? 50,
      price: dto.price,
    }
  },

  mapSaleDTOToModel: (dto: AgencySaleDTO): AgencySale => {
    const tp = dto.travelPackage as any
    const hotelName = tp.hotelName || tp.hotel?.name || "Hotel asignado"
    const destinationCityName =
      tp.destinationCityName ||
      tp.hotel?.city?.name ||
      tp.departureFlight?.destinationCity?.name ||
      ""
    const rawInitialDate =
      tp.initialDate || tp.startDate || new Date().toISOString()
    const rawFinalDate =
      tp.finalDate || tp.endDate || new Date().toISOString()

    const buyerId = dto.buyer?.id ?? 0
    const firstName = dto.buyer?.firstName || ""
    const lastName = dto.buyer?.lastName || ""
    const fullName =
      firstName || lastName
        ? `${firstName} ${lastName}`.trim()
        : `Cliente #${buyerId}`
    const email = dto.buyer?.email || (buyerId ? `ID: ${buyerId}` : "")
    const nationalId = dto.buyer?.nationalId || "-"

    return {
      id: dto.id,
      buyer: {
        id: buyerId,
        firstName,
        lastName,
        fullName,
        email,
        nationalId,
      },
      travelPackage: {
        id: tp.id,
        name: tp.name || "Paquete de viaje",
        hotelName,
        destinationCityName,
        initialDate: new Date(rawInitialDate),
        finalDate: new Date(rawFinalDate),
      },
      price: dto.price,
      purchasedAt: new Date(dto.purchasedAt),
    }
  },

  mapHotelOptionDTOToModel: (dto: HotelOptionDTO): Hotel => ({
    id: dto.id,
    name: dto.name,
    city: locationMappers.mapCityDTOToModel(dto.city),
    photoUrl: dto.photoUrl || "",
  }),

  mapPackageFormToDTO: (
    data: PackageFormData,
    agencyId: number
  ): TravelPackageCreateDTO => ({
    name: data.name,
    description: data.description || "",
    price: Number(data.price),
    startDate: formatLocalDateTime(data.startDate, "09:00:00"),
    endDate: formatLocalDateTime(data.endDate, "23:59:59"),
    hotelId: Number(data.hotelId),
    agencyId,
    departureFlightId: Number(data.departureFlightId),
    returnFlightId: Number(data.returnFlightId),
  }),

  calculateMetrics: (sales: AgencySale[]): AgencyMetricsSummary => {
    const totalRevenue = sales.reduce((acc, curr) => acc + curr.price, 0)
    const uniqueClientKeys = new Set(
      sales.map((s) =>
        s.buyer.nationalId && s.buyer.nationalId !== "-"
          ? s.buyer.nationalId
          : s.buyer.id
      )
    )
    return {
      totalRevenue,
      totalSales: sales.length,
      uniqueClients: uniqueClientKeys.size,
    }
  },
}
