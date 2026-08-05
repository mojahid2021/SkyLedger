"use client"

import React from "react"
import {
  IconLayoutDashboard,
  IconReceipt,
  IconBuildingBank,
  IconFileText,
  IconChartBar,
  IconUsers,
  IconSettings,
  IconShieldCheck,
  IconHelpCircle,
  IconArrowUpRight,
  IconBook2,
} from "@tabler/icons-react"
import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"

interface SidebarProps {
  activeTab: string
  setActiveTab: (tab: string) => void
}

export function Sidebar({ activeTab, setActiveTab }: SidebarProps) {
  const navItems = [
    { id: "dashboard", label: "Dashboard", icon: IconLayoutDashboard },
    { id: "ledgers", label: "Accounts & Ledgers", icon: IconBook2 },
    { id: "transactions", label: "Transactions", icon: IconReceipt },
    { id: "invoices", label: "Invoices & Bills", icon: IconFileText },
    { id: "reports", label: "Financial Reports", icon: IconChartBar },
    { id: "customers", label: "Clients & Vendors", icon: IconUsers },
    { id: "audit", label: "Audit & Compliance", icon: IconShieldCheck },
    { id: "settings", label: "System Settings", icon: IconSettings },
  ]

  return (
    <aside className="w-64 border-r bg-muted/20 flex flex-col justify-between hidden md:flex min-h-[calc(100vh-4rem)]">
      <div className="p-4 space-y-6">
        <div>
          <h2 className="px-3 text-xs font-semibold uppercase tracking-wider text-muted-foreground mb-2">
            Main Menu
          </h2>
          <nav className="space-y-1">
            {navItems.map((item) => {
              const Icon = item.icon
              const isActive = activeTab === item.id

              return (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center gap-3 px-3 py-2 rounded-lg text-sm font-medium transition-colors",
                    isActive
                      ? "bg-primary text-primary-foreground shadow-sm"
                      : "text-muted-foreground hover:text-foreground hover:bg-muted/60"
                  )}
                >
                  <Icon className={cn("h-4 w-4 shrink-0", isActive ? "text-primary-foreground" : "text-muted-foreground")} />
                  <span>{item.label}</span>
                </button>
              )
            })}
          </nav>
        </div>

        {/* Quick Ledger Status Card */}
        <div className="p-3.5 rounded-xl border bg-card/80 text-card-foreground shadow-xs space-y-2.5">
          <div className="flex items-center justify-between">
            <span className="text-xs font-semibold text-muted-foreground uppercase">Ledger Sync</span>
            <span className="flex h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
          </div>
          <p className="text-xs font-medium">PostgreSQL & Mongo Replica Active</p>
          <div className="w-full bg-muted rounded-full h-1.5 overflow-hidden">
            <div className="bg-emerald-500 h-full w-[94%]" />
          </div>
          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
            <span>Latency: 4ms</span>
            <span className="font-semibold text-emerald-600 dark:text-emerald-400">99.99% Sync</span>
          </div>
        </div>
      </div>

      {/* Footer Support section */}
      <div className="p-4 border-t space-y-2">
        <Button variant="outline" size="sm" className="w-full justify-start gap-2 text-xs">
          <IconHelpCircle className="h-4 w-4 text-muted-foreground" />
          <span>Documentation & API</span>
          <IconArrowUpRight className="h-3 w-3 ml-auto opacity-70" />
        </Button>
      </div>
    </aside>
  )
}
