"use client"

import React from "react"
import {
  Dialog,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog"
import { ETicketInline } from "@/components/user/e-ticket-inline"

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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent showCloseButton={false} className="max-w-4xl p-0 bg-transparent border-0 shadow-none outline-none">
        <DialogTitle className="sr-only">Your Flight Boarding Pass & Ticket</DialogTitle>
        <ETicketInline 
          booking={booking} 
          onDone={() => onOpenChange(false)}
        />
      </DialogContent>
    </Dialog>
  )
}
