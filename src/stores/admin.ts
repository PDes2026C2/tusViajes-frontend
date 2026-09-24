import { create } from "zustand"
import { adminAgencyDataSource } from "../datasources/admin"
import {
  buyerMapper,
  metricsMapper,
  type Buyer,
  type TopAgency,
  type TopBuyer,
  type TopDestination,
  type TopRatedDestination,
} from "../models/admin"
import { packageMappers, type Agency } from "@/models/package"

export interface AdminStoreState {
  agencies: Agency[]
  pendingAgencies: Agency[]
  buyers: Buyer[]
  topBuyers: TopBuyer[]
  topRankedDestinations: TopDestination[]
  topAgencies: TopAgency[]
  topRatedDestinations: TopRatedDestination[]

  isLoading: boolean
  isLoadingAgencies: boolean
  isLoadingBuyers: boolean
  isLoadingMetrics: boolean
  processingAgencyId: number | null
  error: string | null

  fetchPendingAgencies: () => Promise<void>
  fetchAllAgencies: () => Promise<void>
  fetchBuyers: () => Promise<void>
  fetchTopBuyers: () => Promise<void>
  fetchTopRankedDestinations: () => Promise<void>
  fetchTopAgencies: () => Promise<void>
  fetchTopRatedDestinations: () => Promise<void>
  fetchAdminDashboard: () => Promise<void>
  authorizeAgency: (id: number) => Promise<void>
  rejectAgency: (id: number) => Promise<void>
  clearError: () => void
}

export const useAdminStore = create<AdminStoreState>((set) => ({
  agencies: [],
  pendingAgencies: [],
  buyers: [],
  topBuyers: [],
  topRankedDestinations: [],
  topAgencies: [],
  topRatedDestinations: [],

  isLoading: false,
  isLoadingAgencies: false,
  isLoadingBuyers: false,
  isLoadingMetrics: false,
  processingAgencyId: null,
  error: null,

  fetchPendingAgencies: async () => {
    set({ isLoading: true, error: null })
    try {
      const dtos = await adminAgencyDataSource.getPendingAgencies()
      const agencies = dtos.map(packageMappers.mapAgencyDTOToModel)
      set({ pendingAgencies: agencies })
    } catch (error: any) {
      set({ error: error?.message || "Error al cargar las agencias pendientes" })
      throw error
    } finally {
      set({ isLoading: false })
    }
  },

  fetchAllAgencies: async () => {
    set({ isLoadingAgencies: true, error: null })
    try {
      const dtos = await adminAgencyDataSource.getAllAgencies()
      const agencies = dtos.map(packageMappers.mapAgencyDTOToModel)
      set({
        agencies,
        pendingAgencies: agencies.filter((a) => a.status === "PENDING"),
      })
    } catch (error: any) {
      set({ error: error?.message || "Error al cargar el listado de agencias" })
      throw error
    } finally {
      set({ isLoadingAgencies: false })
    }
  },

  fetchBuyers: async () => {
    set({ isLoadingBuyers: true, error: null })
    try {
      const dtos = await adminAgencyDataSource.getBuyers()
      const buyers = dtos.map(buyerMapper.mapDTOToModel)
      set({ buyers })
    } catch (error: any) {
      set({ error: error?.message || "Error al cargar el listado de usuarios" })
      throw error
    } finally {
      set({ isLoadingBuyers: false })
    }
  },

  fetchTopBuyers: async () => {
    set({ isLoadingMetrics: true, error: null })
    try {
      const dtos = await adminAgencyDataSource.getTopBuyers()
      const topBuyers = dtos.map(metricsMapper.mapTopBuyerDTOToModel)
      set({ topBuyers })
    } catch (error: any) {
      set({ error: error?.message || "Error al cargar el top de compradores" })
      throw error
    } finally {
      set({ isLoadingMetrics: false })
    }
  },

  fetchTopRankedDestinations: async () => {
    set({ isLoadingMetrics: true, error: null })
    try {
      const dtos = await adminAgencyDataSource.getTopRankedDestinations()
      const topRankedDestinations = dtos.map(metricsMapper.mapTopDestinationDTOToModel)
      set({ topRankedDestinations })
    } catch (error: any) {
      set({ error: error?.message || "Error al cargar los destinos mejor rankeados" })
      throw error
    } finally {
      set({ isLoadingMetrics: false })
    }
  },

  fetchTopAgencies: async () => {
    set({ isLoadingMetrics: true, error: null })
    try {
      const dtos = await adminAgencyDataSource.getTopAgencies()
      const topAgencies = dtos.map(metricsMapper.mapTopAgencyDTOToModel)
      set({ topAgencies })
    } catch (error: any) {
      set({ error: error?.message || "Error al cargar el top de agencias con más ventas" })
      throw error
    } finally {
      set({ isLoadingMetrics: false })
    }
  },

  fetchTopRatedDestinations: async () => {
    set({ isLoadingMetrics: true, error: null })
    try {
      const dtos = await adminAgencyDataSource.getTopRatedDestinations()
      const topRatedDestinations = dtos.map(metricsMapper.mapTopRatedDestinationDTOToModel)
      set({ topRatedDestinations })
    } catch (error: any) {
      set({ error: error?.message || "Error al cargar los destinos mejor valorados" })
      throw error
    } finally {
      set({ isLoadingMetrics: false })
    }
  },

  fetchAdminDashboard: async () => {
    set({ isLoadingMetrics: true, error: null })
    try {
      const [topBuyersDTO, topDestinationsDTO, topAgenciesDTO, topRatedDTO] =
        await Promise.all([
          adminAgencyDataSource.getTopBuyers().catch(() => []),
          adminAgencyDataSource.getTopRankedDestinations().catch(() => []),
          adminAgencyDataSource.getTopAgencies().catch(() => []),
          adminAgencyDataSource.getTopRatedDestinations().catch(() => []),
        ])

      set({
        topBuyers: topBuyersDTO.map(metricsMapper.mapTopBuyerDTOToModel),
        topRankedDestinations: topDestinationsDTO.map(
          metricsMapper.mapTopDestinationDTOToModel
        ),
        topAgencies: topAgenciesDTO.map(metricsMapper.mapTopAgencyDTOToModel),
        topRatedDestinations: topRatedDTO.map(
          metricsMapper.mapTopRatedDestinationDTOToModel
        ),
      })
    } catch (error: any) {
      set({ error: error?.message || "Error al cargar el resumen del panel de administración" })
    } finally {
      set({ isLoadingMetrics: false })
    }
  },

  authorizeAgency: async (id: number) => {
    set({ processingAgencyId: id, error: null })
    try {
      await adminAgencyDataSource.authorizeAgency(id)
      set((state) => ({
        pendingAgencies: state.pendingAgencies.filter((agency) => agency.id !== id),
        agencies: state.agencies.map((agency) =>
          agency.id === id ? { ...agency, status: "AUTHORIZED" } : agency
        ),
      }))
    } catch (error: any) {
      set({ error: error?.message || "Error al autorizar la agencia" })
      throw error
    } finally {
      set({ processingAgencyId: null })
    }
  },

  rejectAgency: async (id: number) => {
    set({ processingAgencyId: id, error: null })
    try {
      await adminAgencyDataSource.rejectAgency(id)
      set((state) => ({
        pendingAgencies: state.pendingAgencies.filter((agency) => agency.id !== id),
        agencies: state.agencies.map((agency) =>
          agency.id === id ? { ...agency, status: "REJECTED" } : agency
        ),
      }))
    } catch (error: any) {
      set({ error: error?.message || "Error al rechazar la agencia" })
      throw error
    } finally {
      set({ processingAgencyId: null })
    }
  },

  clearError: () => set({ error: null }),
}))
