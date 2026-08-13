"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { KeyRound, Settings } from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar, AdminMobileNav, type AdminSection } from "@/components/admin/admin-sidebar"
import { AdminStatsCards } from "@/components/admin/admin-stats-cards"
import { UserDirectoryTable, type AdminUser } from "@/components/admin/user-directory-table"
import { AuditLogList } from "@/components/admin/audit-log-list"
import { AirportsDirectoryTable } from "@/components/admin/airports-directory-table"
import { CitiesDirectoryTable } from "@/components/admin/cities-directory-table"
import { AirlinesDirectoryTable } from "@/components/admin/airlines-directory-table"
import { AircraftDirectoryTable } from "@/components/admin/aircraft-directory-table"


function AdminDashboardContent() {
  const { user, role, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const tabParam = searchParams.get("tab") as AdminSection | null

  const [activeSection, setActiveSection] = useState<AdminSection>(tabParam || "overview")
  const [usersList, setUsersList] = useState<AdminUser[]>([])
  const [fetchingUsers, setFetchingUsers] = useState(true)
  const [dbStatus, setDbStatus] = useState<"connecting" | "connected" | "error">("connecting")
  const [searchQuery, setSearchQuery] = useState("")

  useEffect(() => {
    if (tabParam && ["overview", "users", "audit", "airports", "cities", "airlines", "fleets", "settings"].includes(tabParam)) {
      setActiveSection(tabParam)
    }
  }, [tabParam])

  const handleSearchChange = (query: string) => {
    setSearchQuery(query)
    if (query.trim() && activeSection !== "users") {
      setActiveSection("users")
    }
  }

  const fetchUsers = () => {
    setFetchingUsers(true)
    setDbStatus("connecting")
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users)) {
          setUsersList(data.users)
          setDbStatus("connected")
        } else {
          setDbStatus("error")
        }
      })
      .catch((err) => {
        console.log("Failed to fetch admin users", err)
        setDbStatus("error")
      })
      .finally(() => setFetchingUsers(false))
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
    // Initial directory load — setState only inside async callbacks.
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users)) {
          setUsersList(data.users)
          setDbStatus("connected")
        } else {
          setDbStatus("error")
        }
      })
      .catch((err) => {
        console.log("Failed to fetch admin users", err)
        setDbStatus("error")
      })
      .finally(() => setFetchingUsers(false))
  }, [user, role, isLoading, router])

  if (isLoading || !user || role !== "admin") {
    return (
      <div className="flex h-dvh items-center justify-center bg-delta-canvas text-delta-ink-muted font-delta text-sm">
        Verifying Administrative Credentials...
      </div>
    )
  }

  const adminCount = usersList.filter((u) => u.role === "admin").length
  const userCount = usersList.filter((u) => u.role === "user").length

  const monthStart = new Date(new Date().getFullYear(), new Date().getMonth(), 1)
  const newUsersThisMonth = usersList.filter((u) => {
    const created = u.created_at ? new Date(u.created_at) : null
    return created !== null && created >= monthStart
  }).length

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-delta-surface-1 font-delta text-delta-ink">
      <AdminNavbar searchQuery={searchQuery} onSearchChange={handleSearchChange} />

      <div className="flex min-h-0 flex-1">
        <AdminSidebar
          activeSection={activeSection}
          onSectionChange={setActiveSection}
          dbStatus={dbStatus}
          records={usersList.length}
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <AdminMobileNav activeSection={activeSection} onSectionChange={setActiveSection} />

          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* ===== Section Content ===== */}
            {activeSection === "overview" && (
              <div className="space-y-6">
                <AdminStatsCards
                  usersCount={usersList.length}
                  adminCount={adminCount}
                  userCount={userCount}
                  newUsersThisMonth={newUsersThisMonth}
                />

                <SectionHeading
                  eyebrow="Security"
                  title="System Audit Logs"
                  description="Most recent authentication and access events."
                />
                <div className="mt-3">
                  <AuditLogList />
                </div>
              </div>
            )}

            {activeSection === "users" && (
              <div className="space-y-4">
                <SectionHeading
                  eyebrow="Directory"
                  title="User Access & Roles"
                  description="Manage administrative privileges, role assignments, and status across the organization."
                />
                <UserDirectoryTable
                  users={usersList}
                  loading={fetchingUsers}
                  onRefresh={fetchUsers}
                  searchQuery={searchQuery}
                  onSearchChange={setSearchQuery}
                />
              </div>
            )}

            {activeSection === "audit" && (
              <div className="space-y-4">
                <SectionHeading
                  eyebrow="Security"
                  title="System Security & Authentication Audit Logs"
                  description="Recorded sign-in attempts, role checks, and administrative overrides."
                />
                <AuditLogList />
              </div>
            )}

            {activeSection === "airports" && (
              <div className="space-y-4">
                <SectionHeading
                  eyebrow="Content Management"
                  title="Airports Directory"
                  description="Global flight origin and destination database synchronized with AirLabs API."
                />
                <AirportsDirectoryTable />
              </div>
            )}
            {activeSection === "fleets" && (
              <div className="space-y-4">
                <SectionHeading
                  eyebrow="Content Management"
                  title="Aircraft Fleet Directory"
                  description="Global aircraft fleet database synchronized with AirLabs."
                />
                <AircraftDirectoryTable />
              </div>
            )}
            {activeSection === "cities" && (
              <div className="space-y-4">
                <SectionHeading
                  eyebrow="Content Management"
                  title="Cities Directory"
                  description="Global cities database synchronized with AirLabs."
                />
                <CitiesDirectoryTable />
              </div>
            )}

            {activeSection === "airlines" && (
              <div className="space-y-4">
                <SectionHeading
                  eyebrow="Content Management"
                  title="Airlines Directory"
                  description="Global airlines database synchronized with AirLabs."
                />
                <AirlinesDirectoryTable />
              </div>
            )}


            {activeSection === "settings" && (
              <div className="space-y-4">
                <SectionHeading
                  eyebrow="Configuration"
                  title="System Settings"
                  description="Platform-wide configuration and security policy controls."
                />
                <div className="flex flex-col items-center justify-center gap-3 rounded-[4px] border border-dashed border-delta-hairline bg-delta-canvas px-6 py-16 text-center">
                  <div className="flex h-12 w-12 items-center justify-center rounded-[4px] bg-delta-surface-2 text-delta-navy">
                    <Settings className="h-6 w-6" />
                  </div>
                  <div>
                    <p className="text-[15px] font-[700] text-delta-navy">Settings Module</p>
                    <p className="mt-1 max-w-sm text-[13px] text-delta-ink-muted">
                      Password policy, MFA enforcement, and role permission matrices will live here.
                    </p>
                  </div>
                  <Button
                    variant="outline"
                    size="sm"
                    className="mt-1 h-9 gap-1.5 rounded-[4px] border-delta-hairline text-xs text-delta-navy hover:bg-delta-surface-1"
                  >
                    <KeyRound className="h-3.5 w-3.5" />
                    Review Security Policy
                  </Button>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminDashboardPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-delta-canvas text-sm font-delta text-delta-ink-muted">
          Loading Administrative Control Panel...
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  )
}

function SectionHeading({
  eyebrow,
  title,
  description,
}: {
  eyebrow: string
  title: string
  description: string
}) {
  return (
    <div>
      <p className="text-[11px] font-[600] uppercase tracking-wider text-delta-red">{eyebrow}</p>
      <h2 className="mt-0.5 text-[18px] font-[700] leading-tight text-delta-navy">{title}</h2>
      <p className="mt-1 text-[13px] text-delta-ink-muted">{description}</p>
    </div>
  )
}

