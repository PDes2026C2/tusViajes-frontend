import type { DateRange } from "react-day-picker"
import { Loader2 } from "lucide-react"
import type { FieldErrors } from "react-hook-form"
import type { City, Country } from "../../models/location"
import type { SearchPackageFormData } from "../../models/search.schema"
import { Button } from "../ui/button"
import { DatePickerWithRange } from "../ui/DatePickerWithRange"
import { SelectDropdown, type SelectOption } from "../ui/select-dropdown"

export interface SearchPackageProps {
  originCountryIso?: string
  originCityId?: number
  destinationCountryIso?: string
  destinationCityId?: number
  departureDateRange?: DateRange
  arrivalDateRange?: DateRange
  availableCountries: Country[]
  availableOriginCities: City[]
  availableDestinationCities: City[]
  isLoadingCountries?: boolean
  isLoadingOriginCities?: boolean
  isLoadingDestinationCities?: boolean
  isSearching?: boolean
  onSelectOriginCountry: (isoCode?: string) => void
  onSelectOriginCity: (cityId?: number) => void
  onSelectDestinationCountry: (isoCode?: string) => void
  onSelectDestinationCity: (cityId?: number) => void
  setDepartureDateRange: (range: DateRange | undefined) => void
  setArrivalDateRange: (range: DateRange | undefined) => void
  onSubmit: (e?: React.BaseSyntheticEvent) => Promise<void> | void
  errors?: FieldErrors<SearchPackageFormData>
}

export function SearchPackage({
  originCountryIso,
  originCityId,
  destinationCountryIso,
  destinationCityId,
  departureDateRange,
  setDepartureDateRange,
  arrivalDateRange,
  setArrivalDateRange,
  availableCountries,
  availableOriginCities,
  availableDestinationCities,
  isLoadingCountries = false,
  isLoadingOriginCities = false,
  isLoadingDestinationCities = false,
  isSearching = false,
  onSelectOriginCountry,
  onSelectOriginCity,
  onSelectDestinationCountry,
  onSelectDestinationCity,
  onSubmit,
  errors,
}: SearchPackageProps) {
  const countryOptions: SelectOption[] = availableCountries.map((c) => ({
    value: c.isoCode,
    label: c.name,
    isoCode: c.isoCode,
  }))

  const originCityOptions: SelectOption[] = availableOriginCities.map((city) => ({
    value: city.id,
    label: city.name,
  }))

  const destinationCityOptions: SelectOption[] = availableDestinationCities.map(
    (city) => ({
      value: city.id,
      label: city.name,
    })
  )

  return (
    <form
      onSubmit={onSubmit}
      className="bg-white border border-slate-200 rounded-3xl p-6 md:p-8 shadow-sm"
    >
      <div className="grid grid-cols-1 gap-6">
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {/* Origin Country */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase text-left">
              PAÍS DE ORIGEN
            </label>
            <SelectDropdown
              placeholder="Seleccionar país"
              options={countryOptions}
              selectedValue={originCountryIso}
              onSelect={onSelectOriginCountry}
              isLoading={isLoadingCountries}
              iconType="country"
              error={errors?.originCountryIso?.message}
            />
          </div>

          {/* Origin City */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase text-left">
              CIUDAD DE ORIGEN
            </label>
            <SelectDropdown
              placeholder="Seleccionar ciudad"
              options={originCityOptions}
              selectedValue={originCityId || undefined}
              onSelect={onSelectOriginCity}
              disabled={!originCountryIso}
              isLoading={isLoadingOriginCities}
              iconType="city"
              error={errors?.originCityId?.message}
            />
          </div>

          {/* Destination Country */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase text-left">
              PAÍS DESTINO
            </label>
            <SelectDropdown
              placeholder="Seleccionar país"
              options={countryOptions}
              selectedValue={destinationCountryIso}
              onSelect={onSelectDestinationCountry}
              isLoading={isLoadingCountries}
              iconType="country"
              error={errors?.destinationCountryIso?.message}
            />
          </div>

          {/* Destination City */}
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase text-left">
              CIUDAD DESTINO
            </label>
            <SelectDropdown
              placeholder="Seleccionar ciudad"
              options={destinationCityOptions}
              selectedValue={destinationCityId || undefined}
              onSelect={onSelectDestinationCity}
              disabled={!destinationCountryIso}
              isLoading={isLoadingDestinationCities}
              iconType="city"
              error={errors?.destinationCityId?.message}
            />
          </div>
        </div>

        {/* Date Ranges */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase text-left">
              Fecha de salida
            </label>
            <DatePickerWithRange
              date={departureDateRange}
              setDate={setDepartureDateRange}
            />
          </div>
          <div className="flex flex-col gap-1.5">
            <label className="text-xs font-semibold tracking-wider text-slate-500 uppercase text-left">
              Fecha de regreso
            </label>
            <DatePickerWithRange
              date={arrivalDateRange}
              setDate={setArrivalDateRange}
            />
          </div>
        </div>

        {/* Action Button */}
        <div className="flex flex-col sm:flex-row justify-end items-center pt-2">
          <Button
            type="submit"
            disabled={isSearching}
            className="w-full sm:w-auto px-8 py-3 rounded-xl bg-primary hover:bg-primary/90 text-white font-semibold cursor-pointer shadow-sm flex items-center justify-center gap-2"
          >
            {isSearching && <Loader2 className="h-4 w-4 animate-spin" />}
            <span>{isSearching ? "Buscando..." : "Buscar paquetes"}</span>
          </Button>
        </div>
      </div>
    </form>
  )
}