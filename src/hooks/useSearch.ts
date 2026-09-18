import { zodResolver } from "@hookform/resolvers/zod"
import { useEffect } from "react"
import type { DateRange } from "react-day-picker"
import { useForm } from "react-hook-form"
import {
  searchPackageSchema,
  type SearchPackageFormData,
} from "../models/search.schema"
import type { SearchPackageCriteria } from "../models/search"
import { useSearchStore } from "../stores/search"

export function useSearch() {
  const {
    countries,
    originCities,
    destinationCities,
    packages,
    page,
    size,
    totalElements,
    totalPages,
    isLoadingCountries,
    isLoadingOriginCities,
    isLoadingDestinationCities,
    isSearching,
    searchError,
    fetchCountries,
    fetchOriginCities,
    fetchDestinationCities,
    resetOriginCities,
    resetDestinationCities,
    searchPackages,
  } = useSearchStore()

  const form = useForm<SearchPackageFormData>({
    resolver: zodResolver(searchPackageSchema),
    defaultValues: {
      originCountryIso: "",
      originCityId: 0,
      destinationCountryIso: "",
      destinationCityId: 0,
      departureDateRange: undefined,
      arrivalDateRange: undefined,
    },
    mode: "onBlur",
  })

  const {
    watch,
    setValue,
    getValues,
    handleSubmit,
    formState: { errors },
  } = form

  // Fetch available countries on mount if not yet loaded
  useEffect(() => {
    if (countries.length === 0) {
      fetchCountries()
    }
  }, [countries.length, fetchCountries])

  useEffect(() => {
    if (!isSearching) {
      searchPackages({ page: 0, size: 10 })
    }
  }, [])

  const handleSelectOriginCountry = (isoCode?: string) => {
    setValue("originCountryIso", isoCode || "", { shouldValidate: true })
    setValue("originCityId", 0, { shouldValidate: true })

    if (isoCode) {
      fetchOriginCities(isoCode)
    } else {
      resetOriginCities()
    }
  }

  const handleSelectOriginCity = (cityId?: number) => {
    setValue("originCityId", cityId || 0, { shouldValidate: true })
  }

  const handleSelectDestinationCountry = (isoCode?: string) => {
    setValue("destinationCountryIso", isoCode || "", { shouldValidate: true })
    setValue("destinationCityId", 0, { shouldValidate: true })

    if (isoCode) {
      fetchDestinationCities(isoCode)
    } else {
      resetDestinationCities()
    }
  }

  const handleSelectDestinationCity = (cityId?: number) => {
    setValue("destinationCityId", cityId || 0, { shouldValidate: true })
  }

  const handleSetDepartureDateRange = (range: DateRange | undefined) => {
    setValue("departureDateRange", range, { shouldValidate: true })
  }

  const handleSetArrivalDateRange = (range: DateRange | undefined) => {
    setValue("arrivalDateRange", range, { shouldValidate: true })
  }

  const onValidSubmit = async (data: SearchPackageFormData) => {
    const criteria: SearchPackageCriteria = {
      originCountryIso: data.originCountryIso || undefined,
      originCityId: data.originCityId || undefined,
      destinationCountryIso: data.destinationCountryIso || undefined,
      destinationCityId: data.destinationCityId || undefined,
      departureDateRange: data.departureDateRange,
      arrivalDateRange: data.arrivalDateRange,
      page: 0,
      size: 10,
    }
    await searchPackages(criteria)
  }

  const handleChangePage = async (newPage: number) => {
    const currentData = getValues()
    const criteria: SearchPackageCriteria = {
      originCountryIso: currentData.originCountryIso || undefined,
      originCityId: currentData.originCityId || undefined,
      destinationCountryIso: currentData.destinationCountryIso || undefined,
      destinationCityId: currentData.destinationCityId || undefined,
      departureDateRange: currentData.departureDateRange,
      arrivalDateRange: currentData.arrivalDateRange,
      page: newPage,
      size: 10,
    }
    await searchPackages(criteria)
  }

  return {
    // Current selections
    selectedOriginCountry: watch("originCountryIso"),
    selectedOriginCity: watch("originCityId"),
    selectedDestinationCountry: watch("destinationCountryIso"),
    selectedDestinationCity: watch("destinationCityId"),
    departureDateRange: watch("departureDateRange"),
    arrivalDateRange: watch("arrivalDateRange"),

    // Options and results from store
    countries,
    originCities,
    destinationCities,
    packages,
    page,
    size,
    totalElements,
    totalPages,

    // Loading states
    isLoadingCountries,
    isLoadingOriginCities,
    isLoadingDestinationCities,
    isSearching,

    // Handlers
    onSelectOriginCountry: handleSelectOriginCountry,
    onSelectOriginCity: handleSelectOriginCity,
    onSelectDestinationCountry: handleSelectDestinationCountry,
    onSelectDestinationCity: handleSelectDestinationCity,
    setDepartureDateRange: handleSetDepartureDateRange,
    setArrivalDateRange: handleSetArrivalDateRange,
    onSubmit: handleSubmit(onValidSubmit),
    onChangePage: handleChangePage,

    // Form metadata
    errors,
    searchError,
  }
}
