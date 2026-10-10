import { beforeEach, describe, expect, it, vi } from "vitest"
import { useAdminStore } from "./admin"
import { adminAgencyDataSource } from "../datasources/admin"
import type {
  AgencyResponseDTO,
  TopAgencyDTO,
  BuyerResponseDTO,
  TopRatedCityDTO,
  TopBuyerDTO,
  TopDestinationDTO,
} from "../types/admin"
import type {
  Buyer,
  TopAgency,
  TopBuyer,
  TopDestination,
  TopRatedDestination,
} from "../models/admin"
import type { Agency } from "@/models/package"

vi.mock("../datasources/admin", () => ({
  adminAgencyDataSource: {
    getPendingAgencies: vi.fn(),
    getAllAgencies: vi.fn(),
    authorizeAgency: vi.fn(),
    rejectAgency: vi.fn(),
    getBuyers: vi.fn(),
    getTopBuyers: vi.fn(),
    getTopRankedDestinations: vi.fn(),
    getTopAgencies: vi.fn(),
    getTopRatedDestinations: vi.fn(),
  },
}))

describe("useAdminStore", () => {
  const initialDTOs: AgencyResponseDTO[] = [
    {
      id: 1,
      businessName: "Agencia Sol",
      taxId: "30-11111111-1",
      email: "sol@agencia.com",
      status: "PENDING",
    },
    {
      id: 2,
      businessName: "Agencia Luna",
      taxId: "30-22222222-2",
      email: "luna@agencia.com",
      status: "PENDING",
    },
  ]

  beforeEach(() => {
    vi.clearAllMocks()
    useAdminStore.setState({
      agencies: [],
      pendingAgencies: [],
      buyers: [],
      topBuyers: [],
      topRankedDestinations: [],
      topAgencies: [],
      topRatedDestinations: [],
      isLoading: false,
      isLoadingAgencies: false,
      isLoadingBuyers: false,
      isLoadingMetrics: false,
      processingAgencyId: null,
      error: null,
    })
  })

  it("fetchPendingAgencies loads agencies and maps to domain model", async () => {
    // arrange
    const expectedAgencies: Agency[] = [
      {
        id: 1,
        businessName: "Agencia Sol",
        taxId: "30-11111111-1",
        email: "sol@agencia.com",
        status: "PENDING"
      },
      {
        id: 2,
        businessName: "Agencia Luna",
        taxId: "30-22222222-2",
        email: "luna@agencia.com",
        status: "PENDING"
      },
    ]
    vi.mocked(adminAgencyDataSource.getPendingAgencies).mockResolvedValue(initialDTOs)

    // act
    await useAdminStore.getState().fetchPendingAgencies()

    // assert
    expect(useAdminStore.getState().pendingAgencies).toEqual(expectedAgencies)
    expect(useAdminStore.getState().isLoading).toBe(false)
  })

  it("fetchAllAgencies loads all agencies and syncs pendingAgencies", async () => {
    // arrange
    const allDTOs: AgencyResponseDTO[] = [
      {
        id: 1,
        businessName: "Agencia Sol",
        taxId: "30-11111111-1",
        email: "email@email1.com",
        status: "PENDING",
      },
      {
        id: 2,
        businessName: "Agencia Luna",
        taxId: "30-22222222-2",
        email: "email@email2.com",
        status: "AUTHORIZED",
      },
    ]
    const expectedAgencies: Agency[] = [
      {
        id: 1,
        businessName: "Agencia Sol",
        taxId: "30-11111111-1",
        email: "email@email1.com",
        status: "PENDING",
      },
      {
        id: 2,
        businessName: "Agencia Luna",
        taxId: "30-22222222-2",
        email: "email@email2.com",
        status: "AUTHORIZED",
      },
    ]
    vi.mocked(adminAgencyDataSource.getAllAgencies).mockResolvedValue(allDTOs)

    // act
    await useAdminStore.getState().fetchAllAgencies()

    // assert
    expect(useAdminStore.getState().agencies).toEqual(expectedAgencies)
    expect(useAdminStore.getState().pendingAgencies).toHaveLength(1)
    expect(useAdminStore.getState().pendingAgencies[0].id).toBe(1)
  })

  it("fetchBuyers loads buyers and maps to domain model", async () => {
    // arrange
    const buyersDTO: BuyerResponseDTO[] = [
      {
        id: 1,
        firstName: "Lionel",
        lastName: "Messi",
        email: "lio@afa.com",
        nationalId: "10101010",
        phoneNumber: "12345678",
      },
    ]
    const expectedBuyers: Buyer[] = [
      {
        id: 1,
        firstName: "Lionel",
        lastName: "Messi",
        email: "lio@afa.com",
        nationalId: "10101010",
        phoneNumber: "12345678",
      },
    ]
    vi.mocked(adminAgencyDataSource.getBuyers).mockResolvedValue(buyersDTO)

    // act
    await useAdminStore.getState().fetchBuyers()

    // assert
    expect(useAdminStore.getState().buyers).toEqual(expectedBuyers)
    expect(useAdminStore.getState().isLoadingBuyers).toBe(false)
  })

  it("fetchTopBuyers loads top buyers correctly", async () => {
    // arrange
    const dtos: TopBuyerDTO[] = [
      {
        buyer: {
          id: 10,
          firstName: "Rodrigo",
          lastName: "De Paul",
          email: "rodri@afa.com",
          phoneNumber: "1127278888",
          nationalId: "20456312"
        },
        purchaseCount: 8,
      },
    ]
    const expectedTopBuyers: TopBuyer[] = [
      {
        buyer: {
          id: 10,
          firstName: "Rodrigo",
          lastName: "De Paul",
          email: "rodri@afa.com",
          phoneNumber: "1127278888",
          nationalId: "20456312"
        },
        purchases: 8,
        rank: 1,
      },
    ]
    vi.mocked(adminAgencyDataSource.getTopBuyers).mockResolvedValue(dtos)

    // act
    await useAdminStore.getState().fetchTopBuyers()

    // assert
    expect(useAdminStore.getState().topBuyers).toEqual(expectedTopBuyers)
  })

  it("fetchTopRankedDestinations loads top destinations correctly", async () => {
    // arrange
    const dtos: TopDestinationDTO[] = [
      {
        city: {
          id: 50,
          name: "Bariloche",
          countryDTO: { isoCode: "AR", name: "Argentina" },
        },
        salesCount: 8,
      },
    ]
    const expectedTopDestinations: TopDestination[] = [
      {
        city: {
          id: 50,
          name: "Bariloche",
          country: { isoCode: "AR", name: "Argentina" },
        },
        rank: 1,
        sales: 8,
      },
    ]
    vi.mocked(adminAgencyDataSource.getTopRankedDestinations).mockResolvedValue(dtos)

    // act
    await useAdminStore.getState().fetchTopRankedDestinations()

    // assert
    expect(useAdminStore.getState().topRankedDestinations).toEqual(expectedTopDestinations)
  })

  it("fetchTopAgencies loads top agencies correctly", async () => {
    // arrange
    const dtos: TopAgencyDTO[] = [
      {
        agency: {
          id: 1,
          businessName: "Agencia Sol",
          email: "email@agencia.com",
        },
        sellsCount: 80,
      },
    ]
    const expectedTopAgencies: TopAgency[] = [
      {
        agency: {
          id: 1,
          businessName: "Agencia Sol",
          email: "email@agencia.com",
        },
        sales: 80,
        rank: 1,
      },
    ]
    vi.mocked(adminAgencyDataSource.getTopAgencies).mockResolvedValue(dtos)

    // act
    await useAdminStore.getState().fetchTopAgencies()

    // assert
    expect(useAdminStore.getState().topAgencies).toEqual(expectedTopAgencies)
  })

  it("fetchTopRatedDestinations loads top rated destinations correctly", async () => {
    // arrange
    const dtos: TopRatedCityDTO[] = [
      {
        city: {
          id: 50,
          name: "Bariloche",
          countryDTO: { isoCode: "AR", name: "Argentina" },
        },
        stars: 9,
      },
    ]
    const expectedRated: TopRatedDestination[] = [
      {
        city: {
          id: 50,
          name: "Bariloche",
          country: { isoCode: "AR", name: "Argentina" }
        },
        stars: 9,
        rank: 1,
      },
    ]
    vi.mocked(adminAgencyDataSource.getTopRatedDestinations).mockResolvedValue(dtos)

    // act
    await useAdminStore.getState().fetchTopRatedDestinations()

    // assert
    expect(useAdminStore.getState().topRatedDestinations).toEqual(expectedRated)
  })

  it("authorizeAgency removes the approved agency from pendingAgencies", async () => {
    // arrange
    useAdminStore.setState({
      pendingAgencies: [
        {
          id: 1,
          businessName: "Agencia Sol",
          taxId: "30-11111111-1",
          email: "sol@agencia.com",
          status: "PENDING",
        },
        {
          id: 2,
          businessName: "Agencia Luna",
          taxId: "30-22222222-2",
          email: "luna@agencia.com",
          status: "PENDING",
        },
      ],
    })
    vi.mocked(adminAgencyDataSource.authorizeAgency).mockResolvedValue({
      id: 1,
      businessName: "Agencia Sol",
      taxId: "30-11111111-1",
      email: "sol@agencia.com",
      status: "AUTHORIZED",
    })

    // act
    await useAdminStore.getState().authorizeAgency(1)

    // assert
    const remaining = useAdminStore.getState().pendingAgencies
    expect(remaining).toHaveLength(1)
    expect(remaining[0].id).toBe(2)
    expect(useAdminStore.getState().processingAgencyId).toBeNull()
  })

  it("rejectAgency removes the rejected agency from pendingAgencies", async () => {
    // arrange
    useAdminStore.setState({
      pendingAgencies: [
        {
          id: 1,
          businessName: "Agencia Sol",
          taxId: "30-11111111-1",
          email: "sol@agencia.com",
          status: "PENDING",
        },
        {
          id: 2,
          businessName: "Agencia Luna",
          taxId: "30-22222222-2",
          email: "luna@agencia.com",
          status: "PENDING",
        },
      ],
    })
    vi.mocked(adminAgencyDataSource.rejectAgency).mockResolvedValue({
      id: 2,
      businessName: "Agencia Luna",
      taxId: "30-22222222-2",
      email: "luna@agencia.com",
      status: "REJECTED",
    })

    // act
    await useAdminStore.getState().rejectAgency(2)

    // assert
    const remaining = useAdminStore.getState().pendingAgencies
    expect(remaining).toHaveLength(1)
    expect(remaining[0].id).toBe(1)
    expect(useAdminStore.getState().processingAgencyId).toBeNull()
  })

  it("sets error when fetchPendingAgencies fails", async () => {
    // arrange
    vi.mocked(adminAgencyDataSource.getPendingAgencies).mockRejectedValue(
      new Error("Network error")
    )

    // act & assert
    await expect(
      useAdminStore.getState().fetchPendingAgencies()
    ).rejects.toThrow("Network error")
    expect(useAdminStore.getState().error).toBe("Network error")
    expect(useAdminStore.getState().isLoading).toBe(false)
  })
})
