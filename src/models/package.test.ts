import { describe, expect, it } from "vitest"
import { calculateNights, packageMappers } from "./package"
import type {
  AgencyResponseDTO,
  HotelResponseDTO,
  TravelPackageResponseDTO,
  PageResponseDTO,
} from "../types/package"

describe("package models and mappers", () => {
  it("calculates nights between two dates correctly", () => {
    // arrange
    const checkIn = new Date("2026-10-01T12:00:00Z")
    const checkOut = new Date("2026-10-08T12:00:00Z")
    const expectedNights = 7

    // act
    const nights = calculateNights(checkIn, checkOut)

    // assert
    expect(nights).toBe(expectedNights)
  })

  it("maps AgencyResponseDTO to Agency domain model", () => {
    // arrange
    const agencyDTO: AgencyResponseDTO = {
      id: 5,
      businessName: "Viajes Patagonia SRL",
      taxId: "30-55667788-9",
    }

    // act
    const agency = packageMappers.mapAgencyDTOToModel(agencyDTO)

    // assert
    expect(agency).toEqual({
      id: 5,
      businessName: "Viajes Patagonia SRL",
      taxId: "30-55667788-9",
    })
  })

  it("maps HotelResponseDTO to Hotel domain model", () => {
    // arrange
    const hotelDTO: HotelResponseDTO = {
      id: 40,
      name: "Hotel de los Andes",
      city: {
        id: 3,
        name: "Mendoza",
        countryDTO: { isoCode: "AR", name: "Argentina" },
      },
      photoUrl: "https://example.com/hotel.jpg",
    }

    // act
    const hotel = packageMappers.mapHotelDTOToModel(hotelDTO)

    // assert
    expect(hotel.id).toBe(40)
    expect(hotel.name).toBe("Hotel de los Andes")
    expect(hotel.city.name).toBe("Mendoza")
    expect(hotel.photoUrl).toBe("https://example.com/hotel.jpg")
  })

  it("maps TravelPackageResponseDTO with full flight and hotel data to TravelPackage domain model", () => {
    // arrange
    const dto: TravelPackageResponseDTO = {
      id: 10,
      name: "Paquete Cancún All Inclusive",
      description: "Vuelo y hotel frente a la playa con todo incluido.",
      price: 1800,
      initialDate: "2026-11-10T10:00:00Z",
      finalDate: "2026-11-17T10:00:00Z",
      hotel: {
        id: 101,
        name: "Resort del Caribe",
        city: {
          id: 20,
          name: "Cancún",
          countryDTO: { isoCode: "MX", name: "México" },
        },
        photoUrl: "https://example.com/hotel.jpg",
      },
      agency: {
        id: 1,
        businessName: "TusViajes Premium",
        taxId: "30-11223344-5",
      },
      departureFlight: {
        id: 301,
        flightNumber: "MX-202",
        originCity: {
          id: 1,
          name: "Buenos Aires",
          countryDTO: { isoCode: "AR", name: "Argentina" },
        },
        destinationCity: {
          id: 20,
          name: "Cancún",
          countryDTO: { isoCode: "MX", name: "México" },
        },
        departureTime: "2026-11-10T10:00:00Z",
        arrivalTime: "2026-11-10T18:00:00Z",
      },
      arrivalFlight: {
        id: 302,
        flightNumber: "MX-203",
        originCity: {
          id: 20,
          name: "Cancún",
          countryDTO: { isoCode: "MX", name: "México" },
        },
        destinationCity: {
          id: 1,
          name: "Buenos Aires",
          countryDTO: { isoCode: "AR", name: "Argentina" },
        },
        departureTime: "2026-11-17T12:00:00Z",
        arrivalTime: "2026-11-17T20:00:00Z",
      },
    }

    // act
    const model = packageMappers.mapDTOToModel(dto)

    // assert
    expect(model.id).toBe(10)
    expect(model.name).toBe("Paquete Cancún All Inclusive")
    expect(model.nights).toBe(7)
    expect(model.initialDate).toEqual(new Date("2026-11-10T10:00:00Z"))
    expect(model.finalDate).toEqual(new Date("2026-11-17T10:00:00Z"))
    expect(model.hotel.name).toBe("Resort del Caribe")
    expect(model.hotel.city.name).toBe("Cancún")
    expect(model.agency?.businessName).toBe("TusViajes Premium")
    expect(model.departureFlight.flightNumber).toBe("MX-202")
    expect(model.departureFlight.originCity.name).toBe("Buenos Aires")
    expect(model.departureFlight.destinationCity.name).toBe("Cancún")
    expect(model.arrivalFlight.flightNumber).toBe("MX-203")
    expect(model.arrivalFlight.originCity.name).toBe("Cancún")
    expect(model.arrivalFlight.destinationCity.name).toBe("Buenos Aires")
  })

  it("maps PageResponseDTO to Page domain model with complete data", () => {
    // arrange
    const pageDTO: PageResponseDTO<TravelPackageResponseDTO> = {
      content: [
        {
          id: 1,
          name: "Tour Madrid",
          description: "Vuelo y hotel céntrico",
          price: 1200,
          initialDate: "2026-09-01T00:00:00Z",
          finalDate: "2026-09-10T00:00:00Z",
          hotel: {
            id: 1,
            name: "Hotel Plaza Mayor",
            city: { id: 10, name: "Madrid", countryDTO: { isoCode: "ES", name: "España" } },
          },
          departureFlight: {
            id: 1,
            flightNumber: "IB-6840",
            originCity: { id: 1, name: "Buenos Aires", countryDTO: { isoCode: "AR", name: "Argentina" } },
            destinationCity: { id: 10, name: "Madrid", countryDTO: { isoCode: "ES", name: "España" } },
            departureTime: "2026-09-01T12:00:00Z",
            arrivalTime: "2026-09-02T06:00:00Z",
          },
          arrivalFlight: {
            id: 2,
            flightNumber: "IB-6841",
            originCity: { id: 10, name: "Madrid", countryDTO: { isoCode: "ES", name: "España" } },
            destinationCity: { id: 1, name: "Buenos Aires", countryDTO: { isoCode: "AR", name: "Argentina" } },
            departureTime: "2026-09-10T12:00:00Z",
            arrivalTime: "2026-09-11T06:00:00Z",
          },
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
    const pageModel = packageMappers.mapPageDTOToModel(pageDTO)

    // assert
    expect(pageModel.content).toHaveLength(1)
    expect(pageModel.content[0].name).toBe("Tour Madrid")
    expect(pageModel.content[0].nights).toBe(9)
    expect(pageModel.content[0].departureFlight.flightNumber).toBe("IB-6840")
    expect(pageModel.content[0].hotel.city.name).toBe("Madrid")
    expect(pageModel.totalElements).toBe(1)
    expect(pageModel.totalPages).toBe(1)
    expect(pageModel.size).toBe(10)
    expect(pageModel.number).toBe(0)
  })
})
