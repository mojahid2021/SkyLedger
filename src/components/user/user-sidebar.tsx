import React from "react"
import {
  IconLayoutDashboard,
  IconReceipt,
  IconFileText,
  IconChartBar,
  IconSettings,
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
    { id: "invoices", label: "Invoices & Bills", icon: IconFileText },
    { id: "reports", label: "Financial Reports", icon: IconChartBar },
    { id: "account", label: "Account Settings", icon: IconSettings },
  ]

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r bg-background lg:flex">
      <div className="flex-1 overflow-y-auto p-4">
        <p className="px-3 pb-3 text-[11px] font-[600] uppercase tracking-wider text-muted-foreground">
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
                  "flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-xs font-[600] transition-colors",
                  isActive
                    ? "bg-emerald-600/10 text-emerald-700 dark:text-emerald-300"
                    : "text-muted-foreground hover:bg-muted hover:text-foreground"
                )}
              >
                <Icon className="h-4 w-4" />
                {item.label}
              </button>
            )
          })}
        </nav>
      </div>
      
      <div className="border-t p-4">
        <div className="rounded-lg border bg-muted/20 p-3 text-xs">
          <div className="flex items-center justify-between mb-2">
            <span className="font-semibold text-muted-foreground">Sync Status</span>
            <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-muted-foreground">MySQL Ledger Connected</p>
        </div>
      </div>
    </aside>
  )
}
