import { describe, expect, it } from "vitest"
import {
  packageFormSchema,
  flightFilterSchema,
  type PackageFormValues,
} from "./agency.schema"

describe("agency schemas validation", () => {
  describe("packageFormSchema", () => {
    const validStartDate = new Date("2026-11-01T10:00:00Z")
    const validEndDate = new Date("2026-11-10T10:00:00Z")

    it("successfully validates complete valid package form values", () => {
      // arrange
      const validData: PackageFormValues = {
        name: "Escapada a Cancún",
        description: "Paquete all inclusive con vuelos directos",
        price: 1500,
        startDate: validStartDate,
        endDate: validEndDate,
        hotelId: 10,
        departureFlightId: 101,
        returnFlightId: 102,
      }

      // act
      const result = packageFormSchema.safeParse(validData)

      // assert
      expect(result.success).toBe(true)
    })

    it("successfully validates when optional description is omitted", () => {
      // arrange
      const dataWithoutDescription = {
        name: "Tour por Bariloche",
        price: 800,
        startDate: validStartDate,
        endDate: validEndDate,
        hotelId: 5,
        departureFlightId: 201,
        returnFlightId: 202,
      }

      // act
      const result = packageFormSchema.safeParse(dataWithoutDescription)

      // assert
      expect(result.success).toBe(true)
    })

    it("correctly coerces numeric strings for price, hotel, and flight IDs", () => {
      // arrange
      const dataWithCoercibleStrings = {
        name: "Viaje a Mendoza",
        price: "1200.50",
        startDate: validStartDate,
        endDate: validEndDate,
        hotelId: "3",
        departureFlightId: "301",
        returnFlightId: "302",
      }

      // act
      const result = packageFormSchema.safeParse(dataWithCoercibleStrings)

      // assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.price).toBe(1200.5)
        expect(result.data.hotelId).toBe(3)
        expect(result.data.departureFlightId).toBe(301)
        expect(result.data.returnFlightId).toBe(302)
      }
    })

    it("fails when name has fewer than 3 characters", () => {
      // arrange
      const invalidNameData = {
        name: "AB",
        price: 1000,
        startDate: validStartDate,
        endDate: validEndDate,
        hotelId: 1,
        departureFlightId: 101,
        returnFlightId: 102,
      }

      // act
      const result = packageFormSchema.safeParse(invalidNameData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "El nombre debe tener al menos 3 caracteres")).toBe(true)
      }
    })

    it("fails when price is zero or negative", () => {
      // arrange
      const nonPositivePriceData = {
        name: "Viaje a Salta",
        price: 0,
        startDate: validStartDate,
        endDate: validEndDate,
        hotelId: 1,
        departureFlightId: 101,
        returnFlightId: 102,
      }

      // act
      const result = packageFormSchema.safeParse(nonPositivePriceData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "El precio debe ser mayor a 0")).toBe(true)
      }
    })

    it("fails when hotelId is zero or negative", () => {
      // arrange
      const invalidHotelData = {
        name: "Viaje a Salta",
        price: 1000,
        startDate: validStartDate,
        endDate: validEndDate,
        hotelId: 0,
        departureFlightId: 101,
        returnFlightId: 102,
      }

      // act
      const result = packageFormSchema.safeParse(invalidHotelData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "Selecciona un hotel")).toBe(true)
      }
    })

    it("fails when departureFlightId is zero or negative", () => {
      // arrange
      const invalidDepartureFlightData = {
        name: "Viaje a Salta",
        price: 1000,
        startDate: validStartDate,
        endDate: validEndDate,
        hotelId: 1,
        departureFlightId: 0,
        returnFlightId: 102,
      }

      // act
      const result = packageFormSchema.safeParse(invalidDepartureFlightData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "Selecciona un vuelo de salida")).toBe(true)
      }
    })

    it("fails when returnFlightId is zero or negative", () => {
      // arrange
      const invalidReturnFlightData = {
        name: "Viaje a Salta",
        price: 1000,
        startDate: validStartDate,
        endDate: validEndDate,
        hotelId: 1,
        departureFlightId: 101,
        returnFlightId: 0,
      }

      // act
      const result = packageFormSchema.safeParse(invalidReturnFlightData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "Selecciona un vuelo de llegada")).toBe(true)
      }
    })

    it("fails when departureFlightId and returnFlightId are identical", () => {
      // arrange
      const sameFlightData = {
        name: "Viaje a Ushuaia",
        price: 1000,
        startDate: validStartDate,
        endDate: validEndDate,
        hotelId: 1,
        departureFlightId: 101,
        returnFlightId: 101,
      }

      // act
      const result = packageFormSchema.safeParse(sameFlightData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        const matchingIssue = result.error.issues.find(
          (i) => i.message === "El vuelo de salida debe ser distinto al vuelo de llegada"
        )
        expect(matchingIssue).toBeDefined()
        expect(matchingIssue?.path).toEqual(["returnFlightId"])
      }
    })

    it("fails when endDate is before or equal to startDate", () => {
      // arrange
      const invalidDatesData = {
        name: "Viaje a Iguazú",
        price: 1000,
        startDate: new Date("2026-11-10T10:00:00Z"),
        endDate: new Date("2026-11-05T10:00:00Z"),
        hotelId: 1,
        departureFlightId: 101,
        returnFlightId: 102,
      }

      // act
      const result = packageFormSchema.safeParse(invalidDatesData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        const matchingIssue = result.error.issues.find(
          (i) => i.message === "La fecha de fin debe ser posterior a la fecha de inicio"
        )
        expect(matchingIssue).toBeDefined()
        expect(matchingIssue?.path).toEqual(["endDate"])
      }
    })

    it("fails when endDate is identical to startDate", () => {
      // arrange
      const sameDatesData = {
        name: "Viaje a Iguazú",
        price: 1000,
        startDate: validStartDate,
        endDate: validStartDate,
        hotelId: 1,
        departureFlightId: 101,
        returnFlightId: 102,
      }

      // act
      const result = packageFormSchema.safeParse(sameDatesData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "La fecha de fin debe ser posterior a la fecha de inicio")).toBe(true)
      }
    })
  })

  describe("flightFilterSchema", () => {
    it("successfully validates with default onlyAvailable set to true", () => {
      // arrange
      const emptyFilterData = {}

      // act
      const result = flightFilterSchema.safeParse(emptyFilterData)

      // assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.onlyAvailable).toBe(true)
      }
    })

    it("successfully validates complete filter with coerced city numbers and dates", () => {
      // arrange
      const filterData = {
        originCityId: "1",
        destinationCityId: "5",
        departureDateFrom: new Date("2026-11-01"),
        departureDateTo: new Date("2026-11-15"),
        onlyAvailable: false,
      }

      // act
      const result = flightFilterSchema.safeParse(filterData)

      // assert
      expect(result.success).toBe(true)
      if (result.success) {
        expect(result.data.originCityId).toBe(1)
        expect(result.data.destinationCityId).toBe(5)
        expect(result.data.onlyAvailable).toBe(false)
        expect(result.data.departureDateFrom).toBeInstanceOf(Date)
        expect(result.data.departureDateTo).toBeInstanceOf(Date)
      }
    })
  })
})
