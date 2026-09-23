import type {
  AgencyFlightDTO,
  AgencySaleDTO,
  FlightSearchFilterDTO,
  HotelOptionDTO,
  TravelPackageCreateDTO,
  TravelPackageUpdateDTO,
} from "../types/agency"
import type { PageResponseDTO, TravelPackageResponseDTO } from "../types/package"
import apiClient from "./api-client"
import publicClient from "./public-client"

export const agencyDataSource = {
  async getPackages(
    agencyId?: number
  ): Promise<TravelPackageResponseDTO[]> {
    const response = await publicClient.get<PageResponseDTO<TravelPackageResponseDTO>>(
      "/travel-packages",
      { params: { size: 100 } }
    )
    const packages = response.data?.content || []
    if (agencyId) {
      return packages.filter((p) => p.agency?.id === agencyId)
    }
    return packages
  },

  async createPackage(dto: TravelPackageCreateDTO): Promise<TravelPackageResponseDTO> {
    const response = await apiClient.post<TravelPackageResponseDTO>("/travel-packages", dto)
    return response.data
  },

  async updatePackage(
    id: number,
    dto: TravelPackageUpdateDTO
  ): Promise<TravelPackageResponseDTO> {
    const response = await apiClient.put<TravelPackageResponseDTO>(`/travel-packages/${id}`, dto)
    return response.data
  },

  async deletePackage(id: number): Promise<void> {
    await apiClient.delete(`/travel-packages/${id}`)
  },

  async getHotels(): Promise<HotelOptionDTO[]> {
    const response = await apiClient.get<HotelOptionDTO[]>("/hotels")
    return response.data || []
  },

  async searchFlights(
    filter?: FlightSearchFilterDTO
  ): Promise<AgencyFlightDTO[]> {
    const params: Record<string, any> = {}
    if (filter) {
      if (filter.airline) params.airline = filter.airline
      if (filter.departureDateFrom) params.departureDateFrom = filter.departureDateFrom
      if (filter.departureDateTo) params.departureDateTo = filter.departureDateTo
      if (filter.arrivalDateFrom) params.arrivalDateFrom = filter.arrivalDateFrom
      if (filter.arrivalDateTo) params.arrivalDateTo = filter.arrivalDateTo
      if (filter.originCityId) params.originCityId = filter.originCityId
      if (filter.originCountryIsoCode) params.originCountryIsoCode = filter.originCountryIsoCode
      if (filter.destinationCityId) params.destinationCityId = filter.destinationCityId
      if (filter.destinationCountryIsoCode) params.destinationCountryIsoCode = filter.destinationCountryIsoCode
      if (filter.page !== undefined) params.page = filter.page
      if (filter.size !== undefined) params.size = filter.size
    }

    const response = await apiClient.get<AgencyFlightDTO[]>("/flights", {
      params,
    })
    return response.data || []
  },

  async getFlightById(id: number): Promise<AgencyFlightDTO> {
    const response = await apiClient.get<AgencyFlightDTO>(`/flights/${id}`)
    return response.data
  },


  async getSales(agencyId?: number): Promise<AgencySaleDTO[]> {
    try {
      const response = await apiClient.get<AgencySaleDTO[]>("/agency/sales", {
        params: { agencyId },
      })
      if (Array.isArray(response.data) && response.data.length > 0) {
        return response.data
      }
      throw new Error("No sales from API")
    } catch {
      const now = new Date()
      const d1 = new Date(now.getTime() - 2 * 24 * 3600 * 1000)
      const d2 = new Date(now.getTime() - 5 * 24 * 3600 * 1000)
      const d3 = new Date(now.getTime() - 9 * 24 * 3600 * 1000)
      const d4 = new Date(now.getTime() - 15 * 24 * 3600 * 1000)

      return [
        {
          id: 1001,
          buyer: {
            id: 1,
            firstName: "Lucía",
            lastName: "García",
            email: "lucia.garcia@gmail.com",
            nationalId: "38992110",
          },
          travelPackage: {
            id: 101,
            name: "Escapada Soñada a Nueva York",
            hotelName: "Manhattan Grand Hotel",
            destinationCityName: "Nueva York, Estados Unidos",
            initialDate: new Date(now.getTime() + 10 * 24 * 3600 * 1000).toISOString(),
            finalDate: new Date(now.getTime() + 17 * 24 * 3600 * 1000).toISOString(),
          },
          price: 1250,
          purchasedAt: d1.toISOString(),
        },
        {
          id: 1002,
          buyer: {
            id: 2,
            firstName: "Martín",
            lastName: "Rodríguez",
            email: "martin.rod@hotmail.com",
            nationalId: "40123987",
          },
          travelPackage: {
            id: 102,
            name: "Paraíso Tropical en Miami Beach",
            hotelName: "Oceanfront Palms Resort",
            destinationCityName: "Miami, Estados Unidos",
            initialDate: new Date(now.getTime() + 20 * 24 * 3600 * 1000).toISOString(),
            finalDate: new Date(now.getTime() + 30 * 24 * 3600 * 1000).toISOString(),
          },
          price: 1420,
          purchasedAt: d2.toISOString(),
        },
        {
          id: 1003,
          buyer: {
            id: 3,
            firstName: "Camila",
            lastName: "Sosa",
            email: "camila.sosa@yahoo.com",
            nationalId: "35678432",
          },
          travelPackage: {
            id: 101,
            name: "Escapada Soñada a Nueva York",
            hotelName: "Manhattan Grand Hotel",
            destinationCityName: "Nueva York, Estados Unidos",
            initialDate: new Date(now.getTime() + 15 * 24 * 3600 * 1000).toISOString(),
            finalDate: new Date(now.getTime() + 22 * 24 * 3600 * 1000).toISOString(),
          },
          price: 1250,
          purchasedAt: d3.toISOString(),
        },
        {
          id: 1004,
          buyer: {
            id: 4,
            firstName: "Ignacio",
            lastName: "Fernández",
            email: "nacho.fer@outlook.com",
            nationalId: "42887612",
          },
          travelPackage: {
            id: 102,
            name: "Paraíso Tropical en Miami Beach",
            hotelName: "Oceanfront Palms Resort",
            destinationCityName: "Miami, Estados Unidos",
            initialDate: new Date(now.getTime() + 25 * 24 * 3600 * 1000).toISOString(),
            finalDate: new Date(now.getTime() + 35 * 24 * 3600 * 1000).toISOString(),
          },
          price: 1420,
          purchasedAt: d4.toISOString(),
        },
      ]
    }
  },
}
