import type React from "react"
import { Building2 } from "lucide-react"
import type {
  AgencyFlight,
  AgencyMetricsSummary,
  AgencyPackageItem,
  AgencySale,
  PackageFormData,
} from "../../models/agency"
import type { Hotel } from "../../models/package"
import type {
  AgencyTab,
  PackageDeleteModalState,
  PackageFormModalState,
} from "../../hooks/useAgency"
import { AgencyTabs } from "./AgencyTabs"
import { AgencyPackagesView } from "./AgencyPackagesView"
import { AgencyFlightsView } from "./AgencyFlightsView"
import { AgencySalesView } from "./AgencySalesView"
import { PackageFormModal } from "./PackageFormModal"
import { PackageDeleteModal } from "./PackageDeleteModal"

export interface AgencyPanelLayoutProps {
  header: React.ReactNode

  // Navigation
  activeTab?: AgencyTab
  onTabChange?: (tab: AgencyTab) => void

  // Packages
  packages?: AgencyPackageItem[]
  filteredPackages: AgencyPackageItem[]
  packageSearchQuery: string
  onPackageSearchChange: (query: string) => void
  isLoadingPackages: boolean
  isSubmittingPackage: boolean
  isDeletingPackage: boolean
  formModal: PackageFormModalState
  deleteModal: PackageDeleteModalState
  hotels: Hotel[]
  flights: AgencyFlight[]
  onOpenCreatePackage: (initialFlight?: AgencyFlight) => void
  onOpenEditPackage: (pkg: AgencyPackageItem) => void
  onCloseFormModal: () => void
  onSubmitPackageForm: (data: PackageFormData) => Promise<void>
  onOpenDeleteModal: (pkg: AgencyPackageItem) => void
  onCloseDeleteModal: () => void
  onConfirmDelete: () => Promise<void>
  onRefreshPackages: () => void

  // Flights
  filteredFlights: AgencyFlight[]
  flightDestinationCityId?: number
  flightOriginCityId?: number
  flightOnlyAvailable: boolean
  isLoadingFlights: boolean
  onFlightDestinationChange: (cityId?: number) => void
  onFlightOriginChange: (cityId?: number) => void
  onFlightOnlyAvailableToggle: () => void
  onUseFlightInPackage: (flight: AgencyFlight) => void
  onRefreshFlights: () => void

  // Sales
  filteredSales: AgencySale[]
  salesSearchQuery: string
  onSalesSearchChange: (query: string) => void
  metrics: AgencyMetricsSummary
  isLoadingSales: boolean
  onRefreshSales: () => void
}

export function AgencyPanelLayout({
  header,
  activeTab = "packages",
  onTabChange = () => {},

  // Packages
  packages = [],
  filteredPackages,
  packageSearchQuery,
  onPackageSearchChange,
  isLoadingPackages,
  isSubmittingPackage,
  isDeletingPackage,
  formModal,
  deleteModal,
  hotels,
  flights,
  onOpenCreatePackage,
  onOpenEditPackage,
  onCloseFormModal,
  onSubmitPackageForm,
  onOpenDeleteModal,
  onCloseDeleteModal,
  onConfirmDelete,
  onRefreshPackages,

  // Flights
  filteredFlights,
  flightDestinationCityId,
  flightOriginCityId,
  flightOnlyAvailable,
  isLoadingFlights,
  onFlightDestinationChange,
  onFlightOriginChange,
  onFlightOnlyAvailableToggle,
  onUseFlightInPackage,
  onRefreshFlights,

  // Sales
  filteredSales,
  salesSearchQuery,
  onSalesSearchChange,
  metrics,
  isLoadingSales,
  onRefreshSales,
}: AgencyPanelLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {header}

      {/* Agency Hero Header */}
      <section className="bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="mx-auto max-w-6xl px-6 py-7">
          <div className="flex items-center gap-3.5">
            <div className="w-11 h-11 rounded-2xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <Building2 className="w-6 h-6" />
            </div>
            <div>
              <div className="flex items-center gap-2.5">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Panel de Gestión de Agencia
                </h1>
                <span className="bg-emerald-500/10 text-emerald-700 text-[11px] font-semibold px-2.5 py-0.5 rounded-full uppercase tracking-wider border border-emerald-500/20">
                  Agencia Autorizada
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
                Gestioná tu catálogo de paquetes de viaje, consultá vuelos disponibles y seguí de cerca tus ventas y clientes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8 w-full flex-1 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <AgencyTabs
          activeTab={activeTab}
          packagesCount={packages.length}
          salesCount={filteredSales.length}
          onTabChange={onTabChange}
        />

        {/* Tab Content */}
        {activeTab === "packages" && (
          <AgencyPackagesView
            packages={filteredPackages}
            isLoading={isLoadingPackages}
            searchQuery={packageSearchQuery}
            onSearchChange={onPackageSearchChange}
            onOpenCreate={() => onOpenCreatePackage()}
            onOpenEdit={onOpenEditPackage}
            onOpenDelete={onOpenDeleteModal}
            onRefresh={onRefreshPackages}
          />
        )}

        {activeTab === "flights" && (
          <AgencyFlightsView
            flights={filteredFlights}
            isLoading={isLoadingFlights}
            destinationCityId={flightDestinationCityId}
            originCityId={flightOriginCityId}
            onlyAvailable={flightOnlyAvailable}
            onDestinationChange={onFlightDestinationChange}
            onOriginChange={onFlightOriginChange}
            onOnlyAvailableToggle={onFlightOnlyAvailableToggle}
            onUseFlightInPackage={onUseFlightInPackage}
            onRefresh={onRefreshFlights}
          />
        )}

        {activeTab === "sales" && (
          <AgencySalesView
            sales={filteredSales}
            isLoading={isLoadingSales}
            searchQuery={salesSearchQuery}
            onSearchChange={onSalesSearchChange}
            metrics={metrics}
            onRefresh={onRefreshSales}
          />
        )}
      </main>

      {/* Package Form Modal */}
      <PackageFormModal
        isOpen={formModal.isOpen}
        editingPackage={formModal.editingPackage}
        presetDepartureFlight={formModal.presetDepartureFlight}
        hotels={hotels}
        flights={flights}
        isSubmitting={isSubmittingPackage}
        onClose={onCloseFormModal}
        onSubmit={onSubmitPackageForm}
      />

      {/* Package Delete Modal */}
      <PackageDeleteModal
        isOpen={deleteModal.isOpen}
        packageItem={deleteModal.packageItem}
        isDeleting={isDeletingPackage}
        onClose={onCloseDeleteModal}
        onConfirm={onConfirmDelete}
      />
    </div>
  )
}
