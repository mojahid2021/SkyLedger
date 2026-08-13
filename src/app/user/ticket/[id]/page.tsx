"use client"

import React, { useEffect, useState } from "react"
import { useParams, useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { ETicketInline } from "@/components/user/e-ticket-inline"
import { BookingDetail } from "@/components/user/e-ticket-dialog"
import { ArrowLeft } from "lucide-react"

export default function StandaloneTicketPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const params = useParams()
  const ticketId = params?.id

  const [booking, setBooking] = useState<BookingDetail | null>(null)
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
      return
    }

    if (!ticketId) return

    fetch(`/api/bookings/${ticketId}`)
      .then(res => res.json())
      .then(data => {
        if (data.success) {
          setBooking(data.data)
        }
      })
      .catch(err => console.error("Error fetching ticket", err))
      .finally(() => setLoading(false))

  }, [user, isLoading, router, ticketId])

  if (isLoading || loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-slate-50 text-slate-500 text-sm font-medium">
        Validating Flight Manifest...
      </div>
    )
  }

  if (!booking) {
    return (
      <div className="min-h-screen flex flex-col items-center justify-center bg-[#f9fafb] gap-4">
        <p className="text-slate-500 text-sm font-medium">Ticket not found or inaccessible.</p>
        <button 
          onClick={() => router.push("/user/trips")}
          className="text-sm font-medium px-4 py-2 bg-slate-900 text-white rounded-lg hover:bg-slate-800 transition-colors"
        >
          Return to My Trips
        </button>
      </div>
    )
  }

  return (
    <div className="min-h-dvh bg-slate-100 font-sans relative overflow-x-hidden flex flex-col selection:bg-slate-900 selection:text-white">
      {/* Immersive Background Meshes */}
      <div className="absolute top-0 right-0 -translate-y-1/3 translate-x-1/3 w-[800px] h-[800px] bg-blue-300/20 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-0 left-0 translate-y-1/3 -translate-x-1/3 w-[600px] h-[600px] bg-emerald-400/10 blur-[120px] rounded-full pointer-events-none" />
      
      <div className="relative z-10 w-full max-w-5xl mx-auto px-4 sm:px-8 py-8 sm:py-16">
        <div className="mb-10 print:hidden flex items-center justify-between">
          <button 
            onClick={() => router.push("/user/trips")}
            className="flex items-center gap-2 text-sm font-medium text-slate-500 hover:text-slate-900 transition-colors bg-white/50 px-4 py-2 rounded-full border border-slate-200/60 backdrop-blur-md shadow-sm"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Trips
          </button>
        </div>

        <ETicketInline booking={booking} onDone={() => router.push("/user/trips")} />
      </div>
    </div>
  )
}
