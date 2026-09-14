import { act, renderHook } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useSearch } from "./useSearch"
import { useSearchStore } from "../stores/search"
import type { City, Country } from "../models/location"
import type { SearchPackageCriteria } from "../models/search"

vi.mock("../stores/search", () => ({
  useSearchStore: vi.fn(),
}))

describe("useSearch hook", () => {
  const mockCountries: Country[] = [
    { isoCode: "AR", name: "Argentina" },
    { isoCode: "US", name: "Estados Unidos" },
  ]

  const mockOriginCities: City[] = [
    { id: 1, country: mockCountries[0], name: "Buenos Aires" },
    { id: 2, country: mockCountries[0], name: "Córdoba" },
  ]

  const mockDestinationCities: City[] = [
    { id: 5, country: mockCountries[1], name: "Nueva York" },
    { id: 6, country: mockCountries[1], name: "Miami" },
  ]

  let mockFetchCountries: ReturnType<typeof vi.fn>
  let mockFetchOriginCities: ReturnType<typeof vi.fn>
  let mockFetchDestinationCities: ReturnType<typeof vi.fn>
  let mockResetOriginCities: ReturnType<typeof vi.fn>
  let mockResetDestinationCities: ReturnType<typeof vi.fn>
  let mockSearchPackages: ReturnType<typeof vi.fn>

  beforeEach(() => {
    vi.clearAllMocks()
    mockFetchCountries = vi.fn()
    mockFetchOriginCities = vi.fn()
    mockFetchDestinationCities = vi.fn()
    mockResetOriginCities = vi.fn()
    mockResetDestinationCities = vi.fn()
    mockSearchPackages = vi.fn()

    vi.mocked(useSearchStore).mockReturnValue({
      countries: mockCountries,
      originCities: mockOriginCities,
      destinationCities: mockDestinationCities,
      packages: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      isLoadingCountries: false,
      isLoadingOriginCities: false,
      isLoadingDestinationCities: false,
      isSearching: false,
      searchError: null,
      lastSearchCriteria: null,
      fetchCountries: mockFetchCountries,
      fetchOriginCities: mockFetchOriginCities,
      fetchDestinationCities: mockFetchDestinationCities,
      resetOriginCities: mockResetOriginCities,
      resetDestinationCities: mockResetDestinationCities,
      searchPackages: mockSearchPackages,
    })
  })

  it("exposes the available countries and cities provided by the store", () => {
    // arrange
    const expectedCountries = mockCountries
    const expectedOriginCities = mockOriginCities
    const expectedDestinationCities = mockDestinationCities

    // act
    const { result } = renderHook(() => useSearch())

    // assert
    expect(result.current.countries).toEqual(expectedCountries)
    expect(result.current.originCities).toEqual(expectedOriginCities)
    expect(result.current.destinationCities).toEqual(expectedDestinationCities)
    expect(result.current.page).toEqual(0)
    expect(result.current.size).toEqual(10)
  })

  it("fetches countries and initial packages on mount if the store is empty", () => {
    // arrange
    vi.mocked(useSearchStore).mockReturnValue({
      countries: [],
      originCities: [],
      destinationCities: [],
      packages: [],
      page: 0,
      size: 10,
      totalElements: 0,
      totalPages: 0,
      isLoadingCountries: false,
      isLoadingOriginCities: false,
      isLoadingDestinationCities: false,
      isSearching: false,
      searchError: null,
      lastSearchCriteria: null,
      fetchCountries: mockFetchCountries,
      fetchOriginCities: mockFetchOriginCities,
      fetchDestinationCities: mockFetchDestinationCities,
      resetOriginCities: mockResetOriginCities,
      resetDestinationCities: mockResetDestinationCities,
      searchPackages: mockSearchPackages,
    })

    // act
    renderHook(() => useSearch())

    // assert
    expect(mockFetchCountries).toHaveBeenCalledTimes(1)
    expect(mockSearchPackages).toHaveBeenCalledWith({ page: 0, size: 10 })
  })

  it("updates origin country and fetches origin cities when selected", () => {
    // arrange
    const selectedCountryIso = "AR"
    const { result } = renderHook(() => useSearch())

    // act
    act(() => {
      result.current.onSelectOriginCountry(selectedCountryIso)
    })

    // assert
    expect(result.current.selectedOriginCountry).toEqual(selectedCountryIso)
    expect(result.current.selectedOriginCity).toEqual(0)
    expect(mockFetchOriginCities).toHaveBeenCalledWith(selectedCountryIso)
  })

  it("updates destination country and fetches destination cities when selected", () => {
    // arrange
    const selectedCountryIso = "US"
    const { result } = renderHook(() => useSearch())

    // act
    act(() => {
      result.current.onSelectDestinationCountry(selectedCountryIso)
    })

    // assert
    expect(result.current.selectedDestinationCountry).toEqual(selectedCountryIso)
    expect(result.current.selectedDestinationCity).toEqual(0)
    expect(mockFetchDestinationCities).toHaveBeenCalledWith(selectedCountryIso)
  })

  it("updates selected origin and destination cities", () => {
    // arrange
    const expectedOriginCityId = 1
    const expectedDestinationCityId = 5
    const { result } = renderHook(() => useSearch())

    // act
    act(() => {
      result.current.onSelectOriginCity(expectedOriginCityId)
      result.current.onSelectDestinationCity(expectedDestinationCityId)
    })

    // assert
    expect(result.current.selectedOriginCity).toEqual(expectedOriginCityId)
    expect(result.current.selectedDestinationCity).toEqual(expectedDestinationCityId)
  })

  it("allows submitting an empty form without errors and sends default pagination size 10", async () => {
    // arrange
    const expectedEmptyCriteria: SearchPackageCriteria = {
      originCountryIso: undefined,
      originCityId: undefined,
      destinationCountryIso: undefined,
      destinationCityId: undefined,
      departureDateRange: undefined,
      arrivalDateRange: undefined,
      page: 0,
      size: 10,
    }
    const { result } = renderHook(() => useSearch())

    // act
    await act(async () => {
      await result.current.onSubmit()
    })

    // assert
    expect(result.current.errors).toEqual({})
    expect(mockSearchPackages).toHaveBeenCalledWith(expectedEmptyCriteria)
  })

  it("dispatches validated search criteria to the store upon valid submission", async () => {
    // arrange
    const expectedCriteria: SearchPackageCriteria = {
      originCountryIso: "AR",
      originCityId: 1,
      destinationCountryIso: "US",
      destinationCityId: 5,
      departureDateRange: undefined,
      arrivalDateRange: undefined,
      page: 0,
      size: 10,
    }
    const { result } = renderHook(() => useSearch())

    // act
    act(() => {
      result.current.onSelectOriginCountry("AR")
      result.current.onSelectOriginCity(1)
      result.current.onSelectDestinationCountry("US")
      result.current.onSelectDestinationCity(5)
    })

    await act(async () => {
      await result.current.onSubmit()
    })

    // assert
    expect(mockSearchPackages).toHaveBeenCalledWith(expectedCriteria)
  })

  it("navigates to the selected page when onChangePage is triggered", async () => {
    // arrange
    const targetPage = 2
    const { result } = renderHook(() => useSearch())

    // act
    await act(async () => {
      await result.current.onChangePage(targetPage)
    })

    // assert
    expect(mockSearchPackages).toHaveBeenCalledWith(
      expect.objectContaining({
        page: targetPage,
        size: 10,
      })
    )
  })

  it("clears origin country and resets origin cities when passing undefined", () => {
    // arrange
    const { result } = renderHook(() => useSearch())

    // act
    act(() => {
      result.current.onSelectOriginCountry("AR")
      result.current.onSelectOriginCity(1)
      result.current.onSelectOriginCountry(undefined)
    })

    // assert
    expect(result.current.selectedOriginCountry).toEqual("")
    expect(result.current.selectedOriginCity).toEqual(0)
    expect(mockResetOriginCities).toHaveBeenCalledTimes(1)
  })

  it("clears destination country and resets destination cities when passing undefined", () => {
    // arrange
    const { result } = renderHook(() => useSearch())

    // act
    act(() => {
      result.current.onSelectDestinationCountry("US")
      result.current.onSelectDestinationCity(5)
      result.current.onSelectDestinationCountry(undefined)
    })

    // assert
    expect(result.current.selectedDestinationCountry).toEqual("")
    expect(result.current.selectedDestinationCity).toEqual(0)
    expect(mockResetDestinationCities).toHaveBeenCalledTimes(1)
  })
})
