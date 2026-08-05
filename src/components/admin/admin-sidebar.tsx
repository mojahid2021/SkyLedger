"use client"

import React from "react"
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  Server,
  Plane,
  FolderKanban,
  MapPin,
} from "lucide-react"

import { cn } from "@/lib/utils"

export type AdminSection = "overview" | "users" | "audit" | "airports" | "cities" | "settings"

type DbStatus = "connecting" | "connected" | "error"

interface NavGroup {
  header: string
  items: { id: AdminSection; label: string; icon: typeof Users }[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    header: "Administration",
    items: [
      { id: "overview", label: "Control Overview", icon: LayoutDashboard },
      { id: "users", label: "User Access & Roles", icon: Users },
      { id: "audit", label: "System Audit Logs", icon: ShieldCheck },
    ],
  },
  {
    header: "Content",
    items: [
      { id: "airports", label: "Airports Directory", icon: Plane },
      { id: "cities", label: "Cities Directory", icon: MapPin },
    ],
  },
  {
    header: "System",
    items: [
      { id: "settings", label: "System Settings", icon: Settings },
    ],
  },
]

const ALL_NAV_ITEMS = NAV_GROUPS.flatMap((g) => g.items)

interface AdminSidebarProps {
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
  dbStatus?: DbStatus
  records?: number
}

/**
 * AdminSidebar — dual-navy ladder per DESIGN.md.
 * Sidebar sits on the deepest navy (#001e3d); the active item is marked
 * with a red indicator (the single active-state use of red).
 */
export function AdminSidebar({
  activeSection,
  onSectionChange,
  dbStatus = "connecting",
  records = 0,
}: AdminSidebarProps) {
  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-delta-navy-dark text-white lg:flex">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.header}>
            <p className="px-2 pb-2 text-[11px] font-[600] uppercase tracking-wider text-white/45">
              {group.header}
            </p>
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const isActive = activeSection === item.id

                return (
                  <button
                    key={item.id}
                    type="button"
                    onClick={() => onSectionChange(item.id)}
                    aria-current={isActive ? "page" : undefined}
                    className={cn(
                      "group relative flex w-full items-center gap-3 rounded-[4px] px-3 py-2.5 text-left text-[13px] font-[500] transition-colors",
                      isActive
                        ? "bg-white/10 text-white"
                        : "text-white/55 hover:bg-white/5 hover:text-white"
                    )}
                  >
                    {/* Red active-state indicator — left edge */}
                    <span
                      className={cn(
                        "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-delta-red transition-opacity",
                        isActive ? "opacity-100" : "opacity-0 group-hover:opacity-40"
                      )}
                    />
                    <Icon
                      className={cn(
                        "h-4 w-4 shrink-0",
                        isActive ? "text-delta-red" : "text-white/45 group-hover:text-white/70"
                      )}
                    />
                    <span>{item.label}</span>
                  </button>
                )
              })}
            </nav>
          </div>
        ))}
      </div>

      {/* Database connection status — real state from the users API */}
      <div className="border-t border-white/10 p-4">
        <div className="space-y-2.5 rounded-[4px] border border-white/10 bg-delta-navy p-3.5">
          <div className="flex items-center justify-between">
            <span className="text-[11px] font-[600] uppercase tracking-wider text-white/55">
              Database Connection
            </span>
            <span
              className={cn(
                "h-2 w-2 rounded-full",
                dbStatus === "connected" && "animate-pulse bg-emerald-400",
                dbStatus === "connecting" && "animate-pulse bg-amber-400",
                dbStatus === "error" && "bg-delta-error"
              )}
            />
          </div>
          <p className="flex items-center gap-1.5 text-xs font-[500] text-white/85">
            <Server
              className={cn(
                "h-3.5 w-3.5",
                dbStatus === "connected" && "text-emerald-400",
                dbStatus === "connecting" && "text-amber-400",
                dbStatus === "error" && "text-delta-error"
              )}
            />
            MySQL · skyledger_db
          </p>
          <p className="text-[11px] text-white/55">
            {dbStatus === "connected" && `${records} user records loaded`}
            {dbStatus === "connecting" && "Connecting to database…"}
            {dbStatus === "error" && "Unavailable — check database"}
          </p>
        </div>
      </div>
    </aside>
  )
}

/**
 * Mobile section strip — replaces the sidebar below the lg breakpoint.
 * Active item carries a red underline (Delta active-state indicator).
 */
export function AdminMobileNav({
  activeSection,
  onSectionChange,
}: AdminSidebarProps) {
  return (
    <nav className="sticky top-0 z-30 flex gap-1 overflow-x-auto border-b border-delta-hairline bg-delta-surface-1 px-4 py-2 lg:hidden">
      {ALL_NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = activeSection === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => onSectionChange(item.id)}
            className={cn(
              "flex shrink-0 items-center gap-1.5 rounded-[4px] border px-3 py-2 text-xs font-[600] transition-colors",
              isActive
                ? "border-delta-navy bg-delta-navy text-white"
                : "border-delta-hairline bg-delta-canvas text-delta-ink-muted hover:text-delta-navy"
            )}
          >
            <Icon className="h-3.5 w-3.5" />
            {item.label}
          </button>
        )
      })}
    </nav>
  )
}
