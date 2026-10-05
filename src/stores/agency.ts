import { create } from "zustand"
import { agencyDataSource } from "../datasources/agency"
import {
  agencyMappers,
  type AgencyFlight,
  type AgencyMetricsSummary,
  type AgencyPackageItem,
  type AgencySale,
  type PackageFormData,
} from "../models/agency"
import { packageMappers, type Hotel } from "../models/package"
import type { FlightSearchFilterDTO } from "../types/agency"

export interface AgencyStoreState {
  packages: AgencyPackageItem[]
  flights: AgencyFlight[]
  sales: AgencySale[]
  hotels: Hotel[]
  metrics: AgencyMetricsSummary
  isLoadingPackages: boolean
  isLoadingFlights: boolean
  isLoadingSales: boolean
  isLoadingHotels: boolean
  isSubmitting: boolean
  isDeleting: boolean
  error: string | null

  fetchPackages: (agencyId?: number) => Promise<void>
  createPackage: (data: PackageFormData, agencyId: number) => Promise<void>
  updatePackage: (
    id: number,
    data: PackageFormData,
    agencyId: number
  ) => Promise<void>
  deletePackage: (id: number) => Promise<void>
  fetchHotels: () => Promise<void>
  searchFlights: (filter?: FlightSearchFilterDTO) => Promise<void>
  fetchSales: (agencyId?: number) => Promise<void>
  clearError: () => void
}

export const useAgencyStore = create<AgencyStoreState>((set) => ({
  packages: [],
  flights: [],
  sales: [],
  hotels: [],
  metrics: {
    totalRevenue: 0,
    totalSales: 0,
    uniqueClients: 0,
  },
  isLoadingPackages: false,
  isLoadingFlights: false,
  isLoadingSales: false,
  isLoadingHotels: false,
  isSubmitting: false,
  isDeleting: false,
  error: null,

  fetchPackages: async (agencyId?: number) => {
    set({ isLoadingPackages: true, error: null })
    try {
      const dtos = await agencyDataSource.getPackages(agencyId)
      const mappedPackages: AgencyPackageItem[] = dtos.map((dto) => {
        const pkg = packageMappers.mapDTOToModel(dto)
        return {
          id: pkg.id,
          name: pkg.name,
          description: pkg.description,
          price: pkg.price,
          startDate: pkg.initialDate,
          endDate: pkg.finalDate,
          nights: pkg.nights,
          hotel: pkg.hotel,
          departureFlight: pkg.departureFlight,
          returnFlight: pkg.arrivalFlight,
        }
      })
      set({ packages: mappedPackages, isLoadingPackages: false })
    } catch (err: any) {
      set({
        error: err?.message || "Error al cargar los paquetes de la agencia",
        isLoadingPackages: false,
      })
    }
  },

  createPackage: async (data: PackageFormData, agencyId: number) => {
    set({ isSubmitting: true, error: null })
    try {
      const dto = agencyMappers.mapPackageFormToDTO(data, agencyId)
      const createdDto = await agencyDataSource.createPackage(dto)
      const createdModel = packageMappers.mapDTOToModel(createdDto)
      const newPackageItem: AgencyPackageItem = {
        id: createdModel.id,
        name: createdModel.name,
        description: createdModel.description,
        price: createdModel.price,
        startDate: createdModel.initialDate,
        endDate: createdModel.finalDate,
        nights: createdModel.nights,
        hotel: createdModel.hotel,
        departureFlight: createdModel.departureFlight,
        returnFlight: createdModel.arrivalFlight,
      }

      set((state) => ({
        packages: [newPackageItem, ...state.packages],
        isSubmitting: false,
      }))
    } catch (err: any) {
      set({
        error: err?.message || "Error al crear el paquete de viaje",
        isSubmitting: false,
      })
      throw err
    }
  },

  updatePackage: async (
    id: number,
    data: PackageFormData,
    agencyId: number
  ) => {
    set({ isSubmitting: true, error: null })
    try {
      const dto = agencyMappers.mapPackageFormToDTO(data, agencyId)
      const updatedDto = await agencyDataSource.updatePackage(id, dto)
      const updatedModel = packageMappers.mapDTOToModel(updatedDto)
      const updatedItem: AgencyPackageItem = {
        id: updatedModel.id,
        name: updatedModel.name,
        description: updatedModel.description,
        price: updatedModel.price,
        startDate: updatedModel.initialDate,
        endDate: updatedModel.finalDate,
        nights: updatedModel.nights,
        hotel: updatedModel.hotel,
        departureFlight: updatedModel.departureFlight,
        returnFlight: updatedModel.arrivalFlight,
      }

      set((state) => ({
        packages: state.packages.map((p) => (p.id === id ? updatedItem : p)),
        isSubmitting: false,
      }))
    } catch (err: any) {
      set({
        error: err?.message || "Error al actualizar el paquete de viaje",
        isSubmitting: false,
      })
      throw err
    }
  },

  deletePackage: async (id: number) => {
    set({ isDeleting: true, error: null })
    try {
      await agencyDataSource.deletePackage(id)
      set((state) => ({
        packages: state.packages.filter((p) => p.id !== id),
        isDeleting: false,
      }))
    } catch (err: any) {
      set({
        error: err?.message || "Error al eliminar el paquete",
        isDeleting: false,
      })
      throw err
    }
  },

  fetchHotels: async () => {
    set({ isLoadingHotels: true })
    try {
      const dtos = await agencyDataSource.getHotels()
      const hotels = dtos.map(agencyMappers.mapHotelOptionDTOToModel)
      set({ hotels, isLoadingHotels: false })
    } catch (err: any) {
      set({ isLoadingHotels: false })
    }
  },

  searchFlights: async (filter?: FlightSearchFilterDTO) => {
    set({ isLoadingFlights: true, error: null })
    try {
      const dtos = await agencyDataSource.searchFlights(filter)
      const flights = dtos.map(agencyMappers.mapFlightDTOToModel)
      set({ flights, isLoadingFlights: false })
    } catch (err: any) {
      set({
        error: err?.message || "Error al consultar los vuelos",
        isLoadingFlights: false,
      })
    }
  },

  fetchSales: async (_agencyId?: number) => {
    set({ isLoadingSales: true, error: null })
    try {
      const dtos = await agencyDataSource.getSales()
      const sales = dtos.map(agencyMappers.mapSaleDTOToModel)
      const metrics = agencyMappers.calculateMetrics(sales)
      set({ sales, metrics, isLoadingSales: false })
    } catch (err: any) {
      set({
        error: err?.message || "Error al obtener las ventas de la agencia",
        isLoadingSales: false,
      })
    }
  },

  clearError: () => set({ error: null }),
}))
