import axios from "axios"
import type { ErrorDTO } from "../types/error"

export function formatValidationErrors(errors?: Record<string, string>): string {
  if (!errors) return ""
  const entries = Object.entries(errors).filter(([_, msg]) => Boolean(msg && msg.trim()))
  if (entries.length === 0) return ""
  if (entries.length === 1) return entries[0][1]
  return entries.map(([_, msg]) => `• ${msg}`).join("\n\n")
}

export function isGenericValidationMessage(message?: string): boolean {
  if (!message) return true
  const normalized = message
    .trim()
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
  return (
    normalized === "error de validacion" ||
    normalized === "error de valdiacion" ||
    normalized === "validation error" ||
    normalized === "solicitud invalida" ||
    normalized === "solicitud invalida." ||
    normalized === "bad request" ||
    normalized === "invalid request"
  )
}

export class AppError extends Error {
  readonly code?: string
  readonly errors?: Record<string, string>

  constructor(message: string, code?: string, errors?: Record<string, string>) {
    const hasErrors = Boolean(errors && Object.keys(errors).length > 0)
    const resolvedMessage =
      hasErrors && isGenericValidationMessage(message)
        ? formatValidationErrors(errors)
        : message

    super(resolvedMessage)
    this.name = "AppError"
    this.code = code
    this.errors = errors
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export const errorMappers = {
  mapDTOToModel(dto: ErrorDTO): AppError {
    return new AppError(
      dto.message,
      dto.code !== undefined ? String(dto.code) : undefined,
      dto.errors
    )
  },

  fromAxiosError(error: unknown, fallbackMessage = "Ocurrió un error inesperado"): AppError {
    if (error instanceof AppError) {
      return error
    }

    if (axios.isAxiosError(error)) {
      const data = error.response?.data as Partial<ErrorDTO> | undefined

      if (data && typeof data === "object") {
        const errors =
          data.errors && typeof data.errors === "object" && !Array.isArray(data.errors)
            ? (data.errors as Record<string, string>)
            : undefined
        const code = data.code !== undefined ? String(data.code) : undefined

        if (typeof data.message === "string") {
          return new AppError(data.message, code, errors)
        }

        if (errors && Object.keys(errors).length > 0) {
          return new AppError(formatValidationErrors(errors), code, errors)
        }
      }

      if (error.response) {
        switch (error.response.status) {
          case 400:
            return new AppError("Solicitud inválida.", "BAD_REQUEST")
          case 401:
            return new AppError("No autorizado. Inicie sesión nuevamente.", "UNAUTHORIZED")
          case 403:
            return new AppError("No tiene permisos para realizar esta acción.", "FORBIDDEN")
          case 404:
            return new AppError("Recurso no encontrado.", "NOT_FOUND")
          case 500:
            return new AppError("Error interno del servidor.", "INTERNAL_SERVER_ERROR")
          default:
            return new AppError(fallbackMessage, `HTTP_${error.response.status}`)
        }
      }

      if (error.request) {
        return new AppError(
          "No se pudo conectar con el servidor. Verifique su conexión a internet.",
          "NETWORK_ERROR"
        )
      }

      return new AppError(error.message || fallbackMessage, "REQUEST_SETUP_ERROR")
    }

    if (error instanceof Error) {
      return new AppError(error.message, "GENERAL_ERROR")
    }

    return new AppError(fallbackMessage, "UNKNOWN_ERROR")
  },
}
