import Header from "@/components/layout/header"
import { SearchPackage } from "@/components/package/search"
import { useSearch } from "@/hooks/useSearch"

export function Home() {
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
    <>
      <Header cartCount={0} />
      <main className="max-w-7xl mx-auto px-6 py-12 flex flex-col gap-10">
        <section className="flex flex-col gap-3">
          <h1 className="text-4xl md:text-5xl font-extrabold text-primary tracking-tight">
            Viajes armados a tu medida
          </h1>
          <p className="text-slate-600 text-sm md:text-base leading-relaxed max-w-xl">
            Vuelo de ida, vuelo de vuelta y hotel en un solo paquete. <br />
            Explorá sin iniciar sesión y guardá todas las reservas que quieras.
          </p>
        </section>

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
    </>
  )
}

export default Home