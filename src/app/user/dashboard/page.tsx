"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconUser,
  IconReceipt,
  IconWallet,
  IconTrendingUp,
  IconTrendingDown,
  IconPlus,
  IconDownload,
  IconChevronLeft,
  IconChevronRight,
  IconTrash,
} from "@tabler/icons-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { UserNavbar } from "@/components/user/user-navbar"
import { UserSidebar } from "@/components/user/user-sidebar"
import { useAutoPageSize } from "@/hooks/use-auto-page-size"
import { ETicketInline } from "@/components/user/e-ticket-inline"
import { BookingDetail } from "@/components/user/e-ticket-dialog"
import { Plane, Ticket, RefreshCw } from "lucide-react"

export interface UserTransaction {
  id: number
  reference: string
  description: string
  category: string
  account?: string
  type: "credit" | "debit"
  amount: number | string
  status: "completed" | "pending" | "failed"
  date: string
}

export default function UserDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("dashboard")
  const [transactions, setTransactions] = useState<UserTransaction[]>([])
  const [loadingTxns, setLoadingTxns] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [manualPageSize, setManualPageSize] = useState<number | "auto">("auto")

  // Bookings state
  const [bookings, setBookings] = useState<BookingDetail[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [expandedTicketId, setExpandedTicketId] = useState<number | null>(null)
  const [fullBookingDetails, setFullBookingDetails] = useState<Record<number, BookingDetail>>({})
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  // Auto-detect optimal page size based on viewport height
  const autoPageSize = useAutoPageSize(56, 380, 5)
  const pageSize = manualPageSize === "auto" ? autoPageSize : manualPageSize

  const fetchTransactions = () => {
    if (!user?.id) return
    setLoadingTxns(true)
    fetch(`/api/transactions?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTransactions(data.data)
        }
      })
      .catch((err) => console.log("Failed to fetch transactions", err))
      .finally(() => setLoadingTxns(false))
  }

  const fetchBookings = () => {
    if (!user?.id) return
    setLoadingBookings(true)
    fetch(`/api/bookings?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setBookings(data.data)
        }
      })
      .catch((err) => console.log("Failed to fetch bookings", err))
      .finally(() => setLoadingBookings(false))
  }

  const handleCancelBooking = async (bookingId: number) => {
    if (!confirm("Are you sure you want to cancel this flight reservation? Full fare will be credited back to your SkyLedger wallet.")) {
      return
    }
    setCancellingId(bookingId)
    try {
      const res = await fetch(`/api/bookings/${bookingId}/cancel`, { method: "POST" })
      const data = await res.json()
      if (data.success) {
        alert(data.message)
        fetchBookings()
        fetchTransactions()
      } else {
        alert(data.error || "Failed to cancel booking")
      }
    } catch (err: unknown) {
      alert("Error cancelling booking: " + (err as Error).message)
    } finally {
      setCancellingId(null)
    }
  }

  const handleToggleViewTicket = async (b: BookingDetail) => {
    if (expandedTicketId === b.id) {
      setExpandedTicketId(null)
      return
    }

    if (fullBookingDetails[b.id]) {
      setExpandedTicketId(b.id)
      return
    }

    try {
      const res = await fetch(`/api/bookings/${b.id}`)
      const data = await res.json()
      if (data.success) {
        setFullBookingDetails((prev) => ({ ...prev, [b.id]: data.data }))
      } else {
        setFullBookingDetails((prev) => ({ ...prev, [b.id]: b }))
      }
    } catch {
      setFullBookingDetails((prev) => ({ ...prev, [b.id]: b }))
    } finally {
      setExpandedTicketId(b.id)
    }
  }

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
      return
    }

    let isMounted = true

    fetch(`/api/transactions?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data)) {
          setTransactions(data.data)
        }
      })
      .catch((err) => console.log("Failed to fetch transactions", err))
      .finally(() => {
        if (isMounted) setLoadingTxns(false)
      })

    fetch(`/api/bookings?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (isMounted && data.success && Array.isArray(data.data)) {
          setBookings(data.data)
        }
      })
      .catch((err) => console.log("Failed to fetch bookings", err))
      .finally(() => {
        if (isMounted) setLoadingBookings(false)
      })

    return () => {
      isMounted = false
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Loading User Session...
      </div>
    )
  }

  // Calculate real balances from database transactions
  let totalCredit = 0
  let totalDebit = 0
  transactions.forEach((t) => {
    const amt = typeof t.amount === "number" ? t.amount : parseFloat(t.amount) || 0
    if (t.type === "credit") totalCredit += amt
    else if (t.type === "debit") totalDebit += amt
  })
  const netBalance = totalCredit - totalDebit

  const totalPages = Math.ceil(transactions.length / pageSize) || 1
  const validPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (validPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, transactions.length)
  const paginatedTxns = transactions.slice(startIndex, endIndex)

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background font-sans text-foreground">
      <UserNavbar />

      <div className="flex min-h-0 flex-1">
        <UserSidebar activeTab={activeSection} setActiveTab={(t) => {
          if (t === "wallet") {
            router.push("/user/wallet")
          } else {
            setActiveSection(t)
          }
        }} />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            
            {/* Conditional Views based on Sidebar Tabs */}
            {(activeSection === "dashboard" || activeSection === "account" || activeSection === "reports" || activeSection === "invoices") && (
              <>
                {/* Welcome Banner */}
                <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
                  <div className="flex items-center gap-3">
                    <div className="p-2.5 rounded-lg bg-emerald-600 text-white">
                      <IconUser className="h-5 w-5" />
                    </div>
                    <div>
                      <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                        Welcome back, {user.first_name}!
                        <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                          Member
                        </Badge>
                      </h2>
                      <p className="text-xs text-muted-foreground">
                        Manage your Treasury account balances, submit expense requests, and view personal ledgers.
                      </p>
                    </div>
                  </div>
                </div>

                {/* User Stats */}
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="shadow-xs">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                        Net Balance
                      </CardTitle>
                      <IconWallet className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        ${netBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-xs text-muted-foreground">Calculated from live database</span>
                    </CardContent>
                  </Card>

                  <Card className="shadow-xs">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                        Total Credit (Revenue)
                      </CardTitle>
                      <IconTrendingUp className="h-4 w-4 text-emerald-600" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        ${totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-xs text-muted-foreground">Total credit entries</span>
                    </CardContent>
                  </Card>

                  <Card className="shadow-xs">
                    <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
                      <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                        Total Debit (Expenses)
                      </CardTitle>
                      <IconTrendingDown className="h-4 w-4 text-amber-500" />
                    </CardHeader>
                    <CardContent className="p-4 pt-0">
                      <div className="text-2xl font-bold">
                        ${totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                      </div>
                      <span className="text-xs text-muted-foreground">Total debit entries</span>
                    </CardContent>
                  </Card>
                </div>
              </>
            )}

            {(activeSection === "dashboard" || activeSection === "trips") && (
        <Card className="shadow-xs border-delta-hairline">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2 text-delta-navy">
                <Plane className="h-5 w-5 text-delta-red" />
                My Flight Bookings & Boarding Passes ({bookings.length})
              </CardTitle>
              <CardDescription className="text-xs">
                View confirmed travel itineraries, seat assignments, and digital e-tickets.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchBookings} className="gap-1.5 text-xs border-delta-hairline">
              <RefreshCw className="h-3.5 w-3.5" />
              Refresh Bookings
            </Button>
          </CardHeader>
          <CardContent>
            {loadingBookings ? (
              <div className="py-8 text-center text-xs text-muted-foreground">
                Loading flight reservations...
              </div>
            ) : bookings.length === 0 ? (
              <div className="py-8 text-center text-xs text-muted-foreground space-y-2">
                <Ticket className="h-8 w-8 mx-auto text-delta-hairline" />
                <p className="font-semibold text-delta-navy">No flight bookings found.</p>
                <p className="text-delta-ink-muted">Search and book flights from the home page search widget.</p>
                <Button size="sm" onClick={() => router.push("/")} className="bg-delta-navy text-white text-xs mt-2">
                  Search Flights
                </Button>
              </div>
            ) : (
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {bookings.map((b) => {
                  const isConfirmed = b.status === "confirmed"
                  return (
                    <div
                      key={b.id}
                      className="border border-delta-hairline rounded-[6px] p-4 bg-white hover:border-delta-navy transition-all space-y-3"
                    >
                      <div className="flex items-center justify-between border-b border-delta-hairline pb-2">
                        <div className="flex items-center gap-2">
                          <span className="font-mono text-xs font-bold bg-delta-navy text-white px-2 py-0.5 rounded-[3px]">
                            {b.booking_reference}
                          </span>
                          <span className="text-xs font-semibold uppercase text-delta-ink-muted">
                            {b.cabin_class}
                          </span>
                        </div>
                        {isConfirmed ? (
                          <Badge className="bg-emerald-600 text-white text-[10px] uppercase tracking-wider">
                            Confirmed
                          </Badge>
                        ) : (
                          <Badge className="bg-rose-600 text-white text-[10px] uppercase tracking-wider">
                            Cancelled
                          </Badge>
                        )}
                      </div>

                      <div className="flex items-center justify-between text-sm font-bold text-delta-navy">
                        <div>
                          <span className="text-xl">{b.origin_code}</span>
                          <span className="text-xs font-normal text-delta-ink-muted block">{b.departure_date}</span>
                        </div>
                        <div className="flex items-center gap-2 text-xs font-normal text-delta-ink-muted">
                          <div className="h-[1px] w-8 bg-delta-hairline" />
                          <Plane className="h-4 w-4 rotate-90 text-delta-navy" />
                          <div className="h-[1px] w-8 bg-delta-hairline" />
                        </div>
                        <div className="text-right">
                          <span className="text-xl">{b.destination_code}</span>
                          {b.return_date && (
                            <span className="text-xs font-normal text-delta-ink-muted block">Return: {b.return_date}</span>
                          )}
                        </div>
                      </div>

                      <div className="flex items-center justify-between text-xs pt-2 border-t border-delta-hairline-light">
                        <span className="text-delta-ink-muted">
                          Total Paid: <strong className="font-mono text-delta-red font-bold">${Number(b.total_amount).toFixed(2)} {b.currency}</strong>
                        </span>

                        <div className="flex items-center gap-2">
                          {isConfirmed && (
                            <Button
                              variant="outline"
                              size="sm"
                              disabled={cancellingId === b.id}
                              onClick={() => handleCancelBooking(b.id)}
                              className="h-8 border-rose-200 text-rose-700 hover:bg-rose-50 text-[11px] font-bold uppercase"
                            >
                              Cancel
                            </Button>
                          )}
                          <Button
                            size="sm"
                            onClick={() => handleToggleViewTicket(b)}
                            className="h-8 bg-delta-navy hover:bg-delta-navy-dark text-white text-[11px] font-bold uppercase flex items-center gap-1.5"
                          >
                            <Ticket className="h-3.5 w-3.5" />
                            <span>{expandedTicketId === b.id ? "Hide E-Ticket" : "View E-Ticket"}</span>
                          </Button>
                        </div>
                      </div>

                      {/* Inline Expanded E-Ticket */}
                      {expandedTicketId === b.id && (
                        <div className="pt-3">
                          <ETicketInline
                            booking={fullBookingDetails[b.id] || b}
                            onDone={() => setExpandedTicketId(null)}
                          />
                        </div>
                      )}
                    </div>
                  )
                })}
              </div>
            )}
          </CardContent>
        </Card>
        )}

        {/* My Activity & Ledger Table */}
        {(activeSection === "dashboard" || activeSection === "transactions") && (
          <Card className="shadow-xs">
            <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <IconReceipt className="h-5 w-5 text-emerald-600" />
                My Recent Ledger Activity
              </CardTitle>
              <CardDescription className="text-xs">
                Transactions recorded in the central database.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchTransactions} className="gap-1.5 text-xs">
              <IconDownload className="h-3.5 w-3.5" />
              Refresh Activity
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingTxns ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                      No transactions recorded in database yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTxns.map((txn) => {
                    const isCredit = txn.type === "credit"
                    const val = typeof txn.amount === "number" ? txn.amount : parseFloat(txn.amount) || 0
                    return (
                      <TableRow key={txn.id}>
                        <TableCell className="font-mono text-xs font-semibold text-emerald-600">
                          {txn.reference}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{txn.description}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{txn.category}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{txn.account || "Treasury Account"}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs">
                            {txn.status || "Completed"}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono font-bold text-sm ${
                            isCredit ? "text-emerald-600" : "text-foreground"
                          }`}
                        >
                          {isCredit ? "+" : "-"}${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
            {transactions.length > 0 && (
              <div className="flex flex-col gap-3 border-t pt-3 mt-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
                    <span className="font-semibold text-foreground">{endIndex}</span> of{" "}
                    <span className="font-semibold text-foreground">{transactions.length}</span> transactions
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]">Rows:</span>
                    <select
                      value={manualPageSize}
                      onChange={(e) => {
                        const val = e.target.value
                        setManualPageSize(val === "auto" ? "auto" : Number(val))
                        setCurrentPage(1)
                      }}
                      className="h-7 rounded-md border bg-background px-2 text-xs font-medium text-foreground focus:outline-none"
                    >
                      <option value="auto">Auto ({autoPageSize})</option>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={validPage <= 1}
                    className="h-7 gap-1 px-2 text-xs"
                  >
                    <IconChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs font-medium transition-colors ${
                        page === validPage
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={validPage >= totalPages}
                    className="h-7 gap-1 px-2 text-xs"
                  >
                    <span>Next</span>
                    <IconChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        )}
        </div>
      </main>
      </div>
    </div>
  )
}