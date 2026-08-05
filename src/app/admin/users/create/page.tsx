"use client"

import React, { useState } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Plus, User, Shield, CheckCircle2, AlertCircle, Mail, Phone, Calendar, Lock } from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar, AdminMobileNav } from "@/components/admin/admin-sidebar"

export default function CreateUserPage() {
  const { user, role, isLoading } = useAuth()
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [password, setPassword] = useState("")
  const [userRole, setUserRole] = useState<"admin" | "user">("user")

  const [creating, setCreating] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  if (isLoading || !user || role !== "admin") {
    return (
      <div className="flex h-dvh items-center justify-center bg-delta-canvas text-sm font-delta text-delta-ink-muted">
        Verifying Administrative Credentials...
      </div>
    )
  }

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault()
    setCreating(true)
    setError("")
    setMessage("")

    try {
      const res = await fetch("/api/admin/users", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          date_of_birth: dob,
          password,
          role: userRole,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage(data.message || "User created successfully!")
        setTimeout(() => {
          router.push("/admin/dashboard?tab=users")
        }, 1200)
      } else {
        setError(data.error || "Failed to create new user")
      }
    } catch (err) {
      setError("Network or server error while creating user")
    } finally {
      setCreating(false)
    }
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-delta-surface-1 font-delta text-delta-ink">
      <AdminNavbar />

      <div className="flex min-h-0 flex-1">
        <AdminSidebar activeSection="users" onSectionChange={() => router.push("/admin/dashboard")} />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <AdminMobileNav activeSection="users" onSectionChange={() => router.push("/admin/dashboard")} />

          <div className="w-full space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header with back button */}
            <div className="flex items-center justify-between border-b border-delta-hairline pb-4">
              <div className="flex items-center gap-3">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => router.push("/admin/dashboard?tab=users")}
                  className="h-9 w-9 p-0 rounded-[4px] border-delta-hairline text-delta-navy hover:bg-delta-surface-1"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <p className="text-[11px] font-[600] uppercase tracking-wider text-delta-red">
                    Admin Directory / Create
                  </p>
                  <h1 className="text-[20px] font-[700] leading-tight text-delta-navy flex items-center gap-2">
                    Create New User Account
                  </h1>
                </div>
              </div>
            </div>

            {error && (
              <div className="flex items-center gap-2 rounded-[4px] border border-delta-error/30 bg-delta-error/10 p-3 text-xs font-[500] text-delta-error">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            {message && (
              <div className="flex items-center gap-2 rounded-[4px] border border-delta-success/30 bg-delta-success/10 p-3 text-xs font-[500] text-delta-success">
                <CheckCircle2 className="h-4 w-4 shrink-0" />
                <span>{message}</span>
              </div>
            )}

            {/* Main Form Card */}
            <div className="rounded-[4px] border border-delta-hairline bg-delta-canvas p-6 shadow-xs">
              <form onSubmit={handleCreate} className="space-y-6">
                {/* Role selection dropdown */}
                <div className="rounded-[4px] border border-delta-hairline bg-delta-surface-1 p-4 space-y-2">
                  <label className="text-[11px] font-[700] uppercase tracking-wider text-delta-navy flex items-center gap-1.5">
                    <Shield className="h-3.5 w-3.5 text-delta-navy" />
                    Select Account Access Role
                  </label>
                  <select
                    value={userRole}
                    onChange={(e) => setUserRole(e.target.value as "admin" | "user")}
                    className="h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-xs font-[600] text-delta-ink focus:border-delta-navy focus:outline-none"
                  >
                    <option value="user">STANDARD USER (Default Member Permissions)</option>
                    <option value="admin">ADMINISTRATOR (Full Privileged System Access)</option>
                  </select>
                </div>

                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-xs font-[700] uppercase tracking-wider text-delta-navy border-b border-delta-hairline pb-2">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-[600] uppercase text-delta-ink-muted">First Name *</label>
                      <input
                        type="text"
                        required
                        value={firstName}
                        onChange={(e) => setFirstName(e.target.value)}
                        placeholder="e.g. Sarah"
                        className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm text-delta-ink focus:border-delta-navy focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-[600] uppercase text-delta-ink-muted">Last Name *</label>
                      <input
                        type="text"
                        required
                        value={lastName}
                        onChange={(e) => setLastName(e.target.value)}
                        placeholder="e.g. Connor"
                        className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm text-delta-ink focus:border-delta-navy focus:outline-none"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="text-[11px] font-[600] uppercase text-delta-ink-muted flex items-center gap-1">
                      <Mail className="h-3.5 w-3.5 text-delta-navy" />
                      Email Address *
                    </label>
                    <input
                      type="email"
                      required
                      value={email}
                      onChange={(e) => setEmail(e.target.value)}
                      placeholder="sarah.connor@skyledger.io"
                      className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm text-delta-ink font-mono focus:border-delta-navy focus:outline-none"
                    />
                  </div>

                  <div>
                    <label className="text-[11px] font-[600] uppercase text-delta-ink-muted flex items-center gap-1">
                      <Lock className="h-3.5 w-3.5 text-delta-navy" />
                      Initial Account Password *
                    </label>
                    <input
                      type="password"
                      required
                      value={password}
                      onChange={(e) => setPassword(e.target.value)}
                      placeholder="••••••••"
                      className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm text-delta-ink font-mono focus:border-delta-navy focus:outline-none"
                    />
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="text-[11px] font-[600] uppercase text-delta-ink-muted flex items-center gap-1">
                        <Phone className="h-3.5 w-3.5 text-delta-navy" />
                        Phone Number
                      </label>
                      <input
                        type="text"
                        value={phone}
                        onChange={(e) => setPhone(e.target.value)}
                        placeholder="+1 (555) 019-2834"
                        className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm text-delta-ink font-mono focus:border-delta-navy focus:outline-none"
                      />
                    </div>
                    <div>
                      <label className="text-[11px] font-[600] uppercase text-delta-ink-muted flex items-center gap-1">
                        <Calendar className="h-3.5 w-3.5 text-delta-navy" />
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={dob}
                        onChange={(e) => setDob(e.target.value)}
                        className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm text-delta-ink font-mono focus:border-delta-navy focus:outline-none"
                      />
                    </div>
                  </div>
                </div>

                {/* Form Footer Action */}
                <div className="flex items-center justify-end gap-3 border-t border-delta-hairline pt-6">
                  <Button
                    type="button"
                    variant="outline"
                    onClick={() => router.push("/admin/dashboard?tab=users")}
                    className="h-10 rounded-[4px] border-delta-hairline text-xs font-[600]"
                  >
                    Cancel
                  </Button>

                  <Button
                    type="submit"
                    disabled={creating}
                    className="h-10 gap-1.5 rounded-[4px] bg-delta-red px-6 text-xs font-[700] text-white hover:bg-delta-red-hover"
                  >
                    <Plus className="h-4 w-4" />
                    <span>{creating ? "Creating..." : "Create Account"}</span>
                  </Button>
                </div>
              </form>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}
