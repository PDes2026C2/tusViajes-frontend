import type { CityDTO } from "./location"

export interface AgencyResponseDTO {
  id: number
  businessName: string
  taxId: string
}

export interface HotelResponseDTO {
  id: number
  name: string
  city: CityDTO
  photoUrl?: string
}

export interface FlightDTO {
  id: number
  flightNumber: string
  originCity: CityDTO
  destinationCity: CityDTO
  departureTime: string
  arrivalTime: string
}

export interface TravelPackageResponseDTO {
  id: number
  name: string
  description: string
  price: number
  startDate: string
  endDate: string
  hotel: HotelResponseDTO
  agency: AgencyResponseDTO
  departureFlight: FlightDTO
  arrivalFlight: FlightDTO
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
