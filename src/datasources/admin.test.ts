import { beforeEach, describe, expect, it, vi } from "vitest"
import { adminAgencyDataSource } from "./admin"
import apiClient from "./api-client"
import type {
  AgencyResponseDTO,
  BuyerResponseDTO,
  TopRatedCityDTO,
  TopBuyerDTO,
  TopAgencyDTO,
  TopDestinationDTO,
} from "../types/admin"

vi.mock("./api-client", () => ({
  default: {
    get: vi.fn(),
    post: vi.fn(),
  },
}))

describe("adminAgencyDataSource", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it("getPendingAgencies calls GET /admin/agencies/pending and returns DTOs", async () => {
    // arrange
    const mockDTOs: AgencyResponseDTO[] = [
      {
        id: 1,
        businessName: "Agencia Sol",
        taxId: "30-11111111-1",
        email: "sol@agencia.com",
        status: "PENDING",
      },
    ]
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockDTOs })

    // act
    const result = await adminAgencyDataSource.getPendingAgencies()

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/admin/agencies/pending")
    expect(result).toEqual(mockDTOs)
  })

  it("getAllAgencies calls GET /agencies and returns DTOs", async () => {
    // arrange
    const mockDTOs: AgencyResponseDTO[] = [
      {
        id: 1,
        businessName: "Agencia Sol",
        taxId: "30-11111111-1",
        email: "email@agencia1.com",
        status: "AUTHORIZED",
      },
    ]
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockDTOs })

    // act
    const result = await adminAgencyDataSource.getAllAgencies()

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/agencies")
    expect(result).toEqual(mockDTOs)
  })

  it("authorizeAgency calls POST /admin/agencies/:id/authorize and returns DTO", async () => {
    // arrange
    const mockDTO: AgencyResponseDTO = {
      id: 1,
      businessName: "Agencia Sol",
      taxId: "30-11111111-1",
      email: "email@agencia1.com",
      status: "AUTHORIZED",
    }
    vi.mocked(apiClient.post).mockResolvedValue({ data: mockDTO })

    // act
    const result = await adminAgencyDataSource.authorizeAgency(1)

    // assert
    expect(apiClient.post).toHaveBeenCalledWith("/admin/agencies/1/authorize")
    expect(result).toEqual(mockDTO)
  })

  it("rejectAgency calls POST /admin/agencies/:id/reject and returns DTO", async () => {
    // arrange
    const mockDTO: AgencyResponseDTO = {
      id: 2,
      businessName: "Agencia Luna",
      taxId: "30-22222222-2",
      email: "email@agencia2.com",
      status: "REJECTED",
    }
    vi.mocked(apiClient.post).mockResolvedValue({ data: mockDTO })

    // act
    const result = await adminAgencyDataSource.rejectAgency(2)

    // assert
    expect(apiClient.post).toHaveBeenCalledWith("/admin/agencies/2/reject")
    expect(result).toEqual(mockDTO)
  })

  it("getBuyers calls GET /buyers and returns DTOs", async () => {
    // arrange
    const mockDTOs: BuyerResponseDTO[] = [
      {
        id: 1,
        firstName: "Carlos",
        lastName: "Tevez",
        email: "carlos@example.com",
        nationalId: "12345678",
        phoneNumber: "11223344",
      },
    ]
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockDTOs })

    // act
    const result = await adminAgencyDataSource.getBuyers()

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/buyers")
    expect(result).toEqual(mockDTOs)
  })

  it("getTopBuyers calls GET /admin/metrics/top-buyers and returns DTOs", async () => {
    // arrange
    const mockDTOs: TopBuyerDTO[] = [
      {
        buyer: {
          id: 1,
          firstName: "Lionel",
          lastName: "Messi",
          email: "lio@example.com",
          nationalId: "12345678",
          phoneNumber: "11223344",
        },
        purchaseCount: 20,
      },
    ]
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockDTOs })

    // act
    const result = await adminAgencyDataSource.getTopBuyers()

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/admin/metrics/top-buyers")
    expect(result).toEqual(mockDTOs)
  })

  it("getTopRankedDestinations calls GET /admin/metrics/top-destinations and returns DTOs", async () => {
    // arrange
    const mockDTOs: TopDestinationDTO[] = [
      {
        city: {
          id: 1,
          name: "Cancún",
          countryDTO: { isoCode: "MX", name: "México" },
        },
        salesCount: 15,
      },
    ]
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockDTOs })

    // act
    const result = await adminAgencyDataSource.getTopRankedDestinations()

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/admin/metrics/top-destinations")
    expect(result).toEqual(mockDTOs)
  })

  it("getTopAgencies calls GET /admin/metrics/top-agencies and returns DTOs", async () => {
    // arrange
    const mockDTOs: TopAgencyDTO[] = [
      {
        agency: {
          id: 1,
          businessName: "Viajes Express",
          email: "email@agencia1.com",
        },
        sellsCount: 150,
      },
    ]
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockDTOs })

    // act
    const result = await adminAgencyDataSource.getTopAgencies()

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/admin/metrics/top-agencies")
    expect(result).toEqual(mockDTOs)
  })

  it("getTopRatedDestinations calls GET /admin/metrics/top-rated-destinations and returns DTOs", async () => {
    // arrange
    const mockDTOs: TopRatedCityDTO[] = [
      {
        city: {
          id: 2,
          name: "Bariloche",
          countryDTO: { isoCode: "AR", name: "Argentina" },
        },
        stars: 9.9,
      },
    ]
    vi.mocked(apiClient.get).mockResolvedValue({ data: mockDTOs })

    // act
    const result = await adminAgencyDataSource.getTopRatedDestinations()

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/admin/metrics/top-rated-destinations")
    expect(result).toEqual(mockDTOs)
  })
})
