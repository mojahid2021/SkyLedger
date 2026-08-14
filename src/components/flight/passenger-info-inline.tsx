"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { User, Mail, Phone, Calendar, Shield, Check, ArrowRight, ArrowLeft } from "lucide-react"

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

interface PassengerInfoInlineProps {
  passengersCount: number
  defaultUserEmail?: string
  defaultUserName?: string
  initialData?: PassengerDetail[]
  onConfirm: (passengers: PassengerDetail[]) => void
  onBack?: () => void
}

export function PassengerInfoInline({
  passengersCount = 1,
  defaultUserEmail = "",
  defaultUserName = "",
  initialData = [],
  onConfirm,
  onBack,
}: PassengerInfoInlineProps) {
  const [activePassengerIndex, setActivePassengerIndex] = useState<number>(0)
  const [passengers, setPassengers] = useState<PassengerDetail[]>([])

  useEffect(() => {
    if (initialData && initialData.length > 0) {
      setPassengers(initialData)
    } else {
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
    }
  }, [passengersCount, defaultUserEmail, defaultUserName, initialData])

  const updatePassengerField = (idx: number, field: keyof PassengerDetail, value: any) => {
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
  }

  return (
    <div className="w-full bg-delta-canvas border border-delta-hairline rounded-sm overflow-hidden shadow-none my-4 font-sans">
      {/* Header Bar */}
      <div className="bg-delta-navy text-white p-4 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2.5">
          <div className="bg-delta-red p-1.5 rounded-sm text-white">
            <User className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide uppercase">
              PASSENGER INFORMATION (STEP 2 OF 3)
            </h3>
            <p className="text-xs text-white/70">
              Enter official passport and contact details for each ticketed traveler.
            </p>
          </div>
        </div>
        <Badge className="bg-delta-navy-mid text-white border border-delta-navy-mid/60 text-[10px] tracking-wider uppercase font-bold px-3 py-1.5 rounded-sm shadow-none">
          {passengersCount} {passengersCount === 1 ? "Passenger" : "Passengers"}
        </Badge>
      </div>

      {/* Body Content */}
      <div className="p-5 space-y-5">
        {/* Passenger Tabs */}
        {passengersCount > 1 && (
          <Tabs
            value={activePassengerIndex.toString()}
            onValueChange={(val) => setActivePassengerIndex(parseInt(val, 10))}
            className="w-full"
          >
            <TabsList className="w-full bg-delta-surface-1 p-1 border border-delta-hairline rounded-sm grid grid-cols-2 sm:grid-cols-4 gap-1 select-none">
              {passengers.map((p, idx) => {
                const valid = isPassengerValid(p)
                return (
                  <TabsTrigger
                    key={idx}
                    value={idx.toString()}
                    className="text-xs font-bold uppercase tracking-wider py-2 flex items-center justify-center gap-1.5 data-[state=active]:bg-delta-navy data-[state=active]:text-white rounded-sm transition-colors cursor-pointer"
                  >
                    <User className="h-3.5 w-3.5" />
                    <span>Pax {idx + 1}</span>
                    {valid && <Check className="h-3.5 w-3.5 text-delta-success font-black" />}
                  </TabsTrigger>
                )
              })}
            </TabsList>
          </Tabs>
        )}

        {passengers[activePassengerIndex] && (
          <div className="space-y-4 bg-delta-surface-1/40 p-4 border border-delta-hairline rounded-sm">
            <div className="flex items-center justify-between border-b border-delta-hairline pb-2 select-none">
              <span className="text-xs font-bold uppercase tracking-wider text-delta-navy flex items-center gap-2">
                <User className="h-4 w-4 text-delta-red" />
                Passenger {activePassengerIndex + 1} Details
              </span>
              <span className="text-[11px] font-bold text-delta-ink-muted uppercase">
                Required for TSA Airport Check-In
              </span>
            </div>

            {/* Name Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy select-none">
                  First Name *
                </label>
                <Input
                  placeholder="e.g. Alexander"
                  value={passengers[activePassengerIndex].firstName}
                  onChange={(e) =>
                    updatePassengerField(activePassengerIndex, "firstName", e.target.value)
                  }
                  className="h-11 border border-delta-hairline text-sm rounded-sm bg-delta-canvas focus-visible:ring-1 focus-visible:ring-delta-navy focus-visible:border-delta-navy shadow-none font-medium text-delta-ink"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy select-none">
                  Last Name *
                </label>
                <Input
                  placeholder="e.g. Vance"
                  value={passengers[activePassengerIndex].lastName}
                  onChange={(e) =>
                    updatePassengerField(activePassengerIndex, "lastName", e.target.value)
                  }
                  className="h-11 border border-delta-hairline text-sm rounded-sm bg-delta-canvas focus-visible:ring-1 focus-visible:ring-delta-navy focus-visible:border-delta-navy shadow-none font-medium text-delta-ink"
                />
              </div>
            </div>

            {/* Contact Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy flex items-center gap-1 select-none">
                  <Mail className="h-3.5 w-3.5 text-delta-ink-muted" /> Email Address
                </label>
                <Input
                  type="email"
                  placeholder="passengers@skyledger.io"
                  value={passengers[activePassengerIndex].email}
                  onChange={(e) =>
                    updatePassengerField(activePassengerIndex, "email", e.target.value)
                  }
                  className="h-11 border border-delta-hairline text-sm rounded-sm bg-delta-canvas focus-visible:ring-1 focus-visible:ring-delta-navy focus-visible:border-delta-navy shadow-none font-medium text-delta-ink"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy flex items-center gap-1 select-none">
                  <Phone className="h-3.5 w-3.5 text-delta-ink-muted" /> Phone Number
                </label>
                <Input
                  type="tel"
                  placeholder="+1 (555) 000-0000"
                  value={passengers[activePassengerIndex].phone}
                  onChange={(e) =>
                    updatePassengerField(activePassengerIndex, "phone", e.target.value)
                  }
                  className="h-11 border border-delta-hairline text-sm rounded-sm bg-delta-canvas focus-visible:ring-1 focus-visible:ring-delta-navy focus-visible:border-delta-navy shadow-none font-medium text-delta-ink"
                />
              </div>
            </div>

            {/* Identification Fields */}
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy flex items-center gap-1 select-none">
                  <Calendar className="h-3.5 w-3.5 text-delta-ink-muted" /> Date of Birth
                </label>
                <Input
                  type="date"
                  value={passengers[activePassengerIndex].dateOfBirth}
                  onChange={(e) =>
                    updatePassengerField(activePassengerIndex, "dateOfBirth", e.target.value)
                  }
                  className="h-11 border border-delta-hairline text-sm rounded-sm bg-delta-canvas focus-visible:ring-1 focus-visible:ring-delta-navy focus-visible:border-delta-navy shadow-none font-medium text-delta-ink"
                />
              </div>
              <div className="space-y-1.5">
                <label className="text-[11px] font-bold uppercase tracking-wider text-delta-navy flex items-center gap-1 select-none">
                  <Shield className="h-3.5 w-3.5 text-delta-ink-muted" /> Passport Number
                </label>
                <Input
                  placeholder="e.g. A98234102"
                  value={passengers[activePassengerIndex].passportNumber}
                  onChange={(e) =>
                    updatePassengerField(activePassengerIndex, "passportNumber", e.target.value)
                  }
                  className="h-11 border border-delta-hairline text-sm rounded-sm bg-delta-canvas focus-visible:ring-1 focus-visible:ring-delta-navy focus-visible:border-delta-navy shadow-none font-medium text-delta-ink"
                />
              </div>
            </div>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-delta-hairline">
          <div className="text-xs font-bold text-delta-ink-muted select-none">
            {passengers.filter(isPassengerValid).length} of {passengersCount} traveler details completed
          </div>
          <div className="flex items-center gap-2">
            {onBack && (
              <Button 
                variant="outline" 
                size="sm" 
                onClick={onBack} 
                className="border border-delta-navy text-delta-navy bg-delta-canvas hover:bg-delta-surface-1 rounded-sm text-xs font-bold px-4 py-2 cursor-pointer select-none"
              >
                <ArrowLeft className="h-4 w-4" /> Back to Seats
              </Button>
            )}
            <Button
              onClick={handleContinue}
              disabled={!allValid}
              className="bg-delta-red hover:bg-delta-red-hover text-white text-xs font-bold uppercase tracking-wider px-6 h-10 rounded-sm flex items-center gap-1.5 cursor-pointer shadow-none select-none transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <span>Proceed to Checkout</span>
              <ArrowRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
