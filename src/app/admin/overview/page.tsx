"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { Users, Plane, Building2, MapPin, CreditCard, Loader2 } from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar, AdminMobileNav, type AdminSection } from "@/components/admin/admin-sidebar"
import { AuditLogList } from "@/components/admin/audit-log-list"

interface OverviewStats {
  usersCount: number
  flightsCount: number
  airportsCount: number
  airlinesCount: number
  bookingsCount: number
  totalRevenue: number
}

function AdminOverviewContent() {
  const { user, role, isLoading: authLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as AdminSection | null

  const [stats, setStats] = useState<OverviewStats | null>(null)
  const [loadingStats, setLoadingStats] = useState(true)
  const [dbStatus, setDbStatus] = useState<"connecting" | "connected" | "error">("connecting")
  const [searchQuery, setSearchQuery] = useState("")

  // Redirect old tab parameters
  useEffect(() => {
    if (tabParam && tabParam !== "overview") {
      router.replace(`/admin/${tabParam}`)
    }
  }, [tabParam, router])

  const fetchOverview = () => {
    setLoadingStats(true)
    setDbStatus("connecting")
    fetch("/api/admin/overview")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data) {
          setStats(data.data)
          setDbStatus("connected")
        } else {
          setDbStatus("error")
        }
      })
      .catch((err) => {
        console.error("Failed to fetch admin overview", err)
        setDbStatus("error")
      })
      .finally(() => setLoadingStats(false))
  }

  useEffect(() => {
    if (authLoading) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (role !== "admin") {
      router.replace("/user/dashboard")
      return
    }
    fetchOverview()
  }, [user, role, authLoading, router])

  if (authLoading || !user || role !== "admin") {
    return (
      <div className="flex h-dvh items-center justify-center bg-delta-canvas text-delta-ink-muted text-sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-delta-red" />
        Verifying Administrative Credentials...
      </div>
    )
  }

  const statCards = stats ? [
    { label: "Total Revenue", value: `৳${Number(stats.totalRevenue || 0).toFixed(2)}`, icon: CreditCard, color: "text-delta-success", bg: "bg-delta-success/10", border: "border-delta-success/20" },
    { label: "Total Bookings", value: stats.bookingsCount.toLocaleString(), icon: CreditCard, color: "text-delta-navy", bg: "bg-delta-navy/10", border: "border-delta-navy/20" },
    { label: "Registered Users", value: stats.usersCount.toLocaleString(), icon: Users, color: "text-delta-ink", bg: "bg-delta-surface-2", border: "border-delta-hairline" },
    { label: "Active Flights", value: stats.flightsCount.toLocaleString(), icon: Plane, color: "text-delta-red", bg: "bg-red-50", border: "border-red-100" },
    { label: "Airlines Indexed", value: stats.airlinesCount.toLocaleString(), icon: Building2, color: "text-sky-700", bg: "bg-sky-50", border: "border-sky-100" },
    { label: "Airports Available", value: stats.airportsCount.toLocaleString(), icon: MapPin, color: "text-orange-700", bg: "bg-orange-50", border: "border-orange-100" },
  ] : []

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-delta-surface-1 font-sans text-delta-ink">
      <AdminNavbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex min-h-0 flex-1">
        <AdminSidebar
          activeSection="overview"
          onSectionChange={(section) => {
            if (section !== "overview") router.push(`/admin/${section}`)
          }}
          dbStatus={dbStatus}
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <AdminMobileNav
            activeSection="overview"
            onSectionChange={(section) => {
              if (section !== "overview") router.push(`/admin/${section}`)
            }}
          />

          <div className="space-y-8 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            
            {/* Header */}
            <div className="border-b border-delta-hairline pb-4">
              <h1 className="text-2xl font-bold tracking-tight text-delta-navy">Platform Overview</h1>
              <p className="text-sm text-delta-ink-muted mt-1">Key metrics and recent system activity.</p>
            </div>

            {/* Metrics */}
            <div className="space-y-3">
              <p className="text-[11px] font-bold uppercase tracking-widest text-delta-navy">Key Performance Indicators</p>
              {loadingStats ? (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {Array.from({ length: 6 }).map((_, i) => (
                    <div key={i} className="h-24 rounded-sm bg-delta-surface-2 animate-pulse border border-delta-hairline" />
                  ))}
                </div>
              ) : (
                <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {statCards.map((card, i) => {
                    const Icon = card.icon
                    return (
                      <div key={i} className={`flex items-center gap-4 rounded-sm border p-5 bg-delta-canvas shadow-[0_1px_3px_rgba(0,0,0,0.04)]`}>
                        <div className={`flex h-12 w-12 shrink-0 items-center justify-center rounded-sm border ${card.bg} ${card.border}`}>
                          <Icon className={`h-5 w-5 ${card.color}`} />
                        </div>
                        <div>
                          <p className="text-[11px] font-bold uppercase tracking-wider text-delta-ink-muted">
                            {card.label}
                          </p>
                          <p className={`mt-1 text-2xl font-bold tracking-tight text-delta-navy`}>
                            {card.value}
                          </p>
                        </div>
                      </div>
                    )
                  })}
                </div>
              )}
            </div>

            {/* Audit Logs */}
            <div className="space-y-3 pt-4">
              <SectionHeading
                eyebrow="Security & Events"
                title="Recent System Audit Logs"
                description="Most recent authentication and data modification events."
              />
              <div className="rounded-sm border border-delta-hairline bg-delta-canvas shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
                <AuditLogList />
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminOverviewPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-delta-canvas text-sm text-delta-ink-muted">
          Loading Administrative Control Panel...
        </div>
      }
    >
      <AdminOverviewContent />
    </Suspense>
  )
}

function SectionHeading({ eyebrow, title, description }: { eyebrow: string; title: string; description: string }) {
  return (
    <div>
      <p className="text-[11px] font-bold uppercase tracking-wider text-delta-red">{eyebrow}</p>
      <h2 className="mt-0.5 text-lg font-bold leading-tight text-delta-navy">{title}</h2>
      <p className="mt-1 text-sm text-delta-ink-muted">{description}</p>
    </div>
  )
}
