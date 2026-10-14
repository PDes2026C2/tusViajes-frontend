import { describe, expect, it } from "vitest"
import {
  loginSchema,
  registerBuyerSchema,
  registerAgencySchema,
  type LoginFormData,
  type RegisterBuyerFormData,
  type RegisterAgencyFormData,
} from "./auth.schema"

describe("auth schemas validation", () => {
  describe("loginSchema", () => {
    it("successfully validates valid login credentials", () => {
      // arrange
      const validData: LoginFormData = {
        email: "test@example.com",
        password: "securepassword",
      }

      // act
      const result = loginSchema.safeParse(validData)

      // assert
      expect(result.success).toBe(true)
    })

    it("fails when email is invalid", () => {
      // arrange
      const invalidData = {
        email: "not-an-email",
        password: "password123",
      }

      // act
      const result = loginSchema.safeParse(invalidData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("Formato de email invalido")
      }
    })

    it("fails when password is empty", () => {
      // arrange
      const emptyPasswordData = {
        email: "test@example.com",
        password: "",
      }

      // act
      const result = loginSchema.safeParse(emptyPasswordData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues[0].message).toBe("La contraseña es obligatoria")
      }
    })
  })

  describe("registerBuyerSchema", () => {
    it("successfully validates complete valid buyer data", () => {
      // arrange
      const validBuyerData: RegisterBuyerFormData = {
        firstName: "Carlos",
        lastName: "Gómez",
        email: "carlos@example.com",
        password: "password123",
        nationalId: "12345678",
        phoneNumber: "1123456789",
      }

      // act
      const result = registerBuyerSchema.safeParse(validBuyerData)

      // assert
      expect(result.success).toBe(true)
    })

    it("fails when password has fewer than 8 characters", () => {
      // arrange
      const shortPasswordData = {
        firstName: "Carlos",
        lastName: "Gómez",
        email: "carlos@example.com",
        password: "short",
        nationalId: "12345678",
        phoneNumber: "1123456789",
      }

      // act
      const result = registerBuyerSchema.safeParse(shortPasswordData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "La contraseña debe contener al menos 8 carácteres")).toBe(true)
      }
    })

    it("fails when nationalId contains non-numeric characters", () => {
      // arrange
      const nonNumericDniData = {
        firstName: "Carlos",
        lastName: "Gómez",
        email: "carlos@example.com",
        password: "password123",
        nationalId: "1234567A",
        phoneNumber: "1123456789",
      }

      // act
      const result = registerBuyerSchema.safeParse(nonNumericDniData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "El DNI debe ser numerico")).toBe(true)
      }
    })

    it("fails when nationalId exceeds 8 digits", () => {
      // arrange
      const tooLongDniData = {
        firstName: "Carlos",
        lastName: "Gómez",
        email: "carlos@example.com",
        password: "password123",
        nationalId: "123456789",
        phoneNumber: "1123456789",
      }

      // act
      const result = registerBuyerSchema.safeParse(tooLongDniData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "El DNI es invalido")).toBe(true)
      }
    })

    it("fails when phoneNumber does not have exactly 10 characters", () => {
      // arrange
      const invalidPhoneData = {
        firstName: "Carlos",
        lastName: "Gómez",
        email: "carlos@example.com",
        password: "password123",
        nationalId: "12345678",
        phoneNumber: "12345",
      }

      // act
      const result = registerBuyerSchema.safeParse(invalidPhoneData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "El telefono debe tener 10 carácteres")).toBe(true)
      }
    })

    it("fails when email format is invalid", () => {
      // arrange
      const invalidEmailData = {
        firstName: "Carlos",
        lastName: "Gómez",
        email: "invalid-email",
        password: "password123",
        nationalId: "12345678",
        phoneNumber: "1123456789",
      }

      // act
      const result = registerBuyerSchema.safeParse(invalidEmailData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "Email invalido")).toBe(true)
      }
    })
  })

  describe("registerAgencySchema", () => {
    it("successfully validates valid agency data", () => {
      // arrange
      const validAgencyData: RegisterAgencyFormData = {
        businessName: "Agencia Sol",
        taxId: "30-12345678-9",
        email: "contacto@agenciasol.com",
        password: "password123",
      }

      // act
      const result = registerAgencySchema.safeParse(validAgencyData)

      // assert
      expect(result.success).toBe(true)
    })

    it("fails when password has fewer than 8 characters", () => {
      // arrange
      const shortPasswordData = {
        businessName: "Agencia Sol",
        taxId: "30-12345678-9",
        email: "contacto@agenciasol.com",
        password: "1234",
      }

      // act
      const result = registerAgencySchema.safeParse(shortPasswordData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "La contraseña debe contener al menos 8 carácteres")).toBe(true)
      }
    })

    it("fails when businessName or taxId are empty", () => {
      // arrange
      const emptyFieldsData = {
        businessName: "",
        taxId: "",
        email: "contacto@agenciasol.com",
        password: "password123",
      }

      // act
      const result = registerAgencySchema.safeParse(emptyFieldsData)

      // assert
      expect(result.success).toBe(false)
      if (!result.success) {
        expect(result.error.issues.some((i) => i.message === "La razon social es obligatoria")).toBe(true)
        expect(result.error.issues.some((i) => i.message === "EL CUIT es obligatorio")).toBe(true)
      }
    })
  })
})
