import type { FlightDTO, PageResponseDTO, TravelPackageResponseDTO } from "../types/package"
import { locationMappers, type City } from "./location"

export interface Agency {
  id: number
  businessName: string
  taxId: string
}

export interface Hotel {
  id: number
  name: string
  city: City
  photoUrl?: string
}

export interface Flight {
  id: number
  flightNumber?: string
  originCity?: City
  destinationCity?: City
  departureTime?: Date
  arrivalTime?: Date
}

export interface TravelPackage {
  id: number
  name: string
  description: string
  price: number
  startDate: Date
  endDate: Date
  hotel: Hotel
  agency: Agency
  departureFlight: Flight
  arrivalFlight: Flight
}

export interface Page<T> {
  content: T[]
  totalElements: number
  totalPages: number
  size: number
  number: number
}

export const packageMappers = {
  mapFlightDTOToModel: (dto: FlightDTO): Flight => ({
    id: dto.id,
    flightNumber: dto.flightNumber,
    originCity: locationMappers.mapCityDTOToModel(dto.originCity),
    destinationCity: locationMappers.mapCityDTOToModel(dto.destinationCity),
    departureTime: new Date(dto.departureTime),
    arrivalTime: new Date(dto.arrivalTime),
  }),

  mapDTOToModel: (dto: TravelPackageResponseDTO): TravelPackage => ({
    id: dto.id,
    name: dto.name,
    description: dto.description,
    price: dto.price,
    startDate: new Date(dto.startDate),
    endDate: new Date(dto.endDate),
    hotel: {
      id: dto.hotel.id,
      name: dto.hotel.name,
      city: locationMappers.mapCityDTOToModel(dto.hotel.city),
      photoUrl: dto.hotel.photoUrl,
    },
    agency: {
      id: dto.agency.id,
      businessName: dto.agency.businessName,
      taxId: dto.agency.taxId,
    },
    departureFlight: packageMappers.mapFlightDTOToModel(dto.departureFlight),
    arrivalFlight: packageMappers.mapFlightDTOToModel(dto.arrivalFlight),
  }),

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
