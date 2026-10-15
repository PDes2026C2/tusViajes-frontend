import type { PageResponseDTO } from "./package"

export interface ReviewRequestDTO {
  score: number
  comment?: string
}

export interface ReviewResponseDTO {
  id: number
  buyerId: number
  travelPackageId: number
  score: number
  comment: string
  createdAt: string
}

export type ReviewPageResponseDTO = PageResponseDTO<ReviewResponseDTO>
