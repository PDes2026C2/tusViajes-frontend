import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { favoritePackage } from "../../tests/fixtures/package"
import { FavoritesView, type FavoritesViewProps } from "./FavoritesView"

describe("FavoritesView", () => {
  let viewProps: FavoritesViewProps

  beforeEach(() => {
    viewProps = {
      packages: [favoritePackage], isLoading: false, error: null,
      onRetry: vi.fn(), onExplore: vi.fn(),
      pendingFavoriteIds: [], onRemoveFavorite: vi.fn(), onViewDetails: vi.fn(),
    }
  })

  it("displays the saved packages using the card layout", () => {
    // arrange
    const secondPackage = { ...favoritePackage, id: 102, name: "Escapada a Mendoza" }
    viewProps.packages = [favoritePackage, secondPackage]

    // act
    render(<FavoritesView {...viewProps} />)

    // assert
    expect(screen.queryByRole("heading", { name: "Mis favoritos" })).not.toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "Paquetes guardados", level: 1 })).toBeInTheDocument()
    expect(screen.getByText("Accedé y gestioná los paquetes que guardaste para tus próximas vacaciones")).toBeInTheDocument()
    expect(screen.getByText(favoritePackage.name)).toBeInTheDocument()
    expect(screen.getByText(secondPackage.name)).toBeInTheDocument()
    expect(screen.getByText("2 paquetes")).toBeInTheDocument()
    expect(screen.getAllByText(favoritePackage.hotel.name)).toHaveLength(2)
    expect(screen.getAllByRole("article")).toHaveLength(2)
    expect(screen.getAllByText("USD $950")).toHaveLength(2)
    expect(screen.getAllByText("AR-1200 / AR-1201")).toHaveLength(2)
    expect(screen.getAllByText("Bariloche")).toHaveLength(2)
    expect(screen.queryByRole("button", { name: "Editar" })).not.toBeInTheDocument()
    expect(screen.queryByRole("button", { name: "Eliminar" })).not.toBeInTheDocument()
  })

  it("passes the selected package to the detail and remove actions", () => {
    // arrange
    render(<FavoritesView {...viewProps} />)

    // act
    fireEvent.click(screen.getByRole("button", { name: "Ver detalle" }))
    fireEvent.click(screen.getByRole("button", { name: `Quitar ${favoritePackage.name} de favoritos` }))

    // assert
    expect(viewProps.onViewDetails).toHaveBeenCalledWith(favoritePackage)
    expect(viewProps.onRemoveFavorite).toHaveBeenCalledWith(favoritePackage)
  })

  it("blocks repeated removal clicks while keeping other cards available", () => {
    // arrange
    const secondPackage = { ...favoritePackage, id: 102, name: "Escapada a Mendoza" }
    viewProps.packages = [favoritePackage, secondPackage]
    viewProps.pendingFavoriteIds = [favoritePackage.id]
    render(<FavoritesView {...viewProps} />)
    const pendingHeart = screen.getByRole("button", { name: `Quitar ${favoritePackage.name} de favoritos` })

    // act
    fireEvent.click(pendingHeart)

    // assert
    expect(pendingHeart).toBeDisabled()
    expect(pendingHeart).toHaveAttribute("aria-busy", "true")
    expect(screen.getByRole("button", { name: `Quitar ${secondPackage.name} de favoritos` })).toBeEnabled()
    expect(viewProps.onRemoveFavorite).not.toHaveBeenCalled()
  })

  it("shows loading without exposing stale packages or an empty state", () => {
    // arrange
    viewProps.isLoading = true

    // act
    render(<FavoritesView {...viewProps} />)

    // assert
    expect(screen.getByRole("status")).toHaveTextContent("Cargando tus favoritos...")
    expect(screen.queryByText(favoritePackage.name)).not.toBeInTheDocument()
    expect(screen.queryByText("Todavía no tenés favoritos")).not.toBeInTheDocument()
  })

  it("offers package exploration when the buyer has no saved packages", () => {
    // arrange
    viewProps.packages = []
    render(<FavoritesView {...viewProps} />)

    // act
    fireEvent.click(screen.getByRole("button", { name: "Explorar paquetes" }))

    // assert
    expect(screen.getByText("Todavía no tenés favoritos")).toBeInTheDocument()
    expect(viewProps.onExplore).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("No encontramos paquetes para tu búsqueda")).not.toBeInTheDocument()
  })

  it("shows a loading failure and allows retrying", () => {
    // arrange
    viewProps.packages = []
    viewProps.error = "Servicio no disponible"
    render(<FavoritesView {...viewProps} />)

    // act
    fireEvent.click(screen.getByRole("button", { name: "Reintentar" }))

    // assert
    expect(screen.getByRole("alert")).toHaveTextContent(viewProps.error)
    expect(viewProps.onRetry).toHaveBeenCalledTimes(1)
    expect(screen.queryByText("Todavía no tenés favoritos")).not.toBeInTheDocument()
  })

  it("renders availability badges for packages in favorites", () => {
    // arrange
    const futurePackage = {
      ...favoritePackage,
      id: 201,
      name: "Escapada Futura",
      initialDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 30),
      finalDate: new Date(Date.now() + 1000 * 60 * 60 * 24 * 37),
    }
    const expiredPackage = {
      ...favoritePackage,
      id: 202,
      name: "Escapada Vencida",
      initialDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 10),
      finalDate: new Date(Date.now() - 1000 * 60 * 60 * 24 * 3),
    }
    viewProps.packages = [futurePackage, expiredPackage]

    // act
    render(<FavoritesView {...viewProps} />)

    // assert
    expect(screen.getByText("Disponible")).toBeInTheDocument()
    expect(screen.getByText("No disponible")).toBeInTheDocument()
  })
})
