import { fireEvent, render, screen } from "@testing-library/react"
import { beforeEach, describe, expect, it, vi } from "vitest"
import { PackageFormModal } from "./PackageFormModal"
import type { AgencyFlight, PackageFormData } from "../../models/agency"
import type { Hotel } from "../../models/package"

describe("PackageFormModal component", () => {
  const mockHotelCancun: Hotel = {
    id: 1,
    name: "Cancun Palace",
    city: { id: 10, name: "Cancún", country: { isoCode: "MX", name: "México" } },
    photoUrl: "https://example.com/cancun.jpg",
  }

  const mockHotelMiami: Hotel = {
    id: 2,
    name: "Miami Beach Resort",
    city: { id: 20, name: "Miami", country: { isoCode: "US", name: "Estados Unidos" } },
    photoUrl: "https://example.com/miami.jpg",
  }

  const mockDepartureFlightCancun: AgencyFlight = {
    id: 101,
    flightNumber: "AA-101",
    airline: "American Airlines",
    originCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
    destinationCity: { id: 10, name: "Cancún", country: { isoCode: "MX", name: "México" } },
    departureDate: new Date("2026-10-15T08:00:00"),
    arrivalDate: new Date("2026-10-15T16:00:00"),
    capacity: 150,
    availableSeats: 25,
    price: 450,
  }

  const mockDepartureFlightCancunLater: AgencyFlight = {
    id: 102,
    flightNumber: "AA-102",
    airline: "American Airlines",
    originCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
    destinationCity: { id: 10, name: "Cancún", country: { isoCode: "MX", name: "México" } },
    departureDate: new Date("2026-10-18T08:00:00"),
    arrivalDate: new Date("2026-10-18T16:00:00"),
    capacity: 150,
    availableSeats: 15,
  }

  const mockDepartureFlightMiami: AgencyFlight = {
    id: 103,
    flightNumber: "AA-103",
    airline: "American Airlines",
    originCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
    destinationCity: { id: 20, name: "Miami", country: { isoCode: "US", name: "Estados Unidos" } },
    departureDate: new Date("2026-10-15T08:00:00"),
    arrivalDate: new Date("2026-10-15T15:00:00"),
    capacity: 150,
    availableSeats: 20,
  }

  const mockDepartureFlightFull: AgencyFlight = {
    id: 104,
    flightNumber: "AA-104",
    airline: "American Airlines",
    originCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
    destinationCity: { id: 10, name: "Cancún", country: { isoCode: "MX", name: "México" } },
    departureDate: new Date("2026-10-15T08:00:00"),
    arrivalDate: new Date("2026-10-15T16:00:00"),
    capacity: 150,
    availableSeats: 0,
  }

  const mockReturnFlightCancunToBA: AgencyFlight = {
    id: 201,
    flightNumber: "AR-201",
    airline: "Aerolíneas Argentinas",
    originCity: { id: 10, name: "Cancún", country: { isoCode: "MX", name: "México" } },
    destinationCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
    departureDate: new Date("2026-10-22T10:00:00"),
    arrivalDate: new Date("2026-10-22T18:00:00"),
    capacity: 160,
    availableSeats: 18,
    price: 480,
  }

  const mockReturnFlightCancunToBALater: AgencyFlight = {
    id: 202,
    flightNumber: "AR-202",
    airline: "Aerolíneas Argentinas",
    originCity: { id: 10, name: "Cancún", country: { isoCode: "MX", name: "México" } },
    destinationCity: { id: 1, name: "Buenos Aires", country: { isoCode: "AR", name: "Argentina" } },
    departureDate: new Date("2026-10-25T10:00:00"),
    arrivalDate: new Date("2026-10-25T18:00:00"),
    capacity: 160,
    availableSeats: 10,
  }

  const mockReturnFlightWrongDestination: AgencyFlight = {
    id: 203,
    flightNumber: "AR-203",
    airline: "Aerolíneas Argentinas",
    originCity: { id: 10, name: "Cancún", country: { isoCode: "MX", name: "México" } },
    destinationCity: { id: 20, name: "Miami", country: { isoCode: "US", name: "Estados Unidos" } },
    departureDate: new Date("2026-10-22T10:00:00"),
    arrivalDate: new Date("2026-10-22T14:00:00"),
    capacity: 160,
    availableSeats: 10,
  }

  const allHotels = [mockHotelCancun, mockHotelMiami]
  const allFlights = [
    mockDepartureFlightCancun,
    mockDepartureFlightCancunLater,
    mockDepartureFlightMiami,
    mockDepartureFlightFull,
    mockReturnFlightCancunToBA,
    mockReturnFlightCancunToBALater,
    mockReturnFlightWrongDestination,
  ]

  let mockOnClose: () => void
  let mockOnSubmit: (data: PackageFormData) => Promise<void>

  beforeEach(() => {
    vi.clearAllMocks()
    mockOnClose = vi.fn()
    mockOnSubmit = vi.fn().mockResolvedValue(undefined)
  })

  it("does not render when isOpen is false", () => {
    // arrange
    const { container } = render(
      <PackageFormModal
        isOpen={false}
        editingPackage={null}
        presetDepartureFlight={null}
        hotels={allHotels}
        flights={allFlights}
        isSubmitting={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    // act & assert
    expect(container.firstChild).toBeNull()
  })

  it("renders with locked flight selects when starting creation from scratch", () => {
    // arrange
    render(
      <PackageFormModal
        isOpen={true}
        editingPackage={null}
        presetDepartureFlight={null}
        hotels={allHotels}
        flights={allFlights}
        isSubmitting={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    // act
    const selects = screen.getAllByRole("combobox")
    const departureSelect = selects[1]
    const returnSelect = selects[2]

    // assert
    expect(departureSelect.hasAttribute("disabled")).toBe(true)
    expect(returnSelect.hasAttribute("disabled")).toBe(true)
    expect(screen.getByText(/primero selecciona un hotel/i)).toBeDefined()
  })

  it("unlocks and filters departure flights arriving at the hotel destination", () => {
    // arrange
    render(
      <PackageFormModal
        isOpen={true}
        editingPackage={null}
        presetDepartureFlight={null}
        hotels={allHotels}
        flights={allFlights}
        isSubmitting={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )
    const [hotelSelect] = screen.getAllByRole("combobox")

    // act
    fireEvent.change(hotelSelect, { target: { value: "1" } })

    // assert
    const [, departureSelect] = screen.getAllByRole("combobox")
    expect(departureSelect.hasAttribute("disabled")).toBe(false)
    expect(screen.getByText(/seleccionar vuelo ida \(2 disp\.\)/i)).toBeDefined()
    expect(screen.getByText(/AA-101 \(Buenos Aires ➔ Cancún\)/i)).toBeDefined()
    expect(screen.getByText(/AA-102 \(Buenos Aires ➔ Cancún\)/i)).toBeDefined()
    expect(screen.queryByText(/AA-103/i)).toBeNull()
    expect(screen.queryByText(/AA-104/i)).toBeNull()
  })

  it("auto-fills start date and unlocks return flights when departure flight is chosen", () => {
    // arrange
    render(
      <PackageFormModal
        isOpen={true}
        editingPackage={null}
        presetDepartureFlight={null}
        hotels={allHotels}
        flights={allFlights}
        isSubmitting={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )
    const [hotelSelect] = screen.getAllByRole("combobox")
    const startDateInput = screen.getByLabelText(/fecha de inicio/i, { selector: "input" }) as HTMLInputElement

    // act
    fireEvent.change(hotelSelect, { target: { value: "1" } })
    const [, departureSelect] = screen.getAllByRole("combobox")
    fireEvent.change(departureSelect, { target: { value: "101" } })

    // assert
    expect(startDateInput.value).toBe("2026-10-15")
    const [, , returnSelect] = screen.getAllByRole("combobox")
    expect(returnSelect.hasAttribute("disabled")).toBe(false)
    expect(screen.getByText(/seleccionar vuelo vuelta \(2 disp\.\)/i)).toBeDefined()
    expect(screen.getByText(/AR-201 \(Cancún ➔ Buenos Aires\)/i)).toBeDefined()
    expect(screen.getByText(/AR-202 \(Cancún ➔ Buenos Aires\)/i)).toBeDefined()
    expect(screen.queryByText(/AR-203/i)).toBeNull()
  })

  it("auto-fills end date and calculates stay nights when return flight is chosen", () => {
    // arrange
    render(
      <PackageFormModal
        isOpen={true}
        editingPackage={null}
        presetDepartureFlight={null}
        hotels={allHotels}
        flights={allFlights}
        isSubmitting={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )
    const [hotelSelect] = screen.getAllByRole("combobox")
    const endDateInput = screen.getByLabelText(/fecha de fin/i, { selector: "input" }) as HTMLInputElement

    fireEvent.change(hotelSelect, { target: { value: "1" } })
    const [, departureSelect] = screen.getAllByRole("combobox")
    fireEvent.change(departureSelect, { target: { value: "101" } })

    // act
    const [, , returnSelect] = screen.getAllByRole("combobox")
    fireEvent.change(returnSelect, { target: { value: "201" } })

    // assert
    expect(endDateInput.value).toBe("2026-10-22")
    expect(screen.getByText(/7 noches de estadía/i)).toBeDefined()
  })

  it("resets flights and dates when hotel is changed", () => {
    // arrange
    render(
      <PackageFormModal
        isOpen={true}
        editingPackage={null}
        presetDepartureFlight={null}
        hotels={allHotels}
        flights={allFlights}
        isSubmitting={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )
    const [hotelSelect] = screen.getAllByRole("combobox")
    fireEvent.change(hotelSelect, { target: { value: "1" } })

    const [, departureSelect] = screen.getAllByRole("combobox")
    fireEvent.change(departureSelect, { target: { value: "101" } })

    const [, , returnSelect] = screen.getAllByRole("combobox")
    fireEvent.change(returnSelect, { target: { value: "201" } })

    // act: change hotel to Miami
    fireEvent.change(hotelSelect, { target: { value: "2" } })

    // assert
    const updatedSelects = screen.getAllByRole("combobox")
    expect((updatedSelects[1] as HTMLSelectElement).value).toBe("")
    expect((updatedSelects[2] as HTMLSelectElement).value).toBe("")
    const startDateInput = screen.getByLabelText(/fecha de inicio/i, { selector: "input" }) as HTMLInputElement
    const endDateInput = screen.getByLabelText(/fecha de fin/i, { selector: "input" }) as HTMLInputElement
    expect(startDateInput.value).toBe("")
    expect(endDateInput.value).toBe("")
  })

  it("initializes form properly when presetDepartureFlight is provided", () => {
    // arrange & act
    render(
      <PackageFormModal
        isOpen={true}
        editingPackage={null}
        presetDepartureFlight={mockDepartureFlightCancun}
        hotels={allHotels}
        flights={allFlights}
        isSubmitting={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    // assert
    const startDateInput = screen.getByLabelText(/fecha de inicio/i, { selector: "input" }) as HTMLInputElement
    const [hotelSelect, departureSelect] = screen.getAllByRole("combobox") as HTMLSelectElement[]

    expect(startDateInput.value).toBe("2026-10-15")
    expect(hotelSelect.value).toBe("1")
    expect(departureSelect.value).toBe("101")
  })

  it("submits the form with complete PackageFormData when valid", async () => {
    // arrange
    const expectedFormData: PackageFormData = {
      name: "Vacaciones Cancún",
      description: "Disfrutá del Caribe",
      price: 1500,
      startDate: mockDepartureFlightCancun.arrivalDate,
      endDate: mockReturnFlightCancunToBA.departureDate,
      hotelId: 1,
      departureFlightId: 101,
      returnFlightId: 201,
    }

    render(
      <PackageFormModal
        isOpen={true}
        editingPackage={null}
        presetDepartureFlight={null}
        hotels={allHotels}
        flights={allFlights}
        isSubmitting={false}
        onClose={mockOnClose}
        onSubmit={mockOnSubmit}
      />
    )

    const nameInput = screen.getByPlaceholderText(/ej\. escapada a bariloche soñada/i)
    const priceInput = screen.getByPlaceholderText("950")
    const descInput = screen.getByPlaceholderText(/detalle de actividades/i)
    const [hotelSelect] = screen.getAllByRole("combobox")

    // act
    fireEvent.change(nameInput, { target: { value: "Vacaciones Cancún" } })
    fireEvent.change(priceInput, { target: { value: "1500" } })
    fireEvent.change(descInput, { target: { value: "Disfrutá del Caribe" } })
    fireEvent.change(hotelSelect, { target: { value: "1" } })

    const [, departureSelect] = screen.getAllByRole("combobox")
    fireEvent.change(departureSelect, { target: { value: "101" } })

    const [, , returnSelect] = screen.getAllByRole("combobox")
    fireEvent.change(returnSelect, { target: { value: "201" } })

    const submitBtn = screen.getByRole("button", { name: /crear paquete/i })
    fireEvent.click(submitBtn)

    // assert
    expect(mockOnSubmit).toHaveBeenCalledWith(expectedFormData)
  })
})
