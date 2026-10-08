import type { CityDTO } from "./location"

export interface TravelPackageCreateDTO {
  name: string
  description?: string
  price: number
  startDate: string
  endDate: string
  hotelId: number
  agencyId: number
  departureFlightId: number
  returnFlightId: number
}

export interface TravelPackageUpdateDTO extends Partial<TravelPackageCreateDTO> {}

export interface AgencyFlightDTO {
  id: number
  flightNumber?: string
  airline: string
  originCity: CityDTO
  destinationCity: CityDTO
  departureDate: string
  arrivalDate: string
  capacity?: number
  availableSeats?: number
  price?: number
}

export interface FlightSearchFilterDTO {
  airline?: string
  departureDateFrom?: string
  departureDateTo?: string
  arrivalDateFrom?: string
  arrivalDateTo?: string
  originCityId?: number
  originCountryIsoCode?: string
  destinationCityId?: number
  destinationCountryIsoCode?: string
  onlyAvailable?: boolean
  page?: number
  size?: number
}

export interface AgencySaleBuyerDTO {
  id: number
  firstName: string
  lastName: string
  email: string
  nationalId: string
  phoneNumber?: string
}

export interface AgencySalePackageDTO {
  id: number
  name: string
  hotelName?: string
  destinationCityName?: string
  initialDate?: string
  finalDate?: string
  startDate?: string
  endDate?: string
}

export interface AgencySaleDTO {
  id: number
  price: number
  purchasedAt: string
  buyer: AgencySaleBuyerDTO
  travelPackage: AgencySalePackageDTO | any
}

export interface HotelOptionDTO {
  id: number
  name: string
  city: CityDTO
  photoUrl?: string
}
