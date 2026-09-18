export interface ErrorDTO {
  code: string
  message: string
  timestamp?: string
  errors?: Record<string, unknown>
}
