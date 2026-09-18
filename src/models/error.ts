import axios from "axios"
import type { ErrorDTO } from "../types/error"

export class AppError extends Error {
  readonly code?: string

  constructor(message: string, code?: string) {
    super(message)
    this.name = "AppError"
    this.code = code
    Object.setPrototypeOf(this, AppError.prototype)
  }
}

export const errorMappers = {
  mapDTOToModel(dto: ErrorDTO): AppError {
    return new AppError(dto.message, dto.code)
  },

  fromAxiosError(error: unknown, fallbackMessage = "Ocurrió un error inesperado"): AppError {
    if (error instanceof AppError) {
      return error
    }

    if (axios.isAxiosError(error)) {
      const data = error.response?.data as Partial<ErrorDTO> | undefined

      if (data && typeof data === "object" && typeof data.message === "string") {
        return new AppError(data.message, typeof data.code === "string" ? data.code : undefined)
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
