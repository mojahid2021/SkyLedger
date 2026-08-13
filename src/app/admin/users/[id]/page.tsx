"use client"

import React, { useEffect, useState, use } from "react"
import { useRouter } from "next/navigation"
import { ArrowLeft, Save, Trash2, Shield, User, CheckCircle2, AlertCircle, Mail, Phone, Calendar, Wallet, Plane, Receipt, CreditCard } from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar, AdminMobileNav } from "@/components/admin/admin-sidebar"
import { cn } from "@/lib/utils"

export default function UserDetailsPage({ params }: { params: Promise<{ id: string }> }) {
  const resolvedParams = use(params)
  const userId = resolvedParams.id

  const { user, role, isLoading } = useAuth()
  const router = useRouter()

  const [loading, setLoading] = useState(true)
  const [profile, setProfile] = useState<any>(null)

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

  const fetchUserAggregated = () => {
    setLoading(true)
    setError("")
    fetch(`/api/admin/users/${userId}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.data && data.data.user) {
          const u = data.data.user
          setProfile(data.data)
          setFirstName(u.first_name || "")
          setLastName(u.last_name || "")
          setEmail(u.email || "")
          setPhone(u.phone || "")
          setDob(u.date_of_birth ? u.date_of_birth.split("T")[0] : "")
          setUserRole(u.role || "user")
        } else {
          setError(data.error || "User not found")
        }
      })
      .catch((err) => {
        setError("Database error while fetching user details")
      })
      .finally(() => setLoading(false))
  }

  useEffect(() => {
    if (!isLoading) {
      if (!user) {
        router.replace("/login")
      } else if (role !== "admin") {
        router.replace("/user/dashboard")
      } else {
        fetchUserAggregated()
      }
    }
  }, [user, role, isLoading, userId, router])

  if (isLoading || !user || role !== "admin") {
    return (
      <div className="flex h-dvh items-center justify-center bg-delta-surface-1 text-sm font-delta text-delta-ink-muted">
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
        fetchUserAggregated()
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

  const isRoleChanged = profile?.user && userRole !== profile.user.role
  const actBalance = profile?.account ? Number(profile.account.balance) : 0
  const confirmedFlights = profile?.bookings ? profile.bookings.filter((b:any) => b.status === "confirmed").length : 0

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
                  className="h-9 w-9 p-0 rounded-[4px] border-delta-hairline text-delta-navy hover:bg-delta-canvas transition-colors"
                >
                  <ArrowLeft className="h-4 w-4" />
                </Button>
                <div>
                  <p className="text-[11px] font-[600] uppercase tracking-wider text-delta-red">
                    Admin Directory / User Details
                  </p>
                  <h1 className="text-[20px] font-[700] leading-tight text-delta-navy flex items-center gap-2">
                    User Control Panel
                    <Badge className="font-mono text-xs bg-delta-navy text-white rounded-[4px]">#{userId}</Badge>
                  </h1>
                </div>
              </div>
            </div>

            {loading ? (
              <div className="p-12 text-center text-xs text-delta-ink-muted">
                Loading deep profile analysis from central database...
              </div>
            ) : error && !profile ? (
              <div className="flex items-center gap-2 rounded-[4px] border border-delta-error/30 bg-delta-error/10 p-4 text-xs font-[500] text-delta-error">
                <AlertCircle className="h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            ) : (
              <div className="grid grid-cols-1 xl:grid-cols-3 gap-6">
                
                {/* Left Area: Profile Forms */}
                <div className="xl:col-span-2 space-y-6">
                  
                  {/* Hero Identity Panel */}
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
                            <Badge className="bg-delta-red text-white text-[10px] font-[700] uppercase rounded-[4px]">
                              Administrator
                            </Badge>
                          ) : (
                            <Badge variant="secondary" className="bg-delta-surface-2 border border-delta-hairline text-delta-navy text-[10px] font-[700] uppercase rounded-[4px]">
                              Standard User
                            </Badge>
                          )}
                        </div>
                        <p className="font-mono text-xs text-delta-ink-muted mt-1">{email}</p>
                      </div>
                    </div>
                    <div className="text-right text-xs text-delta-ink-muted">
                      {profile.user?.created_at && (
                        <span className="font-mono">Registered: {new Date(profile.user.created_at).toLocaleDateString()}</span>
                      )}
                    </div>
                  </div>

                  {/* Messaging */}
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

                  {/* Profile Edit Card */}
                  <div className="rounded-[4px] border border-delta-hairline bg-delta-canvas p-6 shadow-xs">
                    <form onSubmit={handleSave} className="space-y-6">
                      
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

                      <div className="space-y-4">
                        <h3 className="text-xs font-[700] uppercase tracking-wider text-delta-navy border-b border-delta-hairline pb-2">
                          Identity Parameters
                        </h3>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-[600] uppercase text-delta-ink-muted">First Name</label>
                            <div className="relative mt-1">
                              <User className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-delta-ink-muted" />
                              <input
                                type="text"
                                required
                                value={firstName}
                                onChange={(e) => setFirstName(e.target.value)}
                                className="h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 pl-9 text-sm text-delta-ink focus:border-delta-navy focus:outline-none"
                              />
                            </div>
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
                          <label className="text-[11px] font-[600] uppercase text-delta-ink-muted">Email Address</label>
                          <div className="relative mt-1">
                            <Mail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-delta-ink-muted" />
                            <input
                              type="email"
                              required
                              value={email}
                              onChange={(e) => setEmail(e.target.value)}
                              className="h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 pl-9 text-sm font-mono text-delta-ink focus:border-delta-navy focus:outline-none"
                            />
                          </div>
                        </div>

                        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                          <div>
                            <label className="text-[11px] font-[600] uppercase text-delta-ink-muted">Phone Number</label>
                            <div className="relative mt-1">
                              <Phone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-delta-ink-muted" />
                              <input
                                type="text"
                                value={phone}
                                onChange={(e) => setPhone(e.target.value)}
                                placeholder="+1..."
                                className="h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 pl-9 text-sm font-mono text-delta-ink focus:border-delta-navy focus:outline-none"
                              />
                            </div>
                          </div>
                          <div>
                            <label className="text-[11px] font-[600] uppercase text-delta-ink-muted">Date of Birth</label>
                            <div className="relative mt-1">
                              <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-delta-ink-muted" />
                              <input
                                type="date"
                                value={dob}
                                onChange={(e) => setDob(e.target.value)}
                                className="h-10 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 pl-9 text-sm font-mono text-delta-ink focus:border-delta-navy focus:outline-none"
                              />
                            </div>
                          </div>
                        </div>
                      </div>

                      <div className="flex items-center justify-between border-t border-delta-hairline pt-6">
                        <Button
                          type="button"
                          variant="outline"
                          onClick={handleDelete}
                          disabled={deleting || saving}
                          className="h-9 gap-1.5 rounded-[4px] border-delta-error/30 text-[11px] uppercase tracking-wider font-[700] text-delta-error hover:bg-delta-error/10"
                        >
                          <Trash2 className="h-3.5 w-3.5" />
                          <span>{deleting ? "Purging..." : "Wipe Account"}</span>
                        </Button>

                        <Button
                          type="submit"
                          disabled={saving}
                          className="h-9 gap-1.5 rounded-[4px] bg-delta-navy px-6 text-[11px] uppercase tracking-wider font-[700] text-white hover:bg-delta-navy-dark"
                        >
                          <Save className="h-3.5 w-3.5" />
                          <span>{saving ? "Saving..." : "Commit Update"}</span>
                        </Button>
                      </div>
                    </form>
                  </div>
                </div>

                {/* Right Area: Aggregate Stats Feed */}
                <div className="xl:col-span-1 space-y-6">
                  {/* High Level Stats */}
                  <div className="grid grid-cols-2 gap-4">
                     <div className="rounded-[4px] border border-delta-hairline bg-delta-navy p-5 text-white shadow-xs">
                        <Wallet className="h-5 w-5 text-emerald-400 mb-3" />
                        <span className="text-[10px] uppercase font-[700] tracking-wider text-white/60">Stored Ledger</span>
                        <p className="text-xl font-[700] font-mono mt-0.5">${actBalance.toLocaleString("en-US", {minimumFractionDigits: 2})}</p>
                     </div>
                     <div className="rounded-[4px] border border-delta-hairline bg-delta-canvas p-5 shadow-xs">
                        <Plane className="h-5 w-5 text-delta-navy mb-3" />
                        <span className="text-[10px] uppercase font-[700] tracking-wider text-delta-ink-muted">Confirmed Flights</span>
                        <p className="text-xl font-[700] text-delta-navy mt-0.5">{confirmedFlights}</p>
                     </div>
                  </div>

                  {/* Transaction Feed */}
                  <div className="rounded-[4px] border border-delta-hairline bg-delta-canvas shadow-xs">
                    <div className="px-5 py-4 border-b border-delta-hairline">
                       <h3 className="text-xs font-[700] uppercase tracking-wider text-delta-navy flex items-center gap-2">
                         <Receipt className="h-4 w-4" /> Recent Timeline
                       </h3>
                    </div>
                    <div className="px-5 py-2">
                       {profile.transactions.length === 0 ? (
                         <div className="py-6 text-center text-xs text-delta-ink-muted">No interactions recorded.</div>
                       ) : (
                         <div className="divide-y divide-delta-hairline">
                           {profile.transactions.slice(0, 5).map((t: any) => (
                             <div key={t.id} className="py-3 flex items-start justify-between gap-4">
                                <div>
                                   <p className="text-xs font-[600] text-delta-navy">{t.description}</p>
                                   <p className="text-[10px] uppercase tracking-wider text-delta-ink-muted font-mono mt-0.5">[{t.date}]</p>
                                </div>
                                <div className={cn("text-xs font-[700] font-mono", t.type === "credit" ? "text-emerald-600" : "text-delta-ink")}>
                                   {t.type === "credit" ? "+" : "-"}${Number(t.amount).toFixed(2)}
                                </div>
                             </div>
                           ))}
                         </div>
                       )}
                    </div>
                  </div>
                </div>

              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}
