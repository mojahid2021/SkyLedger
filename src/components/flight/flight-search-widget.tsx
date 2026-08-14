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
      {/* Search Widget - polished full-width card layout */}
      <div className="w-full bg-delta-canvas rounded-[8px] p-6 sm:p-8 shadow-[0_8px_32px_rgba(0,0,0,0.05)] border border-delta-hairline-light flex flex-col gap-6">
        {/* Trip type toggle (Redesigned capsule slider, no bottom border line) */}
        <div className="flex">
          <div className="inline-flex p-1 bg-delta-surface-2 rounded-[4px] gap-1">
            {(["round", "oneway"] as const).map((t) => (
              <button
                key={t}
                type="button"
                onClick={() => setTripType(t)}
                className={cn(
                  "text-[12px] font-[700] px-4 py-1.5 rounded-[2px] transition-all duration-200 cursor-pointer uppercase tracking-wider",
                  tripType === t
                    ? "bg-white text-delta-navy shadow-[0_1px_3px_rgba(0,0,0,0.05)]"
                    : "text-delta-ink-muted hover:text-delta-navy hover:bg-white/40"
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
          <div className="lg:col-span-2 grid grid-cols-1 sm:grid-cols-2 gap-4 relative">
            <LocationInput
              label="From"
              icon={<Plane className="h-4 w-4" />}
              value={from}
              onChange={(val, code) => {
                setFrom(val)
                setFromCode(code)
              }}
            />

            {/* Swap Button absolutely centered between From & To fields */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 z-10 hidden sm:flex pt-5">
              <button
                type="button"
                onClick={handleSwap}
                className="h-8 w-8 rounded-full bg-white text-delta-navy hover:bg-delta-navy hover:text-white transition-all shadow-[0_2px_8px_rgba(0,0,0,0.08)] flex items-center justify-center border border-delta-hairline cursor-pointer"
                title="Swap Locations"
              >
                <ArrowRightLeft className="h-3.5 w-3.5" />
              </button>
            </div>

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

          {/* Depart Date (1 column) */}
          <div className="space-y-1.5 w-full">
            <label className="text-[12px] font-[500] text-delta-navy uppercase tracking-wide block">
              Depart
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-delta-ink-muted">
                <CalendarDays className="h-4 w-4" />
              </div>
              <input
                type="date"
                value={depart}
                onChange={(e) => setDepart(e.target.value)}
                className="h-[44px] w-full rounded-[4px] border border-delta-hairline bg-delta-canvas pl-9 pr-3 text-[14px] text-delta-ink outline-none transition-all focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10 cursor-pointer font-normal"
              />
            </div>
          </div>

          {/* Return Date (1 column, disabled placeholder for One Way trip to maintain layout stability) */}
          <div className="space-y-1.5 w-full">
            <label className="text-[12px] font-[500] text-delta-navy uppercase tracking-wide block">
              Return
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-delta-ink-muted">
                <CalendarDays className="h-4 w-4" />
              </div>
              {tripType === "round" ? (
                <input
                  type="date"
                  value={returnDate}
                  onChange={(e) => setReturnDate(e.target.value)}
                  className="h-[44px] w-full rounded-[4px] border border-delta-hairline bg-delta-canvas pl-9 pr-3 text-[14px] text-delta-ink outline-none transition-all focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10 cursor-pointer font-normal"
                />
              ) : (
                <div className="h-[44px] w-full rounded-[4px] border border-delta-hairline-light bg-delta-surface-2 opacity-50 pl-9 pr-3 text-[14px] text-delta-ink-muted flex items-center cursor-not-allowed select-none">
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
            <label className="text-[12px] font-[500] text-delta-navy uppercase tracking-wide block">
              Travelers
            </label>
            <button
              type="button"
              onClick={() => setShowPassengerPopover((v) => !v)}
              className="h-[44px] w-full rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-left text-[14px] text-delta-ink hover:border-delta-navy flex items-center justify-between transition-all focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10 cursor-pointer font-normal"
            >
              <span className="flex items-center gap-2 truncate">
                <Users className="h-4 w-4 text-delta-ink-muted shrink-0" />
                <span className="truncate text-delta-navy font-[550]">
                  {passengers} {passengers === 1 ? "Traveler" : "Travelers"}
                </span>
              </span>
              <ChevronDown className="h-4 w-4 text-delta-ink-muted shrink-0" />
            </button>

            {showPassengerPopover && (
              <div className="absolute z-25 mt-1 w-full min-w-[285px] rounded-[4px] border border-delta-hairline bg-delta-canvas p-4 shadow-[0_8px_24px_rgba(0,0,0,0.08)]">
                <div className="flex items-center justify-between">
                  <span className="text-[13px] font-[600] text-delta-ink">Travelers</span>
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                      className="h-7 w-7 rounded-[4px] border border-delta-hairline text-delta-navy hover:border-delta-navy hover:bg-slate-50 flex items-center justify-center cursor-pointer"
                    >
                      <Minus className="h-3.5 w-3.5" />
                    </button>
                    <span className="w-6 text-center text-[14px] font-[700] text-delta-ink">
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
              className="h-[48px] w-full sm:w-auto sm:px-12 bg-delta-red text-white font-[700] hover:bg-delta-red-hover flex items-center justify-center gap-2 rounded-[4px] cursor-pointer text-[16px] uppercase tracking-wider"
            >
              <Search className="h-4 w-4" />
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

      {/* Flight Search Results - sits outside centered card to occupy full content width */}
      {searchResults !== null && (
        <div className="mt-4">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-[700] text-delta-navy flex items-center gap-2">
              <Plane className="h-5 w-5 text-delta-red" />
              Flight Deals for {routeInfo?.origin} → {routeInfo?.destination}
            </h3>
            <span className="text-[13px] text-delta-ink-muted font-[500]">
              {searchResults.length} {searchResults.length === 1 ? "deal" : "deals"} found
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="rounded-[4px] bg-delta-surface-2 p-8 text-center text-delta-ink-muted text-[14px]">
              No flight deals found for this route on the selected dates. Try adjusting your departure date or choosing different airports.
            </div>
          ) : (
            <div className="space-y-4">
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
