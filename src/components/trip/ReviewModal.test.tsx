import { act, fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { useForm } from "react-hook-form"
import { zodResolver } from "@hookform/resolvers/zod"
import { ReviewModal } from "./ReviewModal"
import { reviewSchema, type ReviewFormData } from "../../models/review.schema"
import type { BuyerPurchase } from "../../models/purchase"
import { favoritePackage } from "../../tests/fixtures/package"

describe("ReviewModal component", () => {
  const mockTrip: BuyerPurchase = {
    id: 101,
    price: 950,
    purchasedAt: new Date("2026-09-01T10:00:00Z"),
    travelPackage: favoritePackage,
    status: "COMPLETED",
    isCompleted: true,
  }

  function ModalTestHarness(props: {
    isOpen?: boolean
    trip?: BuyerPurchase | null
    isSubmitting?: boolean
    onClose?: () => void
    onSubmit?: (e?: React.BaseSyntheticEvent) => Promise<void>
    defaultValues?: Partial<ReviewFormData>
  }) {
    const form = useForm<ReviewFormData>({
      resolver: zodResolver(reviewSchema),
      defaultValues: {
        score: props.defaultValues?.score ?? 10,
        comment: props.defaultValues?.comment ?? "",
      },
    })

    return (
      <ReviewModal
        isOpen={props.isOpen ?? true}
        trip={props.trip !== undefined ? props.trip : mockTrip}
        isSubmitting={props.isSubmitting ?? false}
        onClose={props.onClose ?? vi.fn()}
        onSubmit={props.onSubmit ?? form.handleSubmit(vi.fn())}
        form={form}
      />
    )
  }

  let onCloseMock: () => void
  let onSubmitMock: (e?: React.BaseSyntheticEvent) => Promise<void>

  beforeEach(() => {
    vi.resetAllMocks()
    onCloseMock = vi.fn()
    onSubmitMock = vi.fn((e) => {
      e?.preventDefault()
      return Promise.resolve()
    })
  })

  it("does not render dialog when isOpen is false", () => {
    // arrange & act
    render(<ModalTestHarness isOpen={false} />)

    // assert
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("does not render dialog when trip is null", () => {
    // arrange & act
    render(<ModalTestHarness isOpen={true} trip={null} />)

    // assert
    expect(screen.queryByRole("dialog")).not.toBeInTheDocument()
  })

  it("renders modal header, package details, and initial 10/10 score", () => {
    // arrange & act
    render(<ModalTestHarness isOpen={true} trip={mockTrip} />)

    // assert
    expect(screen.getByRole("dialog")).toBeInTheDocument()
    expect(screen.getByRole("heading", { name: "¿Cómo fue tu viaje?" })).toBeInTheDocument()
    expect(screen.getByText(new RegExp(favoritePackage.name))).toBeInTheDocument()
    expect(screen.getByText("¡Excelente! (10/10)")).toBeInTheDocument()
    expect(screen.getAllByRole("radio")).toHaveLength(10)
  })

  it("changes score when selecting a score button", async () => {
    // arrange
    render(<ModalTestHarness isOpen={true} trip={mockTrip} />)

    // act
    const score7Button = screen.getByRole("radio", { name: "Puntaje 7 de 10" })
    await act(async () => {
      fireEvent.click(score7Button)
    })

    // assert
    expect(screen.getByText("Bueno (7/10)")).toBeInTheDocument()
    expect(score7Button).toHaveAttribute("aria-checked", "true")
  })

  it("allows entering a comment and updates character counter", () => {
    // arrange
    render(<ModalTestHarness isOpen={true} trip={mockTrip} />)
    const textarea = screen.getByPlaceholderText(/Contanos qué te pareció/)

    // act
    fireEvent.change(textarea, { target: { value: "Increíble experiencia y servicio" } })

    // assert
    expect(textarea).toHaveValue("Increíble experiencia y servicio")
    expect(screen.getByText("32 / 1000")).toBeInTheDocument()
  })

  it("submits the form when clicking Publicar reseña", () => {
    // arrange
    render(<ModalTestHarness isOpen={true} trip={mockTrip} onSubmit={onSubmitMock} />)

    // act
    const submitButton = screen.getByRole("button", { name: "Publicar reseña" })
    fireEvent.click(submitButton)

    // assert
    expect(onSubmitMock).toHaveBeenCalled()
  })

  it("calls onClose when clicking the close button", () => {
    // arrange
    render(<ModalTestHarness isOpen={true} trip={mockTrip} onClose={onCloseMock} />)

    // act
    const closeButton = screen.getByRole("button", { name: "Cerrar modal" })
    fireEvent.click(closeButton)

    // assert
    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it("calls onClose when clicking Cancelar button", () => {
    // arrange
    render(<ModalTestHarness isOpen={true} trip={mockTrip} onClose={onCloseMock} />)

    // act
    const cancelButton = screen.getByRole("button", { name: "Cancelar" })
    fireEvent.click(cancelButton)

    // assert
    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it("closes modal on Escape key press", () => {
    // arrange
    render(<ModalTestHarness isOpen={true} trip={mockTrip} onClose={onCloseMock} />)

    // act
    fireEvent.keyDown(window, { key: "Escape" })

    // assert
    expect(onCloseMock).toHaveBeenCalledTimes(1)
  })

  it("disables buttons and displays loading indicator when isSubmitting is true", () => {
    // arrange
    render(<ModalTestHarness isOpen={true} trip={mockTrip} isSubmitting={true} onClose={onCloseMock} />)

    // act
    fireEvent.keyDown(window, { key: "Escape" })

    // assert
    expect(screen.getByText("Publicando...")).toBeInTheDocument()
    expect(screen.getByRole("button", { name: "Publicando..." })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Cancelar" })).toBeDisabled()
    expect(screen.getByRole("button", { name: "Cerrar modal" })).toBeDisabled()
    expect(onCloseMock).not.toHaveBeenCalled()
  })
})
