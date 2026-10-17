import { create } from "zustand"
import { locationDataSource } from "../datasources/location"
import { packageDataSource } from "../datasources/package"
import { locationMappers, type City, type Country } from "../models/location"
import { packageMappers, type TravelPackage } from "../models/package"
import type { SearchPackageCriteria } from "../models/search"
import { toast } from "react-toastify"

export interface SearchStoreState {
  countries: Country[]
  originCities: City[]
  destinationCities: City[]
  packages: TravelPackage[]
  page: number
  size: number
  totalElements: number
  totalPages: number
  isLoadingCountries: boolean
  isLoadingOriginCities: boolean
  isLoadingDestinationCities: boolean
  isSearching: boolean
  lastSearchCriteria: SearchPackageCriteria | null

  fetchCountries: () => Promise<void>
  fetchOriginCities: (isoCode: string) => Promise<void>
  fetchDestinationCities: (isoCode: string) => Promise<void>
  resetOriginCities: () => void
  resetDestinationCities: () => void
  searchPackages: (criteria?: SearchPackageCriteria) => Promise<void>
}

export const useSearchStore = create<SearchStoreState>((set) => ({
  countries: [],
  originCities: [],
  destinationCities: [],
  packages: [],
  page: 0,
  size: 10,
  totalElements: 0,
  totalPages: 0,
  isLoadingCountries: false,
  isLoadingOriginCities: false,
  isLoadingDestinationCities: false,
  isSearching: false,
  lastSearchCriteria: null,

  fetchCountries: async () => {
    set({ isLoadingCountries: true })
    try {
      const dtos = await locationDataSource.getCountries()
      set({
        countries: dtos.map(locationMappers.mapCountryDTOToModel),
      })
    } catch (error) {
      toast.error("Hubo un problema al obtener los paises")
    } finally {
      set({ isLoadingCountries: false })
    }
  },

  fetchOriginCities: async (isoCode: string) => {
    set({ isLoadingOriginCities: true })
    try {
      const dtos = await locationDataSource.getCities(isoCode)
      set({
        originCities: dtos.map(locationMappers.mapCityDTOToModel),
      })
    } catch (error) {
      toast.error("Hubo un problema al obtener las ciudades")
    } finally {
      set({ isLoadingOriginCities: false })
    }
  },

  fetchDestinationCities: async (isoCode: string) => {
    set({ isLoadingDestinationCities: true })
    try {
      const dtos = await locationDataSource.getCities(isoCode)
      set({
        destinationCities: dtos.map(locationMappers.mapCityDTOToModel),
      })
    } catch (error) {
      toast.error("Hubo un problema al obtener las ciudades")
    } finally {
      set({ isLoadingDestinationCities: false })
    }
  },

  resetOriginCities: () => set({ originCities: [] }),
  resetDestinationCities: () => set({ destinationCities: [] }),

  searchPackages: async (criteria: SearchPackageCriteria = {}) => {
    const finalCriteria: SearchPackageCriteria = {
      page: criteria.page ?? 0,
      size: criteria.size ?? 10,
      ...criteria,
    }

    set({ isSearching: true, lastSearchCriteria: finalCriteria })
    try {
      const pageDTO = await packageDataSource.searchPackages(finalCriteria)
      const pageModel = packageMappers.mapPageDTOToModel(pageDTO)
      
      set({
        packages: pageModel.content,
        totalElements: pageModel.totalElements,
        totalPages: pageModel.totalPages,
        page: pageModel.number,
        size: pageModel.size,
        isSearching: false,
      })
    } catch (error: any) {
      toast.error("Hubo un error al buscar paquetes. Intente mas tarde.")
      set({
        isSearching: false,
      })
      throw error
    }
  },
}))
