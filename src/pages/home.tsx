import { Header } from "@/components/layout/header"
import { SearchPackage } from "@/components/package/search"
import { PackageList } from "@/components/package/package-list"
import { useHeader } from "@/hooks/useHeader"
import { useSearch } from "@/hooks/useSearch"
import type { TravelPackage } from "@/models/package"

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
    packages,
    page,
    totalPages,
    totalElements,
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
    onChangePage,
    errors,
  } = useSearch()

  const handleAddToCart = (pkg: TravelPackage) => {
    // Handled in home orchestrator - preparing for cart integration
    console.info("Agregando paquete al carrito:", pkg.name, pkg.id)
  }

  const handleViewDetails = (pkg: TravelPackage) => {
    // Handled in home orchestrator - preparing for details modal/page navigation
    console.info("Visualizando detalle del paquete:", pkg.name, pkg.id)
  }

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

      <main className="mx-auto max-w-6xl px-6 -mt-6 pb-16 w-full flex flex-col gap-6">
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

        {/* Listado horizontal de paquetes y paginación centrada */}
        <PackageList
          packages={packages}
          isLoading={isSearching}
          currentPage={page}
          totalPages={totalPages}
          totalElements={totalElements}
          onAddToCart={handleAddToCart}
          onViewDetails={handleViewDetails}
          onPageChange={onChangePage}
        />
      </main>
    </div>
  )
}

export default Home