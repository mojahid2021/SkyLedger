import React from "react"
import {
  IconLayoutDashboard,
  IconReceipt,
  IconPlane,
  IconWallet,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"

interface UserSidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function UserSidebar({ activeTab, setActiveTab }: UserSidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: IconLayoutDashboard },
    { id: "trips", label: "My Trips & Tickets", icon: IconPlane },
    { id: "wallet", label: "Digital Wallet", icon: IconWallet },
    { id: "transactions", label: "Transactions", icon: IconReceipt },
  ]

  return (
    <>
      {/* Mobile Horizontal Sub-Navigation */}
      <nav className="flex w-full overflow-x-auto border-b border-delta-hairline bg-delta-surface-1 px-4 py-2 gap-2 lg:hidden scrollbar-none shrink-0 font-sans">
        {navItems.map((item) => {
          const Icon = item.icon
          const isActive = activeTab === item.id
          return (
            <button
              key={item.id}
              onClick={() => setActiveTab(item.id)}
              className={cn(
                "flex items-center gap-1.5 rounded-sm px-3 py-2 text-xs font-bold transition-colors whitespace-nowrap cursor-pointer select-none",
                isActive
                  ? "bg-delta-navy text-white"
                  : "text-delta-navy hover:bg-delta-surface-2"
              )}
            >
              <Icon className="h-4 w-4" />
              {item.label}
            </button>
          )
        })}
      </nav>

      {/* Desktop Sidebar */}
      <aside className="hidden w-60 shrink-0 flex-col border-r border-delta-hairline bg-delta-surface-1 lg:flex font-sans">
        <div className="flex-1 overflow-y-auto p-4">
          <p className="px-3 pb-3 text-[11px] font-bold uppercase tracking-wider text-delta-navy select-none">
            Workspace
          </p>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id
              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "flex w-full items-center gap-3 rounded-sm px-3 py-2.5 text-sm font-medium transition-colors",
                    isActive
                      ? "bg-transparent text-delta-red font-bold"
                      : "text-delta-ink hover:bg-delta-surface-2 hover:text-delta-navy"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-delta-red" : "text-delta-ink-muted")} />
                  {item.label}
                </button>
              )
            })}
          </nav>
        </div>
        
        <div className="border-t border-delta-hairline p-4">
          <div className="rounded-sm border border-delta-hairline bg-delta-canvas p-4 text-xs">
            <div className="flex items-center justify-between mb-2">
              <span className="font-bold text-delta-navy">Sync Status</span>
              <span className="h-2 w-2 rounded-full bg-delta-success animate-pulse" />
            </div>
            <p className="text-delta-ink-muted">MySQL Ledger Connected</p>
          </div>
        </div>
      </aside>
    </>
  )
}
