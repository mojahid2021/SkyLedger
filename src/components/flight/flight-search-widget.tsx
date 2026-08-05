"use client"

import React, { useState } from "react"
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
import { format } from "date-fns"
import { cn } from "@/lib/utils"

const AIRPORTS = [
  "ATL — Atlanta (ATL)",
  "JFK — New York (JFK)",
  "LAX — Los Angeles (LAX)",
  "ORD — Chicago (ORD)",
  "DFW — Dallas-Fort Worth (DFW)",
  "DEN — Denver (DEN)",
  "SFO — San Francisco (SFO)",
  "SEA — Seattle (SEA)",
  "MIA — Miami (MIA)",
  "BOS — Boston (BOS)",
  "LHR — London Heathrow (LHR)",
  "CDG — Paris Charles de Gaulle (CDG)",
  "AMS — Amsterdam (AMS)",
  "HND — Tokyo Haneda (HND)",
]

const CABIN_CLASSES = ["Main Cabin", "Comfort+", "First Class", "Delta One"]

export function FlightSearchWidget() {
  const [tripType, setTripType] = useState<"round" | "oneway">("round")
  const [from, setFrom] = useState("ATL — Atlanta (ATL)")
  const [to, setTo] = useState("JFK — New York (JFK)")
  const [depart, setDepart] = useState(format(new Date(), "yyyy-MM-dd"))
  const [returnDate, setReturnDate] = useState(
    format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd")
  )
  const [passengers, setPassengers] = useState(1)
  const [cabin, setCabin] = useState("Main Cabin")
  const [showFromList, setShowFromList] = useState(false)
  const [showToList, setShowToList] = useState(false)
  const [showPassengerPopover, setShowPassengerPopover] = useState(false)
  const [fromQuery, setFromQuery] = useState("")
  const [toQuery, setToQuery] = useState("")

  const fromResults = AIRPORTS.filter((a) =>
    a.toLowerCase().includes(fromQuery.toLowerCase())
  )
  const toResults = AIRPORTS.filter((a) => a.toLowerCase().includes(toQuery.toLowerCase()))

  return (
    <div className="w-full bg-delta-canvas rounded-[8px] border border-delta-hairline-light p-6 sm:p-8 shadow-[0_8px_24px_rgba(0,0,0,0.06)]">
      {/* Trip type toggle */}
      <div className="flex items-center gap-6 border-b border-delta-hairline-light pb-3">
        {(["round", "oneway"] as const).map((t) => (
          <button
            key={t}
            type="button"
            onClick={() => setTripType(t)}
            className={cn(
              "text-[14px] font-delta pb-1 border-b-2 transition-colors",
              tripType === t
                ? "text-delta-red border-delta-red font-[600]"
                : "text-delta-navy border-transparent hover:border-delta-hairline"
            )}
          >
            {t === "round" ? "Round trip" : "One way"}
          </button>
        ))}
      </div>

      {/* Fields */}
      <div className="mt-5 grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        {/* From */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-[500] text-delta-navy uppercase tracking-wide">
            From
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-delta-ink-muted">
              <Plane className="h-4 w-4" />
            </div>
            <input
              value={from}
              onChange={(e) => {
                setFrom(e.target.value)
                setFromQuery(e.target.value)
                setShowFromList(true)
              }}
              onFocus={() => setShowFromList(true)}
              onBlur={() => setTimeout(() => setShowFromList(false), 150)}
              className="h-[44px] w-full rounded-[4px] border border-delta-hairline bg-delta-canvas pl-9 pr-3 text-[16px] text-delta-ink outline-none focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10"
            />
            {showFromList && (
              <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-[4px] border border-delta-hairline bg-delta-canvas shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                {fromResults.length === 0 && (
                  <p className="px-3 py-2 text-[13px] text-delta-ink-muted">No airports match</p>
                )}
                {fromResults.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onMouseDown={() => {
                      setFrom(a)
                      setShowFromList(false)
                    }}
                    className="block w-full px-3 py-2 text-left text-[14px] text-delta-ink hover:bg-delta-surface-1"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* To */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-[500] text-delta-navy uppercase tracking-wide">
            To
          </label>
          <div className="relative">
            <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-delta-ink-muted">
              <ArrowRightLeft className="h-4 w-4" />
            </div>
            <input
              value={to}
              onChange={(e) => {
                setTo(e.target.value)
                setToQuery(e.target.value)
                setShowToList(true)
              }}
              onFocus={() => setShowToList(true)}
              onBlur={() => setTimeout(() => setShowToList(false), 150)}
              className="h-[44px] w-full rounded-[4px] border border-delta-hairline bg-delta-canvas pl-9 pr-3 text-[16px] text-delta-ink outline-none focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10"
            />
            {showToList && (
              <div className="absolute z-20 mt-1 max-h-52 w-full overflow-auto rounded-[4px] border border-delta-hairline bg-delta-canvas shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
                {toResults.length === 0 && (
                  <p className="px-3 py-2 text-[13px] text-delta-ink-muted">No airports match</p>
                )}
                {toResults.map((a) => (
                  <button
                    key={a}
                    type="button"
                    onMouseDown={() => {
                      setTo(a)
                      setShowToList(false)
                    }}
                    className="block w-full px-3 py-2 text-left text-[14px] text-delta-ink hover:bg-delta-surface-1"
                  >
                    {a}
                  </button>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* Depart */}
        <div className="space-y-1.5">
          <label className="text-[12px] font-[500] text-delta-navy uppercase tracking-wide">
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
              className="h-[44px] w-full rounded-[4px] border border-delta-hairline bg-delta-canvas pl-9 pr-3 text-[14px] text-delta-ink outline-none focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10"
            />
          </div>
        </div>

        {/* Return */}
        {tripType === "round" ? (
          <div className="space-y-1.5">
            <label className="text-[12px] font-[500] text-delta-navy uppercase tracking-wide">
              Return
            </label>
            <div className="relative">
              <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-delta-ink-muted">
                <CalendarDays className="h-4 w-4" />
              </div>
              <input
                type="date"
                value={returnDate}
                onChange={(e) => setReturnDate(e.target.value)}
                className="h-[44px] w-full rounded-[4px] border border-delta-hairline bg-delta-canvas pl-9 pr-3 text-[14px] text-delta-ink outline-none focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10"
              />
            </div>
          </div>
        ) : (
          <div className="hidden md:block" />
        )}
      </div>

      {/* Passengers + Cabin + Search */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        {/* Passengers */}
        <div className="relative flex-1 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowPassengerPopover((v) => !v)}
            className="h-[44px] w-full sm:w-[220px] rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-left text-[14px] text-delta-ink hover:border-delta-navy flex items-center justify-between"
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-delta-ink-muted" />
              {passengers} {passengers === 1 ? "Traveler" : "Travelers"}
            </span>
            <ChevronDown className="h-4 w-4 text-delta-ink-muted" />
          </button>

          {showPassengerPopover && (
            <div className="absolute z-20 mt-1 w-full rounded-[4px] border border-delta-hairline bg-delta-canvas p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
              <div className="flex items-center justify-between">
                <span className="text-[13px] font-[500] text-delta-ink">Travelers</span>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => setPassengers((p) => Math.max(1, p - 1))}
                    className="h-7 w-7 rounded-[4px] border border-delta-hairline text-delta-navy hover:border-delta-navy flex items-center justify-center"
                  >
                    <Minus className="h-3.5 w-3.5" />
                  </button>
                  <span className="w-6 text-center text-[14px] font-[600] text-delta-ink">
                    {passengers}
                  </span>
                  <button
                    type="button"
                    onClick={() => setPassengers((p) => Math.min(9, p + 1))}
                    className="h-7 w-7 rounded-[4px] border border-delta-hairline text-delta-navy hover:border-delta-navy flex items-center justify-center"
                  >
                    <Plus className="h-3.5 w-3.5" />
                  </button>
                </div>
              </div>
              <div className="mt-3 border-t border-delta-hairline-light pt-2">
                <span className="text-[13px] font-[500] text-delta-ink">Cabin class</span>
                <div className="mt-1.5 flex flex-col gap-1">
                  {CABIN_CLASSES.map((c) => (
                    <button
                      key={c}
                      type="button"
                      onClick={() => setCabin(c)}
                      className={cn(
                        "rounded-[4px] px-2 py-1 text-left text-[13px]",
                        cabin === c
                          ? "bg-delta-navy text-white"
                          : "text-delta-ink hover:bg-delta-surface-1"
                      )}
                    >
                      {c}
                    </button>
                  ))}
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Search CTA — the one red button on the page */}
        <button
          type="button"
          className="flex h-[48px] flex-1 items-center justify-center gap-2 rounded-[4px] bg-delta-red px-6 text-[16px] font-[700] text-white transition-colors hover:bg-delta-red-hover"
        >
          <Search className="h-5 w-5" />
          Search flights
        </button>
      </div>
    </div>
  )
}
