import type { AgencyStatus } from "@/types/auth"
import type {
  AgencyResponseDTO,
  FlightDTO,
  HotelResponseDTO,
  PageResponseDTO,
  TravelPackageResponseDTO,
} from "../types/package"
import { locationMappers, type City } from "./location"
import type { SimpleAgencyDTO } from "@/types/admin"

export interface Agency {
  id: number
  businessName: string
  taxId: string
  email: string
  status: AgencyStatus
}

export interface SimpleAgency {
  id: number
  businessName: string
  email: string
}

export interface Hotel {
  id: number
  name: string
  city: City
  photoUrl: string
  services?: string
}

export interface Flight {
  id: number
  flightNumber: string
  originCity: City
  destinationCity: City
  departureTime: Date
  arrivalTime: Date
}

export interface TravelPackage {
  id: number
  name: string
  description: string
  price: number
  initialDate: Date
  finalDate: Date
  nights: number
  hotel: Hotel
  departureFlight: Flight
  arrivalFlight: Flight
  agency: Agency
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export function calculateNights(initialDate: Date, finalDate: Date): number {
  const diffMs = finalDate.getTime() - initialDate.getTime()
  const nights = Math.round(diffMs / (1000 * 60 * 60 * 24))
  return Math.max(0, nights)
}

export const packageMappers = {
  mapAgencyDTOToModel: (dto: AgencyResponseDTO): Agency => ({
    id: dto.id,
    businessName: dto.businessName,
    taxId: dto.taxId,
    email: dto.email,
    status: dto.status,
  }),

  mapSimpleAgencyDTOToModel: (dto: SimpleAgencyDTO): SimpleAgency => ({
    id: dto.id,
    email: dto.email,
    businessName: dto.businessName
  }),
  
  mapHotelDTOToModel: (dto: HotelResponseDTO): Hotel => ({
    id: dto.id,
    name: dto.name,
    city: locationMappers.mapCityDTOToModel(dto.city),
    photoUrl: dto.photoUrl,
    services: dto.services ?? undefined,
  }),

  mapFlightDTOToModel: (dto: FlightDTO): Flight => {
    const rawDep = dto.departureDate || dto.departureTime || ""
    const rawArr = dto.arrivalDate || dto.arrivalTime || ""
    const prefix = dto.airline
      ? dto.airline
          .split(" ")
          .map((w) => w[0])
          .join("")
          .toUpperCase()
          .slice(0, 2)
      : "FL"
    const flightNumber = dto.flightNumber || (dto.airline ? `${prefix}-${dto.id}` : `FL-${dto.id}`)

    return {
      id: dto.id,
      flightNumber,
      originCity: locationMappers.mapCityDTOToModel(dto.originCity),
      destinationCity: locationMappers.mapCityDTOToModel(dto.destinationCity),
      departureTime: new Date(rawDep),
      arrivalTime: new Date(rawArr),
    }
  },

  mapDTOToModel: (dto: TravelPackageResponseDTO): TravelPackage => {
    const rawStart = dto.startDate || dto.initialDate || ""
    const rawEnd = dto.endDate || dto.finalDate || ""
    const initialDate = new Date(rawStart)
    const finalDate = new Date(rawEnd)
    const nights = calculateNights(initialDate, finalDate)

    return {
      id: dto.id,
      name: dto.name,
      description: dto.description,
      price: dto.price,
      initialDate,
      finalDate,
      nights,
      hotel: packageMappers.mapHotelDTOToModel(dto.hotel),
      departureFlight: packageMappers.mapFlightDTOToModel(dto.departureFlight),
      arrivalFlight: packageMappers.mapFlightDTOToModel(dto.arrivalFlight),
      agency: packageMappers.mapAgencyDTOToModel(dto.agency),
    }
  },

  mapPageDTOToModel: (
    dto: PageResponseDTO<TravelPackageResponseDTO>
  ): Page<TravelPackage> => ({
    content: dto.content.map(packageMappers.mapDTOToModel),
    totalElements: dto.totalElements,
    totalPages: dto.totalPages,
    size: dto.size,
    number: dto.number,
  }),
}
