import { describe, expect, it } from "vitest"
import {
  buyerMapper,
  metricsMapper,
  type Buyer,
  type TopAgency,
  type TopBuyer,
  type TopDestination,
  type TopRatedDestination,
} from "./admin"
import type {
  AgencyResponseDTO,
  BuyerResponseDTO,
  TopRatedCityDTO,
  TopBuyerDTO,
  TopAgencyDTO,
} from "../types/admin"
import type { CityDTO } from "../types/location"

describe("buyerMappers", () => {
  it("maps BuyerResponseDTO to Buyer domain model", () => {
    // arrange
    const dto: BuyerResponseDTO = {
      id: 10,
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan.perez@example.com",
      nationalId: "12345678",
      phoneNumber: "1122334455",
    }
    const expectedModel: Buyer = {
      id: 10,
      firstName: "Juan",
      lastName: "Pérez",
      email: "juan.perez@example.com",
      nationalId: "12345678",
      phoneNumber: "1122334455",
    }

    // act
    const result = buyerMapper.mapDTOToModel(dto)

    // assert
    expect(result).toEqual(expectedModel)
  })
})

describe("metricsMapper", () => {
  it("maps TopBuyerDTO to TopBuyer domain model", () => {
    // arrange
    const dto: TopBuyerDTO = {
      buyer: {
        id: 5,
        firstName: "María",
        lastName: "Gómez",
        email: "maria@example.com",
        nationalId: "12345678",
        phoneNumber: "1122334455",
      },
      purchaseCount: 12,
    }
    const expectedModel: TopBuyer = {
      buyer: {
        id: 5,
        firstName: "María",
        lastName: "Gómez",
        email: "maria@example.com",
        nationalId: "12345678",
        phoneNumber: "1122334455",
      },
      purchases: 12,
      rank: 1,
    }

    // act
    const result = metricsMapper.mapTopBuyerDTOToModel(dto, 0)

    // assert
    expect(result).toEqual(expectedModel)
  })

  it("maps CityDTO to TopDestination domain model", () => {
    // arrange
    const dto: CityDTO = {
      id: 101,
      name: "Bariloche",
      countryDTO: {
        isoCode: "AR",
        name: "Argentina",
      },
    }
    const expectedModel: TopDestination = {
      city: {
        id: 101,
        name: "Bariloche",
        country: {
          isoCode: "AR",
          name: "Argentina"
        }
      },
      rank: 2,
    }

    // act
    const result = metricsMapper.mapTopDestinationDTOToModel(dto, 1)

    // assert
    expect(result).toEqual(expectedModel)
  })

  it("maps AgencyResponseDTO to TopAgency domain model", () => {
    // arrange
    const dto: TopAgencyDTO = {
      agency: {
        id: 3,
        businessName: "Patagonia Viajes",
        email: "info@patagonia.com",
      },
      salesCount: 45,
    }
    const expectedModel: TopAgency = {
      agency: {
        id: 3,
        businessName: "Patagonia Viajes",
        email: "info@patagonia.com",
      },
      sales: 45,
      rank: 1,
    }

    // act
    const result = metricsMapper.mapTopAgencyDTOToModel(dto, 0)

    // assert
    expect(result).toEqual(expectedModel)
  })

  it("maps RatedCityDTO to TopRatedDestination domain model with 1-10 rating scale", () => {
    // arrange
    const dto: TopRatedCityDTO = {
      city: {
        id: 202,
        name: "Ushuaia",
        countryDTO: {
          isoCode: "AR",
          name: "Argentina",
        },
      },
      stars: 8.2,
    }
    const expectedModel: TopRatedDestination = {
      city: {
        id: 202,
        name: "Ushuaia",
        country: {
          isoCode: "AR",
          name: "Argentina",
        },
      },
      stars: 8.2,
      rank: 1,
    }

    // act
    const result = metricsMapper.mapTopRatedDestinationDTOToModel(dto, 0)

    // assert
    expect(result).toEqual(expectedModel)
  })
})
