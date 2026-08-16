"use client"

import React, { useState, useEffect, useRef } from "react"
import {
  Plane,
  ArrowRightLeft,
  CalendarDays,
  Users,
  Search,
  ChevronDown,
  Minus,
  Plus,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { LocationInput } from "./location-input"
import { FlightOfferCard } from "./flight-offer-card"
import { Offer } from "./types"

const CABIN_CLASSES = ["Economy Class", "Premium Economy", "First Class", "Business Class"]

export function FlightSearchWidget({
  initialOrigin,
  initialOriginCode,
  initialDestination,
  initialDestinationCode,
}: {
  initialOrigin?: string
  initialOriginCode?: string
  initialDestination?: string
  initialDestinationCode?: string
} = {}) {
  const [airlineNames, setAirlineNames] = useState<Record<string, string>>({})

  useEffect(() => {
    async function loadAirlines() {
      try {
        const res = await fetch("/api/airlines")
        const json = await res.json()
        if (json.success && json.data) {
          setAirlineNames(json.data)
        }
      } catch (err) {
        console.error("Failed to load airlines:", err)
      }
    }
    loadAirlines()
  }, [])

  const [tripType, setTripType] = useState<"round" | "oneway">("round")
  const [from, setFrom] = useState(initialOrigin || "")
  const [fromCode, setFromCode] = useState(initialOriginCode || "")
  const [to, setTo] = useState(initialDestination || "")
  const [toCode, setToCode] = useState(initialDestinationCode || "")
  const [depart, setDepart] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [returnDate, setReturnDate] = useState(() =>
    format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd")
  )

  useEffect(() => {
    if (initialOriginCode) {
      setFrom(initialOrigin || initialOriginCode)
      setFromCode(initialOriginCode)
    }
    if (initialDestinationCode) {
      setTo(initialDestination || initialDestinationCode)
      setToCode(initialDestinationCode)
    }
  }, [initialOrigin, initialOriginCode, initialDestination, initialDestinationCode])
  const [passengers, setPassengers] = useState(1)
  const [cabin, setCabin] = useState("Economy Class")
  const [showPassengerPopover, setShowPassengerPopover] = useState(false)
  const popoverRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (popoverRef.current && !popoverRef.current.contains(event.target as Node)) {
        setShowPassengerPopover(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<Offer[] | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ origin: string; destination: string } | null>(
    null
  )

  const handleSwap = () => {
    const tempFrom = from
    const tempFromCode = fromCode
    setFrom(to)
    setFromCode(toCode)
    setTo(tempFrom)
    setToCode(tempFromCode)
  }

  const handleSearch = async () => {
    const originParam = fromCode.trim() || from.trim()
    const destParam = toCode.trim() || to.trim()

    if (!originParam || !destParam) {
      setSearchError("Please select origin and destination locations.")
      return
    }

    setSearching(true)
    setSearchError(null)

    try {
      let reqCabin = "economy"
      if (cabin === "Premium Economy") reqCabin = "premium_economy"
      if (cabin === "First Class") reqCabin = "first"
      if (cabin === "Business Class") reqCabin = "business"

      const url = `/api/flights/search?origin=${encodeURIComponent(
        originParam
      )}&destination=${encodeURIComponent(
        destParam
      )}&departure_at=${depart}&one_way=${tripType === "oneway"}&cabin=${reqCabin}&passengers=${passengers}`
      const res = await fetch(
        tripType === "round" && returnDate ? url + `&return_at=${returnDate}` : url
      )
      const flightData = await res.json()

      if (flightData.success && Array.isArray(flightData.data)) {
        setSearchResults(flightData.data)
        setRouteInfo({ origin: originParam, destination: destParam })
      } else {
        const errMessage = flightData.details
          ? flightData.details[0]?.message
          : flightData.error || "No flights found matching your search criteria."
        setSearchError(errMessage)
        setSearchResults([])
      }
    } catch (err) {
      console.error("Flight search API call error:", err)
      setSearchError("Unable to connect to flight search service.")
    } finally {
      setSearching(false)
    }
  }

  return (
    <div className="w-full flex flex-col gap-8 font-delta">
      {/* Search Widget - polished full-width card layout with rich Glassmorphism */}
      <div className="w-full backdrop-blur-md bg-white/95 rounded-[8px] p-6 sm:p-8 shadow-2xl border border-white/20 flex flex-col gap-6 transform transition-all duration-300">
        {/* Trip type toggle (Redesigned capsule slider, no bottom border line) */}
        <div className="flex">
          <div className="inline-flex p-1 bg-delta-surface-2 rounded-[6px] gap-1 border border-delta-hairline-light">
            {(["round", "oneway"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTripType(t)}
                className={cn(
                  "text-[11px] font-[800] px-5 py-2 rounded-[4px] transition-all duration-300 cursor-pointer uppercase tracking-widest",
                  tripType === t
                    ? "bg-delta-navy text-white shadow-md"
                    : "text-delta-navy/70 hover:text-delta-navy hover:bg-white/50"
                )}
              >
                {t === "round" ? "Round Trip" : "One Way"}
              </button>
            ))}
          </div>
        </div>

        {/* Inputs Layout - full width 4-column alignment */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-4 items-end">
          {/* Origin & Destination (spanning 2 columns on desktop with absolute centered Swap button) */}
          <div className="lg:col-span-2 relative">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 sm:gap-10">
              <LocationInput
                label="From"
                icon={<Plane className="h-4 w-4" />}
                value={from}
                onChange={(val, code) => {
                  setFrom(val)
                  setFromCode(code)
                }}
              />

              <LocationInput
                label="To"
                icon={<Plane className="h-4 w-4" />}
                value={to}
                onChange={(val, code) => {
                  setTo(val)
                  setToCode(code)
                }}
              />
            </div>

            {/* Swap Button absolutely centered between From & To fields */}
            <div className="absolute left-1/2 bottom-[6px] -translate-x-1/2 z-10 hidden sm:flex">
              <button
                type="button"
                onClick={handleSwap}
                className="h-9 w-9 rounded-full bg-delta-red text-white hover:bg-delta-red-hover hover:scale-110 active:scale-95 transition-all shadow-lg shadow-delta-red/35 flex items-center justify-center border border-white/20 cursor-pointer shrink-0"
                title="Swap Locations"
              >
                <ArrowRightLeft className="h-4 w-4" />
              </button>
            </div>
          </div>

          {/* Depart Date (1 column) */}
          <div className="space-y-1.5 w-full">
            <label className="text-[11px] font-[800] text-delta-navy uppercase tracking-widest block mb-1">
              Depart
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-delta-navy/55 z-10">
                <CalendarDays className="h-4 w-4" />
              </div>
              <input
                type="date"
                value={depart}
                onChange={(e) => setDepart(e.target.value)}
                className="h-[48px] w-full rounded-[4px] border border-delta-hairline-light bg-delta-surface-1 pl-10 pr-4 text-[14px] font-semibold text-delta-navy outline-none transition-all focus:bg-white focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10 cursor-pointer"
              />
            </div>
          </div>

          {/* Return Date (1 column) */}
          <div className="space-y-1.5 w-full">
            <label className="text-[11px] font-[800] text-delta-navy uppercase tracking-widest block mb-1">
              Return
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-delta-navy/55 z-10">
                <CalendarDays className="h-4 w-4" />
              </div>
              {tripType === "round" ? (
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="h-[48px] w-full rounded-[4px] border border-delta-hairline-light bg-delta-surface-1 pl-10 pr-4 text-[14px] font-semibold text-delta-navy outline-none transition-all focus:bg-white focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10 cursor-pointer"
                />
              ) : (
                <div className="h-[48px] w-full rounded-[4px] border border-delta-hairline-light bg-delta-surface-2 opacity-50 pl-10 pr-4 text-[14px] text-delta-navy/40 flex items-center cursor-not-allowed select-none font-semibold">
                  One Way Trip
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Travelers & Search CTA trigger row */}
        <div className="flex flex-col sm:flex-row gap-4 items-end">
          {/* Travelers Popover trigger */}
          <div ref={popoverRef} className="relative space-y-1.5 w-full sm:w-[260px]">
            <label className="text-[11px] font-[800] text-delta-navy uppercase tracking-widest block mb-1">
              Travelers
            </label>
            <button
              type="button"
              onClick={() => setShowPassengerPopover((v) => !v)}
              className="h-[48px] w-full rounded-[4px] border border-delta-hairline-light bg-delta-surface-1 px-4 text-left text-[14px] text-delta-navy hover:border-delta-navy flex items-center justify-between transition-all focus:bg-white focus:ring-2 focus:ring-delta-navy/10 cursor-pointer font-semibold"
            >
              <span className="flex items-center gap-2 truncate">
                <Users className="h-4 w-4 text-delta-navy/55 shrink-0" />
                <span className="truncate text-delta-navy">
                  {passengers} {passengers === 1 ? "Traveler" : "Travelers"}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-delta-navy/55 shrink-0" />
            </button>

            {showPassengerPopover && (
              <div className="absolute z-25 mt-1.5 w-full min-w-[285px] rounded-[6px] border border-delta-hairline-light bg-white p-4 shadow-2xl">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-[750] text-delta-navy uppercase tracking-wider">Travelers</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                      className="h-7 w-7 rounded-[4px] border border-delta-hairline text-delta-navy hover:border-delta-navy hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-[14px] font-[700] text-delta-navy">
                      {passengers}
                    </span>
                    <button
                      type="button"
                      onClick={() => setPassengers((p) => Math.min(9, p + 1))}
                      className="h-7 w-7 rounded-[4px] border border-delta-hairline text-delta-navy hover:border-delta-navy hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                    >
                      <Plus className="h-3.5 w-3.5" />
                    </button>
                  </div>
                </div>
              </div>
            )}
          </div>

          {/* Search Button (aligned to right) */}
          <div className="w-full sm:w-auto sm:ml-auto">
            <Button
              size="lg"
              onClick={handleSearch}
              disabled={searching}
              className="h-[48px] w-full sm:w-auto sm:px-14 bg-delta-red text-white font-[800] hover:bg-delta-red-hover flex items-center justify-center gap-2.5 rounded-[4px] cursor-pointer text-[14px] uppercase tracking-widest shadow-lg shadow-delta-red/35 hover:scale-[1.02] active:scale-95 transition-all duration-200"
            >
              <Search className="h-4.5 w-4.5" />
              {searching ? "Searching..." : "Search Flights"}
            </Button>
          </div>
        </div>

        {/* Error Message */}
        {searchError && (
          <div className="rounded-[4px] border border-red-200 bg-red-50 p-3.5 text-[13px] text-red-700">
            {searchError}
          </div>
        )}
      </div>

      {/* Flight Search Results - Wrapped in a clean white card for maximum contrast against dark hero backgrounds */}
      {searchResults !== null && (
        <div className="mt-6 rounded-[8px] bg-white p-6 sm:p-8 shadow-2xl border border-delta-hairline-light flex flex-col gap-6 text-delta-ink">
          <div className="flex flex-wrap items-center justify-between gap-3 pb-4 border-b border-delta-hairline-light">
            <h3 className="text-[20px] font-[800] text-delta-navy flex items-center gap-2 tracking-tight">
              <Plane className="h-5 w-5 text-delta-red" />
              Flight Deals for {routeInfo?.origin} → {routeInfo?.destination}
            </h3>
            <span className="text-[12px] font-[750] uppercase tracking-wider text-delta-navy bg-delta-surface-2 px-3 py-1 rounded-full border border-delta-hairline-light">
              {searchResults.length} {searchResults.length === 1 ? "deal" : "deals"} found
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="rounded-[6px] bg-delta-surface-1 p-8 text-center text-delta-ink-muted text-[14px] font-medium border border-delta-hairline-light">
              No flight deals found for this route on the selected dates. Try adjusting your departure date or choosing different airports.
            </div>
          ) : (
            <div className="space-y-5">
              {searchResults.map((offer, idx) => (
                <FlightOfferCard
                  key={offer.id || `offer-${idx}`}
                  offer={offer}
                  index={idx}
                  airlineNames={airlineNames}
                />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
