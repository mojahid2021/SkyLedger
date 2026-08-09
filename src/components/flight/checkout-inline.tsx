"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, CreditCard, ShieldCheck, AlertCircle, Loader2, ArrowRight, ArrowLeft, User } from "lucide-react"
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

  useEffect(() => {
    if (user?.id) {
      fetchUserWallet()
    }
  }, [user?.id])

  async function fetchUserWallet() {
    setLoadingBalance(true)
    setError(null)
    try {
      const res = await fetch(`/api/accounts`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        const userWallet = data.data.find((a: any) => a.user_id === user?.id)
        if (userWallet) {
          setWalletBalance(parseFloat(userWallet.balance || "0"))
        } else {
          setWalletBalance(0)
        }
      }
    } catch {
      setWalletBalance(0)
    } finally {
      setLoadingBalance(false)
    }
  }

  if (!offer) return null

  const baseFare = parseFloat(offer.total_amount || "0")
  const totalSeatFee = selectedSeats.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
  const finalTotalAmount = (baseFare + totalSeatFee).toFixed(2)
  const totalNum = parseFloat(finalTotalAmount)
  const currency = offer.total_currency || "USD"

  const owner = offer.owner || {}
  const ownerName = owner.name || "Airline"
  const firstSlice = offer.slices?.[0]
  const firstSeg = firstSlice?.segments?.[0]
  const flightNumber = firstSeg?.operating_carrier_flight_number || firstSeg?.marketing_carrier_flight_number || "SKL-101"
  const carrierCode = firstSeg?.operating_carrier?.iata_code || owner.iata_code || "DL"

  const canAfford = walletBalance !== null && walletBalance >= totalNum

  const handleConfirmPayment = async () => {
    if (!user?.id || !canAfford) return

    setSubmitting(true)
    setError(null)

    try {
      const formattedPassengers = passengers.map((p, idx) => {
        const passSeatChoices = selectedSeats.filter((s) => s.passengerIndex === idx)
        const outboundChoice = passSeatChoices[0]
        const returnChoice = passSeatChoices[1]

        return {
          firstName: p.firstName,
          lastName: p.lastName,
          email: p.email || user.email,
          phone: p.phone,
          dateOfBirth: p.dateOfBirth,
          passportNumber: p.passportNumber,
          passengerType: p.passengerType || "adult",
          outboundSeat: outboundChoice?.seatDesignator,
          outboundSeatPrice: outboundChoice?.totalAmount || 0,
          returnSeat: returnChoice?.seatDesignator,
          returnSeatPrice: returnChoice?.totalAmount || 0,
        }
      })

      const payload = {
        userId: user.id,
        duffelOfferId: offer.id,
        originCode: routeInfo.origin,
        destinationCode: routeInfo.destination,
        departureDate: routeInfo.departureDate,
        returnDate: routeInfo.returnDate,
        cabinClass: routeInfo.cabinClass || "economy",
        totalAmount: totalNum,
        currency,
        flightNumber,
        airlineCode: carrierCode,
        airlineName: ownerName,
        passengers: formattedPassengers,
      }

      const res = await fetch("/api/bookings", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      })

      const data = await res.json()

      if (data.success) {
        onBookingComplete({
          id: data.data.bookingId,
          booking_reference: data.data.bookingReference,
          origin_code: routeInfo.origin,
          destination_code: routeInfo.destination,
          departure_date: routeInfo.departureDate,
          return_date: routeInfo.returnDate,
          cabin_class: routeInfo.cabinClass || "economy",
          total_amount: totalNum,
          currency,
          status: "confirmed",
          created_at: new Date().toISOString(),
          passengers: formattedPassengers.map((p, idx) => ({
            id: idx + 1,
            first_name: p.firstName,
            last_name: p.lastName,
            email: p.email,
            phone: p.phone,
            passport_number: p.passportNumber,
            passenger_type: p.passengerType,
            tickets: [
              {
                ticket_number: `006-${Math.floor(1000000000 + Math.random() * 9000000000)}`,
                flight_number: flightNumber,
                airline_name: ownerName,
                seat_designator: p.outboundSeat,
                segment_type: "outbound",
              },
            ],
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
    <div className="w-full bg-white border border-delta-hairline rounded-[6px] overflow-hidden shadow-sm my-4">
      {/* Header Bar */}
      <div className="bg-delta-navy text-white p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-delta-red p-1.5 rounded-[3px] text-white">
            <CreditCard className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide uppercase">
              CHECKOUT & WALLET PAYMENT (STEP 3 OF 3)
            </h3>
            <p className="text-xs text-slate-300">
              Review itinerary breakdown and complete double-entry ledger settlement.
            </p>
          </div>
        </div>
      </div>

      {/* Body */}
      <div className="p-5 space-y-5">
        {/* Flight Summary Card */}
        <div className="bg-slate-50 border border-delta-hairline rounded-[4px] p-4 space-y-3">
          <div className="flex items-center justify-between border-b border-delta-hairline pb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-delta-navy flex items-center gap-1.5">
              <Plane className="h-4 w-4 text-delta-red" />
              {ownerName} · {carrierCode} {flightNumber}
            </span>
            <Badge className="bg-delta-navy text-white text-[10px] uppercase tracking-wider">
              {routeInfo.cabinClass || "Economy"}
            </Badge>
          </div>

          <div className="flex items-center justify-between text-sm font-bold text-delta-navy">
            <div>
              <span className="text-xl">{routeInfo.origin}</span>
              <span className="text-xs text-delta-ink-muted block font-normal">{routeInfo.departureDate}</span>
            </div>
            <div className="flex items-center gap-2 text-xs font-normal text-delta-ink-muted">
              <div className="h-[1px] w-12 bg-delta-hairline" />
              <Plane className="h-4 w-4 rotate-90 text-delta-navy" />
              <div className="h-[1px] w-12 bg-delta-hairline" />
            </div>
            <div className="text-right">
              <span className="text-xl">{routeInfo.destination}</span>
              {routeInfo.returnDate && (
                <span className="text-xs text-delta-ink-muted block font-normal">Return: {routeInfo.returnDate}</span>
              )}
            </div>
          </div>
        </div>

        {/* Passengers & Assigned Seats Summary */}
        <div className="space-y-2">
          <span className="text-xs font-bold uppercase tracking-wider text-delta-navy flex items-center gap-1">
            <User className="h-3.5 w-3.5 text-delta-red" />
            Ticketed Passengers & Assigned Seats ({passengers.length})
          </span>
          <div className="border border-delta-hairline rounded-[4px] divide-y divide-delta-hairline bg-white">
            {passengers.map((p, idx) => {
              const passSeatChoices = selectedSeats.filter((s) => s.passengerIndex === idx)
              return (
                <div key={idx} className="p-3 flex items-center justify-between text-xs">
                  <div>
                    <span className="font-bold text-delta-navy uppercase">
                      {p.firstName} {p.lastName}
                    </span>
                    <span className="text-delta-ink-muted block text-[11px]">{p.email}</span>
                  </div>
                  <div className="text-right">
                    {passSeatChoices.length > 0 ? (
                      <div className="flex items-center gap-1.5">
                        {passSeatChoices.map((s, sIdx) => (
                          <span key={sIdx} className="bg-delta-navy text-white px-2 py-0.5 rounded font-mono text-[10px] font-bold">
                            Seat {s.seatDesignator}
                          </span>
                        ))}
                      </div>
                    ) : (
                      <span className="text-slate-400 italic">Standard Seating</span>
                    )}
                  </div>
                </div>
              )
            })}
          </div>
        </div>

        {/* Price Breakdown */}
        <div className="space-y-2 border-t border-delta-hairline pt-4">
          <span className="text-xs font-bold uppercase tracking-wider text-delta-navy">
            Fare & Fee Calculation Summary
          </span>
          <div className="space-y-1 text-xs">
            <div className="flex justify-between text-delta-ink">
              <span>Base Flight Fare ({passengers.length} Traveler{passengers.length > 1 ? "s" : ""})</span>
              <span className="font-mono font-bold">${baseFare.toFixed(2)}</span>
            </div>
            {totalSeatFee > 0 && (
              <div className="flex justify-between text-delta-ink">
                <span>Selected Preferred Seats</span>
                <span className="font-mono font-bold">${totalSeatFee.toFixed(2)}</span>
              </div>
            )}
            <div className="flex justify-between text-delta-navy font-bold text-sm border-t border-delta-hairline pt-2 mt-2">
              <span>Total Amount Due</span>
              <span className="font-mono text-delta-red font-black text-lg">${finalTotalAmount} {currency}</span>
            </div>
          </div>
        </div>

        {/* Ledger Wallet Settlement Check */}
        <div className="bg-slate-50 border border-delta-hairline rounded-[4px] p-4 space-y-3">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold uppercase tracking-wider text-delta-navy flex items-center gap-1.5">
              <CreditCard className="h-4 w-4 text-delta-navy" />
              Settlement Method: SkyLedger Asset Wallet
            </span>
            {loadingBalance ? (
              <Loader2 className="h-4 w-4 animate-spin text-delta-navy" />
            ) : (
              <span className="text-xs font-bold text-delta-navy">
                Available Wallet: <strong className="font-mono text-sm text-emerald-700">${(walletBalance || 0).toFixed(2)}</strong>
              </span>
            )}
          </div>

          {!loadingBalance && !canAfford && (
            <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-[4px] text-xs flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
              <div className="flex items-start gap-2">
                <AlertCircle className="h-4 w-4 text-rose-600 shrink-0 mt-0.5" />
                <div>
                  <strong className="block">Insufficient Ledger Wallet Balance!</strong> You need an additional{" "}
                  <strong className="font-mono">${(totalNum - (walletBalance || 0)).toFixed(2)}</strong> to settle this flight reservation.
                </div>
              </div>
              <Button 
                onClick={() => router.push("/user/wallet")}
                className="bg-delta-navy hover:bg-delta-navy-dark text-white text-[11px] uppercase tracking-wider font-bold h-8 shrink-0"
              >
                Recharge Wallet
              </Button>
            </div>
          )}

          {!loadingBalance && canAfford && (
            <div className="bg-emerald-50 border border-emerald-200 text-emerald-800 p-2.5 rounded-[4px] text-xs flex items-center gap-2">
              <ShieldCheck className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Double-entry ledger wallet settlement verified. Balance remaining after reservation: <strong className="font-mono">${((walletBalance || 0) - totalNum).toFixed(2)}</strong></span>
            </div>
          )}
        </div>

        {error && (
          <div className="bg-rose-50 border border-rose-200 text-rose-800 p-3 rounded-[4px] text-xs flex items-center gap-2">
            <AlertCircle className="h-4 w-4 text-rose-600 shrink-0" />
            <span>{error}</span>
          </div>
        )}

        {/* Footer Actions */}
        <div className="flex items-center justify-between pt-3 border-t border-delta-hairline">
          {onBack && (
            <Button
              variant="outline"
              size="sm"
              onClick={onBack}
              disabled={submitting}
              className="text-xs font-bold uppercase gap-1"
            >
              <ArrowLeft className="h-4 w-4" /> Back to Passenger Info
            </Button>
          )}

          <Button
            onClick={handleConfirmPayment}
            disabled={!canAfford || submitting || loadingBalance}
            className="bg-delta-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-6 h-10 rounded-[4px] flex items-center gap-2 ml-auto"
          >
            {submitting ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                <span>Settling Flight Ledger...</span>
              </>
            ) : (
              <>
                <span>Confirm & Settle ${finalTotalAmount}</span>
                <ArrowRight className="h-4 w-4" />
              </>
            )}
          </Button>
        </div>
      </div>
    </div>
  )
}
