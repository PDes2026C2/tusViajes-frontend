import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useAgency } from "./useAgency"
import { useAgencyStore } from "../stores/agency"
import { useAuthStore } from "../stores/auth"
import type { AgencyFlight, AgencyPackageItem, AgencySale } from "../models/agency"

vi.mock("react-toastify", () => ({
  toast: {
    success: vi.fn(),
    error: vi.fn(),
    info: vi.fn(),
  },
}))

describe("useAgency hook", () => {
  const mockCity = {
    id: 5,
    name: "Nueva York",
    country: { isoCode: "US", name: "Estados Unidos" },
  }

  const mockFlight: AgencyFlight = {
    id: 501,
    flightNumber: "AR-1300",
    airline: "Aerolíneas Argentinas",
    originCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
    destinationCity: mockCity,
    departureDate: new Date("2026-10-01T10:00:00Z"),
    arrivalDate: new Date("2026-10-01T18:00:00Z"),
    capacity: 200,
    availableSeats: 25,
    price: 650,
  }

  const mockPackage: AgencyPackageItem = {
    id: 101,
    name: "Paquete a Nueva York",
    description: "Excelente viaje",
    price: 1250,
    startDate: new Date("2026-10-01T10:00:00Z"),
    endDate: new Date("2026-10-08T10:00:00Z"),
    nights: 7,
    hotel: { id: 201, name: "Hotel NY", city: mockCity, photoUrl: "http://photo.com/1.jpg" },
    departureFlight: mockFlight as any,
    returnFlight: mockFlight as any,
  }

  const mockSale: AgencySale = {
    id: 1001,
    buyer: {
      id: 1,
      firstName: "Martín",
      lastName: "Gómez",
      fullName: "Martín Gómez",
      email: "martin@gmail.com",
      nationalId: "30123456",
    },
    travelPackage: {
      id: 101,
      name: "Paquete a Nueva York",
      hotelName: "Hotel NY",
      destinationCityName: "Nueva York, Estados Unidos",
      initialDate: new Date("2026-10-01T10:00:00Z"),
      finalDate: new Date("2026-10-08T10:00:00Z"),
    },
    price: 1250,
    purchasedAt: new Date("2026-09-15T10:00:00Z"),
  }

  beforeEach(() => {
    vi.clearAllMocks()
    useAuthStore.setState({
      user: { id: 2, email: "agencia@tusviajes.com", role: "AGENCY" },
      isAuthenticated: true,
    })

    useAgencyStore.setState({
      packages: [mockPackage],
      flights: [mockFlight],
      sales: [mockSale],
      hotels: [],
      metrics: { totalRevenue: 1250, totalSales: 1, uniqueClients: 1 },
      isLoadingPackages: false,
      isLoadingFlights: false,
      isLoadingSales: false,
      isLoadingHotels: false,
      isSubmitting: false,
      isDeleting: false,
      error: null,
      fetchPackages: vi.fn().mockResolvedValue(undefined),
      createPackage: vi.fn().mockResolvedValue(undefined),
      updatePackage: vi.fn().mockResolvedValue(undefined),
      deletePackage: vi.fn().mockResolvedValue(undefined),
      fetchHotels: vi.fn().mockResolvedValue(undefined),
      searchFlights: vi.fn().mockResolvedValue(undefined),
      fetchSales: vi.fn().mockResolvedValue(undefined),
      clearError: vi.fn(),
    })
  })

  it("initializes with default tab and filtered lists", () => {
    // arrange & act
    const { result } = renderHook(() => useAgency())

    // assert
    expect(result.current.activeTab).toBe("packages")
    expect(result.current.filteredPackages).toHaveLength(1)
    expect(result.current.filteredFlights).toHaveLength(1)
    expect(result.current.filteredSales).toHaveLength(1)
  })

  it("changes active tab when onTabChange is called", () => {
    // arrange
    const { result } = renderHook(() => useAgency())

    // act
    act(() => {
      result.current.onTabChange("flights")
    })

    // assert
    expect(result.current.activeTab).toBe("flights")
  })

  it("filters packages by search query", () => {
    // arrange
    const { result } = renderHook(() => useAgency())

    // act
    act(() => {
      result.current.onPackageSearchChange("inexistente")
    })

    // assert
    expect(result.current.filteredPackages).toHaveLength(0)

    // act 2
    act(() => {
      result.current.onPackageSearchChange("Nueva York")
    })

    // assert 2
    expect(result.current.filteredPackages).toHaveLength(1)
  })

  it("opens create package modal and closes it", () => {
    // arrange
    const { result } = renderHook(() => useAgency())

    // act
    act(() => {
      result.current.onOpenCreatePackage()
    })

    // assert
    expect(result.current.formModal.isOpen).toBe(true)
    expect(result.current.formModal.editingPackage).toBeNull()

    // act 2
    act(() => {
      result.current.onCloseFormModal()
    })

    // assert 2
    expect(result.current.formModal.isOpen).toBe(false)
  })

  it("switches to packages tab with preset departure flight when onUseFlightInPackage is called", () => {
    // arrange
    const { result } = renderHook(() => useAgency())

    // act
    act(() => {
      result.current.onTabChange("flights")
      result.current.onUseFlightInPackage(mockFlight)
    })

    // assert
    expect(result.current.activeTab).toBe("packages")
    expect(result.current.formModal.isOpen).toBe(true)
    expect(result.current.formModal.presetDepartureFlight).toEqual(mockFlight)
  })

  it("opens delete modal and closes it", () => {
    // arrange
    const { result } = renderHook(() => useAgency())

    // act
    act(() => {
      result.current.onOpenDeleteModal(mockPackage)
    })

    // assert
    expect(result.current.deleteModal.isOpen).toBe(true)
    expect(result.current.deleteModal.packageItem).toEqual(mockPackage)

    // act 2
    act(() => {
      result.current.onCloseDeleteModal()
    })

    // assert 2
    expect(result.current.deleteModal.isOpen).toBe(false)
  })
})
