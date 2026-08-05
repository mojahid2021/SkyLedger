"use client"

import React, { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Trash2, Shield, User, CheckCircle2, AlertCircle, Mail, Phone, Calendar } from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar, AdminMobileNav } from "@/components/admin/admin-sidebar"
import { AdminUser } from "@/components/admin/user-directory-table"

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const userId = resolvedParams.id

  const { user, role, isLoading } = useAuth()
  const router = useRouter()

  const [userData, setUserData] = useState<AdminUser | null>(null)
  const [loadingUser, setLoadingUser] = useState(true)

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [dob, setDob] = useState("")
  const [userRole, setUserRole] = useState<"admin" | "user">("user")

  const [saving, setSaving] = useState(false)
  const [deleting, setDeleting] = useState(false)
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")

  const fetchUser = () => {
    setLoadingUser(true)
    fetch("/api/admin/users")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.users)) {
          const found = data.users.find((u: AdminUser) => String(u.id) === String(userId))
          if (found) {
            setUserData(found)
            setFirstName(found.first_name || "")
            setLastName(found.last_name || "")
            setEmail(found.email || "")
            setPhone(found.phone || "")
            setDob(found.date_of_birth || "")
            setUserRole(found.role || "user")
          } else {
            setError(`User #${userId} not found in database`)
          }
        }
      })
      .catch((err) => {
        console.error("Failed to load user", err)
        setError("Database error while fetching user details")
      })
      .finally(() => setLoadingUser(false))
  }

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login")
      } else if (role !== "admin") {
        router.replace("/user/dashboard")
      } else {
        fetchUser()
      }
    }
  }, [user, role, isLoading, userId, router])

  if (isLoading || !user || role !== "admin") {
    return (
      <div className="flex h-dvh items-center justify-center bg-delta-canvas text-sm font-delta text-delta-ink-muted">
        Verifying Administrative Credentials...
      </div>
    )
  }

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault()
    setSaving(true)
    setError("")
    setMessage("")

    try {
      const res = await fetch("/api/admin/users", {
        method: "PATCH",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: Number(userId),
          first_name: firstName,
          last_name: lastName,
          email,
          phone,
          date_of_birth: dob,
          role: userRole,
        }),
      })

      const data = await res.json()

      if (data.success) {
        setMessage(data.message || "User profile and role updated successfully!")
        fetchUser()
      } else {
        setError(data.error || "Failed to update user details")
      }
    } catch (err) {
      setError("Network or server error while updating user")
    } finally {
      setSaving(false)
    }
  }

  const handleDelete = async () => {
    if (!confirm(`Are you sure you want to delete user #${userId} (${email})? This action cannot be undone.`)) {
      return
    }

    setDeleting(true)
    setError("")

    try {
      const res = await fetch(`/api/admin/users?userId=${userId}`, {
        method: "DELETE",
      })

      const data = await res.json()

      if (data.success) {
        router.push("/admin/dashboard?tab=users")
      } else {
        setError(data.error || "Failed to delete user")
      }
    } catch (err) {
      setError("Network error while deleting user")
    } finally {
      setDeleting(false)
    }
  }

  const isRoleChanged = userData && userRole !== userData.role

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
                    Admin Directory / User Details
                  </p>
                  <h1 className="text-[20px] font-[700] leading-tight text-delta-navy flex items-center gap-2">
                    User Details & Access Control
                    <Badge className="font-mono text-xs bg-delta-navy text-white">#{userId}</Badge>
                  </h1>
                </div>
              </div>
            </div>

            {loadingUser ? (
              <div className="p-12 text-center text-xs text-delta-ink-muted">
                Loading user profile details from database...
              </div>
            ) : error && !userData ? (
              <div className="flex items-center gap-2 rounded-[4px] border border-delta-error/30 bg-delta-error/10 p-4 text-xs font-[500] text-delta-error">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <>
                {/* User Info Overview Hero Banner */}
                <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[4px] border border-delta-hairline bg-delta-canvas p-6 shadow-xs">
                  <div className="flex items-center gap-4">
                    <Avatar className="h-14 w-14 border border-delta-hairline">
                      <AvatarFallback className="bg-delta-navy text-white font-[700] text-lg">
                        {firstName?.[0]}{lastName?.[0]}
                      </AvatarFallback>
                    </Avatar>
                    <div>
                      <div className="flex items-center gap-2">
                        <h2 className="text-[18px] font-[700] text-delta-navy leading-tight">
                          {firstName} {lastName}
                        </h2>
                        {userRole === "admin" ? (
                          <Badge className="bg-delta-red text-white text-[10px] font-[700] uppercase">
                            Administrator
                          </Badge>
                        ) : (
                          <Badge variant="secondary" className="bg-delta-surface-2 text-delta-navy text-[10px] font-[700] uppercase">
                            Standard User
                          </Badge>
                        )}
                      </div>
                      <p className="font-mono text-xs text-delta-ink-muted mt-1">{email}</p>
                    </div>
                  </div>

                  <div className="text-right text-xs text-delta-ink-muted">
                    {userData?.created_at && (
                      <span className="font-mono">Registered: {new Date(userData.created_at).toLocaleDateString()}</span>
                    )}
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

                {/* Edit Form Card */}
                <div className="rounded-[4px] border border-delta-hairline bg-delta-canvas p-6 shadow-xs">
                  <form onSubmit={handleSave} className="space-y-6">
                    {/* Role Selection Dropdown */}
                    <div className="rounded-[4px] border border-delta-hairline bg-delta-surface-1 p-4 space-y-2">
                      <div className="flex items-center justify-between">
                        <label className="text-[11px] font-[700] uppercase tracking-wider text-delta-navy flex items-center gap-1.5">
                          <Shield className="h-3.5 w-3.5 text-delta-navy" />
                          Assigned Access Role
                        </label>
                        {isRoleChanged && (
                          <span className="text-[10px] font-[700] text-delta-red">Role Modified</span>
                        )}
                      </div>
                      <select
                        value={userRole}
                        onChange={(e) => setUserRole(e.target.value as "admin" | "user")}
                        className="h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-xs font-[600] text-delta-ink focus:border-delta-navy focus:outline-none"
                      >
                        <option value="user">STANDARD USER (Default Member Permissions)</option>
                        <option value="admin">ADMINISTRATOR (Full Privileged System Access)</option>
                      </select>
                    </div>

                    {/* Profile Fields */}
                    <div className="space-y-4">
                      <h3 className="text-xs font-[700] uppercase tracking-wider text-delta-navy border-b border-delta-hairline pb-2">
                        Profile Parameters
                      </h3>

                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                        <div>
                          <label className="text-[11px] font-[600] uppercase text-delta-ink-muted">First Name</label>
                          <input
                            type="text"
                            required
                            value={firstName}
                            onChange={(e) => setFirstName(e.target.value)}
                            className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm text-delta-ink focus:border-delta-navy focus:outline-none"
                          />
                        </div>
                        <div>
                          <label className="text-[11px] font-[600] uppercase text-delta-ink-muted">Last Name</label>
                          <input
                            type="text"
                            required
                            value={lastName}
                            onChange={(e) => setLastName(e.target.value)}
                            className="mt-1 h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-sm text-delta-ink focus:border-delta-navy focus:outline-none"
                          />
                        </div>
                      </div>

                      <div>
                        <label className="text-[11px] font-[600] uppercase text-delta-ink-muted flex items-center gap-1">
                          <Mail className="h-3.5 w-3.5 text-delta-navy" />
                          Email Address
                        </label>
                        <input
                          type="email"
                          required
                          value={email}
                          onChange={(e) => setEmail(e.target.value)}
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
                            placeholder="+1 (555) 000-0000"
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

                    {/* Action Bar */}
                    <div className="flex items-center justify-between border-t border-delta-hairline pt-6">
                      <Button
                        type="button"
                        variant="outline"
                        onClick={handleDelete}
                        disabled={deleting || saving}
                        className="h-10 gap-1.5 rounded-[4px] border-delta-error/30 text-xs font-[600] text-delta-error hover:bg-delta-error/10"
                      >
                        <Trash2 className="h-4 w-4" />
                        <span>{deleting ? "Deleting..." : "Delete User Account"}</span>
                      </Button>

                      <div className="flex items-center gap-3">
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
                          disabled={saving}
                          className="h-10 gap-1.5 rounded-[4px] bg-delta-red px-6 text-xs font-[700] text-white hover:bg-delta-red-hover"
                        >
                          <Save className="h-4 w-4" />
                          <span>{saving ? "Saving..." : "Save Changes"}</span>
                        </Button>
                      </div>
                    </div>
                  </form>
                </div>
              </>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
