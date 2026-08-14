"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { UserNavbar } from "@/components/user/user-navbar"
import { UserSidebar } from "@/components/user/user-sidebar"
import { BookingDetail } from "@/components/user/e-ticket-dialog"
import { Plane, Ticket } from "lucide-react"

const getCabinClassLabel = (cabin: string) => {
  switch (cabin?.toLowerCase()) {
    case "premium_economy":
      return "Premium Economy"
    case "first":
      return "First Class"
    case "business":
      return "Business Class"
    case "economy":
    default:
      return "Economy Class"
  }
}

export default function UserTripsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  const [bookings, setBookings] = useState<BookingDetail[]>([])
  const [loadingBookings, setLoadingBookings] = useState(true)
  const [cancellingId, setCancellingId] = useState<number | null>(null)

  const fetchBookings = useCallback(() => {
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
  }, [user?.id])

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
      return
    }
    
    fetchBookings()
  }, [user, isLoading, router, fetchBookings])

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
      } else {
        alert(data.error || "Failed to cancel booking")
      }
    } catch (err: unknown) {
      alert("Error cancelling booking: " + (err as Error).message)
    } finally {
      setCancellingId(null)
    }
  }

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-slate-500 text-sm">
        Loading Context...
      </div>
    )
  }

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-delta-canvas font-sans text-delta-ink">
      <UserNavbar />

      <div className="flex min-h-0 flex-1">
        <UserSidebar 
          activeTab="trips" 
          setActiveTab={(t) => {
            if (t === "wallet") {
              router.push("/user/wallet")
            } else if (t === "transactions") {
              router.push("/user/transactions")
            } else if (t === "dashboard") {
              router.push("/user/dashboard")
            } else {
              router.push("/user/dashboard")
            }
          }} 
        />

        <main className="min-w-0 flex-1 overflow-y-auto bg-delta-canvas font-sans">
          <div className="w-full mx-auto px-6 py-12 md:py-16 lg:px-12">
            
            <header className="mb-12 border-b border-delta-hairline pb-8">
              <span className="block text-[11px] font-bold text-delta-navy-mid mb-3 uppercase tracking-wider select-none">My Reservations</span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-delta-navy mb-2">
                    Trips & Tickets
                  </h1>
                  <p className="text-delta-ink-muted text-sm font-medium max-w-md leading-relaxed">
                    View your confirmed global itineraries, flight details, and digital boarding passes.
                  </p>
                </div>
                
                <button 
                  onClick={fetchBookings} 
                  className="text-sm font-bold text-delta-navy-mid hover:text-delta-navy transition-colors shrink-0 cursor-pointer select-none"
                >
                   Refresh Records
                </button>
              </div>
            </header>

            <section>
              {loadingBookings ? (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                   {[1, 2].map(i => <div key={i} className="h-48 bg-delta-surface-1 border border-delta-hairline rounded-sm animate-pulse" />)}
                 </div>
              ) : bookings.length === 0 ? (
                 <div className="pt-8 pb-16">
                   <p className="text-sm font-medium text-delta-ink-muted">No flight bookings found.</p>
                 </div>
              ) : (
                 <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    {bookings.map((b) => {
                       const isConfirmed = b.status === "confirmed"
                       return (
                         <div key={b.id} className="p-6 md:p-8 bg-delta-canvas border border-delta-hairline rounded-sm flex flex-col justify-between shadow-none">
                           <div className="flex justify-between items-start mb-12">
                             <div>
                               <span className="font-mono text-xs font-bold bg-delta-navy text-white px-2 py-1 rounded-sm">
                                 {b.booking_reference}
                               </span>
                               <span className="ml-3 text-xs font-bold uppercase tracking-wider text-delta-ink-muted">
                                 {getCabinClassLabel(b.cabin_class)}
                               </span>
                             </div>
                             {isConfirmed ? (
                               <span className="text-[10px] font-bold uppercase tracking-wider text-delta-success bg-delta-success/10 border border-delta-success/20 px-2 py-0.5 rounded-full">Confirmed</span>
                             ) : (
                               <span className="text-[10px] font-bold uppercase tracking-wider text-delta-error bg-delta-error/10 border border-delta-error/20 px-2 py-0.5 rounded-full">Cancelled</span>
                             )}
                           </div>
                           
                           <div className="flex items-center justify-between text-delta-navy mb-10 select-none">
                              <div>
                                <div className="text-4xl font-bold tracking-tight mb-1 uppercase">{b.origin_code}</div>
                                <div className="text-xs font-bold text-delta-ink-muted">{b.departure_date}</div>
                              </div>
                              <div className="flex-1 px-4 sm:px-8 flex items-center">
                                <div className="h-[1px] w-full bg-delta-hairline" />
                                <Plane className="h-4 w-4 text-delta-ink-muted shrink-0 mx-2" />
                                <div className="h-[1px] w-full bg-delta-hairline" />
                              </div>
                              <div className="text-right">
                                <div className="text-4xl font-bold tracking-tight mb-1 uppercase">{b.destination_code}</div>
                                {b.return_date && <div className="text-xs font-bold text-delta-ink-muted">Return: {b.return_date}</div>}
                              </div>
                           </div>
                           
                           <div className="flex items-center justify-between pt-6 border-t border-delta-hairline">
                              <div className="text-sm font-medium text-delta-ink-muted select-none">
                                 Total: <span className="font-bold text-delta-red text-lg ml-1 font-sans">৳{Number(b.total_amount).toFixed(2)}</span>
                              </div>
                              <div className="flex gap-2">
                                 {isConfirmed && (
                                    <button
                                      disabled={cancellingId === b.id}
                                      onClick={() => handleCancelBooking(b.id)}
                                      className="text-xs font-bold text-delta-ink-muted hover:text-delta-error transition-colors px-3 py-2 disabled:opacity-50 cursor-pointer"
                                    >
                                      Cancel
                                    </button>
                                 )}
                                 <button
                                    onClick={() => router.push(`/user/ticket/${b.id}`)}
                                    className="border border-delta-navy text-delta-navy bg-delta-canvas hover:bg-delta-surface-1 text-xs font-bold px-4 py-2 rounded-sm transition-colors flex items-center gap-1.5 cursor-pointer"
                                 >
                                    <Ticket className="h-3.5 w-3.5" />
                                    View Ticket
                                 </button>
                              </div>
                           </div>
                         </div>
                       )
                    })}
                 </div>
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  )
}
