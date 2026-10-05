import { beforeEach, describe, expect, it, vi } from "vitest"
import { agencyDataSource } from "./agency"
import apiClient from "./api-client"
import type { AgencyFlightDTO } from "../types/agency"

vi.mock("./public-client", () => ({
  default: {
    get: vi.fn(),
  },
}))

vi.mock("./api-client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
    put: vi.fn(),
    delete: vi.fn(),
  },
}))

describe("agencyDataSource - Flights", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  const mockFlightDTO: AgencyFlightDTO = {
    id: 501,
    flightNumber: "AR-1300",
    airline: "Aerolíneas Argentinas",
    originCity: { id: 1, countryDTO: { isoCode: "AR", name: "Argentina" }, name: "Buenos Aires" },
    destinationCity: { id: 6, countryDTO: { isoCode: "US", name: "Estados Unidos" }, name: "Miami" },
    departureDate: "2026-10-01T10:00:00.000Z",
    arrivalDate: "2026-10-01T18:00:00.000Z",
    capacity: 200,
    availableSeats: 45,
    price: 600,
  }

  it("searchFlights calls GET /flights with query parameters and returns data", async () => {
    // arrange
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        content: [mockFlightDTO],
        totalElements: 1,
        totalPages: 1,
        size: 10,
        number: 0,
      },
    })

    // act
    const result = await agencyDataSource.searchFlights({
      destinationCityId: 6,
      originCityId: 1,
      airline: "Aerolíneas Argentinas",
      departureDateFrom: "2026-10-01T00:00:00",
      departureDateTo: "2026-10-01T23:59:59",
      page: 0,
      size: 10,
    })

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/flights", {
      params: {
        destinationCityId: 6,
        originCityId: 1,
        airline: "Aerolíneas Argentinas",
        departureDateFrom: "2026-10-01T00:00:00",
        departureDateTo: "2026-10-01T23:59:59",
        page: 0,
        size: 10,
      },
    })
    expect(result).toEqual([mockFlightDTO])
  })

  it("searchFlights calls GET /flights with empty params when filter is omitted", async () => {
    // arrange
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        content: [],
        totalElements: 0,
        totalPages: 0,
        size: 10,
        number: 0,
      },
    })

    // act
    const result = await agencyDataSource.searchFlights()

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/flights", {
      params: {},
    })
    expect(result).toEqual([])
  })

  it("getFlightById calls GET /flights/{id} and returns flight DTO", async () => {
    // arrange
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockFlightDTO })

    // act
    const result = await agencyDataSource.getFlightById(501)

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/flights/501")
    expect(result).toEqual(mockFlightDTO)
  })
})

describe("agencyDataSource - Sales", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getSales calls GET /agencies/me/sales with pagination and returns content", async () => {
    // arrange
    const mockSale = {
      id: 101,
      price: 1500,
      purchasedAt: "2026-10-01T10:00:00Z",
      buyer: {
        id: 1,
        firstName: "Lucía",
        lastName: "García",
        email: "lucia@gmail.com",
        nationalId: "38992110",
      },
      travelPackage: {
        id: 10,
        name: "Escapada a Miami",
        hotel: { name: "Grand Hotel", city: { name: "Miami" } },
        startDate: "2026-11-01T00:00:00Z",
        endDate: "2026-11-08T00:00:00Z",
      },
    }
    vi.mocked(apiClient.get).mockResolvedValue({
      data: {
        content: [mockSale],
        totalElements: 1,
      },
    })

    // act
    const result = await agencyDataSource.getSales(0, 50)

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/agencies/me/sales", {
      params: { page: 0, size: 50 },
    })
    expect(result).toEqual([mockSale])
  })

  it("getSales defaults to page 0 and size 100 and returns empty array on empty content", async () => {
    // arrange
    vi.mocked(apiClient.get).mockResolvedValue({
      data: { content: [] },
    })

    // act
    const result = await agencyDataSource.getSales()

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/agencies/me/sales", {
      params: { page: 0, size: 100 },
    })
    expect(result).toEqual([])
  })
})

