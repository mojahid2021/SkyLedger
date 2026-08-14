"use client"

import React, { useEffect, useState, Suspense } from "react"
import { useRouter } from "next/navigation"
import { Plus, Plane, Search, RefreshCw } from "lucide-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { AdminNavbar } from "@/components/admin/admin-navbar"
import { AdminSidebar, AdminMobileNav, type AdminSection } from "@/components/admin/admin-sidebar"
import { cn } from "@/lib/utils"

function AdminFlightsContent() {
  const { user, role, isLoading } = useAuth()
  const router = useRouter()

  const [flights, setFlights] = useState<any[]>([])
  const [loading, setLoading] = useState(true)
  const [search, setSearch] = useState("")

  const handleSectionChange = (section: AdminSection) => {
    if (section === "flights") return
    router.push(`/admin/${section}`)
  }

  const fetchFlights = (query = search) => {
    setLoading(true)
    fetch(`/api/admin/flights?search=${encodeURIComponent(query)}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          setFlights(data.flights || [])
        }
      })
      .catch((err) => console.error("Error fetching flights:", err))
      .finally(() => setLoading(false))
  }

  const handleAddDeal = (flightId: number, tag: string) => {
    fetch("/api/admin/flights/deal", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ flightId, tag }),
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          fetchFlights()
        } else {
          alert("Failed to add deal: " + data.error)
        }
      })
      .catch((err) => console.error("Error adding deal:", err))
  }

  const handleRemoveDeal = (flightId: number) => {
    fetch(`/api/admin/flights/deal?flightId=${flightId}`, {
      method: "DELETE",
    })
      .then((res) => res.json())
      .then((data) => {
        if (data.success) {
          fetchFlights()
        } else {
          alert("Failed to remove deal: " + data.error)
        }
      })
      .catch((err) => console.error("Error removing deal:", err))
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
    fetchFlights()
  }, [user, role, isLoading, router])

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    fetchFlights(search)
  }

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
        <AdminSidebar activeSection="flights" onSectionChange={handleSectionChange} />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <AdminMobileNav activeSection="flights" onSectionChange={handleSectionChange} />

          <div className="space-y-6 p-4 sm:p-6 lg:p-8">
            {/* Header */}
            <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 border-b border-delta-hairline pb-4">
              <div>
                <p className="text-[11px] font-[600] uppercase tracking-wider text-delta-red">
                  Operations Console
                </p>
                <h1 className="text-[20px] font-[700] leading-tight text-delta-navy flex items-center gap-2">
                  Flights Directory
                  <Badge variant="outline" className="text-[10px] font-[600] border-delta-hairline text-delta-navy">
                    {flights.length} active
                  </Badge>
                </h1>
              </div>

              <div className="flex items-center gap-2 w-full sm:w-auto">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => fetchFlights(search)}
                  disabled={loading}
                  className="h-9 w-9 p-0 border-delta-hairline text-delta-navy hover:bg-delta-surface-1"
                >
                  <RefreshCw className={cn("h-4 w-4", loading && "animate-spin")} />
                </Button>

                <Button
                  onClick={() => router.push("/admin/flights/create")}
                  className="h-9 gap-1.5 rounded-[4px] bg-delta-red px-4 text-xs font-[700] text-white hover:bg-delta-red-hover shadow-xs transition-colors shrink-0"
                >
                  <Plus className="h-3.5 w-3.5" />
                  Schedule Flight
                </Button>
              </div>
            </div>

            {/* Filter Bar */}
            <div className="flex items-center justify-between gap-3 bg-white p-4 rounded-[4px] border border-delta-hairline shadow-xs">
              <form onSubmit={handleSearchSubmit} className="relative w-full sm:w-80">
                <Search className="absolute left-3 top-1/2 h-3.5 w-3.5 -translate-y-1/2 text-delta-ink-muted" />
                <input
                  type="text"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  placeholder="Filter by flight number, airline, route..."
                  className="h-9 w-full rounded-[4px] border border-delta-hairline bg-delta-surface-1 pl-9 pr-3 text-xs text-delta-ink placeholder:text-delta-ink-muted focus:border-delta-navy focus:bg-white focus:outline-none"
                />
              </form>
            </div>

            {/* Content Table / List */}
            {loading ? (
              <div className="flex h-64 items-center justify-center text-xs text-delta-ink-muted">
                Loading scheduled flights from MariaDB...
              </div>
            ) : flights.length === 0 ? (
              <div className="flex flex-col items-center justify-center gap-3 rounded-[4px] border border-dashed border-delta-hairline bg-delta-canvas px-6 py-16 text-center">
                <div className="flex h-12 w-12 items-center justify-center rounded-[4px] bg-delta-surface-2 text-delta-navy">
                  <Plane className="h-6 w-6" />
                </div>
                <div>
                  <p className="text-[15px] font-[700] text-delta-navy">No flights scheduled</p>
                  <p className="mt-1 max-w-sm text-[13px] text-delta-ink-muted">
                    {search
                      ? "No flights match your search query."
                      : "Use the button above to add new flights. The scheduled flights list will appear here."}
                  </p>
                </div>
              </div>
            ) : (
              <div className="rounded-[4px] border border-delta-hairline bg-delta-canvas overflow-hidden shadow-xs">
                <div className="overflow-x-auto">
                  <table className="w-full border-collapse text-left text-sm text-delta-ink">
                    <thead className="bg-delta-surface-1 border-b border-delta-hairline text-[11px] font-[700] uppercase tracking-wider text-delta-navy">
                      <tr>
                        <th className="px-4 py-3 w-16">ID</th>
                        <th className="px-4 py-3">Flight No.</th>
                        <th className="px-4 py-3">Airline</th>
                        <th className="px-4 py-3">Route</th>
                        <th className="px-4 py-3">Aircraft</th>
                        <th className="px-4 py-3">Routing</th>
                        <th className="px-4 py-3">Schedule</th>
                        <th className="px-4 py-3">Status</th>
                        <th className="px-4 py-3">Bookings</th>
                        <th className="px-4 py-3 text-center">Today's Deal</th>
                        <th className="px-4 py-3 text-right">Base Fare</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-delta-hairline">
                      {flights.map((flight: any) => (
                        <tr key={flight.id} className="hover:bg-delta-surface-1/50 transition-colors">
                          <td className="px-4 py-3 font-mono text-xs font-[600] text-delta-navy">
                            #{flight.id}
                          </td>
                          <td className="px-4 py-3 font-[700] text-delta-navy">
                            {flight.flight_number}
                          </td>
                          <td className="px-4 py-3">
                            <div className="font-[600] text-xs">{flight.airline_name}</div>
                            {flight.airline_iata && (
                              <div className="text-[10px] text-delta-ink-muted uppercase font-mono mt-0.5">
                                {flight.airline_iata} Carrier
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex items-center gap-1.5 text-xs font-[700] text-delta-navy">
                              <span>{flight.origin_iata || "???"}</span>
                              <span className="text-delta-red font-normal">➔</span>
                              <span>{flight.destination_iata || "???"}</span>
                            </div>
                            <div className="text-[10px] text-delta-ink-muted truncate max-w-[180px] mt-0.5">
                              {flight.origin_name} to {flight.destination_name}
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            {flight.aircraft_model ? (
                              <>
                                <div className="text-xs font-[500]">{flight.aircraft_model}</div>
                                {flight.aircraft_reg && (
                                  <div className="text-[10px] text-delta-ink-muted font-mono mt-0.5">
                                    {flight.aircraft_reg}
                                  </div>
                                )}
                              </>
                            ) : (
                              <span className="text-xs text-delta-ink-muted italic">None Assigned</span>
                            )}
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex rounded-full px-2 py-0.5 text-[10px] font-[600] uppercase tracking-wider border",
                                flight.flight_type === "direct" && "bg-emerald-50 text-emerald-700 border-emerald-200",
                                flight.flight_type === "connecting" && "bg-amber-50 text-amber-700 border-amber-200",
                                flight.flight_type === "multi-city" && "bg-blue-50 text-blue-700 border-blue-200"
                              )}
                            >
                              {flight.flight_type}
                            </span>
                          </td>
                          <td className="px-4 py-3 text-xs">
                            <div>
                              <span className="font-[600] text-delta-navy mr-1">DEP:</span>
                              <span className="font-mono">{flight.departure_time}</span>
                            </div>
                            <div className="mt-0.5">
                              <span className="font-[600] text-delta-navy mr-1">ARR:</span>
                              <span className="font-mono">{flight.arrival_time}</span>
                            </div>
                          </td>
                          <td className="px-4 py-3">
                            <span
                              className={cn(
                                "inline-flex rounded-[4px] px-2.5 py-0.5 text-[11px] font-[700] uppercase tracking-wider border",
                                flight.status === "scheduled" && "bg-blue-50 text-blue-700 border-blue-200",
                                flight.status === "delayed" && "bg-amber-50 text-amber-700 border-amber-200",
                                flight.status === "cancelled" && "bg-rose-50 text-rose-700 border-rose-200",
                                flight.status === "landed" && "bg-emerald-50 text-emerald-700 border-emerald-200"
                              )}
                            >
                              {flight.status}
                            </span>
                          </td>
                          <td className="px-4 py-3">
                            <div className="flex flex-col">
                              <span className="text-xs font-[700] text-delta-navy">{flight.booked_seats || 0} / {flight.total_seats || 0}</span>
                              <span className="text-[10px] text-delta-ink-muted">Seats Booked</span>
                            </div>
                          </td>
                          <td className="px-4 py-3 text-center">
                            {flight.is_deal ? (
                              <div className="flex flex-col sm:flex-row items-center justify-center gap-1.5">
                                <Badge className="bg-delta-red text-white uppercase text-[9px] font-bold tracking-wider">{flight.deal_tag || "Low Fare"}</Badge>
                                <Button
                                  size="sm"
                                  variant="ghost"
                                  onClick={() => handleRemoveDeal(flight.id)}
                                  className="h-6 px-2 text-[10px] text-delta-red hover:bg-rose-50 border border-rose-100 rounded-[3px] font-[700]"
                                >
                                  Remove
                                </Button>
                              </div>
                            ) : (
                              <div className="flex items-center justify-center">
                                <select
                                  defaultValue=""
                                  onChange={(e) => {
                                    if (e.target.value) {
                                      handleAddDeal(flight.id, e.target.value)
                                      e.target.value = "" // Reset selector
                                    }
                                  }}
                                  className="h-7 rounded-[4px] border border-delta-hairline bg-white text-[10px] px-1 font-bold text-delta-navy focus:outline-none focus:border-delta-navy cursor-pointer"
                                >
                                  <option value="">+ Add Deal...</option>
                                  <option value="Low fare">Low fare</option>
                                  <option value="Popular">Popular</option>
                                  <option value="Best deal">Best deal</option>
                                  <option value="Hot Deal">Hot Deal</option>
                                  <option value="Last Minute">Last Minute</option>
                                </select>
                              </div>
                            )}
                          </td>
                          <td className="px-4 py-3 text-right font-mono text-xs font-[700] text-delta-navy">
                            ৳{Number(flight.price).toFixed(2)}
                          </td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </div>
        </main>
      </div>
    </div>
  )
}

export default function AdminFlightsPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-dvh items-center justify-center bg-delta-canvas text-sm font-delta text-delta-ink-muted">
          Loading Flights Directory...
        </div>
      }
    >
      <AdminFlightsContent />
    </Suspense>
  )
}
