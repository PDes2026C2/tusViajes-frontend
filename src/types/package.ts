import type { AgencyStatus } from "./auth"
import type { CityDTO } from "./location"

export interface AgencyResponseDTO {
  id: number
  businessName: string
  taxId: string
  email: string
  status: AgencyStatus
}

export interface HotelResponseDTO {
  id: number
  name: string
  city: CityDTO
  photoUrl: string
}

export interface FlightDTO {
  id: number
  flightNumber?: string
  airline?: string
  originCity: CityDTO
  destinationCity: CityDTO
  departureTime?: string
  departureDate?: string
  arrivalTime?: string
  arrivalDate?: string
}

export interface TravelPackageResponseDTO {
  id: number
  name: string
  description: string
  price: number
  startDate?: string
  endDate?: string
  initialDate?: string
  finalDate?: string
  hotel: HotelResponseDTO
  departureFlight: FlightDTO
  arrivalFlight: FlightDTO
  agency: AgencyResponseDTO
}

export interface PageResponseDTO<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
  first?: boolean
  last?: boolean
  empty?: boolean
}
