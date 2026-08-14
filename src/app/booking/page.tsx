"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { motion, AnimatePresence } from "framer-motion"
import { UserNavbar } from "@/components/user/user-navbar"
import { SeatMapInline } from "@/components/flight/seat-map-inline"
import { PassengerInfoInline, PassengerDetail } from "@/components/flight/passenger-info-inline"
import { CheckoutInline } from "@/components/flight/checkout-inline"
import { ETicketInline } from "@/components/user/e-ticket-inline"
import { SelectedSeatChoice } from "@/types/seat-map"
import { useAuth } from "@/context/auth-context"
import { Plane, Armchair, User, CreditCard, CheckCircle2, ArrowLeft, Calendar } from "lucide-react"

type BookingStep = "seat" | "passenger" | "checkout" | "confirmed"

const steps = [
  { id: "seat",      label: "Select Seats",    icon: Armchair,     num: 1 },
  { id: "passenger", label: "Passenger Info",   icon: User,         num: 2 },
  { id: "checkout",  label: "Payment",          icon: CreditCard,   num: 3 },
  { id: "confirmed", label: "E-Ticket",         icon: CheckCircle2, num: 4 },
]

const stepOrder: BookingStep[] = ["seat", "passenger", "checkout", "confirmed"]

function StepProgress({ currentStep }: { currentStep: BookingStep }) {
  const currentIdx = stepOrder.indexOf(currentStep)

  return (
    <div className="flex items-center justify-center w-full">
      {steps.map((step, idx) => {
        const Icon = step.icon
        const isCompleted = idx < currentIdx
        const isCurrent = idx === currentIdx
        const isUpcoming = idx > currentIdx

        return (
          <React.Fragment key={step.id}>
            <div className="flex flex-col items-center gap-1.5">
              <motion.div
                initial={false}
                animate={{
                  backgroundColor: isCompleted ? "#2e7d32" : isCurrent ? "#e31837" : "#eef2f7",
                  borderColor: isCompleted ? "#2e7d32" : isCurrent ? "#e31837" : "#d0d5dd",
                }}
                transition={{ duration: 0.3 }}
                className="w-9 h-9 rounded-sm border-2 flex items-center justify-center"
              >
                {isCompleted ? (
                  <CheckCircle2 className="h-4 w-4 text-white" />
                ) : (
                  <Icon className={`h-4 w-4 ${isCurrent ? "text-white" : "text-delta-ink-muted"}`} />
                )}
              </motion.div>
              <div className="hidden sm:flex flex-col items-center">
                <span className={`text-[11px] font-bold uppercase tracking-wider ${
                  isCurrent ? "text-delta-navy" : isCompleted ? "text-delta-success" : "text-delta-ink-muted"
                }`}>
                  {step.label}
                </span>
              </div>
            </div>

            {idx < steps.length - 1 && (
              <div className="flex-1 mx-2 sm:mx-3 h-[2px] relative top-[-10px] sm:top-[-14px] bg-delta-hairline overflow-hidden rounded-sm">
                <motion.div
                  initial={false}
                  animate={{ width: idx < currentIdx ? "100%" : "0%" }}
                  transition={{ duration: 0.5, ease: "easeInOut" }}
                  className="h-full bg-delta-success rounded-sm"
                />
              </div>
            )}
          </React.Fragment>
        )
      })}
    </div>
  )
}

function FlightSummaryCard({ offer, currentStep, selectedSeats = [] }: { offer: any; currentStep: BookingStep; selectedSeats?: SelectedSeatChoice[] }) {
  const slices = offer.slices || []
  const firstSlice = slices[0]
  const firstSeg = firstSlice?.segments?.[0]
  const owner = offer.owner || {}
  const ownerName = owner.name || "Airline"
  const carrierCode = firstSeg?.operating_carrier?.iata_code || owner.iata_code || "DL"
  const flightNumber = firstSeg?.operating_carrier_flight_number || firstSeg?.marketing_carrier_flight_number || "SKL-101"
  const origin = firstSlice?.origin?.iata_code || "JFK"
  const destination = firstSlice?.destination?.iata_code || "LAX"
  const originCity = firstSlice?.origin?.city_name || ""
  const destCity = firstSlice?.destination?.city_name || ""
  const departureDate = firstSeg?.departing_at ? firstSeg.departing_at.split("T")[0] : ""
  const departureTime = firstSeg?.departing_at ? firstSeg.departing_at.split("T")[1]?.slice(0, 5) : ""
  const arrivalTime = firstSeg?.arriving_at ? firstSeg.arriving_at.split("T")[1]?.slice(0, 5) : ""
  const cabinClass = firstSeg?.passengers?.[0]?.cabin_class || "economy"
  const paxCount = offer.passengers?.length || 1
  const isRoundTrip = slices.length > 1
  
  // Detailed Fare calculation matching CheckoutInline
  const baseFarePerPax = parseFloat(offer.total_amount || "0") / paxCount
  let adjustedBase = 0
  Array.from({ length: paxCount }).forEach((_, idx) => {
    let mult = 1.0
    selectedSeats.filter((s) => s.passengerIndex === idx).forEach((s) => {
      const m = s.cabinClass === "first" ? 3.0 : s.cabinClass === "business" ? 2.2 : s.cabinClass === "premium_economy" ? 1.35 : 1.0
      if (m > mult) mult = m
    })
    adjustedBase += baseFarePerPax * mult
  })
  
  const taxPercentage = offer.tax_percentage || 0
  const totalSeatFee = selectedSeats.reduce((sum, s) => sum + (s.totalAmount || 0), 0)
  const totalSeatFeeWithTax = totalSeatFee + (totalSeatFee * (taxPercentage / 100))
  const finalTotalAmount = adjustedBase + totalSeatFeeWithTax

  const cabinLabel = cabinClass === "premium_economy" ? "Premium Economy"
    : cabinClass === "business" ? "Business"
    : cabinClass === "first" ? "First Class"
    : "Economy"

  const currentIdx = stepOrder.indexOf(currentStep)

  return (
    <div className="bg-delta-canvas border border-delta-hairline rounded-sm overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      {/* Navy header */}
      <div className="bg-delta-navy px-4 py-3">
        <div className="flex items-center gap-2 mb-3">
          <Plane className="h-3.5 w-3.5 text-white/60" />
          <span className="text-[10px] font-bold uppercase tracking-widest text-white/60">
            {ownerName} · {carrierCode} {flightNumber}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <div>
            <p className="text-3xl font-bold tracking-tight text-white leading-none">{origin}</p>
            {originCity && <p className="text-[11px] text-white/50 mt-0.5">{originCity}</p>}
            {departureTime && <p className="text-sm font-mono font-bold text-white/80 mt-1">{departureTime}</p>}
          </div>
          <div className="flex flex-col items-center gap-1 px-3">
            <Plane className="h-4 w-4 text-delta-red rotate-90" />
            {isRoundTrip && <span className="text-[9px] text-white/40 font-bold uppercase tracking-wider">Round trip</span>}
          </div>
          <div className="text-right">
            <p className="text-3xl font-bold tracking-tight text-white leading-none">{destination}</p>
            {destCity && <p className="text-[11px] text-white/50 mt-0.5">{destCity}</p>}
            {arrivalTime && <p className="text-sm font-mono font-bold text-white/80 mt-1">{arrivalTime}</p>}
          </div>
        </div>
      </div>

      {/* Details */}
      <div className="p-4 border-b border-delta-hairline space-y-2.5">
        {departureDate && (
          <div className="flex items-center gap-2.5">
            <Calendar className="h-3.5 w-3.5 text-delta-ink-muted shrink-0" />
            <span className="text-xs text-delta-ink-muted font-medium">{departureDate}</span>
          </div>
        )}
        <div className="flex items-center gap-2.5">
          <User className="h-3.5 w-3.5 text-delta-ink-muted shrink-0" />
          <span className="text-xs text-delta-ink-muted font-medium">{paxCount} Passenger{paxCount > 1 ? "s" : ""}</span>
        </div>
        <div className="flex items-center gap-2.5">
          <Armchair className="h-3.5 w-3.5 text-delta-ink-muted shrink-0" />
          <span className="text-xs text-delta-ink-muted font-medium">{cabinLabel}</span>
        </div>
        
        {/* Receipt-style fare breakdown */}
        <div className="pt-3 mt-2 border-t border-delta-hairline-light">
          <p className="text-[10px] font-bold uppercase tracking-wider text-delta-navy mb-2">Fare Breakdown</p>
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-delta-ink-muted font-medium">Base Fare ({paxCount} pax)</span>
            <span className="font-mono font-bold text-delta-ink">৳{adjustedBase.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
          {totalSeatFee > 0 && (
            <div className="flex items-center justify-between text-xs mb-1.5">
              <span className="text-delta-ink-muted font-medium">Seat Selection Fee</span>
              <span className="font-mono font-bold text-delta-ink">৳{totalSeatFeeWithTax.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
            </div>
          )}
          <div className="flex items-center justify-between mt-2 border-t border-dashed border-delta-hairline-light pt-2">
            <span className="text-[11px] font-bold uppercase tracking-wider text-delta-navy">Total Amount Due</span>
            <span className="text-xl font-bold text-delta-red">৳{finalTotalAmount.toLocaleString("en-US", { minimumFractionDigits: 2, maximumFractionDigits: 2 })}</span>
          </div>
        </div>
      </div>

      {/* Step tracker */}
      <div className="p-4 bg-delta-surface-1">
        <p className="text-[10px] font-bold uppercase tracking-widest text-delta-ink-muted mb-3">Booking Progress</p>
        <div className="space-y-2">
          {steps.map((s, idx) => {
            const isCompleted = idx < currentIdx
            const isCurrent = idx === currentIdx
            return (
              <div key={s.id} className="flex items-center gap-2.5">
                <div className={`w-5 h-5 rounded-sm border flex items-center justify-center shrink-0 ${
                  isCompleted
                    ? "bg-delta-success border-delta-success"
                    : isCurrent
                    ? "bg-delta-red border-delta-red"
                    : "bg-delta-canvas border-delta-hairline"
                }`}>
                  {isCompleted ? (
                    <CheckCircle2 className="h-3 w-3 text-white" />
                  ) : (
                    <span className="text-[8px] font-bold" style={{ color: isCurrent ? "#fff" : "#666" }}>{s.num}</span>
                  )}
                </div>
                <span className={`text-xs font-medium ${
                  isCompleted
                    ? "text-delta-success line-through opacity-60"
                    : isCurrent
                    ? "text-delta-navy font-bold"
                    : "text-delta-ink-muted"
                }`}>
                  {s.label}
                </span>
              </div>
            )
          })}
        </div>
      </div>
    </div>
  )
}

function BookingContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const offerIdParam = searchParams.get("offerId")

  const [offer, setOffer] = useState<any | null>(null)
  const [currentStep, setCurrentStep] = useState<BookingStep>("seat")
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeatChoice[]>([])
  const [passengersList, setPassengersList] = useState<PassengerDetail[]>([])
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null)
  const [loadingOffer, setLoadingOffer] = useState<boolean>(true)
  const [prevStep, setPrevStep] = useState<number>(0)

  useEffect(() => {
    if (isLoading) return
    if (!user) { router.replace("/login"); return }

    try {
      const stored = sessionStorage.getItem("skyledger_selected_offer")
      if (stored) {
        setOffer(JSON.parse(stored))
        setLoadingOffer(false)
        return
      }
    } catch {}

    if (offerIdParam) {
      setLoadingOffer(true)
      const passengersParam = searchParams.get("passengers") || "1"
      const cabinParam = searchParams.get("cabin") || "economy"
      fetch(`/api/flights/offer?id=${offerIdParam}&passengers=${passengersParam}&cabin=${cabinParam}`)
        .then((r) => r.json())
        .then((json) => { if (json.success && json.offer) setOffer(json.offer) })
        .catch((e) => console.error("Failed to fetch offer:", e))
        .finally(() => setLoadingOffer(false))
    } else {
      setLoadingOffer(false)
    }
  }, [user, isLoading, router, offerIdParam])

  const goToStep = (next: BookingStep) => {
    setPrevStep(stepOrder.indexOf(currentStep))
    setCurrentStep(next)
  }

  if (isLoading || loadingOffer) {
    return (
      <div className="min-h-screen bg-delta-surface-1 flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-sm border-2 border-delta-hairline border-t-delta-red animate-spin" />
          <Plane className="absolute inset-0 m-auto h-5 w-5 text-delta-navy" />
        </div>
        <p className="text-sm font-medium text-delta-ink-muted">Preparing your booking...</p>
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-delta-surface-1 flex flex-col items-center justify-center p-6 text-center gap-5">
        <div className="w-16 h-16 rounded-sm bg-delta-surface-2 border border-delta-hairline flex items-center justify-center">
          <Plane className="h-7 w-7 text-delta-ink-muted" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-delta-navy mb-2 uppercase tracking-wide">No Flight Selected</h2>
          <p className="text-sm text-delta-ink-muted max-w-sm">
            Please select a flight from the search results to continue with your booking.
          </p>
        </div>
        <button
          onClick={() => router.push("/")}
          className="h-12 px-8 rounded-sm bg-delta-red hover:bg-delta-red-hover text-white font-bold text-sm transition-colors cursor-pointer flex items-center gap-2"
        >
          <ArrowLeft className="h-4 w-4" />
          Search Flights
        </button>
      </div>
    )
  }

  const slices = offer.slices || []
  const firstSlice = slices[0]
  const firstSeg = firstSlice?.segments?.[0]
  const owner = offer.owner || {}
  const ownerName = owner.name || "Airline"
  const carrierCode = firstSeg?.operating_carrier?.iata_code || owner.iata_code || "DL"
  const flightNumber = firstSeg?.operating_carrier_flight_number || firstSeg?.marketing_carrier_flight_number || "SKL-101"
  const origin = firstSlice?.origin?.iata_code || "JFK"
  const destination = firstSlice?.destination?.iata_code || "LAX"

  const currentIdx = stepOrder.indexOf(currentStep)
  const isForward = currentIdx >= prevStep
  const isConfirmedStep = currentStep === "confirmed"

  const stepVariants = {
    enter: (fwd: boolean) => ({ opacity: 0, x: fwd ? 32 : -32 }),
    center: { opacity: 1, x: 0 },
    exit: (fwd: boolean) => ({ opacity: 0, x: fwd ? -32 : 32 }),
  }

  return (
    <div className="min-h-screen bg-delta-surface-1 flex flex-col font-sans">
      <UserNavbar />



      {/* Main Content */}
      <main className="flex-1 max-w-7xl mx-auto w-full px-4 sm:px-6 lg:px-8 py-6">
        {isConfirmedStep ? (
          <AnimatePresence mode="wait" custom={isForward}>
            <motion.div
              key={currentStep}
              custom={isForward}
              variants={stepVariants}
              initial="enter"
              animate="center"
              exit="exit"
              transition={{ duration: 0.3, ease: "easeInOut" }}
            >
              {confirmedBooking && (
                <ETicketInline
                  booking={confirmedBooking}
                  onDone={() => router.push("/user/dashboard")}
                />
              )}
            </motion.div>
          </AnimatePresence>
        ) : (
          <div className="flex flex-col lg:flex-row gap-6">
            {/* Step content */}
            <div className="flex-1 min-w-0">
              <AnimatePresence mode="wait" custom={isForward}>
                <motion.div
                  key={currentStep}
                  custom={isForward}
                  variants={stepVariants}
                  initial="enter"
                  animate="center"
                  exit="exit"
                  transition={{ duration: 0.3, ease: "easeInOut" }}
                >
                  {currentStep === "seat" && (
                    <SeatMapInline
                      offerId={offer.id}
                      passengersCount={offer.passengers?.length || 1}
                      initialSelections={selectedSeats}
                      onConfirmSeats={(choices) => {
                        setSelectedSeats(choices)
                        goToStep("passenger")
                      }}
                      onCancel={() => router.push("/")}
                    />
                  )}
                  {currentStep === "passenger" && (
                    <PassengerInfoInline
                      passengersCount={offer.passengers?.length || 1}
                      defaultUserEmail={user?.email || ""}
                      defaultUserName={user ? `${user.first_name} ${user.last_name}` : ""}
                      initialData={passengersList}
                      onConfirm={(passengers) => {
                        setPassengersList(passengers)
                        goToStep("checkout")
                      }}
                      onBack={() => goToStep("seat")}
                    />
                  )}
                  {currentStep === "checkout" && (
                    <CheckoutInline
                      offer={offer}
                      selectedSeats={selectedSeats}
                      passengers={passengersList}
                      routeInfo={{
                        origin: firstSlice?.origin?.iata_code || "JFK",
                        destination: firstSlice?.destination?.iata_code || "LAX",
                        departureDate: firstSeg?.departing_at ? firstSeg.departing_at.split("T")[0] : "2026-09-01",
                        returnDate: slices[1]?.segments?.[0]?.departing_at ? slices[1].segments[0].departing_at.split("T")[0] : undefined,
                        cabinClass: firstSeg?.passengers?.[0]?.cabin_class || "economy",
                      }}
                      onBookingComplete={(booking) => {
                        setConfirmedBooking(booking)
                        goToStep("confirmed")
                      }}
                      onBack={() => goToStep("passenger")}
                    />
                  )}
                </motion.div>
              </AnimatePresence>
            </div>

            {/* Sidebar */}
            <div className="lg:w-64 xl:w-72 shrink-0">
              <div className="sticky top-6">
                <FlightSummaryCard offer={offer} currentStep={currentStep} selectedSeats={selectedSeats} />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-delta-surface-1 flex flex-col items-center justify-center gap-4">
        <div className="relative w-12 h-12">
          <div className="w-12 h-12 rounded-sm border-2 border-delta-hairline border-t-delta-red animate-spin" />
          <Plane className="absolute inset-0 m-auto h-5 w-5 text-delta-navy" />
        </div>
        <p className="text-sm font-medium text-delta-ink-muted">Loading booking...</p>
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
