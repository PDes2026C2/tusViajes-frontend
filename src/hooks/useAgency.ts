import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"
import type { AgencyFlight, AgencyPackageItem, PackageFormData } from "../models/agency"
import { useAgencyStore } from "../stores/agency"
import { useAuthStore } from "../stores/auth"

export type AgencyTab = "packages" | "flights" | "sales"

export interface PackageDeleteModalState {
  isOpen: boolean
  packageItem: AgencyPackageItem | null
}

export interface PackageFormModalState {
  isOpen: boolean
  editingPackage: AgencyPackageItem | null
  presetDepartureFlight: AgencyFlight | null
}

interface AgencyUIFiltersState {
  activeTab: AgencyTab
  packageSearchQuery: string
  salesSearchQuery: string
  flightDestinationCityId?: number
  flightOriginCityId?: number
  flightOnlyAvailable: boolean
  formModal: PackageFormModalState
  deleteModal: PackageDeleteModalState
}

const initialUIState: AgencyUIFiltersState = {
  activeTab: "packages",
  packageSearchQuery: "",
  salesSearchQuery: "",
  flightDestinationCityId: undefined,
  flightOriginCityId: undefined,
  flightOnlyAvailable: true,
  formModal: {
    isOpen: false,
    editingPackage: null,
    presetDepartureFlight: null,
  },
  deleteModal: {
    isOpen: false,
    packageItem: null,
  },
}

export function useAgency() {
  const user = useAuthStore((state) => state.user)
  const {
    packages = [],
    flights = [],
    sales = [],
    hotels = [],
    metrics,
    isLoadingPackages,
    isLoadingFlights,
    isLoadingSales,
    isLoadingHotels,
    isSubmitting: isSubmittingPackage,
    isDeleting: isDeletingPackage,
    error,
    fetchPackages,
    createPackage,
    updatePackage,
    deletePackage,
    fetchHotels,
    searchFlights,
    fetchSales,
    clearError,
  } = useAgencyStore()

  const [uiState, setUiState] = useState<AgencyUIFiltersState>(initialUIState)

  useEffect(() => {
    const agencyId = user?.id
    fetchPackages(agencyId).catch(() => {})
    fetchHotels().catch(() => {})
    searchFlights().catch(() => {})
    fetchSales(agencyId).catch(() => {})
  }, [user?.id])

  // Filtered packages
  const filteredPackages = useMemo(() => {
    const trimmed = uiState.packageSearchQuery.trim().toLowerCase()
    if (!trimmed) return packages

    return packages.filter(
      (pkg) =>
        pkg.name.toLowerCase().includes(trimmed) ||
        pkg.hotel.name.toLowerCase().includes(trimmed) ||
        pkg.hotel.city.name.toLowerCase().includes(trimmed) ||
        pkg.departureFlight.destinationCity.name.toLowerCase().includes(trimmed)
    )
  }, [packages, uiState.packageSearchQuery])

  // Filtered flights
  const filteredFlights = useMemo(() => {
    let result = flights

    if (uiState.flightDestinationCityId) {
      result = result.filter(
        (f) => f.destinationCity.id === uiState.flightDestinationCityId
      )
    }

    if (uiState.flightOriginCityId) {
      result = result.filter(
        (f) => f.originCity.id === uiState.flightOriginCityId
      )
    }

    if (uiState.flightOnlyAvailable) {
      result = result.filter((f) => f.availableSeats > 0)
    }

    return result
  }, [
    flights,
    uiState.flightDestinationCityId,
    uiState.flightOriginCityId,
    uiState.flightOnlyAvailable,
  ])

  // Filtered sales
  const filteredSales = useMemo(() => {
    const trimmed = uiState.salesSearchQuery.trim().toLowerCase()
    if (!trimmed) return sales

    return sales.filter(
      (s) =>
        s.buyer.fullName.toLowerCase().includes(trimmed) ||
        s.buyer.email.toLowerCase().includes(trimmed) ||
        s.buyer.nationalId.toLowerCase().includes(trimmed) ||
        s.travelPackage.name.toLowerCase().includes(trimmed) ||
        s.travelPackage.destinationCityName.toLowerCase().includes(trimmed)
    )
  }, [sales, uiState.salesSearchQuery])

  // Handlers - Navigation
  const handleTabChange = (activeTab: AgencyTab) => {
    setUiState((prev) => ({ ...prev, activeTab }))
  }

  // Handlers - Package Search & Modals
  const handlePackageSearchChange = (packageSearchQuery: string) => {
    setUiState((prev) => ({ ...prev, packageSearchQuery }))
  }

  const handleOpenCreatePackage = (initialFlight?: AgencyFlight) => {
    setUiState((prev) => ({
      ...prev,
      formModal: {
        isOpen: true,
        editingPackage: null,
        presetDepartureFlight: initialFlight || null,
      },
    }))
  }

  const handleOpenEditPackage = (pkg: AgencyPackageItem) => {
    setUiState((prev) => ({
      ...prev,
      formModal: {
        isOpen: true,
        editingPackage: pkg,
        presetDepartureFlight: null,
      },
    }))
  }

  const handleCloseFormModal = () => {
    setUiState((prev) => ({
      ...prev,
      formModal: {
        isOpen: false,
        editingPackage: null,
        presetDepartureFlight: null,
      },
    }))
  }

  const handleSubmitPackageForm = async (data: PackageFormData) => {
    if (!user?.id) {
      toast.error("Debes iniciar sesión como agencia para gestionar paquetes")
      return
    }
    const agencyId = user.id
    const { editingPackage } = uiState.formModal

    try {
      if (editingPackage) {
        await updatePackage(editingPackage.id, data, agencyId)
        toast.success(`Paquete "${data.name}" actualizado correctamente`)
      } else {
        await createPackage(data, agencyId)
        toast.success(`Paquete "${data.name}" creado con éxito`)
      }
      handleCloseFormModal()
    } catch (err: any) {
      toast.error(err?.message || "Ocurrió un error al guardar el paquete")
    }
  }

  const handleOpenDeleteModal = (packageItem: AgencyPackageItem) => {
    setUiState((prev) => ({
      ...prev,
      deleteModal: {
        isOpen: true,
        packageItem,
      },
    }))
  }

  const handleCloseDeleteModal = () => {
    setUiState((prev) => ({
      ...prev,
      deleteModal: {
        isOpen: false,
        packageItem: null,
      },
    }))
  }

  const handleConfirmDelete = async () => {
    const pkg = uiState.deleteModal.packageItem
    if (!pkg) return

    handleCloseDeleteModal()
    try {
      await deletePackage(pkg.id)
      toast.success(`Paquete "${pkg.name}" eliminado correctamente`)
    } catch (err: any) {
      toast.error(err?.message || "No se pudo eliminar el paquete")
    }
  }

  const handleRefreshPackages = async () => {
    clearError()
    try {
      await fetchPackages(user?.id)
      toast.success("Listado de paquetes actualizado")
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar paquetes")
    }
  }

  // Handlers - Flights
  const handleFlightDestinationChange = (flightDestinationCityId?: number) => {
    setUiState((prev) => ({ ...prev, flightDestinationCityId }))
  }

  const handleFlightOriginChange = (flightOriginCityId?: number) => {
    setUiState((prev) => ({ ...prev, flightOriginCityId }))
  }

  const handleFlightOnlyAvailableToggle = () => {
    setUiState((prev) => ({
      ...prev,
      flightOnlyAvailable: !prev.flightOnlyAvailable,
    }))
  }

  const handleUseFlightInPackage = (flight: AgencyFlight) => {
    setUiState((prev) => ({
      ...prev,
      activeTab: "packages",
      formModal: {
        isOpen: true,
        editingPackage: null,
        presetDepartureFlight: flight,
      },
    }))
  }

  const handleRefreshFlights = async () => {
    clearError()
    try {
      await searchFlights()
      toast.success("Vuelos actualizados")
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar vuelos")
    }
  }

  // Handlers - Sales
  const handleSalesSearchChange = (salesSearchQuery: string) => {
    setUiState((prev) => ({ ...prev, salesSearchQuery }))
  }

  const handleRefreshSales = async () => {
    clearError()
    try {
      await fetchSales(user?.id)
      toast.success("Historial de ventas actualizado")
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar ventas")
    }
  }

  return {
    // Navigation
    activeTab: uiState.activeTab,
    onTabChange: handleTabChange,

    // Packages
    packages,
    filteredPackages,
    packageSearchQuery: uiState.packageSearchQuery,
    onPackageSearchChange: handlePackageSearchChange,
    isLoadingPackages,
    isSubmittingPackage,
    isDeletingPackage,
    formModal: uiState.formModal,
    deleteModal: uiState.deleteModal,
    hotels,
    isLoadingHotels,
    onOpenCreatePackage: handleOpenCreatePackage,
    onOpenEditPackage: handleOpenEditPackage,
    onCloseFormModal: handleCloseFormModal,
    onSubmitPackageForm: handleSubmitPackageForm,
    onOpenDeleteModal: handleOpenDeleteModal,
    onCloseDeleteModal: handleCloseDeleteModal,
    onConfirmDelete: handleConfirmDelete,
    onRefreshPackages: handleRefreshPackages,

    // Flights
    flights,
    filteredFlights,
    flightDestinationCityId: uiState.flightDestinationCityId,
    flightOriginCityId: uiState.flightOriginCityId,
    flightOnlyAvailable: uiState.flightOnlyAvailable,
    isLoadingFlights,
    onFlightDestinationChange: handleFlightDestinationChange,
    onFlightOriginChange: handleFlightOriginChange,
    onFlightOnlyAvailableToggle: handleFlightOnlyAvailableToggle,
    onUseFlightInPackage: handleUseFlightInPackage,
    onRefreshFlights: handleRefreshFlights,

    // Sales
    sales,
    filteredSales,
    salesSearchQuery: uiState.salesSearchQuery,
    onSalesSearchChange: handleSalesSearchChange,
    metrics,
    isLoadingSales,
    onRefreshSales: handleRefreshSales,

    // User & Error
    user,
    error,
    clearError,
  }
}

export type AgencyViewProps = ReturnType<typeof useAgency>
