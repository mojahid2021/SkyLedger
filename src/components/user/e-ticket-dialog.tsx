"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, Calendar, MapPin, Ticket, User, Printer, CheckCircle2, ShieldCheck } from "lucide-react"

export interface BookingDetail {
  id: number
  booking_reference: string
  origin_code: string
  destination_code: string
  departure_date: string
  return_date?: string
  cabin_class: string
  total_amount: number
  currency: string
  status: "confirmed" | "cancelled"
  created_at: string
  passengers?: Array<{
    id: number
    first_name: string
    last_name: string
    email?: string
    phone?: string
    passport_number?: string
    passenger_type: string
    tickets?: Array<{
      ticket_number: string
      flight_number: string
      airline_name: string
      seat_designator?: string
      segment_type: string
    }>
  }>
}

interface ETicketDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  booking: BookingDetail | null
}

export function ETicketDialog({ open, onOpenChange, booking }: ETicketDialogProps) {
  if (!booking) return null

  const handlePrint = () => {
    window.print()
  }

  const isConfirmed = booking.status === "confirmed"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-white border border-delta-hairline p-0 gap-0 overflow-hidden text-delta-ink rounded-[6px]">
        {/* Printable Ticket Area */}
        <div id="printable-e-ticket" className="p-0">
          {/* Delta Navy Header */}
          <div className="bg-delta-navy p-6 text-white flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="bg-delta-red p-2 rounded-[4px] text-white shrink-0">
                <Plane className="h-6 w-6" />
              </div>
              <div>
                <span className="text-[11px] font-bold tracking-widest text-delta-red uppercase">
                  SKYLEDGER AIRLINES
                </span>
                <DialogTitle className="text-xl font-extrabold text-white tracking-tight">
                  ELECTRONIC BOARDING PASS & PASSENGER RECEIPT
                </DialogTitle>
              </div>
            </div>

            <div className="text-right">
              <span className="text-[10px] uppercase font-bold tracking-wider text-slate-300 block">
                BOOKING REFERENCE (PNR)
              </span>
              <span className="font-mono text-2xl font-black text-white tracking-widest bg-white/10 px-3 py-1 rounded-[4px] border border-white/20 inline-block mt-0.5">
                {booking.booking_reference}
              </span>
            </div>
          </div>

          {/* Ticket Status Bar */}
          <div className="bg-slate-100 border-b border-delta-hairline px-6 py-2.5 flex items-center justify-between text-xs">
            <div className="flex items-center gap-2">
              <span className="font-bold text-delta-navy uppercase tracking-wider">Status:</span>
              {isConfirmed ? (
                <Badge className="bg-emerald-600 text-white border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5 flex items-center gap-1">
                  <CheckCircle2 className="h-3 w-3" /> Confirmed
                </Badge>
              ) : (
                <Badge className="bg-rose-600 text-white border-none text-[10px] font-bold uppercase tracking-wider px-2 py-0.5">
                  Cancelled
                </Badge>
              )}
            </div>
            <div className="text-delta-ink-muted">
              Issued: {new Date(booking.created_at).toLocaleDateString("en-US", { year: "numeric", month: "short", day: "numeric" })}
            </div>
          </div>

          {/* Body Details */}
          <div className="p-6 space-y-6">
            {/* Route & Flight Information Card */}
            <div className="bg-slate-50 border border-delta-hairline rounded-[6px] p-5">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
                {/* Departure */}
                <div className="space-y-1">
                  <span className="text-[11px] font-bold text-delta-navy uppercase tracking-wider block">
                    Origin Airport
                  </span>
                  <span className="text-3xl font-extrabold text-delta-navy font-mono">
                    {booking.origin_code}
                  </span>
                  <span className="text-xs text-delta-ink block flex items-center gap-1">
                    <Calendar className="h-3.5 w-3.5 text-delta-red" />
                    {booking.departure_date}
                  </span>
                </div>

                {/* Flight Indicator */}
                <div className="flex flex-col items-center justify-center text-center px-4">
                  <span className="text-[11px] font-bold text-delta-navy uppercase tracking-wider mb-1">
                    {booking.cabin_class} Class
                  </span>
                  <div className="relative w-full my-2 flex items-center justify-center">
                    <div className="w-full h-[2px] bg-delta-navy" />
                    <div className="absolute bg-slate-50 px-2 text-delta-navy">
                      <Plane className="h-5 w-5 rotate-90" />
                    </div>
                  </div>
                  <span className="text-[11px] text-delta-ink-muted font-mono">
                    Non-Stop · SkyLedger Express
                  </span>
                </div>

                {/* Arrival */}
                <div className="space-y-1 md:text-right">
                  <span className="text-[11px] font-bold text-delta-navy uppercase tracking-wider block">
                    Destination Airport
                  </span>
                  <span className="text-3xl font-extrabold text-delta-navy font-mono">
                    {booking.destination_code}
                  </span>
                  {booking.return_date && (
                    <span className="text-xs text-delta-ink block flex items-center justify-end gap-1">
                      <Calendar className="h-3.5 w-3.5 text-delta-red" />
                      Return: {booking.return_date}
                    </span>
                  )}
                </div>
              </div>
            </div>

            {/* Passengers & Assigned Seats Manifest */}
            <div className="space-y-3">
              <span className="text-xs font-bold uppercase tracking-wider text-delta-navy flex items-center gap-1.5 border-b border-delta-hairline pb-2">
                <User className="h-4 w-4 text-delta-red" />
                Ticketed Passenger Manifest ({booking.passengers?.length || 1})
              </span>

              <div className="divide-y divide-delta-hairline border border-delta-hairline rounded-[6px] overflow-hidden">
                {(booking.passengers || []).map((p, idx) => (
                  <div key={p.id || idx} className="p-4 bg-white hover:bg-slate-50/50 transition-colors">
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div>
                        <span className="text-sm font-bold text-delta-navy uppercase tracking-wide block">
                        {p.first_name} {p.last_name}
                        </span>
                        <div className="text-xs text-delta-ink-muted flex items-center gap-3 mt-0.5">
                          <span>Type: <strong className="uppercase text-delta-navy">{p.passenger_type}</strong></span>
                          {p.passport_number && <span>Passport: <strong className="font-mono text-delta-navy">{p.passport_number}</strong></span>}
                          {p.email && <span>Email: {p.email}</span>}
                        </div>
                      </div>

                      <div className="flex items-center gap-3 flex-wrap">
                        {(p.tickets || []).map((t, tIdx) => (
                          <div key={tIdx} className="bg-slate-100 border border-delta-hairline px-3 py-1.5 rounded-[4px] text-right">
                            <span className="text-[10px] font-bold uppercase tracking-wider text-delta-ink-muted block">
                              {t.segment_type === "return" ? "Return Seat" : "Outbound Seat"}
                            </span>
                            <span className="font-mono text-xs font-bold text-delta-navy">
                              {t.seat_designator || "Unassigned"} ({t.flight_number})
                            </span>
                            <span className="text-[9px] font-mono text-slate-500 block">
                              tkt: {t.ticket_number}
                            </span>
                          </div>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </div>

            {/* Barcode & Payment Receipt */}
            <div className="border border-dashed border-delta-hairline rounded-[6px] p-4 bg-slate-50 flex flex-wrap items-center justify-between gap-4">
              {/* Pseudo Barcode Visual */}
              <div className="space-y-1">
                <span className="text-[10px] font-bold uppercase tracking-wider text-delta-ink-muted block">
                  TSA Security & Boarding Verification Barcode
                </span>
                <div className="bg-white border border-delta-hairline px-3 py-2 rounded flex items-center gap-1 font-mono text-xs tracking-widest select-none">
                  <div className="h-8 flex items-center gap-[2px]">
                    {[4, 2, 6, 1, 4, 2, 7, 3, 1, 5, 2, 6, 3, 1, 4, 5, 2, 8, 2, 4, 1, 6, 3, 5, 2].map((w, i) => (
                      <div key={i} className="bg-black h-full" style={{ width: `${w}px` }} />
                    ))}
                  </div>
                  <span className="ml-3 font-bold text-delta-navy">*{booking.booking_reference}*</span>
                </div>
              </div>

              {/* Total Settlement Details */}
              <div className="text-right space-y-0.5">
                <span className="text-[10px] font-bold uppercase tracking-wider text-delta-ink-muted block">
                  Ledger Wallet Settlement
                </span>
                <span className="text-2xl font-black text-delta-red font-mono">
                  ${Number(booking.total_amount).toFixed(2)} {booking.currency}
                </span>
                <span className="text-[11px] text-emerald-700 font-bold block flex items-center justify-end gap-1">
                  <ShieldCheck className="h-3.5 w-3.5" /> Fully Settled via SkyLedger Wallet
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Action Footer */}
        <div className="bg-slate-100 border-t border-delta-hairline p-4 flex items-center justify-between">
          <div className="text-xs text-delta-ink-muted">
            Present this e-ticket along with valid government ID at airport check-in.
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 border-delta-hairline text-xs font-bold uppercase"
            >
              Close
            </Button>
            <Button
              onClick={handlePrint}
              className="h-9 bg-delta-navy hover:bg-delta-navy-dark text-white text-xs font-bold uppercase tracking-wider px-4 rounded-[4px] flex items-center gap-1.5"
            >
              <Printer className="h-4 w-4" /> Print / Save PDF
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
