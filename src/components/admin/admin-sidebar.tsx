"use client"

import React, { useState, useEffect } from "react"
import { usePathname, useSearchParams, useRouter } from "next/navigation"
import {
  LayoutDashboard,
  Users,
  ShieldCheck,
  Settings,
  Plane,
  FolderKanban,
  MapPin,
  Building2,
  Plane as PlaneIcon,
  Plus,
  ChevronDown,
} from "lucide-react"

import { cn } from "@/lib/utils"

export type AdminSection =
  | "overview"
  | "users"
  | "create-user"
  | "audit"
  | "airports"
  | "cities"
  | "airlines"
  | "fleets"
  | "flights"
  | "create-flight"
  | "bookings"
  | "settings"

type DbStatus = "connecting" | "connected" | "error"

interface NavChildItem {
  id: AdminSection
  label: string
  icon: typeof Users
  href: string
}

interface NavItem {
  id: string
  label: string
  icon: typeof Users
  href?: string
  children?: NavChildItem[]
}

interface NavGroup {
  header: string
  items: NavItem[]
}

const NAV_GROUPS: NavGroup[] = [
  {
    header: "Administration",
    items: [
      {
        id: "overview",
        label: "Control Overview",
        icon: LayoutDashboard,
        href: "/admin/dashboard",
      },
      {
        id: "users-parent",
        label: "User Access",
        icon: Users,
        children: [
          {
            id: "users",
            label: "All Users",
            icon: Users,
            href: "/admin/users",
          },
          {
            id: "create-user",
            label: "Create User",
            icon: Plus,
            href: "/admin/users/create",
          },
        ],
      },
      {
        id: "audit",
        label: "System Audit Logs",
        icon: ShieldCheck,
        href: "/admin/audit",
      },
    ],
  },
  {
    header: "Content Directories",
    items: [
      {
        id: "directories-parent",
        label: "Directories",
        icon: FolderKanban,
        children: [
          {
            id: "airports",
            label: "Airports Directory",
            icon: Plane,
            href: "/admin/airports",
          },
          {
            id: "cities",
            label: "Cities Directory",
            icon: MapPin,
            href: "/admin/cities",
          },
          {
            id: "airlines",
            label: "Airlines Directory",
            icon: Building2,
            href: "/admin/airlines",
          },
          {
            id: "fleets",
            label: "Aircraft Fleet",
            icon: PlaneIcon,
            href: "/admin/fleets",
          },
        ],
      },
    ],
  },
  {
    header: "Flight Operations",
    items: [
      {
        id: "flights-parent",
        label: "Flight Ops",
        icon: PlaneIcon,
        children: [
          {
            id: "bookings",
            label: "All Bookings",
            icon: FolderKanban,
            href: "/admin/bookings",
          },
          {
            id: "flights",
            label: "Flight Management",
            icon: PlaneIcon,
            href: "/admin/flights",
          },
        ],
      },
    ],
  },
  {
    header: "System",
    items: [
      {
        id: "settings",
        label: "System Settings",
        icon: Settings,
        href: "/admin/settings",
      },
    ],
  },
]

interface AdminSidebarProps {
  activeSection: AdminSection
  onSectionChange: (section: AdminSection) => void
  dbStatus?: DbStatus
  records?: number
}

export function AdminSidebar({
  activeSection,
  onSectionChange,
  dbStatus = "connecting",
  records = 0,
}: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [expandedGroups, setExpandedGroups] = useState<Record<string, boolean>>({})
  const [mounted, setMounted] = useState(false)

  // Resolve the active section ID from both props and routing state
  const getActiveItemId = (): string => {
    if (pathname === "/admin/users/create") return "create-user"
    if (pathname === "/admin/flights/create") return "create-flight"
    if (pathname === "/admin/airlines") return "airlines"
    if (pathname === "/admin/airports") return "airports"
    if (pathname === "/admin/cities") return "cities"
    if (pathname === "/admin/fleets") return "fleets"
    if (pathname === "/admin/users") return "users"
    if (pathname === "/admin/audit") return "audit"
    if (pathname === "/admin/flights") return "flights"
    if (pathname === "/admin/bookings") return "bookings"
    if (pathname === "/admin/settings") return "settings"
    if (pathname === "/admin/overview") return "overview"

    return activeSection
  }

  const activeId = getActiveItemId()

  useEffect(() => {
    setMounted(true)
    const storedGroups = localStorage.getItem("skyledger_admin_sidebar_expanded_groups")
    let initialGroups: Record<string, boolean> = {}
    if (storedGroups) {
      try {
        initialGroups = JSON.parse(storedGroups)
      } catch (e) { }
    }

    // Auto-expand group containing the active child item
    NAV_GROUPS.forEach((group) => {
      group.items.forEach((item) => {
        if (item.children && item.children.some((child) => child.id === activeId)) {
          initialGroups[item.id] = true
        }
      })
    })

    setExpandedGroups(initialGroups)
  }, [pathname, searchParams, activeSection])

  const toggleGroup = (groupId: string) => {
    const updated = {
      ...expandedGroups,
      [groupId]: !expandedGroups[groupId],
    }
    setExpandedGroups(updated)
    localStorage.setItem("skyledger_admin_sidebar_expanded_groups", JSON.stringify(updated))
  }

  const handleItemClick = (item: { id: string; label: string; href?: string }) => {
    if (item.href) {
      router.push(item.href)
    }

    const possibleSections = [
      "overview",
      "users",
      "audit",
      "airports",
      "cities",
      "airlines",
      "fleets",
      "flights",
      "create-flight",
      "settings",
    ]

    if (possibleSections.includes(item.id)) {
      onSectionChange(item.id as AdminSection)
    }
  }

  return (
    <aside className="hidden w-60 shrink-0 flex-col border-r border-white/10 bg-delta-navy-dark text-white lg:flex">
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {NAV_GROUPS.map((group) => (
          <div key={group.header} className="space-y-1">
            {mounted && (
              <p className="px-2 pb-1.5 text-[11px] font-[600] uppercase tracking-wider text-white/45">
                {group.header}
              </p>
            )}
            <nav className="space-y-1">
              {group.items.map((item) => {
                const Icon = item.icon
                const hasChildren = !!item.children
                const isExpanded = !!expandedGroups[item.id]

                // Determine active status
                const isChildActive = hasChildren && item.children!.some((child) => child.id === activeId)
                const isParentActive = !hasChildren && activeId === item.id
                const isActive = isParentActive || isChildActive

                if (hasChildren) {
                  return (
                    <div key={item.id} className="group/parent relative">
                      <button
                        type="button"
                        onClick={() => toggleGroup(item.id)}
                        className={cn(
                          "group/btn relative flex w-full items-center gap-3 rounded-[4px] px-3 py-2.5 text-left text-[13px] font-[500] transition-colors",
                          isActive
                            ? "bg-white/10 text-white font-[600]"
                            : "text-white/55 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {/* Red active indicator */}
                        <span
                          className={cn(
                            "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-delta-red transition-opacity",
                            isActive ? "opacity-100" : "opacity-0 group-hover/btn:opacity-40"
                          )}
                        />
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isActive ? "text-delta-red" : "text-white/45 group-hover/btn:text-white/70"
                          )}
                        />
                        <span className="flex-1 truncate">{item.label}</span>
                        <ChevronDown
                          className={cn(
                            "h-3.5 w-3.5 text-white/45 transition-transform duration-200",
                            isExpanded && "rotate-180"
                          )}
                        />
                      </button>

                      {/* Expanded submenu in sidebar */}
                      {isExpanded && (
                        <div className="mt-1 ml-4 pl-4 border-l border-white/10 space-y-1">
                          {item.children!.map((child) => {
                            const isCurrentActive = activeId === child.id
                            return (
                              <button
                                key={child.id}
                                type="button"
                                onClick={() => handleItemClick(child)}
                                className={cn(
                                  "group/child relative flex w-full items-center gap-2.5 rounded-[4px] px-3 py-2 text-left text-[12px] font-[500] transition-colors",
                                  isCurrentActive
                                    ? "bg-white/5 text-white font-[600]"
                                    : "text-white/45 hover:bg-white/5 hover:text-white"
                                )}
                              >
                                <span
                                  className={cn(
                                    "h-1.5 w-1.5 rounded-full transition-all",
                                    isCurrentActive
                                      ? "bg-delta-red scale-125"
                                      : "bg-white/20 group-hover/child:bg-white/40"
                                  )}
                                />
                                <span className="truncate">{child.label}</span>
                              </button>
                            )
                          })}
                        </div>
                      )}
                    </div>
                  )
                } else {
                  return (
                    <div key={item.id} className="group/link relative">
                      <button
                        type="button"
                        onClick={() => handleItemClick(item)}
                        className={cn(
                          "group/btn relative flex w-full items-center gap-3 rounded-[4px] px-3 py-2.5 text-left text-[13px] font-[500] transition-colors",
                          isParentActive
                            ? "bg-white/10 text-white font-[600]"
                            : "text-white/55 hover:bg-white/5 hover:text-white"
                        )}
                      >
                        {/* Red active indicator */}
                        <span
                          className={cn(
                            "absolute left-0 top-1/2 h-4 w-0.5 -translate-y-1/2 rounded-full bg-delta-red transition-opacity",
                            isParentActive ? "opacity-100" : "opacity-0 group-hover/btn:opacity-40"
                          )}
                        />
                        <Icon
                          className={cn(
                            "h-4 w-4 shrink-0 transition-colors",
                            isParentActive ? "text-delta-red" : "text-white/45 group-hover/btn:text-white/70"
                          )}
                        />
                        <span className="truncate">{item.label}</span>
                      </button>
                    </div>
                  )
                }
              })}
            </nav>
          </div>
        ))}
      </div>
    </aside>
  )
}

export function AdminMobileNav({ activeSection, onSectionChange }: AdminSidebarProps) {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const getActiveItemId = (): string => {
    if (pathname === "/admin/users/create") return "create-user"
    if (pathname === "/admin/flights/create") return "create-flight"
    if (pathname === "/admin/airlines") return "airlines"
    if (pathname === "/admin/airports") return "airports"
    if (pathname === "/admin/cities") return "cities"
    if (pathname === "/admin/fleets") return "fleets"
    if (pathname === "/admin/bookings") return "bookings"

    if (pathname === "/admin/dashboard" || pathname === "/admin/overview") {
      const tab = searchParams?.get("tab")
      if (tab) return tab
      return "overview"
    }

    return activeSection
  }

  const activeId = getActiveItemId()

  const handleItemClick = (item: { id: string; label: string; href?: string }) => {
    if (item.href) {
      router.push(item.href)
    }

    const possibleSections = [
      "overview",
      "users",
      "audit",
      "airports",
      "cities",
      "airlines",
      "fleets",
      "flights",
      "create-flight",
      "settings",
    ]

    if (possibleSections.includes(item.id)) {
      onSectionChange(item.id as AdminSection)
    }
  }

  // Flatten nested items for simple mobile horizontal scroll bar
  const mobileItems: { id: AdminSection; label: string; icon: typeof Users; href: string }[] = NAV_GROUPS.flatMap((group) => {
    return group.items.flatMap((item) => {
      if (item.children) {
        return item.children
      }
      return {
        id: item.id as AdminSection,
        label: item.label,
        icon: item.icon,
        href: item.href || "",
      }
    })
  })

  return (
    <nav className="sticky top-0 z-30 flex gap-1 overflow-x-auto border-b border-delta-hairline bg-delta-surface-1 px-4 py-2 lg:hidden">
      {mobileItems.map((item) => {
        const Icon = item.icon || Plus
        const isActive = activeId === item.id

        return (
          <button
            key={item.id}
            type="button"
            onClick={() => handleItemClick(item)}
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
