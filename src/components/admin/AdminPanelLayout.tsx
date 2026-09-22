import type React from "react"
import { ShieldCheck } from "lucide-react"
import type {
  Buyer,
  TopAgency,
  TopBuyer,
  TopDestination,
  TopRatedDestination,
} from "../../models/admin"
import type { Agency } from "@/models/package"
import type {
  AdminTab,
  AgencyStatusFilter,
  ConfirmDialogState,
} from "../../hooks/useAdmin"
import { AdminTabs } from "./AdminTabs"
import { AdminMetricsView } from "./AdminMetricsView"
import { AdminAgenciesView } from "./AdminAgenciesView"
import { AdminUsersView } from "./AdminUsersView"
import { AgencyActionModal } from "./AgencyActionModal"

export interface AdminPanelLayoutProps {
  header: React.ReactNode

  // Navigation / Tabs
  activeTab?: AdminTab
  onTabChange?: (tab: AdminTab) => void

  // Agencies
  agencies?: Agency[]
  pendingAgencies?: Agency[]
  filteredAgencies: Agency[]
  searchQuery: string
  agencyStatusFilter?: AgencyStatusFilter
  isLoading: boolean
  processingAgencyId: number | null
  error: string | null
  confirmDialog: ConfirmDialogState
  onSearchChange: (query: string) => void
  onAgencyStatusFilterChange?: (status: AgencyStatusFilter) => void
  onOpenAuthorize: (agency: Agency) => void
  onOpenReject: (agency: Agency) => void
  onCloseConfirmDialog: () => void
  onConfirmAction: () => void
  onRefresh: () => void

  // Buyers
  buyers?: Buyer[]
  filteredBuyers?: Buyer[]
  userSearchQuery?: string
  isLoadingBuyers?: boolean
  onUserSearchChange?: (query: string) => void
  onRefreshBuyers?: () => void

  // Metrics
  topBuyers?: TopBuyer[]
  topRankedDestinations?: TopDestination[]
  topAgencies?: TopAgency[]
  topRatedDestinations?: TopRatedDestination[]
  isLoadingMetrics?: boolean
  onRefreshMetrics?: () => void
}

export function AdminPanelLayout({
  header,
  activeTab = "metrics",
  onTabChange = () => {},
  pendingAgencies = [],
  filteredAgencies,
  searchQuery,
  agencyStatusFilter = "ALL",
  isLoading,
  processingAgencyId,
  error,
  confirmDialog,
  onSearchChange,
  onAgencyStatusFilterChange = () => {},
  onOpenAuthorize,
  onOpenReject,
  onCloseConfirmDialog,
  onConfirmAction,
  onRefresh,

  // Buyers
  filteredBuyers = [],
  userSearchQuery = "",
  isLoadingBuyers = false,
  onUserSearchChange = () => {},
  onRefreshBuyers,

  // Metrics
  topBuyers = [],
  topRankedDestinations = [],
  topAgencies = [],
  topRatedDestinations = [],
  isLoadingMetrics = false,
  onRefreshMetrics,
}: AdminPanelLayoutProps) {
  return (
    <div className="min-h-screen bg-slate-50/50 flex flex-col">
      {header}

      {/* Admin Hero Header */}
      <section className="bg-white border-b border-slate-200/80 shadow-2xs">
        <div className="mx-auto max-w-6xl px-6 py-7">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 rounded-xl bg-primary/10 text-primary flex items-center justify-center shrink-0">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="flex items-center gap-2">
                <h1 className="text-xl sm:text-2xl font-bold tracking-tight text-slate-900">
                  Panel de Administración
                </h1>
                <span className="bg-primary/10 text-primary text-[11px] font-medium px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Admin
                </span>
              </div>
              <p className="mt-1 text-xs sm:text-sm text-slate-500 max-w-2xl">
                Supervisá y gestioná usuarios, agencias y métricas clave de la plataforma TusViajes.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* Main Content */}
      <main className="mx-auto max-w-6xl px-6 py-8 w-full flex-1 flex flex-col gap-6">
        {/* Navigation Tabs */}
        <AdminTabs
          activeTab={activeTab}
          pendingAgenciesCount={pendingAgencies.length}
          onTabChange={onTabChange}
        />

        {/* Tab Content */}
        {activeTab === "metrics" && (
          <AdminMetricsView
            topBuyers={topBuyers}
            topRankedDestinations={topRankedDestinations}
            topAgencies={topAgencies}
            topRatedDestinations={topRatedDestinations}
            isLoading={isLoadingMetrics}
            onRefresh={onRefreshMetrics}
          />
        )}

        {activeTab === "agencies" && (
          <AdminAgenciesView
            agencies={filteredAgencies}
            isLoading={isLoading}
            processingAgencyId={processingAgencyId}
            searchQuery={searchQuery}
            statusFilter={agencyStatusFilter}
            pendingCount={pendingAgencies.length}
            error={error}
            onSearchChange={onSearchChange}
            onStatusFilterChange={onAgencyStatusFilterChange}
            onAuthorize={onOpenAuthorize}
            onReject={onOpenReject}
            onRefresh={onRefresh}
          />
        )}

        {activeTab === "users" && (
          <AdminUsersView
            buyers={filteredBuyers}
            searchQuery={userSearchQuery}
            isLoading={isLoadingBuyers}
            error={error}
            onSearchChange={onUserSearchChange}
            onRefresh={onRefreshBuyers}
          />
        )}
      </main>

      {/* Action Confirmation Modal */}
      <AgencyActionModal
        isOpen={confirmDialog.isOpen}
        agency={confirmDialog.agency}
        actionType={confirmDialog.actionType}
        isProcessing={processingAgencyId === confirmDialog.agency?.id}
        onClose={onCloseConfirmDialog}
        onConfirm={onConfirmAction}
      />
    </div>
  )
}
