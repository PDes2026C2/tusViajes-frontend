import { beforeEach, describe, expect, it, vi } from "vitest"
import { useAgencyStore } from "./agency"
import { agencyDataSource } from "../datasources/agency"
import type { TravelPackageResponseDTO } from "../types/package"
import type { AgencyFlightDTO, AgencySaleDTO, HotelOptionDTO } from "../types/agency"

vi.mock("../datasources/agency", () => ({
  agencyDataSource: {
    getPackages: vi.fn(),
    createPackage: vi.fn(),
    updatePackage: vi.fn(),
    deletePackage: vi.fn(),
    getHotels: vi.fn(),
    searchFlights: vi.fn(),
    getFlightById: vi.fn(),
    getSales: vi.fn(),
  },
}))

describe("useAgencyStore", () => {
  const mockPackageDTO: TravelPackageResponseDTO = {
    id: 101,
    name: "Escapada a Miami",
    description: "Vuelo + 7 noches",
    price: 1500,
    initialDate: "2026-10-01T10:00:00.000Z",
    finalDate: "2026-10-08T10:00:00.000Z",
    hotel: {
      id: 201,
      name: "Grand Hotel",
      city: { id: 6, countryDTO: { isoCode: "US", name: "Estados Unidos" }, name: "Miami" },
      photoUrl: "http://hotel.com/img.jpg",
    },
    agency: {
      id: 2,
      businessName: "Caribe Sol",
      taxId: "30-12345678-9",
      email: "info@caribe.com",
      status: "AUTHORIZED",
    },
    departureFlight: {
      id: 501,
      flightNumber: "AR-1300",
      originCity: { id: 1, countryDTO: { isoCode: "AR", name: "Argentina" }, name: "Buenos Aires" },
      destinationCity: { id: 6, countryDTO: { isoCode: "US", name: "Estados Unidos" }, name: "Miami" },
      departureTime: "2026-10-01T10:00:00.000Z",
      arrivalTime: "2026-10-01T18:00:00.000Z",
    },
    arrivalFlight: {
      id: 502,
      flightNumber: "AR-1301",
      originCity: { id: 6, countryDTO: { isoCode: "US", name: "Estados Unidos" }, name: "Miami" },
      destinationCity: { id: 1, countryDTO: { isoCode: "AR", name: "Argentina" }, name: "Buenos Aires" },
      departureTime: "2026-10-08T10:00:00.000Z",
      arrivalTime: "2026-10-08T18:00:00.000Z",
    },
  }

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

  const mockSaleDTO: AgencySaleDTO = {
    id: 1001,
    buyer: {
      id: 1,
      firstName: "Lucía",
      lastName: "García",
      email: "lucia@gmail.com",
      nationalId: "38992110",
    },
    travelPackage: {
      id: 101,
      name: "Escapada a Miami",
      hotelName: "Grand Hotel",
      destinationCityName: "Miami, Estados Unidos",
      initialDate: "2026-10-01T10:00:00.000Z",
      finalDate: "2026-10-08T10:00:00.000Z",
    },
    price: 1500,
    purchasedAt: "2026-09-20T12:00:00.000Z",
  }

  const mockHotelDTO: HotelOptionDTO = {
    id: 201,
    name: "Grand Hotel",
    city: { id: 6, countryDTO: { isoCode: "US", name: "Estados Unidos" }, name: "Miami" },
    photoUrl: "http://hotel.com/img.jpg",
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useAgencyStore.setState({
      packages: [],
      flights: [],
      sales: [],
      hotels: [],
      metrics: { totalRevenue: 0, totalSales: 0, uniqueClients: 0 },
      isLoadingPackages: false,
      isLoadingFlights: false,
      isLoadingSales: false,
      isLoadingHotels: false,
      isSubmitting: false,
      isDeleting: false,
      error: null,
    })
  })

  it("fetches agency packages and maps to domain model", async () => {
    // arrange
    vi.mocked(agencyDataSource.getPackages).mockResolvedValue([mockPackageDTO])

    // act
    await useAgencyStore.getState().fetchPackages(2)

    // assert
    const packages = useAgencyStore.getState().packages
    expect(packages).toHaveLength(1)
    expect(packages[0].name).toBe("Escapada a Miami")
    expect(packages[0].nights).toBe(7)
    expect(packages[0].price).toBe(1500)
    expect(useAgencyStore.getState().isLoadingPackages).toBe(false)
  })

  it("creates a package and prepends to state packages list", async () => {
    // arrange
    vi.mocked(agencyDataSource.createPackage).mockResolvedValue(mockPackageDTO)
    const formData = {
      name: "Escapada a Miami",
      description: "Vuelo + 7 noches",
      price: 1500,
      startDate: new Date("2026-10-01T10:00:00.000Z"),
      endDate: new Date("2026-10-08T10:00:00.000Z"),
      hotelId: 201,
      departureFlightId: 501,
      returnFlightId: 502,
    }

    // act
    await useAgencyStore.getState().createPackage(formData, 2)

    // assert
    expect(useAgencyStore.getState().packages).toHaveLength(1)
    expect(useAgencyStore.getState().packages[0].id).toBe(101)
    expect(useAgencyStore.getState().isSubmitting).toBe(false)
  })

  it("deletes a package and removes it from state", async () => {
    // arrange
    vi.mocked(agencyDataSource.deletePackage).mockResolvedValue()
    useAgencyStore.setState({
      packages: [
        {
          id: 101,
          name: "Escapada a Miami",
          description: "",
          price: 1500,
          startDate: new Date(),
          endDate: new Date(),
          nights: 7,
          hotel: { id: 201, name: "Grand Hotel", city: { id: 6, country: { isoCode: "US", name: "Estados Unidos" }, name: "Miami" }, photoUrl: "http://photo.com/1.jpg" },
          departureFlight: {} as any,
          returnFlight: {} as any,
        },
      ],
    })

    // act
    await useAgencyStore.getState().deletePackage(101)

    // assert
    expect(useAgencyStore.getState().packages).toHaveLength(0)
    expect(useAgencyStore.getState().isDeleting).toBe(false)
  })

  it("searches flights and maps them to domain models", async () => {
    // arrange
    vi.mocked(agencyDataSource.searchFlights).mockResolvedValue([mockFlightDTO])

    // act
    await useAgencyStore.getState().searchFlights({ destinationCityId: 6 })

    // assert
    const flights = useAgencyStore.getState().flights
    expect(flights).toHaveLength(1)
    expect(flights[0].flightNumber).toBe("AR-1300")
    expect(flights[0].availableSeats).toBe(45)
    expect(useAgencyStore.getState().isLoadingFlights).toBe(false)
  })

  it("fetches hotels and maps them", async () => {
    // arrange
    vi.mocked(agencyDataSource.getHotels).mockResolvedValue([mockHotelDTO])

    // act
    await useAgencyStore.getState().fetchHotels()

    // assert
    expect(useAgencyStore.getState().hotels).toHaveLength(1)
    expect(useAgencyStore.getState().hotels[0].name).toBe("Grand Hotel")
  })

  it("fetches sales, maps items and calculates metrics", async () => {
    // arrange
    vi.mocked(agencyDataSource.getSales).mockResolvedValue([mockSaleDTO])

    // act
    await useAgencyStore.getState().fetchSales(2)

    // assert
    const { sales, metrics } = useAgencyStore.getState()
    expect(sales).toHaveLength(1)
    expect(sales[0].buyer.fullName).toBe("Lucía García")
    expect(metrics).toEqual({
      totalRevenue: 1500,
      totalSales: 1,
      uniqueClients: 1,
    })
  })

  it("fetches sales with backend format (buyer object and nested hotel) and maps correctly", async () => {
    // arrange
    const backendSaleDTO: AgencySaleDTO = {
      id: 2002,
      buyer: {
        id: 42,
        firstName: "Carlos",
        lastName: "Gómez",
        email: "carlos@example.com",
        nationalId: "42000000",
      },
      price: 2400,
      purchasedAt: "2026-10-02T15:00:00.000Z",
      travelPackage: {
        id: 55,
        name: "Cataratas del Iguazú",
        startDate: "2026-11-15T09:00:00.000Z",
        endDate: "2026-11-20T21:00:00.000Z",
        hotel: {
          id: 12,
          name: "Iguazú Grand Resort",
          city: { id: 3, countryDTO: { isoCode: "AR", name: "Argentina" }, name: "Puerto Iguazú" },
          photoUrl: "",
        },
      } as any,
    }
    vi.mocked(agencyDataSource.getSales).mockResolvedValue([backendSaleDTO])

    // act
    await useAgencyStore.getState().fetchSales()

    // assert
    const { sales, metrics } = useAgencyStore.getState()
    expect(sales).toHaveLength(1)
    expect(sales[0].buyer.fullName).toBe("Carlos Gómez")
    expect(sales[0].travelPackage.hotelName).toBe("Iguazú Grand Resort")
    expect(sales[0].travelPackage.destinationCityName).toBe("Puerto Iguazú")
    expect(metrics.totalRevenue).toBe(2400)
    expect(metrics.uniqueClients).toBe(1)
  })
})
