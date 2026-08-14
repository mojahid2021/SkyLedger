"use client"

import React, { useState, useEffect, Suspense } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { UserNavbar } from "@/components/user/user-navbar"
import { SeatMapInline } from "@/components/flight/seat-map-inline"
import { PassengerInfoInline, PassengerDetail } from "@/components/flight/passenger-info-inline"
import { CheckoutInline } from "@/components/flight/checkout-inline"
import { ETicketInline } from "@/components/user/e-ticket-inline"
import { SelectedSeatChoice } from "@/types/seat-map"
import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Plane, Armchair, User, CreditCard, CheckCircle2, ArrowLeft } from "lucide-react"

function BookingContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()
  const offerIdParam = searchParams.get("offerId")

  const [offer, setOffer] = useState<any | null>(null)
  const [currentStep, setCurrentStep] = useState<"seat" | "passenger" | "checkout" | "confirmed">("seat")
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeatChoice[]>([])
  const [passengersList, setPassengersList] = useState<PassengerDetail[]>([])
  const [confirmedBooking, setConfirmedBooking] = useState<any | null>(null)
  const [loadingOffer, setLoadingOffer] = useState<boolean>(true)

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
      return
    }

    try {
      const stored = sessionStorage.getItem("skyledger_selected_offer")
      if (stored) {
        const parsed = JSON.parse(stored)
        setOffer(parsed)
        setLoadingOffer(false)
        return
      }
    } catch {}

    if (offerIdParam) {
      setLoadingOffer(true)
      const passengersParam = searchParams.get("passengers") || "1"
      const cabinParam = searchParams.get("cabin") || "economy"
      fetch(`/api/flights/offer?id=${offerIdParam}&passengers=${passengersParam}&cabin=${cabinParam}`)
        .then((res) => res.json())
        .then((json) => {
          if (json.success && json.offer) {
            setOffer(json.offer)
          }
        })
        .catch((err) => console.error("Failed to fetch offer:", err))
        .finally(() => setLoadingOffer(false))
    } else {
      setLoadingOffer(false)
    }
  }, [user, isLoading, router, offerIdParam])

  if (isLoading || loadingOffer) {
    return (
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-delta-navy font-semibold text-sm">
        Initializing Flight Booking Workspace...
      </div>
    )
  }

  if (!offer) {
    return (
      <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center p-6 text-center space-y-4">
        <Plane className="h-12 w-12 text-delta-navy opacity-50" />
        <h2 className="text-xl font-bold text-delta-navy uppercase">No Flight Offer Selected</h2>
        <p className="text-xs text-delta-ink-muted max-w-md">
          Please select a flight offer from the home page flight search widget to proceed with booking.
        </p>
        <Button onClick={() => router.push("/")} className="bg-delta-navy text-white text-xs uppercase px-6">
          Search Flights
        </Button>
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

  const steps = [
    { id: "seat", label: "1. Select Seats", icon: Armchair },
    { id: "passenger", label: "2. Passenger Info", icon: User },
    { id: "checkout", label: "3. Wallet Payment", icon: CreditCard },
    { id: "confirmed", label: "4. E-Ticket", icon: CheckCircle2 },
  ]

  return (
    <div className="min-h-screen bg-slate-50 flex flex-col text-delta-ink">
      <UserNavbar />

      <main className="flex-1 w-full max-w-5xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
        {/* Top Header & Breadcrumb */}
        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3 border-b border-delta-hairline pb-4">
          <div>
            <div className="flex items-center gap-2">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => router.push("/")}
                className="h-8 px-2 text-delta-navy hover:bg-slate-200 text-xs gap-1"
              >
                <ArrowLeft className="h-4 w-4" /> Search Results
              </Button>
              <span className="text-slate-300">/</span>
              <span className="text-xs font-bold text-delta-red uppercase tracking-wider">
                Flight Reservation
              </span>
            </div>
            <h1 className="text-xl font-extrabold text-delta-navy tracking-tight uppercase mt-1">
              {firstSlice?.origin?.iata_code || "JFK"} to {firstSlice?.destination?.iata_code || "LAX"} · {ownerName} ({carrierCode} {flightNumber})
            </h1>
          </div>

          <Badge className="bg-delta-navy text-white text-xs uppercase px-3 py-1 font-mono font-bold">
            Fare: ৳{parseFloat(offer.total_amount || "0").toFixed(2)} BDT
          </Badge>
        </div>

        {/* Step Progress Bar */}
        <div className="bg-white border border-delta-hairline rounded-[6px] p-2 sm:p-3 shadow-xs">
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {steps.map((s, idx) => {
              const Icon = s.icon
              const isCurrent = currentStep === s.id
              const isCompleted =
                (s.id === "seat" && ["passenger", "checkout", "confirmed"].includes(currentStep)) ||
                (s.id === "passenger" && ["checkout", "confirmed"].includes(currentStep)) ||
                (s.id === "checkout" && currentStep === "confirmed")

              return (
                <div
                  key={s.id}
                  className={`flex items-center justify-center gap-2 p-2.5 rounded-[4px] border text-xs font-bold transition-all ${
                    isCurrent
                      ? "bg-delta-navy text-white border-delta-navy shadow-sm"
                      : isCompleted
                      ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                      : "bg-slate-50 text-slate-400 border-delta-hairline-light"
                  }`}
                >
                  <Icon className="h-4 w-4 shrink-0" />
                  <span className="truncate">{s.label}</span>
                </div>
              )
            })}
          </div>
        </div>

        {/* Active Step Content Container */}
        {currentStep === "seat" && (
          <SeatMapInline
            offerId={offer.id}
            passengersCount={offer.passengers?.length || 1}
            initialSelections={selectedSeats}
            onConfirmSeats={(choices) => {
              setSelectedSeats(choices)
              setCurrentStep("passenger")
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
              setCurrentStep("checkout")
            }}
            onBack={() => setCurrentStep("seat")}
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
              setCurrentStep("confirmed")
            }}
            onBack={() => setCurrentStep("passenger")}
          />
        )}

        {currentStep === "confirmed" && confirmedBooking && (
          <ETicketInline
            booking={confirmedBooking}
            onDone={() => {
              router.push("/user/dashboard")
            }}
          />
        )}
      </main>
    </div>
  )
}

export default function BookingPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-slate-50 flex items-center justify-center text-delta-navy font-semibold text-sm">
        Loading Flight Booking...
      </div>
    }>
      <BookingContent />
    </Suspense>
  )
}
