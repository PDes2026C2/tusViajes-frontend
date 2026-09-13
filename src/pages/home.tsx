import { Header } from "@/components/layout/header"
import { SearchPackage } from "@/components/package/search"
import { useHeader } from "@/hooks/useHeader"
import { useSearch } from "@/hooks/useSearch"

export function Home() {
  const headerProps = useHeader({ cartCount: 0 })
  const {
    selectedOriginCountry,
    selectedOriginCity,
    selectedDestinationCountry,
    selectedDestinationCity,
    departureDateRange,
    arrivalDateRange,
    countries,
    originCities,
    destinationCities,
    isLoadingCountries,
    isLoadingOriginCities,
    isLoadingDestinationCities,
    isSearching,
    onSelectOriginCountry,
    onSelectOriginCity,
    onSelectDestinationCountry,
    onSelectDestinationCity,
    setDepartureDateRange,
    setArrivalDateRange,
    onSubmit,
    errors,
  } = useSearch()

  return (
    <div className="min-h-screen bg-slate-50/40 flex flex-col">
      <Header {...headerProps} />

      <section className="tide-gradient border-b border-sky-100/60">
        <div className="mx-auto max-w-6xl px-6 pb-14 pt-12 text-left">
          <h1 className="max-w-[18ch] text-balance text-4xl font-extrabold tracking-tight text-[#084d6e] sm:text-5xl leading-tight">
            Viajes armados a tu medida
          </h1>
          <p className="mt-4 max-w-[46ch] text-pretty text-muted-foreground text-base sm:text-lg leading-relaxed">
            Vuelo de ida, vuelo de vuelta y hotel en un solo paquete. Explorá sin iniciar sesión y guardá todas las
            reservas que quieras.
          </p>
        </div>
      </section>

      <main className="mx-auto max-w-6xl px-6 -mt-6 pb-16 w-full">

        <section>
          <SearchPackage
            originCountryIso={selectedOriginCountry}
            originCityId={selectedOriginCity}
            destinationCountryIso={selectedDestinationCountry}
            destinationCityId={selectedDestinationCity}
            departureDateRange={departureDateRange}
            arrivalDateRange={arrivalDateRange}
            availableCountries={countries}
            availableOriginCities={originCities}
            availableDestinationCities={destinationCities}
            isLoadingCountries={isLoadingCountries}
            isLoadingOriginCities={isLoadingOriginCities}
            isLoadingDestinationCities={isLoadingDestinationCities}
            isSearching={isSearching}
            onSelectOriginCountry={onSelectOriginCountry}
            onSelectOriginCity={onSelectOriginCity}
            onSelectDestinationCountry={onSelectDestinationCountry}
            onSelectDestinationCity={onSelectDestinationCity}
            setDepartureDateRange={setDepartureDateRange}
            setArrivalDateRange={setArrivalDateRange}
            onSubmit={onSubmit}
            errors={errors}
          />
        </section>
      </main>
    </div>
  )
}

export default Home