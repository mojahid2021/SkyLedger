"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { FolderKanban, Search, Loader2, CreditCard, Ticket } from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar, AdminMobileNav } from "@/components/admin/admin-sidebar"
import { Input } from "@/components/ui/input"

interface Booking {
  id: number
  booking_reference: string
  origin_code: string
  destination_code: string
  departure_date: string
  cabin_class: string
  total_amount: string
  currency: string
  status: "confirmed" | "cancelled"
  created_at: string
  first_name: string | null
  last_name: string | null
  email: string | null
  flight_number?: string
}

function AdminBookingsContent() {
  const { user, role, isLoading: authLoading } = useAuth()
  const router = useRouter()

  const [searchQuery, setSearchQuery] = useState("")
  const [debouncedSearch, setDebouncedSearch] = useState("")
  const [bookings, setBookings] = useState<Booking[]>([])
  const [loading, setLoading] = useState(true)

  // Debounce search input
  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchQuery), 300)
    return () => clearTimeout(handler)
  }, [searchQuery])

  useEffect(() => {
    if (authLoading || !user || role !== "admin") return

    setLoading(true)
    fetch(`/api/admin/bookings?search=${encodeURIComponent(debouncedSearch)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.bookings)) {
          setBookings(data.bookings)
        }
      })
      .catch((err) => console.error("Failed to fetch bookings", err))
      .finally(() => setLoading(false))
  }, [user, role, authLoading, debouncedSearch])

  if (authLoading || !user || role !== "admin") {
    return (
      <div className="flex h-dvh items-center justify-center bg-delta-canvas text-delta-ink-muted text-sm">
        <Loader2 className="mr-2 h-4 w-4 animate-spin text-delta-red" />
        Verifying Administrative Credentials...
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-delta-surface-1 font-sans text-delta-ink">
      <AdminNavbar searchQuery={searchQuery} onSearchChange={setSearchQuery} />

      <div className="flex min-h-0 flex-1">
        <AdminSidebar activeSection="bookings" onSectionChange={(sec) => router.push(`/admin/${sec}`)} />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <AdminMobileNav activeSection="bookings" onSectionChange={(sec) => router.push(`/admin/${sec}`)} />

          <div className="space-y-6 p-4 sm:p-6 lg:p-8 max-w-7xl mx-auto">
            {/* Header */}
            <div className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between border-b border-delta-hairline pb-4">
              <div>
                <h1 className="text-2xl font-bold tracking-tight text-delta-navy flex items-center gap-2">
                  <FolderKanban className="h-6 w-6 text-delta-red" />
                  All Bookings
                </h1>
                <p className="text-sm text-delta-ink-muted mt-1">Manage flight bookings and transactions.</p>
              </div>
              <div className="relative w-full sm:w-72">
                <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-delta-ink-muted" />
                <Input
                  placeholder="Search PNR, user name, or email..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="pl-9 h-10 border-delta-hairline text-sm"
                />
              </div>
            </div>

            {/* Table */}
            <div className="rounded-sm border border-delta-hairline bg-delta-canvas shadow-[0_1px_3px_rgba(0,0,0,0.04)] overflow-hidden">
              <div className="overflow-x-auto">
                <table className="w-full text-left text-sm">
                  <thead className="bg-delta-surface-1 text-[11px] font-bold uppercase tracking-wider text-delta-ink-muted border-b border-delta-hairline">
                    <tr>
                      <th className="px-4 py-3">PNR</th>
                      <th className="px-4 py-3">Passenger</th>
                      <th className="px-4 py-3">Flight</th>
                      <th className="px-4 py-3">Route & Date</th>
                      <th className="px-4 py-3">Class</th>
                      <th className="px-4 py-3">Amount</th>
                      <th className="px-4 py-3">Status</th>
                    </tr>
                  </thead>
                  <tbody className="divide-y divide-delta-hairline">
                    {loading ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-delta-ink-muted text-sm">
                          <Loader2 className="mx-auto h-5 w-5 animate-spin text-delta-navy mb-2" />
                          Loading bookings...
                        </td>
                      </tr>
                    ) : bookings.length === 0 ? (
                      <tr>
                        <td colSpan={6} className="px-4 py-8 text-center text-delta-ink-muted text-sm">
                          No bookings found matching your search.
                        </td>
                      </tr>
                    ) : (
                      bookings.map((booking) => (
                        <tr key={booking.id} className="hover:bg-delta-surface-1/50 transition-colors">
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-2 font-mono font-bold text-delta-navy">
                              <Ticket className="h-3.5 w-3.5 text-delta-red" />
                              {booking.booking_reference}
                            </div>
                            <div className="text-[10px] text-delta-ink-muted mt-0.5 font-sans">
                              {new Date(booking.created_at).toLocaleDateString()}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-medium text-delta-ink">
                              {booking.first_name} {booking.last_name}
                            </div>
                            <div className="text-xs text-delta-ink-muted">{booking.email || "Guest"}</div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-delta-navy uppercase tracking-wide">
                              {booking.flight_number || "N/A"}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-bold text-delta-navy uppercase tracking-wide flex items-center gap-1.5">
                              {booking.origin_code} <span className="text-delta-red opacity-60">→</span> {booking.destination_code}
                            </div>
                            <div className="text-xs text-delta-ink-muted mt-0.5">{booking.departure_date}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span className="inline-block bg-delta-surface-2 border border-delta-hairline px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-wider text-delta-ink-muted">
                              {booking.cabin_class.replace("_", " ")}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-mono font-bold text-delta-ink flex items-center gap-1">
                              <CreditCard className="h-3 w-3 text-delta-success shrink-0" />
                              ৳{Number(booking.total_amount).toFixed(2)}
                            </div>
                            <div className="text-[10px] text-delta-ink-muted uppercase">{booking.currency}</div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={`inline-block px-2 py-0.5 rounded-sm text-[10px] font-bold uppercase tracking-widest border ${booking.status === "confirmed"
                                  ? "bg-delta-success/10 text-delta-success border-delta-success/20"
                                  : "bg-delta-error/10 text-delta-error border-delta-error/20"
                                }`}
                            >
                              {booking.status}
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminBookingsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-delta-canvas text-sm text-delta-ink-muted">
          Loading Administrative Control Panel...
        </div>
      }
    >
      <AdminBookingsContent />
    </Suspense>
  )
}
