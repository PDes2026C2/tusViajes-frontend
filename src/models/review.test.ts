import { describe, expect, it } from "vitest"
import { reviewMappers, type Review } from "./review"
import type { ReviewResponseDTO } from "../types/review"

describe("review models and mappers", () => {
  it("maps ReviewResponseDTO to domain Review model correctly", () => {
    // arrange
    const dto: ReviewResponseDTO = {
      id: 42,
      buyerId: 7,
      travelPackageId: 101,
      score: 9,
      comment: "Increíble estadía y vuelos puntuales.",
      createdAt: "2026-10-14T20:00:00Z",
    }

    const expectedModel: Review = {
      id: 42,
      buyerId: 7,
      travelPackageId: 101,
      score: 9,
      comment: "Increíble estadía y vuelos puntuales.",
      createdAt: new Date("2026-10-14T20:00:00Z"),
    }

    // act
    const result = reviewMappers.mapDTOToModel(dto)

    // assert
    expect(result).toEqual(expectedModel)
  })
})
