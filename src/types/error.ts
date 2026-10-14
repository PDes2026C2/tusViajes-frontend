export interface ErrorDTO {
  code: string | number
  message: string
  timestamp?: string
  errors?: Record<string, string>
}
