import { describe, expect, it } from "vitest"
import { getAuthRedirectPath } from "./authRedirect"

describe("getAuthRedirectPath", () => {
  it.each(["/agency/panel", "/admin/panel", "/agency/login", "/admin/login", "/unauthorized"])("sends a buyer to Home instead of %s after authentication", (requestedPath) => {
    // arrange
    const expectedPath = "/home"

    // act
    const path = getAuthRedirectPath("BUYER", requestedPath)

    // assert
    expect(path).toBe(expectedPath)
  })

  it.each(["/", "/home", "/favorites", "/my-trips"])("preserves the buyer's permitted destination %s", (requestedPath) => {
    // arrange
    const expectedPath = requestedPath

    // act
    const path = getAuthRedirectPath("BUYER", requestedPath)

    // assert
    expect(path).toBe(expectedPath)
  })

  it.each([
    { role: "BUYER", expectedPath: "/home" },
    { role: "AGENCY", expectedPath: "/agency/panel" },
    { role: "ADMIN", expectedPath: "/admin/panel" },
  ] as const)("defaults $role to $expectedPath", ({ role, expectedPath }) => {
    // arrange
    const requestedPath = undefined

    // act
    const path = getAuthRedirectPath(role, requestedPath)

    // assert
    expect(path).toBe(expectedPath)
  })

  it.each([
    { role: "AGENCY", requestedPath: "/my-trips", expectedPath: "/agency/panel" },
    { role: "ADMIN", requestedPath: "/favorites", expectedPath: "/admin/panel" },
  ] as const)("keeps $role in its own panel when the requested destination is $requestedPath", ({ role, requestedPath, expectedPath }) => {
    // arrange
    const expectedDestination = expectedPath

    // act
    const path = getAuthRedirectPath(role, requestedPath)

    // assert
    expect(path).toBe(expectedDestination)
  })
})
