"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { User, Shield, Lock, Save, ArrowLeft } from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar, AdminMobileNav, type AdminSection } from "@/components/admin/admin-sidebar"

export default function AdminProfilePage() {
  const { user, login, isLoading } = useAuth()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")

  const [formData, setFormData] = useState({
    first_name: "",
    last_name: "",
    email: "",
    phone: "",
    date_of_birth: "",
    current_password: "",
    new_password: "",
    confirm_password: "",
  })

  const [isSubmitting, setIsSubmitting] = useState(false)
  const [successMsg, setSuccessMsg] = useState("")
  const [errorMsg, setErrorMsg] = useState("")

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    } else if (user && user.role !== "admin") {
      router.replace("/user/dashboard")
    }
  }, [user, isLoading, router])

  useEffect(() => {
    if (user) {
      setFormData(prev => ({
        ...prev,
        first_name: user.first_name || "",
        last_name: user.last_name || "",
        email: user.email || "",
        phone: user.phone || "",
        date_of_birth: user.date_of_birth ? user.date_of_birth.split("T")[0] : "",
      }))
    }
  }, [user])

  const handleSidebarChange = (section: AdminSection) => {
    if (section === "overview") router.push("/admin/overview")
    else router.push(`/admin/${section}`)
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setErrorMsg("")
    setSuccessMsg("")

    if (formData.new_password) {
      if (!formData.current_password) {
        setErrorMsg("Current password is required to set a new password.")
        return
      }
      if (formData.new_password !== formData.confirm_password) {
        setErrorMsg("New password and confirm password do not match.")
        return
      }
    }

    setIsSubmitting(true)

    try {
      const payload = {
        id: user?.id,
        first_name: formData.first_name,
        last_name: formData.last_name,
        email: formData.email,
        phone: formData.phone,
        date_of_birth: formData.date_of_birth,
        ...(formData.new_password ? { 
          current_password: formData.current_password,
          new_password: formData.new_password 
        } : {})
      }

      const res = await fetch("/api/admin/profile", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload)
      })

      const data = await res.json()

      if (data.success) {
        setSuccessMsg(data.message || "Profile updated successfully.")
        setFormData(prev => ({ ...prev, current_password: "", new_password: "", confirm_password: "" }))
      } else {
        setErrorMsg(data.error || "Failed to update profile.")
      }
    } catch (err: any) {
      setErrorMsg("An unexpected error occurred.")
    } finally {
      setIsSubmitting(false)
    }
  }

  if (isLoading || !user || user.role !== "admin") {
    return (
      <div className="flex h-screen items-center justify-center bg-delta-surface-1">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-delta-navy border-t-transparent" />
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-delta-surface-1 font-sans text-delta-ink">
      <AdminNavbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex min-h-0 flex-1">
        <AdminSidebar activeSection="overview" onSectionChange={handleSidebarChange} />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <AdminMobileNav activeSection="overview" onSectionChange={handleSidebarChange} />

          <div className="mx-auto max-w-4xl p-4 sm:p-6 lg:p-8">
            <div className="mb-6 flex items-center justify-between">
              <div>
                <Button variant="ghost" className="mb-2 -ml-3 text-delta-ink-muted" onClick={() => router.back()}>
                  <ArrowLeft className="mr-2 h-4 w-4" />
                  Back
                </Button>
                <h1 className="flex items-center gap-2 text-2xl font-bold tracking-tight text-delta-navy">
                  <User className="h-6 w-6 text-delta-red" />
                  Profile Settings
                </h1>
                <p className="mt-1 text-sm text-delta-ink-muted">
                  Update your admin account details and security settings.
                </p>
              </div>
            </div>

            {errorMsg && (
              <div className="mb-6 rounded-[4px] border border-red-200 bg-red-50 p-4 text-sm text-red-600">
                {errorMsg}
              </div>
            )}
            
            {successMsg && (
              <div className="mb-6 rounded-[4px] border border-green-200 bg-green-50 p-4 text-sm text-green-600">
                {successMsg}
              </div>
            )}

            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Personal Information */}
              <div className="rounded-[4px] border border-delta-hairline bg-delta-canvas p-6 shadow-xs">
                <h2 className="mb-4 text-sm font-bold uppercase tracking-wider text-delta-navy">
                  Personal Information
                </h2>
                
                <div className="grid gap-4 sm:grid-cols-2">
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy">
                      First Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.first_name}
                      onChange={(e) => setFormData({ ...formData, first_name: e.target.value })}
                      className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm focus:border-delta-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy">
                      Last Name
                    </label>
                    <input
                      type="text"
                      required
                      value={formData.last_name}
                      onChange={(e) => setFormData({ ...formData, last_name: e.target.value })}
                      className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm focus:border-delta-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy">
                      Email Address
                    </label>
                    <input
                      type="email"
                      required
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm focus:border-delta-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy">
                      Phone Number
                    </label>
                    <input
                      type="text"
                      value={formData.phone}
                      onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                      className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm focus:border-delta-navy focus:outline-none"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy">
                      Date of Birth
                    </label>
                    <input
                      type="date"
                      value={formData.date_of_birth}
                      onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                      className="mt-1 h-10 w-full sm:w-1/2 rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm focus:border-delta-navy focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              {/* Security */}
              <div className="rounded-[4px] border border-delta-hairline bg-delta-canvas p-6 shadow-xs">
                <div className="mb-4 flex items-center gap-2">
                  <Shield className="h-4 w-4 text-delta-navy" />
                  <h2 className="text-sm font-bold uppercase tracking-wider text-delta-navy">
                    Security
                  </h2>
                </div>
                <p className="mb-4 text-xs text-delta-ink-muted">
                  Leave the fields below empty if you do not wish to change your password.
                </p>

                <div className="grid gap-4 sm:grid-cols-2">
                  <div className="sm:col-span-2">
                    <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy">
                      Current Password
                    </label>
                    <input
                      type="password"
                      value={formData.current_password}
                      onChange={(e) => setFormData({ ...formData, current_password: e.target.value })}
                      className="mt-1 h-10 w-full sm:w-1/2 rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm focus:border-delta-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy">
                      New Password
                    </label>
                    <input
                      type="password"
                      value={formData.new_password}
                      onChange={(e) => setFormData({ ...formData, new_password: e.target.value })}
                      className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm focus:border-delta-navy focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy">
                      Confirm New Password
                    </label>
                    <input
                      type="password"
                      value={formData.confirm_password}
                      onChange={(e) => setFormData({ ...formData, confirm_password: e.target.value })}
                      className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm focus:border-delta-navy focus:outline-none"
                    />
                  </div>
                </div>
              </div>

              <div className="flex justify-end">
                <Button
                  type="submit"
                  disabled={isSubmitting}
                  className="rounded-[4px] bg-delta-navy px-6 text-white hover:bg-delta-navy/90"
                >
                  <Save className="mr-2 h-4 w-4" />
                  {isSubmitting ? "Saving..." : "Save Changes"}
                </Button>
              </div>
            </form>
          </div>
        </main>
      </div>
    </div>
  )
}
