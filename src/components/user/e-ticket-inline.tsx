"use client"

import React from "react"
import { motion, useReducedMotion } from "framer-motion"
import {
  AirplaneTilt,
  User,
  CheckCircle,
  XCircle,
  DownloadSimple,
  Barcode,
  ShieldCheck,
} from "@phosphor-icons/react"
import { BookingDetail } from "@/components/user/e-ticket-dialog"

interface ETicketInlineProps {
  booking: BookingDetail | null
  onDone?: () => void
}

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

export function ETicketInline({ booking, onDone }: ETicketInlineProps) {
  const reduceMotion = useReducedMotion()
  
  if (!booking) return null

  const handlePrint = () => {
    window.print()
  }

  const isConfirmed = booking.status === "confirmed"

  return (
    <motion.div 
      initial={reduceMotion ? { opacity: 1 } : { opacity: 0, y: 24, scale: 0.98 }}
      animate={{ opacity: 1, y: 0, scale: 1 }}
      transition={{ duration: 0.7, ease: [0.16, 1, 0.3, 1] }}
      className="w-full flex flex-col md:flex-row border border-delta-hairline rounded-sm overflow-hidden bg-delta-canvas print:border print:border-delta-hairline font-sans"
    >
      
      <div className="flex-1 flex flex-col">
        {/* Top Half: Flight Route & Status (Dark Airline Aesthetics) */}
        <div className="bg-delta-navy text-white p-8 md:p-12 relative overflow-hidden">
          
          <div className="relative z-10 flex justify-between items-start mb-12 border-b border-white/10 pb-8">
             <div className="flex items-center gap-4">
               <div className="bg-white/15 p-3 rounded-sm border border-white/10">
                  <AirplaneTilt weight="fill" className="h-7 w-7 text-white" />
               </div>
               <div>
                  <h2 className="text-2xl font-bold tracking-tight text-white leading-none mb-1">SkyLedger</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-white/60">Electronic Boarding Pass</p>
               </div>
             </div>
             {isConfirmed ? (
                <div className="flex items-center gap-1.5 bg-delta-success/20 border border-delta-success text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                  <CheckCircle weight="fill" className="h-4 w-4 text-white" /> Confirmed
                </div>
             ) : (
                <div className="flex items-center gap-1.5 bg-delta-error/20 border border-delta-error text-white px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                  <XCircle weight="fill" className="h-4 w-4 text-white" /> Cancelled
                </div>
             )}
          </div>

          <div className="relative z-10 flex items-center justify-between">
             <div className="w-[100px]">
                <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2">Origin</p>
                <p className="text-5xl md:text-6xl font-bold tracking-[-0.04em] text-white uppercase">{booking.origin_code}</p>
             </div>
             
             <div className="flex-1 px-4 md:px-12 relative flex items-center justify-center">
                <div className="w-full border-t-2 border-white/20 border-dashed absolute top-1/2 -translate-y-1/2" />
                <div className="bg-delta-navy px-4 py-2 relative z-10 border-2 border-delta-navy-mid rounded-full flex flex-col items-center justify-center gap-1">
                   <AirplaneTilt weight="fill" className="h-5 w-5 text-white/80 rotate-90" />
                </div>
                {/* Flight date anchored in center */}
                <div className="absolute -bottom-8 w-full text-center text-xs font-bold text-white/80">
                  {booking.departure_date}
                </div>
             </div>

             <div className="text-right w-[100px]">
                <p className="text-[11px] font-bold text-white/60 uppercase tracking-widest mb-2">Dest</p>
                <p className="text-5xl md:text-6xl font-bold tracking-[-0.04em] text-white uppercase">{booking.destination_code}</p>
             </div>
          </div>
        </div>

        {/* Bottom Half: Passenger Manifest */}
        <div className="bg-delta-canvas p-8 md:p-12 relative flex-1">
          <h4 className="text-[12px] font-bold text-delta-navy uppercase tracking-widest mb-6 flex items-center gap-2 select-none">
             <User weight="bold" className="h-4 w-4" /> Official Passenger Manifest
          </h4>
          <div className="flex flex-col gap-4">
             {(booking.passengers || []).map((p, i) => (
                 <motion.div 
                   key={p.id || i}
                   initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                   className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-sm bg-delta-surface-1 border border-delta-hairline hover:bg-delta-surface-2 transition-colors"
                 >
                    <div className="mb-4 md:mb-0">
                       <p className="text-lg font-bold tracking-tight text-delta-navy">{p.first_name} {p.last_name}</p>
                       <p className="text-[10px] font-bold uppercase tracking-widest text-delta-ink-muted mt-1.5 flex flex-wrap items-center gap-2">
                         <span className="bg-delta-surface-2 text-delta-ink px-2 py-0.5 rounded-sm">{p.passenger_type}</span>
                         <span>{p.tickets?.[0]?.airline_name || "SL Express Group"}</span>
                         <span className="bg-delta-navy-mid/20 text-delta-navy-mid px-2 py-0.5 rounded-sm">{getCabinClassLabel(booking.cabin_class)}</span>
                       </p>
                    </div>
                    {p.tickets && p.tickets.length > 0 && (
                       <div className="flex gap-8 md:gap-12">
                          <div>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-delta-ink-muted mb-1">Flight No.</p>
                             <p className="text-xl font-mono font-bold tracking-tight text-delta-navy">{p.tickets[0].flight_number}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-delta-ink-muted mb-1">Seat Assignment</p>
                             <p className="text-xl font-mono font-bold tracking-tight text-delta-navy">{p.tickets[0].seat_designator || "TBA"}</p>
                          </div>
                       </div>
                    )}
                 </motion.div>
             ))}
          </div>
        </div>
      </div>

      {/* Right Ticket Stub (25%) */}
      <div className="w-full md:w-[320px] bg-delta-surface-1 border-t md:border-t-0 md:border-l border-dashed border-delta-hairline p-8 md:p-10 flex flex-col justify-between relative print:break-inside-avoid">
        
        <div className="space-y-8">
           <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-delta-ink-muted mb-2">Booking Reference</p>
              <p className="text-3xl font-mono tracking-tight font-bold text-delta-navy">{booking.booking_reference}</p>
           </div>
           
           <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-delta-ink-muted mb-2">Date Issued</p>
              <p className="text-sm font-bold text-delta-navy">
                {new Date(booking.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
           </div>

           <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-delta-ink-muted mb-2">Total Settled</p>
              <p className="text-3xl font-bold tracking-tight text-delta-red font-sans">
                ৳{Number(booking.total_amount).toFixed(2)}
              </p>
              <div className="flex items-center gap-1.5 text-delta-success mt-2 bg-delta-success/10 px-2.5 py-1 rounded-sm w-fit border border-delta-success/20">
                   <ShieldCheck weight="fill" className="h-4 w-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest">Account Paid</span>
              </div>
           </div>
        </div>
        
        <div className="mt-12 space-y-6">
           <div className="h-24 w-full flex flex-col items-center justify-center bg-delta-canvas border border-delta-hairline rounded-sm overflow-hidden relative">
               <Barcode weight="thin" className="w-[150%] h-[120px] text-delta-ink opacity-80" />
           </div>
           
           <div className="flex flex-col gap-2.5 print:hidden">
              <button onClick={handlePrint} className="w-full h-12 rounded-sm bg-delta-red text-white hover:bg-delta-red-hover font-bold text-sm flex items-center justify-center gap-2 transition-colors cursor-pointer select-none">
                 <DownloadSimple weight="bold" className="h-[18px] w-[18px]" /> Save PDF
              </button>
              {onDone && (
                <button onClick={onDone} className="w-full h-12 rounded-sm border border-delta-navy text-delta-navy hover:bg-delta-surface-2 bg-delta-canvas font-bold text-sm transition-colors cursor-pointer select-none">
                   Back to Center
                </button>
              )}
           </div>
        </div>
      </div>

    </motion.div>
  )
}
