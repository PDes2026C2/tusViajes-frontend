import { describe, expect, it } from "vitest"
import { agencyMappers, type AgencyFlight } from "./agency"
import type { AgencyFlightDTO, AgencySaleDTO } from "../types/agency"

describe("agencyMappers", () => {
  it("mapFlightDTOToModel correctly maps backend DTO without flightNumber or capacity", () => {
    // arrange: backend FlightDTO returns country (not countryDTO) and no flightNumber/capacity/availableSeats
    const backendDTO: AgencyFlightDTO = {
      id: 99,
      airline: "Aerolíneas Argentinas",
      originCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
      destinationCity: { id: 5, name: "Nueva York", country: { isoCode: "US", name: "Estados Unidos" } },
      departureDate: "2026-10-01T10:00:00.000Z",
      arrivalDate: "2026-10-01T19:00:00.000Z",
    }

    // act
    const model: AgencyFlight = agencyMappers.mapFlightDTOToModel(backendDTO)

    // assert
    expect(model.id).toBe(99)
    expect(model.flightNumber).toBe("AA-99")
    expect(model.airline).toBe("Aerolíneas Argentinas")
    expect(model.originCity.name).toBe("Buenos Aires")
    expect(model.originCity.country.isoCode).toBe("AR")
    expect(model.destinationCity.name).toBe("Nueva York")
    expect(model.destinationCity.country.isoCode).toBe("US")
    expect(model.capacity).toBe(180)
    expect(model.availableSeats).toBe(50)
    expect(model.departureDate).toBeInstanceOf(Date)
    expect(model.arrivalDate).toBeInstanceOf(Date)
  })

  it("mapFlightDTOToModel preserves explicit flightNumber, capacity, and availableSeats", () => {
    // arrange
    const dto: AgencyFlightDTO = {
      id: 501,
      flightNumber: "IB-6844",
      airline: "Iberia",
      originCity: { id: 1, name: "Buenos Aires", countryDTO: { isoCode: "AR", name: "Argentina" } },
      destinationCity: { id: 9, name: "Madrid", countryDTO: { isoCode: "ES", name: "España" } },
      departureDate: "2026-10-05T12:00:00.000Z",
      arrivalDate: "2026-10-06T06:00:00.000Z",
      capacity: 300,
      availableSeats: 15,
      price: 900,
    }

    // act
    const model = agencyMappers.mapFlightDTOToModel(dto)

    // assert
    expect(model.flightNumber).toBe("IB-6844")
    expect(model.capacity).toBe(300)
    expect(model.availableSeats).toBe(15)
    expect(model.price).toBe(900)
  })

  it("mapSaleDTOToModel formats buyer fullName and dates properly", () => {
    // arrange
    const saleDTO: AgencySaleDTO = {
      id: 10,
      buyer: {
        id: 1,
        firstName: "María",
        lastName: "Pérez",
        email: "maria@example.com",
        nationalId: "40123456",
      },
      travelPackage: {
        id: 5,
        name: "Playa del Carmen",
        hotelName: "Resort Riviera",
        destinationCityName: "Cancún",
        initialDate: "2026-11-01T00:00:00.000Z",
        finalDate: "2026-11-10T00:00:00.000Z",
      },
      price: 2400,
      purchasedAt: "2026-09-21T15:30:00.000Z",
    }

    // act
    const sale = agencyMappers.mapSaleDTOToModel(saleDTO)

    // assert
    expect(sale.buyer.fullName).toBe("María Pérez")
    expect(sale.price).toBe(2400)
    expect(sale.travelPackage.destinationCityName).toBe("Cancún")
    expect(sale.purchasedAt).toBeInstanceOf(Date)
  })

  it("calculateMetrics aggregates revenue, count and unique client emails", () => {
    // arrange
    const sales = [
      {
        id: 1,
        buyer: { id: 1, firstName: "A", lastName: "B", fullName: "A B", email: "client1@test.com", nationalId: "1" },
        travelPackage: {} as any,
        price: 1000,
        purchasedAt: new Date(),
      },
      {
        id: 2,
        buyer: { id: 1, firstName: "A", lastName: "B", fullName: "A B", email: "client1@test.com", nationalId: "1" },
        travelPackage: {} as any,
        price: 1500,
        purchasedAt: new Date(),
      },
      {
        id: 3,
        buyer: { id: 2, firstName: "C", lastName: "D", fullName: "C D", email: "client2@test.com", nationalId: "2" },
        travelPackage: {} as any,
        price: 800,
        purchasedAt: new Date(),
      },
    ]

    // act
    const metrics = agencyMappers.calculateMetrics(sales)

    // assert
    expect(metrics.totalRevenue).toBe(3300)
    expect(metrics.totalSales).toBe(3)
    expect(metrics.uniqueClients).toBe(2)
  })
})
