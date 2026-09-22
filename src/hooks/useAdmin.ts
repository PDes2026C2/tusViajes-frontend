import { useEffect, useMemo, useState } from "react"
import { toast } from "react-toastify"
import { useAdminStore } from "../stores/admin"
import type { Agency } from "@/models/package"

export type AdminTab = "metrics" | "agencies" | "users"
export type AgencyStatusFilter = "ALL" | "PENDING" | "AUTHORIZED" | "REJECTED"

export interface ConfirmDialogState {
  isOpen: boolean
  agency: Agency | null
  actionType: "authorize" | "reject" | null
}

interface AdminUIState {
  activeTab: AdminTab
  searchQuery: string
  userSearchQuery: string
  agencyStatusFilter: AgencyStatusFilter
  confirmDialog: ConfirmDialogState
}

const initialUIState: AdminUIState = {
  activeTab: "metrics",
  searchQuery: "",
  userSearchQuery: "",
  agencyStatusFilter: "ALL",
  confirmDialog: {
    isOpen: false,
    agency: null,
    actionType: null,
  },
}

export function useAdmin() {
  const {
    agencies: storeAgencies = [],
    pendingAgencies = [],
    buyers: storeBuyers = [],
    topBuyers = [],
    topRankedDestinations = [],
    topAgencies = [],
    topRatedDestinations = [],
    isLoading = false,
    isLoadingAgencies = false,
    isLoadingBuyers = false,
    isLoadingMetrics = false,
    processingAgencyId = null,
    error = null,
    fetchPendingAgencies,
    fetchAllAgencies,
    fetchBuyers,
    fetchAdminDashboard,
    authorizeAgency,
    rejectAgency,
    clearError,
  } = useAdminStore()

  const [uiState, setUiState] = useState<AdminUIState>(initialUIState)

  useEffect(() => {
    fetchPendingAgencies().catch((err: any) => {
      toast.error(err?.message || "No se pudieron cargar las agencias pendientes")
    })
    fetchAllAgencies?.()?.catch(() => {})
    fetchBuyers?.()?.catch(() => {})
    fetchAdminDashboard?.()?.catch(() => {})
  }, [])

  // Base list of agencies: either the full list or fallback to pendingAgencies
  const baseAgencies = useMemo(() => {
    if (storeAgencies && storeAgencies.length > 0) {
      return storeAgencies
    }
    return pendingAgencies
  }, [storeAgencies, pendingAgencies])

  const filteredAgencies = useMemo(() => {
    let result = baseAgencies

    if (uiState.agencyStatusFilter !== "ALL") {
      result = result.filter((agency) => agency.status === uiState.agencyStatusFilter)
    }

    const trimmed = uiState.searchQuery.trim().toLowerCase()
    if (trimmed) {
      result = result.filter(
        (agency) =>
          agency.businessName.toLowerCase().includes(trimmed) ||
          agency.taxId.toLowerCase().includes(trimmed) ||
          agency.email.toLowerCase().includes(trimmed)
      )
    }

    return result
  }, [baseAgencies, uiState.agencyStatusFilter, uiState.searchQuery])

  const filteredBuyers = useMemo(() => {
    const trimmed = uiState.userSearchQuery.trim().toLowerCase()
    if (!trimmed) return storeBuyers

    return storeBuyers.filter(
      (buyer) =>
        buyer.firstName.toLowerCase().includes(trimmed) ||
        buyer.lastName.toLowerCase().includes(trimmed) ||
        buyer.email.toLowerCase().includes(trimmed) ||
        (buyer.nationalId && buyer.nationalId.toLowerCase().includes(trimmed))
    )
  }, [storeBuyers, uiState.userSearchQuery])

  const handleTabChange = (activeTab: AdminTab) => {
    setUiState((prev) => ({ ...prev, activeTab }))
  }

  const handleSearchChange = (searchQuery: string) => {
    setUiState((prev) => ({ ...prev, searchQuery }))
  }

  const handleUserSearchChange = (userSearchQuery: string) => {
    setUiState((prev) => ({ ...prev, userSearchQuery }))
  }

  const handleAgencyStatusFilterChange = (agencyStatusFilter: AgencyStatusFilter) => {
    setUiState((prev) => ({ ...prev, agencyStatusFilter }))
  }

  const handleOpenAuthorize = (agency: Agency) => {
    setUiState((prev) => ({
      ...prev,
      confirmDialog: {
        isOpen: true,
        agency,
        actionType: "authorize",
      },
    }))
  }

  const handleOpenReject = (agency: Agency) => {
    setUiState((prev) => ({
      ...prev,
      confirmDialog: {
        isOpen: true,
        agency,
        actionType: "reject",
      },
    }))
  }

  const handleCloseConfirmDialog = () => {
    setUiState((prev) => ({
      ...prev,
      confirmDialog: {
        isOpen: false,
        agency: null,
        actionType: null,
      },
    }))
  }

  const handleConfirmAction = async () => {
    const { agency, actionType } = uiState.confirmDialog
    if (!agency || !actionType) return

    handleCloseConfirmDialog()

    try {
      if (actionType === "authorize") {
        await authorizeAgency(agency.id)
        toast.success(`Agencia "${agency.businessName}" autorizada correctamente`)
      } else {
        await rejectAgency(agency.id)
        toast.info(`Agencia "${agency.businessName}" rechazada`)
      }
    } catch (err: any) {
      toast.error(err?.message || "Ocurrió un error al procesar la solicitud")
    }
  }

  const handleRefresh = async () => {
    try {
      clearError()
      await fetchPendingAgencies()
      await fetchAllAgencies?.()
      toast.success("Listado de agencias actualizado")
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar las agencias pendientes")
    }
  }

  const handleRefreshBuyers = async () => {
    try {
      clearError()
      await fetchBuyers?.()
      toast.success("Listado de usuarios actualizado")
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar los usuarios")
    }
  }

  const handleRefreshMetrics = async () => {
    try {
      clearError()
      await fetchAdminDashboard?.()
      toast.success("Métricas actualizadas")
    } catch (err: any) {
      toast.error(err?.message || "Error al actualizar las métricas")
    }
  }

  return {
    // Navigation / Tabs
    activeTab: uiState.activeTab,
    onTabChange: handleTabChange,

    // Agencies State & Handlers
    agencies: baseAgencies,
    pendingAgencies,
    filteredAgencies,
    searchQuery: uiState.searchQuery,
    agencyStatusFilter: uiState.agencyStatusFilter,
    onSearchChange: handleSearchChange,
    onAgencyStatusFilterChange: handleAgencyStatusFilterChange,
    onOpenAuthorize: handleOpenAuthorize,
    onOpenReject: handleOpenReject,
    confirmDialog: uiState.confirmDialog,
    onCloseConfirmDialog: handleCloseConfirmDialog,
    onConfirmAction: handleConfirmAction,

    // Buyers State & Handlers
    buyers: storeBuyers,
    filteredBuyers,
    userSearchQuery: uiState.userSearchQuery,
    onUserSearchChange: handleUserSearchChange,
    onRefreshBuyers: handleRefreshBuyers,

    // Metrics State & Handlers
    topBuyers,
    topRankedDestinations,
    topAgencies,
    topRatedDestinations,
    onRefreshMetrics: handleRefreshMetrics,

    // Loading & Error States
    isLoading,
    isLoadingAgencies,
    isLoadingBuyers,
    isLoadingMetrics,
    processingAgencyId,
    error,
    onRefresh: handleRefresh,
  }
}

export type AdminAgenciesViewProps = ReturnType<typeof useAdmin>
