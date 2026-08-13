"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/context/auth-context"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar, AdminMobileNav, type AdminSection } from "@/components/admin/admin-sidebar"
import { AircraftDirectoryTable } from "@/components/admin/aircraft-directory-table"

export default function AdminFleetsPage() {
  const { user, role, isLoading } = useAuth()
  const router = useRouter()

  const handleSectionChange = (section: AdminSection) => {
    if (section === "fleets") return
    router.push(`/admin/dashboard?tab=${section}`)
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
          activeSection="fleets"
          onSectionChange={handleSectionChange}
          dbStatus="connected"
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <AdminMobileNav activeSection="fleets" onSectionChange={handleSectionChange} />

          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="space-y-1">
              <span className="text-[11px] font-[600] uppercase tracking-wider text-delta-red">
                Content Management
              </span>
              <h1 className="text-xl font-[700] tracking-tight text-delta-navy sm:text-2xl">
                Aircraft Fleet Directory & Sync
              </h1>
              <p className="text-xs text-delta-ink-muted">
                Manage global aircraft fleet database, sync data from AirLabs API into MariaDB.
              </p>
            </div>

            <AircraftDirectoryTable />
          </div>
        </main>
      </div>
    </div>
  )
}