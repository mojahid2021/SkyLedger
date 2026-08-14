"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/context/auth-context"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar, AdminMobileNav, type AdminSection } from "@/components/admin/admin-sidebar"
import { UserDirectoryTable, type AdminUser } from "@/components/admin/user-directory-table"

function AdminUsersContent() {
  const { user, role, isLoading } = useAuth()
  const router = useRouter()

  const [usersList, setUsersList] = useState<AdminUser[]>([])
  const [fetchingUsers, setFetchingUsers] = useState(true)
  const [dbStatus, setDbStatus] = useState<"connecting" | "connected" | "error">("connecting")
  const [searchQuery, setSearchQuery] = useState("")

  const handleSectionChange = (section: AdminSection) => {
    if (section === "users") return
    router.push(`/admin/${section}`)
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
    fetchUsers()
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
      <AdminNavbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex min-h-0 flex-1">
        <AdminSidebar
          activeSection="users"
          onSectionChange={handleSectionChange}
          dbStatus={dbStatus}
          records={usersList.length}
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <AdminMobileNav activeSection="users" onSectionChange={handleSectionChange} />

          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
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
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminUsersPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-delta-canvas text-sm font-delta text-delta-ink-muted">
          Loading Users Management...
        </div>
      }
    >
      <AdminUsersContent />
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
