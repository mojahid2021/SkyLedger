"use client"

import React, { useState, useCallback, useRef, useEffect } from "react"
import {
  Plane,
  ArrowRightLeft,
  CalendarDays,
  Users,
  Search,
  ChevronDown,
  Minus,
  Plus,
  MapPin,
  Building2,
} from "lucide-react"

import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"
import { Button } from "@/components/ui/button"

import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface LocationResult {
  type: "city" | "airport"
  id: number
  name: string
  code: string | null
  country_code: string | null
}

const CABIN_CLASSES = ["Main Cabin", "Comfort+", "First Class", "Delta One"]

function useLocationSearch(query: string): { results: LocationResult[]; loading: boolean } {
  const [results, setResults] = useState<LocationResult[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!query || query.trim().length < 2) {
      setResults([])
      return
    }

    timerRef.current = setTimeout(() => {
      setLoading(true)
      fetch(`/api/locations?q=${encodeURIComponent(query.trim())}`)
        .then((r) => r.json())
        .then((d) => { if (d.success) setResults(d.data) })
        .finally(() => setLoading(false))
    }, 200)

    return () => { if (timerRef.current) clearTimeout(timerRef.current) }
  }, [query])

  return { results, loading }
}

function formatLabel(loc: LocationResult): string {
  const code = loc.code ? ` (${loc.code})` : ""
  const country = loc.country_code ? ` · ${loc.country_code}` : ""
  return `${loc.name}${code}${country}`
}

function LocationInput({
  label,
  icon,
  value,
  onChange,
}: {
  label: string
  icon: React.ReactNode
  value: string
  onChange: (val: string) => void
}) {
  const [query, setQuery] = useState(value)
  const [open, setOpen] = useState(false)
  const { results, loading } = useLocationSearch(query)

  return (
    <div className="space-y-1.5">
      <label className="text-[12px] font-[500] text-delta-navy uppercase tracking-wide">{label}</label>
      <div className="relative">
        <div className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-delta-ink-muted">
          {icon}
        </div>
        <input
          value={query}
          onChange={(e) => {
            setQuery(e.target.value)
            onChange(e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 150)}
          placeholder={`City or airport...`}
          className="h-[44px] w-full rounded-[4px] border border-delta-hairline bg-delta-canvas pl-9 pr-3 text-[15px] text-delta-ink outline-none focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10"
        />
        {open && query.trim().length >= 2 && (
          <div className="absolute z-20 mt-1 max-h-60 w-full overflow-auto rounded-[4px] border border-delta-hairline bg-delta-canvas shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
            {loading && (
              <p className="px-3 py-2 text-[13px] text-delta-ink-muted">Searching...</p>
            )}
            {!loading && results.length === 0 && (
              <p className="px-3 py-2 text-[13px] text-delta-ink-muted">No results found</p>
            )}
            {!loading && results.map((loc) => {
              const label = formatLabel(loc)
              return (
                <button
                  key={`${loc.type}-${loc.id}`}
                  type="button"
                  onMouseDown={() => {
                    setQuery(label)
                    onChange(label)
                    setOpen(false)
                  }}
                  className="flex w-full items-center gap-2.5 px-3 py-2 text-left text-[13px] text-delta-ink hover:bg-delta-surface-1"
                >
                  {loc.type === "airport" ? (
                    <Plane className="h-3.5 w-3.5 shrink-0 text-delta-navy/50" />
                  ) : (
                    <Building2 className="h-3.5 w-3.5 shrink-0 text-delta-red/70" />
                  )}
                  <span className="flex-1 truncate">{loc.name}</span>
                  <span className="flex items-center gap-1.5 shrink-0">
                    {loc.code && (
                      <span className="rounded bg-delta-navy px-1.5 py-0.5 font-mono text-[10px] font-[700] text-white">
                        {loc.code}
                      </span>
                    )}
                    {loc.country_code && (
                      <span className="text-[11px] text-delta-ink-muted">{loc.country_code}</span>
                    )}
                  </span>
                </button>
              )
            })}
          </div>
        )}
      </div>
    </div>
  )
}

export function FlightSearchWidget() {
  const [tripType, setTripType] = useState<"round" | "oneway">("round")
  const [from, setFrom] = useState("")
  const [to, setTo] = useState("")
  const [depart, setDepart] = useState(format(new Date(), "yyyy-MM-dd"))
  const [returnDate, setReturnDate] = useState(
    format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd")
  )
  const [passengers, setPassengers] = useState(1)
  const [cabin, setCabin] = useState("Main Cabin")
  const [showPassengerPopover, setShowPassengerPopover] = useState(false)


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
        <LocationInput
          label="From"
          icon={<Plane className="h-4 w-4" />}
          value={from}
          onChange={setFrom}
        />

        {/* To */}
        <LocationInput
          label="To"
          icon={<ArrowRightLeft className="h-4 w-4" />}
          value={to}
          onChange={setTo}
        />

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

      <div className="mt-4 flex flex-col sm:flex-row gap-3">
        {/* Passengers */}
        <div className="relative flex-1 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowPassengerPopover((v) => !v)}
            className="flex h-[44px] w-full items-center justify-between rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-[15px] font-[400] text-delta-ink outline-none hover:bg-delta-surface-1"
          >
            <span className="flex items-center gap-2">
              <Users className="h-4 w-4 text-delta-ink-muted" />
              {passengers} Passenger(s)
            </span>
          </button>
          
          {showPassengerPopover && (
            <div className="absolute top-full mt-2 w-60 z-30 rounded-[4px] border border-delta-hairline bg-delta-canvas p-4 shadow-lg">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-[600]">Passengers</span>
                    <div className="flex items-center gap-2">
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPassengers(Math.max(1, passengers - 1))}><Minus className="h-3 w-3"/></Button>
                        <span className="text-sm font-mono w-4 text-center">{passengers}</span>
                        <Button variant="outline" size="icon" className="h-7 w-7" onClick={() => setPassengers(passengers + 1)}><Plus className="h-3 w-3"/></Button>
                    </div>
                </div>
            </div>
          )}
        </div>
        
        <div className="flex-1">
            <Button size="lg" className="h-[44px] w-full bg-delta-red px-10 text-white font-[700] hover:bg-delta-red/90">
                Search Flights
            </Button>
        </div>
      </div>

      <div className="mt-6 flex justify-end">
        <Button size="lg" className="h-[48px] bg-delta-red px-10 text-white font-[700] hover:bg-delta-red/90">
            Search Flights
        </Button>
      </div>
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
