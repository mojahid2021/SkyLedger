"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Phone, Calendar, Shield, Check, ArrowRight } from "lucide-react"

export interface PassengerDetail {
  passengerIndex: number
  firstName: string
  lastName: string
  email: string
  phone: string
  dateOfBirth: string
  passportNumber: string
  passengerType: "adult" | "child" | "infant"
  outboundSeat?: string
  returnSeat?: string
  outboundSeatPrice?: number
  returnSeatPrice?: number
}

interface PassengerInfoDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  passengersCount: number
  defaultUserEmail?: string
  defaultUserName?: string
  onConfirm: (passengers: PassengerDetail[]) => void
}

export function PassengerInfoDialog({
  open,
  onOpenChange,
  passengersCount = 1,
  defaultUserEmail = "",
  defaultUserName = "",
  onConfirm,
}: PassengerInfoDialogProps) {
  const [activePassengerIndex, setActivePassengerIndex] = useState<number>(0)
  const [passengers, setPassengers] = useState<PassengerDetail[]>([])

  useEffect(() => {
    if (open) {
      // Initialize passenger entries
      const names = defaultUserName.split(" ")
      const defaultFirst = names[0] || ""
      const defaultLast = names.slice(1).join(" ") || ""

      const initial: PassengerDetail[] = Array.from({ length: passengersCount }, (_, idx) => ({
        passengerIndex: idx,
        firstName: idx === 0 ? defaultFirst : "",
        lastName: idx === 0 ? defaultLast : "",
        email: idx === 0 ? defaultUserEmail : "",
        phone: "",
        dateOfBirth: "",
        passportNumber: "",
        passengerType: "adult",
      }))
      setPassengers(initial)
      setActivePassengerIndex(0)
    }
  }, [open, passengersCount, defaultUserEmail, defaultUserName])

  const updatePassengerField = (idx: number, field: keyof PassengerDetail, value: string) => {
    setPassengers((prev) =>
      prev.map((p) => (p.passengerIndex === idx ? { ...p, [field]: value } : p))
    )
  }

  const isPassengerValid = (p: PassengerDetail) => {
    return p.firstName.trim().length > 0 && p.lastName.trim().length > 0
  }

  const allValid = passengers.length > 0 && passengers.every(isPassengerValid)

  const handleContinue = () => {
    if (!allValid) return
    onConfirm(passengers)
    onOpenChange(false)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-2xl bg-white border border-delta-hairline p-0 gap-0 overflow-hidden text-delta-ink rounded-[4px]">
        {/* Header */}
        <DialogHeader className="bg-delta-navy p-5 text-white">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <div className="bg-delta-red p-1.5 rounded-[3px] text-white">
                <User className="h-5 w-5" />
              </div>
              <div>
                <DialogTitle className="text-lg font-bold text-white tracking-wide">
                  PASSENGER INFORMATION
                </DialogTitle>
                <DialogDescription className="text-xs text-slate-300">
                  Provide passport and contact details for all ticketed passengers.
                </DialogDescription>
              </div>
            </div>
            <Badge className="bg-white/10 text-white border-white/20 text-[10px] tracking-wider uppercase font-semibold">
              {passengersCount} {passengersCount === 1 ? "Passenger" : "Passengers"}
            </Badge>
          </div>
        </DialogHeader>

        {/* Content Body */}
        <div className="p-6 space-y-5 max-h-[70vh] overflow-y-auto">
          {/* Passenger Selector Tabs */}
          {passengersCount > 1 && (
            <Tabs
              value={activePassengerIndex.toString()}
              onValueChange={(val) => setActivePassengerIndex(parseInt(val, 10))}
              className="w-full"
            >
              <TabsList className="w-full bg-slate-100 p-1 border border-delta-hairline rounded-[4px] grid grid-cols-2 sm:grid-cols-4 gap-1">
                {passengers.map((p, idx) => {
                  const valid = isPassengerValid(p)
                  return (
                    <TabsTrigger
                      key={idx}
                      value={idx.toString()}
                      className="text-xs font-semibold uppercase tracking-wider py-1.5 flex items-center justify-center gap-1.5 data-[state=active]:bg-delta-navy data-[state=active]:text-white transition-colors"
                    >
                      <User className="h-3.5 w-3.5" />
                      <span>Pax {idx + 1}</span>
                      {valid && <Check className="h-3 w-3 text-emerald-500" />}
                    </TabsTrigger>
                  )
                })}
              </TabsList>
            </Tabs>
          )}

          {passengers[activePassengerIndex] && (
            <div className="space-y-4">
              <div className="flex items-center justify-between border-b border-delta-hairline pb-2">
                <span className="text-xs font-bold uppercase tracking-wider text-delta-navy flex items-center gap-2">
                  <User className="h-4 w-4 text-delta-red" />
                  Passenger {activePassengerIndex + 1} Details
                </span>
                <span className="text-[11px] text-delta-ink-muted uppercase">
                  Required for TSA Check-In
                </span>
              </div>

              {/* Name Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-delta-ink-muted">
                    First Name *
                  </label>
                  <Input
                    placeholder="e.g. Alexander"
                    value={passengers[activePassengerIndex].firstName}
                    onChange={(e) =>
                      updatePassengerField(activePassengerIndex, "firstName", e.target.value)
                    }
                    className="h-9 border-delta-hairline text-sm rounded-[4px] focus:border-delta-navy focus:ring-1 focus:ring-delta-navy"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-delta-ink-muted">
                    Last Name *
                  </label>
                  <Input
                    placeholder="e.g. Vance"
                    value={passengers[activePassengerIndex].lastName}
                    onChange={(e) =>
                      updatePassengerField(activePassengerIndex, "lastName", e.target.value)
                    }
                    className="h-9 border-delta-hairline text-sm rounded-[4px] focus:border-delta-navy focus:ring-1 focus:ring-delta-navy"
                  />
                </div>
              </div>

              {/* Contact Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-delta-ink-muted flex items-center gap-1">
                    <Mail className="h-3 w-3" /> Email Address
                  </label>
                  <Input
                    type="email"
                    placeholder="skyledger@gmail.com"
                    value={passengers[activePassengerIndex].email}
                    onChange={(e) =>
                      updatePassengerField(activePassengerIndex, "email", e.target.value)
                    }
                    className="h-9 border-delta-hairline text-sm rounded-[4px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-delta-ink-muted flex items-center gap-1">
                    <Phone className="h-3 w-3" /> Phone Number
                  </label>
                  <Input
                    type="tel"
                    placeholder="+8801736345525"
                    value={passengers[activePassengerIndex].phone}
                    onChange={(e) =>
                      updatePassengerField(activePassengerIndex, "phone", e.target.value)
                    }
                    className="h-9 border-delta-hairline text-sm rounded-[4px]"
                  />
                </div>
              </div>

              {/* Identification Fields */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-delta-ink-muted flex items-center gap-1">
                    <Calendar className="h-3 w-3" /> Date of Birth
                  </label>
                  <Input
                    type="date"
                    value={passengers[activePassengerIndex].dateOfBirth}
                    onChange={(e) =>
                      updatePassengerField(activePassengerIndex, "dateOfBirth", e.target.value)
                    }
                    className="h-9 border-delta-hairline text-sm rounded-[4px]"
                  />
                </div>
                <div className="space-y-1.5">
                  <label className="text-[11px] font-bold uppercase tracking-wider text-delta-ink-muted flex items-center gap-1">
                    <Shield className="h-3 w-3" /> Passport Number
                  </label>
                  <Input
                    placeholder="e.g. A98234102"
                    value={passengers[activePassengerIndex].passportNumber}
                    onChange={(e) =>
                      updatePassengerField(activePassengerIndex, "passportNumber", e.target.value)
                    }
                    className="h-9 border-delta-hairline text-sm rounded-[4px]"
                  />
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Footer Actions */}
        <div className="bg-slate-50 border-t border-delta-hairline p-4 flex items-center justify-between">
          <div className="text-xs text-delta-ink-muted">
            {passengers.filter(isPassengerValid).length} of {passengersCount} passenger details completed
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              onClick={() => onOpenChange(false)}
              className="h-9 border-delta-hairline text-xs font-bold uppercase"
            >
              Cancel
            </Button>
            <Button
              onClick={handleContinue}
              disabled={!allValid}
              className="h-9 bg-delta-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-5 rounded-[4px] flex items-center gap-1.5"
            >
              Proceed to Payment
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}
