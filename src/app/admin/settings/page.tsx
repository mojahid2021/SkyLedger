"use client"

import React, { useEffect, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Settings, KeyRound } from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar, AdminMobileNav, type AdminSection } from "@/components/admin/admin-sidebar"

function AdminSettingsContent() {
  const { user, role, isLoading } = useAuth()
  const router = useRouter()

  const handleSectionChange = (section: AdminSection) => {
    if (section === "settings") return
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
          activeSection="settings"
          onSectionChange={handleSectionChange}
          dbStatus="connected"
        />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <AdminMobileNav activeSection="settings" onSectionChange={handleSectionChange} />

          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
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
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminSettingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-delta-canvas text-sm font-delta text-delta-ink-muted">
          Loading System Settings...
        </div>
      }
    >
      <AdminSettingsContent />
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
