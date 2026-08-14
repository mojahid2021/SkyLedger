"use client"

import React, { useState, useEffect } from "react"
import { Plane, CreditCard, ShieldCheck, AlertCircle, Loader2, ChevronRight, ChevronLeft, User, Check, Wallet } from "lucide-react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { PassengerDetail } from "@/components/flight/passenger-info-inline"
import { SelectedSeatChoice } from "@/types/seat-map"

interface CheckoutInlineProps {
  offer: any
  selectedSeats: SelectedSeatChoice[]
  passengers: PassengerDetail[]
  routeInfo: {
    origin: string
    destination: string
    departureDate: string
    returnDate?: string
    cabinClass?: string
  }
  onBookingComplete: (booking: any) => void
  onBack?: () => void
}

const PAX_COLORS = [
  { bg: "bg-red-100",    text: "text-red-700",    border: "border-red-300"    },
  { bg: "bg-sky-100",    text: "text-sky-700",    border: "border-sky-300"    },
  { bg: "bg-green-100",  text: "text-green-700",  border: "border-green-300"  },
  { bg: "bg-orange-100", text: "text-orange-700", border: "border-orange-300" },
]


function getInitials(first: string, last: string) {
  return ((first?.[0] || "") + (last?.[0] || "")).toUpperCase() || "?"
}

export function CheckoutInline({
  offer,
  selectedSeats = [],
  passengers = [],
  routeInfo,
  onBookingComplete,
  onBack,
}: CheckoutInlineProps) {
  const { user } = useAuth()
  const router = useRouter()
  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [loadingBalance, setLoadingBalance] = useState<boolean>(false)
  const [submitting, setSubmitting] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => { if (user?.id) fetchWallet() }, [user?.id])

  async function fetchWallet() {
    setLoadingBalance(true)
    try {
      const res  = await fetch(`/api/accounts`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        const w = data.data.find((a: any) => a.user_id === user?.id)
        setWalletBalance(w ? parseFloat(w.balance || "0") : 0)
      }
    } catch { setWalletBalance(0) }
    finally { setLoadingBalance(false) }
  }

  if (!offer) return null

  // Fare calculation
  const baseFarePerPax = parseFloat(offer.total_amount || "0") / (passengers.length || 1)
  let adjustedBase = 0
  passengers.forEach((_, idx) => {
    let mult = 1.0
    selectedSeats.filter((s) => s.passengerIndex === idx).forEach((s) => {
      const m = s.cabinClass === "first" ? 3.0 : s.cabinClass === "business" ? 2.2 : s.cabinClass === "premium_economy" ? 1.35 : 1.0
      if (m > mult) mult = m
    })
    adjustedBase += baseFarePerPax * mult
  })

  const taxPercentage     = offer.tax_percentage || 0
  const totalSeatFee      = selectedSeats.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
  const totalSeatFeeWithTax = totalSeatFee + (totalSeatFee * (taxPercentage / 100))
  const finalTotalAmount  = (adjustedBase + totalSeatFeeWithTax).toFixed(2)
  const totalNum          = parseFloat(finalTotalAmount)
  const currency          = offer.total_currency || "BDT"

  const owner        = offer.owner || {}
  const ownerName    = owner.name || "Airline"
  const firstSlice   = offer.slices?.[0]
  const firstSeg     = firstSlice?.segments?.[0]
  const carrierCode  = firstSeg?.operating_carrier?.iata_code || owner.iata_code || "DL"
  const rawFlightNum = firstSeg?.operating_carrier_flight_number || firstSeg?.marketing_carrier_flight_number || "101"
  const flightNumber = rawFlightNum.toString().includes(carrierCode) ? rawFlightNum : `${carrierCode}-${rawFlightNum}`

  const canAfford  = walletBalance !== null && walletBalance >= totalNum
  const balAfter   = (walletBalance || 0) - totalNum

  const cabinLabel = (routeInfo.cabinClass || "economy") === "premium_economy" ? "Premium Economy"
    : (routeInfo.cabinClass || "economy") === "business" ? "Business"
    : (routeInfo.cabinClass || "economy") === "first" ? "First Class"
    : "Economy"

  const handlePay = async () => {
    if (!user?.id || !canAfford) return
    setSubmitting(true); setError(null)

    try {
      const formattedPassengers = passengers.map((p, idx) => {
        const seatChoices = selectedSeats.filter((s) => s.passengerIndex === idx)
        return {
          firstName: p.firstName, lastName: p.lastName, email: p.email || user.email,
          phone: p.phone, dateOfBirth: p.dateOfBirth, passportNumber: p.passportNumber,
          passengerType: p.passengerType || "adult",
          outboundSeat: seatChoices[0]?.seatDesignator,
          outboundSeatPrice: seatChoices[0]?.totalAmount || 0,
          returnSeat: seatChoices[1]?.seatDesignator,
          returnSeatPrice: seatChoices[1]?.totalAmount || 0,
        }
      })

      let highestCabin = routeInfo.cabinClass || "economy"
      selectedSeats.forEach((s: any) => {
        if (s.cabinClass === "first") highestCabin = "first"
        else if (s.cabinClass === "business" && highestCabin !== "first") highestCabin = "business"
        else if (s.cabinClass === "premium_economy" && highestCabin !== "first" && highestCabin !== "business") highestCabin = "premium_economy"
      })

      const res  = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          userId: user.id, flightId: offer.id,
          originCode: routeInfo.origin, destinationCode: routeInfo.destination,
          departureDate: routeInfo.departureDate, returnDate: routeInfo.returnDate,
          cabinClass: highestCabin, totalAmount: totalNum, currency,
          flightNumber, airlineCode: carrierCode, airlineName: ownerName,
          passengers: formattedPassengers,
        }),
      })
      const data = await res.json()

      if (data.success) {
        onBookingComplete({
          id: data.data.bookingId,
          booking_reference: data.data.bookingReference,
          origin_code: routeInfo.origin, destination_code: routeInfo.destination,
          departure_date: routeInfo.departureDate, return_date: routeInfo.returnDate,
          cabin_class: highestCabin, total_amount: totalNum, currency,
          status: "confirmed", created_at: new Date().toISOString(),
          passengers: formattedPassengers.map((p, idx) => ({
            id: idx + 1,
            first_name: p.firstName, last_name: p.lastName,
            email: p.email, phone: p.phone,
            passport_number: p.passportNumber, passenger_type: p.passengerType,
            tickets: [{
              ticket_number: `006-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
              flight_number: flightNumber, airline_name: ownerName,
              seat_designator: p.outboundSeat, segment_type: "outbound",
            }],
          })),
        })
      } else {
        setError(data.error || "Failed to complete booking payment.")
      }
    } catch (err: any) {
      setError(err.message || "An error occurred during payment processing.")
    } finally {
      setSubmitting(false)
    }
  }

  return (
    <div className="bg-delta-canvas border border-delta-hairline rounded-sm overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="bg-delta-navy px-5 py-4 flex items-center gap-2.5">
        <div className="bg-delta-red p-1.5 rounded-sm">
          <CreditCard className="h-4 w-4 text-white" />
        </div>
        <div>
          <h3 className="text-sm font-bold text-white uppercase tracking-wide">Checkout & Payment</h3>
          <p className="text-xs text-white/60 mt-0.5">Review your booking and confirm payment</p>
        </div>
      </div>

      <div className="p-5 space-y-5">
        {/* Route card */}
        <div className="bg-delta-surface-1 border border-delta-hairline rounded-sm p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-delta-hairline pb-2.5">
            <span className="text-xs font-bold uppercase tracking-wider text-delta-navy flex items-center gap-1.5">
              <Plane className="h-4 w-4 text-delta-red" />
              {ownerName} · {flightNumber}
            </span>
            <span className="text-[10px] font-bold uppercase tracking-wider bg-delta-navy text-white px-2 py-0.5 rounded-sm">
              {cabinLabel}
            </span>
          </div>
          <div className="flex items-center justify-between text-delta-navy">
            <div>
              <span className="text-2xl font-bold uppercase">{routeInfo.origin}</span>
              <span className="text-xs text-delta-ink-muted block font-medium mt-0.5">{routeInfo.departureDate}</span>
            </div>
            <div className="flex items-center gap-2 text-delta-ink-muted">
              <div className="h-[1px] w-10 bg-delta-hairline" />
              <Plane className="h-4 w-4 rotate-90 text-delta-navy" />
              <div className="h-[1px] w-10 bg-delta-hairline" />
            </div>
            <div className="text-right">
              <span className="text-2xl font-bold uppercase">{routeInfo.destination}</span>
              {routeInfo.returnDate && (
                <span className="text-xs text-delta-ink-muted block font-medium mt-0.5">Return: {routeInfo.returnDate}</span>
              )}
            </div>
          </div>
        </div>

        {/* Passengers & seats */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold uppercase tracking-wider text-delta-navy flex items-center gap-1.5 select-none">
            <User className="h-3.5 w-3.5 text-delta-red" />
            Ticketed Travelers ({passengers.length})
          </span>
          <div className="border border-delta-hairline rounded-sm overflow-hidden bg-delta-canvas">
            {passengers.map((p, idx) => {
              const seatChoices = selectedSeats.filter((s) => s.passengerIndex === idx)
              const colors = PAX_COLORS[idx % PAX_COLORS.length]
              const initials = getInitials(p.firstName, p.lastName)
              return (
                <div
                  key={idx}
                  className="p-3.5 flex items-center justify-between border-b border-delta-hairline last:border-0"
                >
                  <div className="flex items-center gap-2.5">
                    <div className={`w-7 h-7 rounded-sm flex items-center justify-center text-[11px] font-bold border ${colors.bg} ${colors.text} ${colors.border}`}>
                      {initials || (idx + 1)}
                    </div>
                    <div>
                      <span className="text-sm font-bold text-delta-navy block">{p.firstName} {p.lastName}</span>
                      <span className="text-[11px] text-delta-ink-muted capitalize">{p.passengerType}</span>
                    </div>
                  </div>
                  <div className="flex items-center gap-1.5">
                    {seatChoices.length > 0 ? (
                      seatChoices.map((s, sIdx) => (
                        <span key={sIdx} className="bg-delta-navy text-white px-2 py-0.5 rounded-sm font-mono text-[10px] font-bold">
                          {s.seatDesignator}
                        </span>
                      ))
                    ) : (
                      <span className="text-[11px] text-delta-ink-muted italic">Standard seating</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Receipt-style fare breakdown */}
        <div className="border border-delta-hairline rounded-sm overflow-hidden">
          <div className="bg-delta-surface-1 px-4 py-2.5 border-b border-delta-hairline">
            <span className="text-[11px] font-bold uppercase tracking-wider text-delta-navy">Fare Breakdown</span>
          </div>
          <div className="p-4 space-y-2.5 bg-delta-canvas">
            <div className="flex items-center justify-between text-sm">
              <span className="text-delta-ink-muted">Standard Base Fare ({passengers.length} pax)</span>
              <span className="font-mono font-bold text-delta-ink">৳{parseFloat(offer.total_amount || "0").toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
            {adjustedBase - parseFloat(offer.total_amount || "0") > 0 && (
              <div className="flex items-center justify-between text-sm text-delta-navy">
                <span className="font-medium">Premium Cabin Upgrade</span>
                <span className="font-mono font-bold">+৳{(adjustedBase - parseFloat(offer.total_amount || "0")).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            {totalSeatFeeWithTax > 0 && (
              <div className="flex items-center justify-between text-sm">
                <span className="text-delta-ink-muted">Seat Selection Fee</span>
                <span className="font-mono font-bold text-delta-ink">+৳{totalSeatFeeWithTax.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
              </div>
            )}
            {/* Dotted separator */}
            <div className="border-t border-dashed border-delta-hairline pt-2.5">
              <div className="flex items-center justify-between">
                <span className="text-sm font-bold text-delta-navy">Total Amount Due</span>
                <span className="text-2xl font-bold text-delta-red">৳{Number(finalTotalAmount).toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })} <span className="text-xs text-delta-ink-muted font-normal">{currency}</span></span>
              </div>
            </div>
          </div>
        </div>

        {/* Wallet */}
        <div className={`border rounded-sm overflow-hidden ${canAfford ? "border-delta-success/30" : "border-delta-error/30"}`}>
          <div className={`px-4 py-2.5 border-b flex items-center justify-between ${canAfford ? "bg-delta-success/8 border-delta-success/20" : "bg-delta-error/8 border-delta-error/20"}`}>
            <span className="text-[11px] font-bold uppercase tracking-wider text-delta-navy flex items-center gap-1.5">
              <Wallet className="h-3.5 w-3.5 text-delta-navy-mid" />
              SkyLedger Asset Wallet
            </span>
            {loadingBalance ? (
              <Loader2 className="h-4 w-4 animate-spin text-delta-navy" />
            ) : (
              <span className={`font-mono font-bold text-sm px-2 py-0.5 rounded-sm border ${
                canAfford
                  ? "text-delta-success bg-delta-success/10 border-delta-success/25"
                  : "text-delta-error bg-delta-error/10 border-delta-error/25"
              }`}>
                ৳{(walletBalance || 0).toFixed(2)}
              </span>
            )}
          </div>

          <div className="p-4 bg-delta-canvas space-y-2.5">
            {!loadingBalance && canAfford && (
              <>
                <div className="flex items-center gap-2 text-delta-success text-xs font-bold">
                  <ShieldCheck className="h-4 w-4 shrink-0" />
                  <span>Balance verified. Ready to confirm booking.</span>
                </div>
                <div className="flex items-center justify-between text-xs border-t border-delta-hairline-light pt-2.5">
                  <span className="text-delta-ink-muted">Balance after booking</span>
                  <span className="font-mono font-bold text-delta-ink">৳{balAfter.toFixed(2)}</span>
                </div>
              </>
            )}
            {!loadingBalance && !canAfford && (
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                <div className="flex items-start gap-2 text-delta-error">
                  <AlertCircle className="h-4 w-4 shrink-0 mt-0.5 animate-pulse" />
                  <div>
                    <p className="text-xs font-bold">Insufficient balance</p>
                    <p className="text-[11px] text-delta-ink-muted mt-0.5">
                      Need additional <strong className="font-mono text-delta-ink">৳{(totalNum - (walletBalance || 0)).toFixed(2)}</strong>
                    </p>
                  </div>
                </div>
                <button
                  onClick={() => router.push("/user/wallet")}
                  className="shrink-0 h-9 px-4 rounded-sm bg-delta-red hover:bg-delta-red-hover text-white text-xs font-bold uppercase tracking-wider transition-colors cursor-pointer"
                >
                  Top Up Wallet
                </button>
              </div>
            )}
          </div>
        </div>

        {/* Error */}
        {error && (
          <div className="flex items-start gap-2.5 bg-delta-error/10 border border-delta-error/25 rounded-sm p-3.5">
            <AlertCircle className="h-4 w-4 text-delta-error shrink-0 mt-0.5" />
            <p className="text-xs text-delta-error font-medium">{error}</p>
          </div>
        )}

        {/* Actions */}
        <div className="flex items-center justify-between pt-4 border-t border-delta-hairline">
          {onBack && (
            <button
              onClick={onBack}
              disabled={submitting}
              className="h-10 px-4 rounded-sm border border-delta-navy text-delta-navy bg-delta-canvas hover:bg-delta-surface-1 text-xs font-bold flex items-center gap-1.5 transition-colors cursor-pointer disabled:opacity-40"
            >
              <ChevronLeft className="h-4 w-4" /> Back
            </button>
          )}

          <button
            onClick={handlePay}
            disabled={!canAfford || submitting || loadingBalance}
            className="ml-auto h-12 px-8 rounded-sm bg-delta-red hover:bg-delta-red-hover text-white font-bold text-sm flex items-center gap-3 transition-colors cursor-pointer shadow-none disabled:opacity-40 disabled:cursor-not-allowed"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Processing Payment...</span>
              </>
            ) : (
              <>
                <span>Confirm & Pay ৳{finalTotalAmount}</span>
                <ChevronRight className="h-4 w-4" />
              </>
            )}
          </button>
        </div>
      </div>
    </div>
  )
}
