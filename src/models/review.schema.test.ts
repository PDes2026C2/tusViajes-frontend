import { describe, expect, it } from "vitest"
import { reviewSchema } from "./review.schema"

describe("reviewSchema", () => {
  it("validates valid review data", () => {
    // arrange
    const validData = {
      score: 9,
      comment: "Excelente viaje, el hotel fue increíble y los vuelos puntuales.",
    }

    // act
    const result = reviewSchema.safeParse(validData)

    // assert
    expect(result.success).toBe(true)
    if (result.success) {
      expect(result.data).toEqual(validData)
    }
  })

  it("accepts review without comment", () => {
    // arrange
    const validDataWithoutComment = {
      score: 10,
    }

    // act
    const result = reviewSchema.safeParse(validDataWithoutComment)

    // assert
    expect(result.success).toBe(true)
  })

  it("fails when score is missing or less than 1", () => {
    // arrange
    const missingScore = { comment: "Buen viaje" }
    const zeroScore = { score: 0 }

    // act
    const missingResult = reviewSchema.safeParse(missingScore)
    const zeroResult = reviewSchema.safeParse(zeroScore)

    // assert
    expect(missingResult.success).toBe(false)
    if (!missingResult.success) {
      expect(missingResult.error.issues[0].message).toBe("Se debe ingresar un puntaje")
    }
    expect(zeroResult.success).toBe(false)
    if (!zeroResult.success) {
      expect(zeroResult.error.issues[0].message).toBe("El puntaje debe ser al menos 1")
    }
  })

  it("fails when score is greater than 10 or not an integer", () => {
    // arrange
    const tooHigh = { score: 11 }
    const decimal = { score: 8.5 }

    // act
    const tooHighResult = reviewSchema.safeParse(tooHigh)
    const decimalResult = reviewSchema.safeParse(decimal)

    // assert
    expect(tooHighResult.success).toBe(false)
    if (!tooHighResult.success) {
      expect(tooHighResult.error.issues[0].message).toBe("El puntaje no puede ser mayor a 10")
    }
    expect(decimalResult.success).toBe(false)
    if (!decimalResult.success) {
      expect(decimalResult.error.issues[0].message).toBe("El puntaje debe ser un número entero")
    }
  })

  it("fails when comment exceeds 1000 characters", () => {
    // arrange
    const longComment = "a".repeat(1001)
    const invalidData = { score: 8, comment: longComment }

    // act
    const result = reviewSchema.safeParse(invalidData)

    // assert
    expect(result.success).toBe(false)
    if (!result.success) {
      expect(result.error.issues[0].message).toBe("El comentario no puede exceder los 1000 caracteres")
    }
  })
})
