import { beforeEach, describe, expect, it, vi } from "vitest"
import { packageDataSource } from "./package"
import publicClient from "./public-client"
import type { SearchPackageCriteria } from "../models/search"
import type { PageResponseDTO, TravelPackageResponseDTO } from "../types/package"
import { favoritePackageDTO } from "../tests/fixtures/package"

vi.mock("./public-client", () => ({ default: { get: vi.fn() } }))

describe("packageDataSource date filters", () => {
  let expectedPackages: PageResponseDTO<TravelPackageResponseDTO>

  beforeEach(() => {
    expectedPackages = {
      content: [favoritePackageDTO], totalElements: 1, totalPages: 1, number: 0, size: 10,
    }
    vi.resetAllMocks()
    vi.mocked(publicClient.get).mockResolvedValue({ data: expectedPackages })
  })

  it("includes the entire local departure and return days without shifting to UTC or changing the selected dates", async () => {
    // arrange
    const departureFrom = new Date(2026, 10, 1, 8, 30)
    const departureTo = new Date(2026, 10, 10, 14, 45)
    const arrivalFrom = new Date(2026, 10, 15, 9, 15)
    const arrivalTo = new Date(2026, 10, 21, 18, 20)
    const selectedDates = [departureFrom, departureTo, arrivalFrom, arrivalTo]
    const expectedSelectedTimes = selectedDates.map((date) => date.getTime())
    const criteria: SearchPackageCriteria = {
      originCountryIso: "AR", originCityId: 1,
      destinationCountryIso: "BR", destinationCityId: 11,
      departureDateRange: { from: departureFrom, to: departureTo },
      arrivalDateRange: { from: arrivalFrom, to: arrivalTo },
      page: 1, size: 5,
    }
    const expectedParams = {
      originCountryIso: "AR", originCityId: 1,
      destinationCountryIso: "BR", destinationCityId: 11,
      departureFrom: "2026-11-01T00:00:00.000",
      departureTo: "2026-11-10T23:59:59.999",
      arrivalFrom: "2026-11-15T00:00:00.000",
      arrivalTo: "2026-11-21T23:59:59.999",
      page: 1, size: 5,
    }

    // act
    const packages = await packageDataSource.searchPackages(criteria)

    // assert
    expect(publicClient.get).toHaveBeenCalledExactlyOnceWith("/travel-packages", { params: expectedParams })
    expect(packages).toEqual(expectedPackages)
    expect(selectedDates.map((date) => date.getTime())).toEqual(expectedSelectedTimes)
  })

  it("keeps a same-day search inclusive even on the last day of the year", async () => {
    // arrange
    const selectedDay = new Date(2026, 11, 31)
    const criteria: SearchPackageCriteria = {
      departureDateRange: { from: selectedDay, to: selectedDay },
      arrivalDateRange: { from: selectedDay, to: selectedDay },
    }
    const expectedParams = {
      page: 0, size: 10,
      departureFrom: "2026-12-31T00:00:00.000",
      departureTo: "2026-12-31T23:59:59.999",
      arrivalFrom: "2026-12-31T00:00:00.000",
      arrivalTo: "2026-12-31T23:59:59.999",
    }

    // act
    await packageDataSource.searchPackages(criteria)

    // assert
    expect(publicClient.get).toHaveBeenCalledExactlyOnceWith("/travel-packages", { params: expectedParams })
  })

  it("keeps date ranges open when no end day is selected", async () => {
    // arrange
    const criteria: SearchPackageCriteria = {
      departureDateRange: { from: new Date(2026, 10, 10) },
      arrivalDateRange: { from: new Date(2026, 10, 15) },
    }
    const expectedParams = {
      page: 0, size: 10,
      departureFrom: "2026-11-10T00:00:00.000",
      arrivalFrom: "2026-11-15T00:00:00.000",
    }

    // act
    await packageDataSource.searchPackages(criteria)

    // assert
    expect(publicClient.get).toHaveBeenCalledExactlyOnceWith("/travel-packages", { params: expectedParams })
  })

  it("omits date filters when no dates are selected", async () => {
    // arrange
    const expectedParams = { page: 0, size: 10 }

    // act
    await packageDataSource.searchPackages()

    // assert
    expect(publicClient.get).toHaveBeenCalledExactlyOnceWith("/travel-packages", { params: expectedParams })
  })
})
