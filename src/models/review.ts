import type { ReviewResponseDTO } from "../types/review"

export interface Review {
  id: number
  buyerId: number
  travelPackageId: number
  score: number
  comment: string
  createdAt: Date
}

export const reviewMappers = {
  mapDTOToModel: (dto: ReviewResponseDTO): Review => ({
    id: dto.id,
    buyerId: dto.buyerId,
    travelPackageId: dto.travelPackageId,
    score: dto.score,
    comment: dto.comment,
    createdAt: new Date(dto.createdAt),
  }),
}
