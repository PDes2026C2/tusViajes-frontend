import { describe, expect, it } from "vitest"
import type { AxiosError, AxiosResponse, InternalAxiosRequestConfig } from "axios"
import { AppError, errorMappers } from "./error"
import type { ErrorDTO } from "../types/error"

describe("AppError and errorMappers", () => {
  it("creates an AppError that is an instance of Error and AppError", () => {
    // arrange & act
    const error = new AppError("Algo salió mal", "CUSTOM_CODE")

    // assert
    expect(error).toBeInstanceOf(Error)
    expect(error).toBeInstanceOf(AppError)
    expect(error.message).toBe("Algo salió mal")
    expect(error.code).toBe("CUSTOM_CODE")
    expect(error.name).toBe("AppError")
  })

  it("maps ErrorDTO to AppError correctly", () => {
    // arrange
    const dto: ErrorDTO = {
      code: "INVALID_CREDENTIALS",
      message: "Credenciales inválidas",
      timestamp: "2026-09-17T20:00:00Z",
      errors: { email: "Email no registrado" },
    }

    // act
    const appError = errorMappers.mapDTOToModel(dto)

    // assert
    expect(appError.message).toBe("Credenciales inválidas")
    expect(appError.code).toBe("INVALID_CREDENTIALS")
  })

  it("extracts message and code from AxiosError containing ErrorDTO", () => {
    // arrange
    const mockAxiosError = {
      isAxiosError: true,
      name: "AxiosError",
      message: "Request failed with status code 400",
      response: {
        status: 400,
        statusText: "Bad Request",
        data: {
          code: "USER_ALREADY_EXISTS",
          message: "El usuario ya está registrado",
        } satisfies ErrorDTO,
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      } as AxiosResponse,
    } as AxiosError

    // act
    const result = errorMappers.fromAxiosError(mockAxiosError)

    // assert
    expect(result).toBeInstanceOf(AppError)
    expect(result.message).toBe("El usuario ya está registrado")
    expect(result.code).toBe("USER_ALREADY_EXISTS")
  })

  it("handles AxiosError with HTTP status but no structured ErrorDTO body", () => {
    // arrange
    const mockAxiosError = {
      isAxiosError: true,
      name: "AxiosError",
      message: "Request failed with status code 404",
      response: {
        status: 404,
        statusText: "Not Found",
        data: "Cannot GET /api/unknown",
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      } as AxiosResponse,
    } as AxiosError

    // act
    const result = errorMappers.fromAxiosError(mockAxiosError)

    // assert
    expect(result).toBeInstanceOf(AppError)
    expect(result.message).toBe("Recurso no encontrado.")
    expect(result.code).toBe("NOT_FOUND")
  })

  it("handles network error without HTTP response", () => {
    // arrange
    const mockAxiosError = {
      isAxiosError: true,
      name: "AxiosError",
      message: "Network Error",
      request: {},
    } as AxiosError

    // act
    const result = errorMappers.fromAxiosError(mockAxiosError)

    // assert
    expect(result).toBeInstanceOf(AppError)
    expect(result.message).toBe("No se pudo conectar con el servidor. Verifique su conexión a internet.")
    expect(result.code).toBe("NETWORK_ERROR")
  })

  it("handles standard Error instances and unknown objects gracefully", () => {
    // arrange
    const standardError = new Error("Error genérico")
    const unknownError = { foo: "bar" }

    // act
    const resultStandard = errorMappers.fromAxiosError(standardError)
    const resultUnknown = errorMappers.fromAxiosError(unknownError, "Mensaje personalizado")

    // assert
    expect(resultStandard.message).toBe("Error genérico")
    expect(resultStandard.code).toBe("GENERAL_ERROR")

    expect(resultUnknown.message).toBe("Mensaje personalizado")
    expect(resultUnknown.code).toBe("UNKNOWN_ERROR")
  })

  it("returns the same AppError if already an instance of AppError", () => {
    // arrange
    const original = new AppError("Error previo", "PREV_CODE")

    // act
    const result = errorMappers.fromAxiosError(original)

    // assert
    expect(result).toBe(original)
  })

  it("formats single validation error when message is generic 'Error de validación'", () => {
    // arrange
    const dto: ErrorDTO = {
      code: 400,
      message: "Error de validación",
      errors: { email: "El email debe ser una dirección válida" },
    }

    // act
    const appError = errorMappers.mapDTOToModel(dto)

    // assert
    expect(appError.message).toBe("El email debe ser una dirección válida")
    expect(appError.code).toBe("400")
    expect(appError.errors).toEqual({ email: "El email debe ser una dirección válida" })
  })

  it("formats multiple validation errors as a bulleted list when message is generic", () => {
    // arrange
    const dto: ErrorDTO = {
      code: 400,
      message: "Error de validacion",
      errors: {
        email: "El email es obligatorio",
        password: "La contraseña debe tener al menos 8 caracteres",
      },
    }

    // act
    const appError = errorMappers.mapDTOToModel(dto)

    // assert
    expect(appError.message).toBe(
      "• El email es obligatorio\n\n• La contraseña debe tener al menos 8 caracteres"
    )
    expect(appError.code).toBe("400")
    expect(appError.errors).toEqual({
      email: "El email es obligatorio",
      password: "La contraseña debe tener al menos 8 caracteres",
    })
  })

  it("extracts validation errors from AxiosError 400 Bad Request with numeric code and errors map", () => {
    // arrange
    const mockAxiosError = {
      isAxiosError: true,
      name: "AxiosError",
      message: "Request failed with status code 400",
      response: {
        status: 400,
        statusText: "Bad Request",
        data: {
          code: 400,
          message: "Error de validación",
          errors: {
            taxId: "El CUIT debe seguir el formato XX-XXXXXXXX-X",
          },
        } satisfies ErrorDTO,
        headers: {},
        config: {} as InternalAxiosRequestConfig,
      } as AxiosResponse,
    } as AxiosError

    // act
    const result = errorMappers.fromAxiosError(mockAxiosError)

    // assert
    expect(result).toBeInstanceOf(AppError)
    expect(result.message).toBe("El CUIT debe seguir el formato XX-XXXXXXXX-X")
    expect(result.code).toBe("400")
    expect(result.errors).toEqual({
      taxId: "El CUIT debe seguir el formato XX-XXXXXXXX-X",
    })
  })
})
