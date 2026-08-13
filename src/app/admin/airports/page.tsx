"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/context/auth-context"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar, AdminMobileNav, type AdminSection } from "@/components/admin/admin-sidebar"
import { AirportsDirectoryTable } from "@/components/admin/airports-directory-table"

export default function AdminAirportsPage() {
  const { user, role, isLoading } = useAuth()
  const router = useRouter()

  const handleSectionChange = (section: AdminSection) => {
    if (section === "airports") return
    if (section === "overview") {
      router.push("/admin/dashboard")
    } else if (section === "create-flight") {
      router.push("/admin/flights/create")
    } else if (section === "create-user") {
      router.push("/admin/users/create")
    } else {
      router.push(`/admin/${section}`)
    }
  }

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
      return
    }
    if (role !== "admin") {
      router.replace("/user/dashboard")
      return
    }
  }, [user, role, isLoading, router])

  if (isLoading || !user || role !== "admin") {
    return (
      <div className="flex h-dvh items-center justify-center bg-delta-canvas text-delta-ink-muted font-delta text-sm">
        Verifying Administrative Credentials...
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-delta-surface-1 font-delta text-delta-ink">
      <AdminNavbar />

      <div className="flex min-h-0 flex-1">
        <AdminSidebar
          activeSection="airports"
          onSectionChange={handleSectionChange}
          dbStatus="connected"
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <AdminMobileNav activeSection="airports" onSectionChange={handleSectionChange} />

          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="space-y-1">
              <span className="text-[11px] font-[600] uppercase tracking-wider text-delta-red">
                Content Management
              </span>
              <h1 className="text-xl font-[700] tracking-tight text-delta-navy sm:text-2xl">
                Airports Directory & Sync
              </h1>
              <p className="text-xs text-delta-ink-muted">
                Manage global airport codes, coordinates, and sync data from AirLabs API into MariaDB.
              </p>
            </div>

            <AirportsDirectoryTable />
          </div>
        </main>
      </div>
    </div>
  )
}
