import { beforeEach, describe, expect, it, vi } from "vitest"
import { favoritesDataSource } from "./favorites"
import apiClient from "./api-client"
import { favoritePackageDTO } from "../tests/fixtures/package"

vi.mock("./api-client", () => ({
  default: { get: vi.fn(), post: vi.fn(), delete: vi.fn() },
}))

describe("favoritesDataSource", () => {
  beforeEach(() => {
    vi.resetAllMocks()
  })

  it("returns the authenticated buyer's favorite DTOs", async () => {
    // arrange
    const expectedFavorites = [favoritePackageDTO]
    vi.mocked(apiClient.get).mockResolvedValue({ data: expectedFavorites })

    // act
    const favorites = await favoritesDataSource.getFavorites()

    // assert
    expect(apiClient.get).toHaveBeenCalledWith("/buyers/me/favorites")
    expect(favorites).toEqual(expectedFavorites)
  })

  it("adds a package for the authenticated buyer without a request body", async () => {
    // arrange
    vi.mocked(apiClient.post).mockResolvedValue({ data: "" })

    // act
    await favoritesDataSource.addFavorite(favoritePackageDTO.id)

    // assert
    expect(apiClient.post).toHaveBeenCalledWith("/buyers/me/favorites/101")
  })

  it("propagates request failures instead of returning mock favorites", async () => {
    // arrange
    const expectedError = new Error("Servicio no disponible")
    vi.mocked(apiClient.get).mockRejectedValue(expectedError)

    // act
    const request = favoritesDataSource.getFavorites()

    // assert
    await expect(request).rejects.toBe(expectedError)
  })

  it("removes a favorite for the authenticated buyer", async () => {
    // arrange
    vi.mocked(apiClient.delete).mockResolvedValue({ data: "" })

    // act
    await favoritesDataSource.removeFavorite(favoritePackageDTO.id)

    // assert
    expect(apiClient.delete).toHaveBeenCalledWith("/buyers/me/favorites/101")
  })
})
