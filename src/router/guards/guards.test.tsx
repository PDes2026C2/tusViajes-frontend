import { render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { MemoryRouter, Route, Routes } from "react-router-dom"
import PublicRoute from "./publicRoute"
import ProtectedRoute from "./protectedRoute"
import { useAuth } from "../../hooks/useAuth"
import type { User } from "../../models/auth"

vi.mock("../../hooks/useAuth", () => ({
  useAuth: vi.fn(),
}))

describe("Route Guards with useAuth", () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  describe("PublicRoute", () => {
    it("renders child outlet when user is not authenticated", () => {
      // arrange
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
      } as any)

      // act
      render(
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<div>Página de Login</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )

      // assert
      expect(screen.getByText("Página de Login")).toBeDefined()
    })

    it("redirects BUYER user to /home", () => {
      // arrange
      const buyer: User = { id: 1, email: "buyer@test.com", role: "BUYER" }
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        user: buyer,
      } as any)

      // act
      render(
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<div>Página de Login</div>} />
            </Route>
            <Route path="/home" element={<div>Home Page</div>} />
          </Routes>
        </MemoryRouter>
      )

      // assert
      expect(screen.queryByText("Página de Login")).toBeNull()
      expect(screen.getByText("Home Page")).toBeDefined()
    })

    it("redirects AGENCY user to /agency/panel", () => {
      // arrange
      const agency: User = { id: 2, email: "agency@test.com", role: "AGENCY" }
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        user: agency,
      } as any)

      // act
      render(
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<div>Página de Login</div>} />
            </Route>
            <Route path="/agency/panel" element={<div>Panel Agencia</div>} />
          </Routes>
        </MemoryRouter>
      )

      // assert
      expect(screen.queryByText("Página de Login")).toBeNull()
      expect(screen.getByText("Panel Agencia")).toBeDefined()
    })

    it("redirects ADMIN user to /admin/panel", () => {
      // arrange
      const admin: User = { id: 3, email: "admin@test.com", role: "ADMIN" }
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        user: admin,
      } as any)

      // act
      render(
        <MemoryRouter initialEntries={["/login"]}>
          <Routes>
            <Route element={<PublicRoute />}>
              <Route path="/login" element={<div>Página de Login</div>} />
            </Route>
            <Route path="/admin/panel" element={<div>Panel Administrador</div>} />
          </Routes>
        </MemoryRouter>
      )

      // assert
      expect(screen.queryByText("Página de Login")).toBeNull()
      expect(screen.getByText("Panel Administrador")).toBeDefined()
    })
  })

  describe("ProtectedRoute", () => {
    it("redirects unauthenticated user to /login", () => {
      // arrange
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: false,
        user: null,
      } as any)

      // act
      render(
        <MemoryRouter initialEntries={["/my-trips"]}>
          <Routes>
            <Route element={<ProtectedRoute allowedRoles={["BUYER"]} />}>
              <Route path="/my-trips" element={<div>Mis Viajes</div>} />
            </Route>
            <Route path="/login" element={<div>Página de Login</div>} />
          </Routes>
        </MemoryRouter>
      )

      // assert
      expect(screen.queryByText("Mis Viajes")).toBeNull()
      expect(screen.getByText("Página de Login")).toBeDefined()
    })

    it("redirects to /unauthorized when user does not have an allowed role", () => {
      // arrange
      const buyer: User = { id: 1, email: "buyer@test.com", role: "BUYER" }
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        user: buyer,
      } as any)

      // act
      render(
        <MemoryRouter initialEntries={["/admin/panel"]}>
          <Routes>
            <Route element={<ProtectedRoute allowedRoles={["ADMIN"]} />}>
              <Route path="/admin/panel" element={<div>Panel Admin</div>} />
            </Route>
            <Route path="/unauthorized" element={<div>No Autorizado</div>} />
          </Routes>
        </MemoryRouter>
      )

      // assert
      expect(screen.queryByText("Panel Admin")).toBeNull()
      expect(screen.getByText("No Autorizado")).toBeDefined()
    })

    it("renders outlet when user is authenticated with allowed role", () => {
      // arrange
      const agency: User = { id: 2, email: "agency@test.com", role: "AGENCY" }
      vi.mocked(useAuth).mockReturnValue({
        isAuthenticated: true,
        user: agency,
      } as any)

      // act
      render(
        <MemoryRouter initialEntries={["/agency/panel"]}>
          <Routes>
            <Route element={<ProtectedRoute allowedRoles={["AGENCY"]} />}>
              <Route path="/agency/panel" element={<div>Panel Agencia</div>} />
            </Route>
          </Routes>
        </MemoryRouter>
      )

      // assert
      expect(screen.getByText("Panel Agencia")).toBeDefined()
    })
  })
})
