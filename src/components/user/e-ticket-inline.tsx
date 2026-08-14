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
      className="w-full flex flex-col md:flex-row shadow-[0_40px_80px_-20px_rgba(0,0,0,0.08)] rounded-[2rem] overflow-hidden bg-white print:shadow-none print:border print:border-slate-200"
    >
      
      <div className="flex-1 flex flex-col">
        {/* Top Half: Flight Route & Status (Dark Airline Aesthetics) */}
        <div className="bg-slate-900 text-white p-8 md:p-12 relative overflow-hidden">
          <div className="absolute top-0 right-0 w-[400px] h-[400px] bg-blue-500/10 blur-[100px] rounded-full pointer-events-none translate-x-1/4 -translate-y-1/4" />
          
          <div className="relative z-10 flex justify-between items-start mb-12 border-b border-white/10 pb-8">
             <div className="flex items-center gap-4">
               <div className="bg-white/10 p-3 rounded-[14px] backdrop-blur-md border border-white/10 shadow-inner">
                  <AirplaneTilt weight="fill" className="h-7 w-7 text-white" />
               </div>
               <div>
                  <h2 className="text-2xl font-medium tracking-tight text-white leading-none mb-1">SkyLedger</h2>
                  <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400">Electronic Boarding Pass</p>
               </div>
             </div>
             {isConfirmed ? (
                <div className="flex items-center gap-1.5 bg-emerald-500/10 border border-emerald-500/20 text-emerald-400 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                  <CheckCircle weight="fill" className="h-4 w-4" /> Confirmed
                </div>
             ) : (
                <div className="flex items-center gap-1.5 bg-rose-500/10 border border-rose-500/20 text-rose-400 px-3 py-1.5 rounded-full text-[10px] font-bold uppercase tracking-widest backdrop-blur-sm">
                  <XCircle weight="fill" className="h-4 w-4" /> Cancelled
                </div>
             )}
          </div>

          <div className="relative z-10 flex items-center justify-between">
             <div className="w-[100px]">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Origin</p>
                <p className="text-5xl md:text-6xl font-semibold tracking-[-0.04em] text-white">{booking.origin_code}</p>
             </div>
             
             <div className="flex-1 px-4 md:px-12 relative flex items-center justify-center">
                <div className="w-full border-t-2 border-slate-700/50 border-dashed absolute top-1/2 -translate-y-1/2" />
                <div className="bg-slate-900 px-4 py-2 relative z-10 border-2 border-slate-800 rounded-full flex flex-col items-center justify-center gap-1 shadow-xl">
                   <AirplaneTilt weight="fill" className="h-5 w-5 text-slate-300 rotate-90" />
                </div>
                {/* Flight date anchored in center */}
                <div className="absolute -bottom-8 w-full text-center text-xs font-medium text-slate-400">
                  {booking.departure_date}
                </div>
             </div>

             <div className="text-right w-[100px]">
                <p className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-2">Dest</p>
                <p className="text-5xl md:text-6xl font-semibold tracking-[-0.04em] text-white">{booking.destination_code}</p>
             </div>
          </div>
        </div>

        {/* Bottom Half: Passenger Manifest */}
        <div className="bg-white p-8 md:p-12 relative flex-1">
          <h4 className="text-[11px] font-bold text-slate-400 uppercase tracking-widest mb-6 flex items-center gap-2">
             <User weight="bold" className="h-4 w-4" /> Official Passenger Manifest
          </h4>
          <div className="flex flex-col gap-4">
             {(booking.passengers || []).map((p, i) => (
                 <motion.div 
                   key={p.id || i}
                   initial={reduceMotion ? false : { opacity: 0, y: 8 }}
                   animate={{ opacity: 1, y: 0 }}
                   transition={{ delay: 0.3 + (i * 0.1), duration: 0.5 }}
                   className="flex flex-col md:flex-row md:items-center justify-between p-5 rounded-2xl bg-slate-50/70 border border-slate-100 hover:bg-slate-50 transition-colors"
                 >
                    <div className="mb-4 md:mb-0">
                      <p className="text-lg font-semibold tracking-tight text-slate-900">{p.first_name} {p.last_name}</p>
                      <p className="text-[10px] font-bold uppercase tracking-widest text-slate-500 mt-1.5 flex flex-wrap items-center gap-2">
                        <span className="bg-slate-200/60 px-2 py-0.5 rounded-sm">{p.passenger_type}</span>
                        <span>{p.tickets?.[0]?.airline_name || "SL Express Group"}</span>
                        <span className="bg-blue-100 text-blue-800 px-2 py-0.5 rounded-sm">{getCabinClassLabel(booking.cabin_class)}</span>
                      </p>
                    </div>
                    {p.tickets && p.tickets.length > 0 && (
                       <div className="flex gap-8 md:gap-12">
                          <div>
                             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Flight No.</p>
                             <p className="text-xl font-mono font-medium tracking-tight text-slate-900">{p.tickets[0].flight_number}</p>
                          </div>
                          <div className="text-right">
                             <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-1">Seat Assignment</p>
                             <p className="text-xl font-mono font-medium tracking-tight text-slate-900">{p.tickets[0].seat_designator || "TBA"}</p>
                          </div>
                       </div>
                    )}
                 </motion.div>
             ))}
          </div>
        </div>
      </div>

      {/* Right Ticket Stub (25%) */}
      <div className="w-full md:w-[320px] bg-[#f8fafc] border-t md:border-t-0 md:border-l border-dashed border-slate-300 p-8 md:p-10 flex flex-col justify-between relative print:break-inside-avoid">
        
        <div className="space-y-8">
           <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Booking Reference</p>
              <p className="text-3xl font-mono tracking-tight font-semibold text-slate-900">{booking.booking_reference}</p>
           </div>
           
           <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Date Issued</p>
              <p className="text-sm font-medium text-slate-900">
                {new Date(booking.created_at).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
              </p>
           </div>

           <div>
              <p className="text-[10px] font-bold uppercase tracking-widest text-slate-400 mb-2">Total Settled</p>
              <p className="text-2xl font-semibold tracking-tight text-slate-900">
                ৳{Number(booking.total_amount).toFixed(2)} <span className="text-sm text-slate-400 ml-1">{booking.currency}</span>
              </p>
              <div className="flex items-center gap-1.5 text-emerald-600 mt-2 bg-emerald-50 px-2.5 py-1 rounded w-fit">
                   <ShieldCheck weight="fill" className="h-4 w-4" />
                   <span className="text-[10px] font-bold uppercase tracking-widest text-emerald-700">Account Paid</span>
              </div>
           </div>
        </div>
        
        <div className="mt-12 space-y-6">
           <div className="h-24 w-full flex flex-col items-center justify-center bg-white border border-slate-200 rounded-[14px] overflow-hidden relative shadow-sm">
               <Barcode weight="thin" className="w-[150%] h-[120px] text-slate-800 opacity-80" />
           </div>
           
           <div className="flex flex-col gap-2.5 print:hidden">
              <button onClick={handlePrint} className="w-full h-12 rounded-xl bg-slate-900 text-white font-medium text-sm flex items-center justify-center gap-2 transition-transform hover:scale-[0.98] active:scale-[0.95] shadow-md hover:shadow-lg">
                 <DownloadSimple weight="bold" className="h-[18px] w-[18px]" /> Save PDF
              </button>
              {onDone && (
                <button onClick={onDone} className="w-full h-12 rounded-xl bg-slate-200/50 text-slate-600 font-medium text-sm transition-colors hover:bg-slate-200 hover:text-slate-900">
                   Back to Center
                </button>
              )}
           </div>
        </div>
      </div>

    </motion.div>
  )
}
