import { BarChart2, Building2, Users } from "lucide-react"
import type { AdminTab } from "../../hooks/useAdmin"

export interface AdminTabsProps {
  activeTab: AdminTab
  pendingAgenciesCount: number
  onTabChange: (tab: AdminTab) => void
}

export function AdminTabs({
  activeTab,
  pendingAgenciesCount,
  onTabChange,
}: AdminTabsProps) {
  const tabs: { id: AdminTab; label: string; icon: typeof BarChart2; badge?: number }[] = [
    {
      id: "metrics",
      label: "Métricas y Rankings",
      icon: BarChart2,
    },
    {
      id: "agencies",
      label: "Agencias",
      icon: Building2,
      badge: pendingAgenciesCount > 0 ? pendingAgenciesCount : undefined,
    },
    {
      id: "users",
      label: "Usuarios",
      icon: Users,
    },
  ]

  return (
    <div className="flex border-b border-slate-200 bg-white px-6 rounded-t-2xl shadow-2xs">
      <nav className="flex space-x-2 sm:space-x-6 overflow-x-auto py-2" aria-label="Tabs de administración">
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
              <Icon className={`w-4 h-4 ${isActive ? "text-primary" : "text-slate-400"}`} />
              <span>{tab.label}</span>
              {tab.badge !== undefined && (
                <span className="ml-1 inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium bg-error/10 text-error border border-error/20">
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
