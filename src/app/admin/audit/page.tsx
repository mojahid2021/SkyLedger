"use client"

import React, { useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"

import { useAuth } from "@/context/auth-context"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar, AdminMobileNav, type AdminSection } from "@/components/admin/admin-sidebar"
import { AuditLogList } from "@/components/admin/audit-log-list"

function AdminAuditContent() {
  const { user, role, isLoading } = useAuth()
  const router = useRouter()

  const handleSectionChange = (section: AdminSection) => {
    if (section === "audit") return
    router.push(`/admin/${section}`)
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
          activeSection="audit"
          onSectionChange={handleSectionChange}
          dbStatus="connected"
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <AdminMobileNav activeSection="audit" onSectionChange={handleSectionChange} />

          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            <div className="space-y-4">
              <SectionHeading
                eyebrow="Security"
                title="System Security & Authentication Audit Logs"
                description="Recorded sign-in attempts, role checks, and administrative overrides."
              />
              <AuditLogList />
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminAuditPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-delta-canvas text-sm font-delta text-delta-ink-muted">
          Loading Security Audit Logs...
        </div>
      }
    >
      <AdminAuditContent />
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
