import { describe, expect, it } from "vitest"
import { getTripStatus, purchaseMappers, type BuyerPurchase } from "./purchase"
import type { BuyerPurchaseResponseDTO, BuyerPurchasesPageDTO } from "../types/buyer"
import { favoritePackageDTO } from "../tests/fixtures/package"

describe("purchase models and mappers", () => {
  const referenceDate = new Date("2026-10-15T12:00:00Z")

  it("determines UPCOMING status when current date is before start date", () => {
    // arrange
    const startDate = new Date("2026-10-20T10:00:00Z")
    const endDate = new Date("2026-10-27T10:00:00Z")
    const expectedStatus = "UPCOMING"

    // act
    const status = getTripStatus(startDate, endDate, referenceDate)

    // assert
    expect(status).toBe(expectedStatus)
  })

  it("determines IN_PROGRESS status when current date is between start and end date", () => {
    // arrange
    const startDate = new Date("2026-10-10T10:00:00Z")
    const endDate = new Date("2026-10-20T10:00:00Z")
    const expectedStatus = "IN_PROGRESS"

    // act
    const status = getTripStatus(startDate, endDate, referenceDate)

    // assert
    expect(status).toBe(expectedStatus)
  })

  it("determines COMPLETED status when current date is after end date", () => {
    // arrange
    const startDate = new Date("2026-10-01T10:00:00Z")
    const endDate = new Date("2026-10-08T10:00:00Z")
    const expectedStatus = "COMPLETED"

    // act
    const status = getTripStatus(startDate, endDate, referenceDate)

    // assert
    expect(status).toBe(expectedStatus)
  })

  it("maps BuyerPurchaseResponseDTO to domain model correctly", () => {
    // arrange
    const rawDTO: BuyerPurchaseResponseDTO = {
      id: 55,
      price: 950,
      purchasedAt: "2026-09-01T14:30:00Z",
      buyer: {
        id: 7,
        firstName: "Thiago",
        lastName: "Tester",
        email: "buyer@example.com",
        nationalId: "12345678",
      },
      travelPackage: favoritePackageDTO,
    }

    const expectedModel: BuyerPurchase = {
      id: 55,
      price: 950,
      purchasedAt: new Date("2026-09-01T14:30:00Z"),
      travelPackage: {
        id: 101,
        name: "Escapada a Bariloche",
        description: "Vuelo y hotel",
        price: 950,
        initialDate: new Date("2026-10-10T10:00:00Z"),
        finalDate: new Date("2026-10-17T10:00:00Z"),
        nights: 7,
        hotel: {
          id: 10,
          name: "Hotel del Cerro",
          city: {
            id: 2,
            name: "Bariloche",
            country: { isoCode: "AR", name: "Argentina" },
          },
          photoUrl: "https://example.com/hotel.jpg",
        },
        departureFlight: {
          id: 11,
          flightNumber: "AR-1200",
          originCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
          destinationCity: { id: 2, name: "Bariloche", country: { isoCode: "AR", name: "Argentina" } },
          departureTime: new Date("2026-10-10T10:00:00Z"),
          arrivalTime: new Date("2026-10-10T12:00:00Z"),
        },
        arrivalFlight: {
          id: 12,
          flightNumber: "AR-1201",
          originCity: { id: 2, name: "Bariloche", country: { isoCode: "AR", name: "Argentina" } },
          destinationCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
          departureTime: new Date("2026-10-17T10:00:00Z"),
          arrivalTime: new Date("2026-10-17T12:00:00Z"),
        },
        agency: {
          id: 1,
          businessName: "Agencia Sol",
          taxId: "30-11111111-1",
          email: "sol@example.com",
          status: "AUTHORIZED",
        },
      },
      status: "IN_PROGRESS",
      isCompleted: false,
    }

    // act
    const result = purchaseMappers.mapDTOToModel(rawDTO, referenceDate)

    // assert
    expect(result).toEqual(expectedModel)
  })

  it("maps BuyerPurchasesPageDTO to domain Page correctly", () => {
    // arrange
    const rawPageDTO: BuyerPurchasesPageDTO = {
      content: [
        {
          id: 55,
          price: 950,
          purchasedAt: "2026-09-01T14:30:00Z",
          travelPackage: favoritePackageDTO,
        },
      ],
      totalElements: 1,
      totalPages: 1,
      size: 10,
      number: 0,
      first: true,
      last: true,
      empty: false,
    }

    // act
    const result = purchaseMappers.mapPageDTOToModel(rawPageDTO, referenceDate)

    // assert
    expect(result.content).toHaveLength(1)
    expect(result.totalElements).toBe(1)
    expect(result.totalPages).toBe(1)
    expect(result.content[0].id).toBe(55)
    expect(result.content[0].status).toBe("IN_PROGRESS")
  })
})
