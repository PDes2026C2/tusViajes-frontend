import { Briefcase, Plane, Receipt } from "lucide-react"
import type { AgencyTab } from "../../hooks/useAgency"

export interface AgencyTabsProps {
  activeTab: AgencyTab
  packagesCount?: number
  salesCount?: number
  onTabChange: (tab: AgencyTab) => void
}

export function AgencyTabs({
  activeTab,
  packagesCount,
  salesCount,
  onTabChange,
}: AgencyTabsProps) {
  const tabs: {
    id: AgencyTab
    label: string
    icon: typeof Briefcase
    badge?: number
  }[] = [
    {
      id: "packages",
      label: "Mis Paquetes",
      icon: Briefcase,
      badge: packagesCount,
    },
    {
      id: "flights",
      label: "Consulta de Vuelos",
      icon: Plane,
    },
    {
      id: "sales",
      label: "Ventas y Clientes",
      icon: Receipt,
      badge: salesCount,
    },
  ]

  return (
    <div className="flex border-b border-slate-200 bg-white px-6 rounded-t-2xl shadow-2xs">
      <nav
        className="flex space-x-2 sm:space-x-6 overflow-x-auto py-2"
        aria-label="Tabs de agencia"
      >
        {tabs.map((tab) => {
          const Icon = tab.icon
          const isActive = activeTab === tab.id

          return (
            <button
              key={tab.id}
              type="button"
              onClick={() => onTabChange(tab.id)}
              className={`flex items-center gap-2 py-2.5 px-3 text-xs sm:text-sm font-medium rounded-xl border-b-2 transition-all cursor-pointer whitespace-nowrap ${
                isActive
                  ? "border-primary text-primary bg-primary/5 font-semibold"
                  : "border-transparent text-slate-500 hover:text-slate-700 hover:bg-slate-50"
              }`}
            >
              <Icon
                className={`w-4 h-4 ${
                  isActive ? "text-primary" : "text-slate-400"
                }`}
              />
              <span>{tab.label}</span>
              {tab.badge !== undefined && tab.badge > 0 && (
                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-primary/10 text-primary border border-primary/20">
                  {tab.badge}
                </span>
              )}
            </button>
          )
        })}
      </nav>
    </div>
  )
}
