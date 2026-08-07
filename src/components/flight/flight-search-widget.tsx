"use client"

import React, { useState, useRef, useEffect } from "react"
import {
  Plane,
  ArrowRightLeft,
  CalendarDays,
  Users,
  Search,
  ChevronDown,
  Minus,
  Plus,
  Leaf,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"

import { format } from "date-fns"
import { cn } from "@/lib/utils"

interface LocationResult {
  id: number
  name: string
  iata_code: string | null
  icao_code: string | null
  country_code: string | null
}

interface TimEmissionsDetails {
  emissionsGramsPerPax?: {
    first?: number
    business?: number
    premiumEconomy?: number
    economy?: number
    mean?: number
  }
  emissionsBreakdown?: {
    wttEmissionsGramsPerPax?: { first?: number; business?: number; premiumEconomy?: number; economy?: number; mean?: number }
    ttwEmissionsGramsPerPax?: { first?: number; business?: number; premiumEconomy?: number; economy?: number; mean?: number }
  }
  contrailsImpactBucket?: string
  source?: string
  timWebsiteEmissionsCalculatorUrl?: string
}

function getCabinEmissions(details: TimEmissionsDetails | undefined, selectedCabin: string) {
  if (!details || !details.emissionsGramsPerPax) return null

  const keyMap: Record<string, keyof NonNullable<TimEmissionsDetails["emissionsGramsPerPax"]>> = {
    "Main Cabin": "economy",
    "Comfort+": "premiumEconomy",
    "First Class": "first",
    "Delta One": "business",
  }

  const classKey = keyMap[selectedCabin] || "economy"
  const totalGrams = details.emissionsGramsPerPax[classKey] ?? details.emissionsGramsPerPax.economy ?? details.emissionsGramsPerPax.mean ?? 0
  const wttGrams = details.emissionsBreakdown?.wttEmissionsGramsPerPax?.[classKey] ?? details.emissionsBreakdown?.wttEmissionsGramsPerPax?.economy ?? details.emissionsBreakdown?.wttEmissionsGramsPerPax?.mean ?? 0
  const ttwGrams = details.emissionsBreakdown?.ttwEmissionsGramsPerPax?.[classKey] ?? details.emissionsBreakdown?.ttwEmissionsGramsPerPax?.economy ?? details.emissionsBreakdown?.ttwEmissionsGramsPerPax?.mean ?? 0

  return {
    totalKg: Math.round(totalGrams / 1000),
    wttKg: Math.round(wttGrams / 1000),
    ttwKg: Math.round(ttwGrams / 1000),
  }
}

function formatContrailBucket(bucket?: string): string {
  if (!bucket) return "Contrail Impact: Low"
  const clean = bucket.replace("CONTRAILS_IMPACT_", "").toLowerCase()
  return `Contrail Impact: ${clean.charAt(0).toUpperCase() + clean.slice(1)}`
}

interface AviasalesFlight {
  origin: string
  destination: string
  origin_airport?: string
  destination_airport?: string
  price: number
  airline: string
  flight_number: string | number
  departure_at: string
  return_at?: string
  transfers?: number
  return_transfers?: number
  duration?: number
  duration_to?: number
  duration_back?: number
  link?: string
  emissionsDetails?: TimEmissionsDetails
}

const CABIN_CLASSES = ["Main Cabin", "Comfort+", "First Class", "Delta One"]

function useLocationSearch(query: string): { results: LocationResult[]; loading: boolean } {
  const [results, setResults] = useState<LocationResult[]>([])
  const [loading, setLoading] = useState(false)
  const timerRef = useRef<ReturnType<typeof setTimeout> | null>(null)

  useEffect(() => {
    if (timerRef.current) clearTimeout(timerRef.current)

    if (!query || query.trim().length < 2) {
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

  const activeResults = (!query || query.trim().length < 2) ? [] : results

  return { results: activeResults, loading }
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
  onChange: (val: string, code: string) => void
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
            onChange(e.target.value, e.target.value)
            setOpen(true)
          }}
          onFocus={() => setOpen(true)}
          onBlur={() => setTimeout(() => setOpen(false), 200)}
          placeholder={`Search airport or city...`}
          className="h-[44px] w-full rounded-[4px] border border-delta-hairline bg-delta-canvas pl-9 pr-3 text-[15px] text-delta-ink outline-none focus:border-delta-navy focus:ring-2 focus:ring-delta-navy/10"
        />
        {open && query.trim().length >= 2 && (
          <div className="absolute z-30 mt-1 max-h-72 w-full overflow-auto rounded-[4px] border border-delta-hairline bg-delta-canvas shadow-[0_8px_24px_rgba(0,0,0,0.14)]">
            {loading && (
              <p className="px-3 py-3 text-[13px] text-delta-ink-muted">Searching airports...</p>
            )}
            {!loading && results.length === 0 && (
              <p className="px-3 py-3 text-[13px] text-delta-ink-muted">No matching airports found</p>
            )}
            {!loading && results.map((ap) => {
              const apCode = ap.iata_code || ap.icao_code || ""
              const displayLabel = `${ap.name}${apCode ? ` (${apCode})` : ""}${ap.country_code ? ` · ${ap.country_code}` : ""}`

              return (
                <button
                  key={`ap-${ap.id}`}
                  type="button"
                  onMouseDown={() => {
                    setQuery(displayLabel)
                    onChange(displayLabel, apCode)
                    setOpen(false)
                  }}
                  className="flex w-full items-center justify-between px-3 py-2 text-left text-[13px] text-delta-ink hover:bg-delta-surface-1 transition-colors border-b border-delta-hairline-light last:border-0"
                >
                  <div className="flex items-center gap-2.5 min-w-0 pr-2">
                    <Plane className="h-4 w-4 text-delta-navy shrink-0" />
                    <span className="truncate font-[500] text-delta-navy">{ap.name}</span>
                  </div>

                  <div className="flex items-center gap-1.5 shrink-0">
                    {ap.iata_code && (
                      <span className="rounded bg-delta-navy px-1.5 py-0.5 font-mono text-[10px] font-[700] text-white">
                        {ap.iata_code}
                      </span>
                    )}
                    {ap.icao_code && ap.icao_code !== ap.iata_code && (
                      <span className="rounded bg-delta-navy/70 px-1.5 py-0.5 font-mono text-[10px] font-[700] text-white">
                        {ap.icao_code}
                      </span>
                    )}
                    {ap.country_code && (
                      <span className="text-[11px] font-[400] text-delta-ink-muted">{ap.country_code}</span>
                    )}
                  </div>
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
  const [fromCode, setFromCode] = useState("")
  const [to, setTo] = useState("")
  const [toCode, setToCode] = useState("")
  const [depart, setDepart] = useState(() => format(new Date(), "yyyy-MM-dd"))
  const [returnDate, setReturnDate] = useState(() =>
    format(new Date(Date.now() + 7 * 86400000), "yyyy-MM-dd")
  )
  const [passengers, setPassengers] = useState(1)
  const [cabin, setCabin] = useState("Main Cabin")
  const [showPassengerPopover, setShowPassengerPopover] = useState(false)

  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<AviasalesFlight[] | null>(null)
  const [routeInfo, setRouteInfo] = useState<{ origin: string; destination: string } | null>(null)

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
      let url = `/api/flights/search?origin=${encodeURIComponent(originParam)}&destination=${encodeURIComponent(destParam)}&departure_at=${depart}&one_way=${tripType === "oneway"}&cy=usd&currency=usd`
      if (tripType === "round" && returnDate) {
        url += `&return_at=${returnDate}`
      }

      const res = await fetch(url)
      const data = await res.json()

      if (data.success && Array.isArray(data.data)) {
        setSearchResults(data.data)
        setRouteInfo({
          origin: data.originCode || originParam,
          destination: data.destinationCode || destParam,
        })
      } else if (data.success && data.data && typeof data.data === "object") {
        const list = Object.values(data.data).flat() as AviasalesFlight[]
        setSearchResults(list)
        setRouteInfo({
          origin: data.originCode || originParam,
          destination: data.destinationCode || destParam,
        })
      } else {
        setSearchError(data.error || "No flights found matching your search criteria.")
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
          onChange={(val, code) => {
            setFrom(val)
            setFromCode(code)
          }}
        />

        {/* To */}
        <LocationInput
          label="To"
          icon={<ArrowRightLeft className="h-4 w-4" />}
          value={to}
          onChange={(val, code) => {
            setTo(val)
            setToCode(code)
          }}
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

      {/* Passengers + Cabin + Search */}
      <div className="mt-4 flex flex-col sm:flex-row gap-3 items-end">
        {/* Passengers */}
        <div className="relative flex-1 sm:flex-none">
          <button
            type="button"
            onClick={() => setShowPassengerPopover((v) => !v)}
            className="h-[44px] w-full sm:w-[240px] rounded-[4px] border border-delta-hairline bg-delta-canvas px-3 text-left text-[14px] text-delta-ink hover:border-delta-navy flex items-center justify-between"
          >
            <span className="flex items-center gap-2 truncate">
              <Users className="h-4 w-4 text-delta-ink-muted shrink-0" />
              <span className="truncate">
                {passengers} {passengers === 1 ? "Traveler" : "Travelers"} · {cabin}
              </span>
            </span>
            <ChevronDown className="h-4 w-4 text-delta-ink-muted shrink-0" />
          </button>

          {showPassengerPopover && (
            <div className="absolute z-20 mt-1 w-full min-w-[240px] rounded-[4px] border border-delta-hairline bg-delta-canvas p-3 shadow-[0_8px_24px_rgba(0,0,0,0.12)]">
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

        {/* Search CTA button */}
        <div className="flex-1 sm:flex-initial sm:ml-auto">
          <Button
            size="lg"
            onClick={handleSearch}
            disabled={searching}
            className="h-[44px] w-full sm:w-auto bg-delta-red px-10 text-white font-[700] hover:bg-delta-red/90 flex items-center justify-center gap-2"
          >
            <Search className="h-4 w-4" />
            {searching ? "Searching..." : "Search Flights"}
          </Button>
        </div>
      </div>

      {/* Error Message */}
      {searchError && (
        <div className="mt-4 rounded-[4px] border border-red-200 bg-red-50 p-3 text-[14px] text-red-700">
          {searchError}
        </div>
      )}

      {/* Flight Search Results */}
      {searchResults !== null && (
        <div className="mt-8 border-t border-delta-hairline-light pt-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-[18px] font-[700] text-delta-navy flex items-center gap-2">
              <Plane className="h-5 w-5 text-delta-red" />
              Flight Deals for {routeInfo?.origin} → {routeInfo?.destination}
            </h3>
            <span className="text-[13px] text-delta-ink-muted">
              {searchResults.length} {searchResults.length === 1 ? "deal" : "deals"} found
            </span>
          </div>

          {searchResults.length === 0 ? (
            <div className="rounded-[4px] border border-delta-hairline bg-delta-surface-1 p-6 text-center text-delta-ink-muted text-[14px]">
              No flight deals found for this route on the selected dates. Try adjusting your departure date or choosing different airports.
            </div>
          ) : (
            <div className="space-y-3">
              {searchResults.map((flight, idx) => {
                const departDate = flight.departure_at ? new Date(flight.departure_at) : null
                const returnDt = flight.return_at ? new Date(flight.return_at) : null
                const formattedDepart = departDate && !isNaN(departDate.getTime()) ? format(departDate, "MMM d, yyyy HH:mm") : (flight.departure_at || "")
                const formattedReturn = returnDt && !isNaN(returnDt.getTime()) ? format(returnDt, "MMM d, yyyy HH:mm") : (flight.return_at || "")
                const flightUrl = flight.link
                  ? (flight.link.startsWith("http") ? flight.link : `https://www.aviasales.com${flight.link}`)
                  : `https://www.aviasales.com/search/${flight.origin}${depart.replace(/-/g, "")}${flight.destination}`

                const totalDuration = flight.duration || (flight.duration_to ? flight.duration_to + (flight.duration_back || 0) : 0)
                const durationHours = Math.floor(totalDuration / 60)
                const durationMins = totalDuration % 60

                return (
                  <div
                    key={`${flight.airline}-${flight.flight_number}-${idx}`}
                    className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 rounded-[6px] border border-delta-hairline bg-white p-4 shadow-sm hover:border-delta-navy transition-all"
                  >
                    <div className="flex items-center gap-4 flex-1">
                      {/* Airline logo */}
                      <div className="flex h-10 w-12 shrink-0 items-center justify-center rounded bg-delta-surface-1 border border-delta-hairline p-1">
                        <img
                          src={`https://pics.avs.io/80/40/${flight.airline}.png`}
                          alt={flight.airline}
                          className="max-h-full max-w-full object-contain"
                          onError={(e) => {
                            (e.target as HTMLElement).style.display = "none"
                          }}
                        />
                        <span className="font-bold text-[12px] text-delta-navy">{flight.airline}</span>
                      </div>

                      {/* Flight Details */}
                      <div>
                        <div className="flex items-center gap-2">
                          <span className="font-[700] text-[15px] text-delta-navy">
                            {flight.origin_airport || flight.origin} → {flight.destination_airport || flight.destination}
                          </span>
                          <span className="rounded bg-delta-navy/10 px-2 py-0.5 text-[11px] font-mono font-[600] text-delta-navy">
                            {flight.airline} {flight.flight_number}
                          </span>
                          {flight.transfers === 0 ? (
                            <span className="rounded bg-green-100 px-2 py-0.5 text-[11px] font-[600] text-green-800">
                              Non-stop
                            </span>
                          ) : (
                            <span className="rounded bg-amber-100 px-2 py-0.5 text-[11px] font-[600] text-amber-800">
                              {flight.transfers} stop{flight.transfers! > 1 ? "s" : ""}
                            </span>
                          )}
                        </div>

                        <div className="mt-1 flex flex-wrap items-center gap-x-4 gap-y-1 text-[13px] text-delta-ink-muted">
                          <span>Depart: <strong className="text-delta-ink font-[500]">{formattedDepart}</strong></span>
                          {formattedReturn && (
                            <span>Return: <strong className="text-delta-ink font-[500]">{formattedReturn}</strong></span>
                          )}
                          {totalDuration > 0 && (
                            <span>Duration: <strong className="text-delta-ink font-[500]">{durationHours}h {durationMins}m</strong></span>
                          )}
                        </div>

                        {/* Google Travel Impact Model (TIM) Emissions */}
                        {flight.emissionsDetails && (() => {
                          const emissionsInfo = getCabinEmissions(flight.emissionsDetails, cabin)
                          if (!emissionsInfo) return null

                          return (
                            <div className="mt-2.5 flex flex-wrap items-center gap-2 pt-2 border-t border-delta-hairline-light text-[12px]">
                              <span className="inline-flex items-center gap-1 rounded bg-emerald-50 px-2 py-0.5 font-[600] text-emerald-800 border border-emerald-200">
                                <Leaf className="h-3 w-3 text-emerald-600" />
                                {emissionsInfo.totalKg > 0 ? `${emissionsInfo.totalKg} kg CO2e / pax` : "Emissions Calculated"}
                              </span>

                              {(emissionsInfo.ttwKg > 0 || emissionsInfo.wttKg > 0) && (
                                <span className="text-delta-ink-muted">
                                  (TTW: {emissionsInfo.ttwKg} kg · WTT: {emissionsInfo.wttKg} kg)
                                </span>
                              )}

                              {flight.emissionsDetails.contrailsImpactBucket && (
                                <span className="rounded bg-sky-50 px-1.5 py-0.5 text-[11px] font-[500] text-sky-700 border border-sky-200">
                                  {formatContrailBucket(flight.emissionsDetails.contrailsImpactBucket)}
                                </span>
                              )}

                              {flight.emissionsDetails.source && (
                                <span className="rounded bg-gray-100 px-1.5 py-0.5 text-[10px] font-mono font-[700] text-gray-700">
                                  {flight.emissionsDetails.source}
                                </span>
                              )}

                              {flight.emissionsDetails.timWebsiteEmissionsCalculatorUrl && (
                                <a
                                  href={flight.emissionsDetails.timWebsiteEmissionsCalculatorUrl}
                                  target="_blank"
                                  rel="noopener noreferrer"
                                  className="inline-flex items-center gap-1 text-[11px] text-delta-navy font-[600] hover:underline ml-auto"
                                >
                                  Travel Impact Model (TIM)
                                  <ExternalLink className="h-3 w-3" />
                                </a>
                              )}
                            </div>
                          )
                        })()}
                      </div>
                    </div>

                    {/* Price & Book */}
                    <div className="flex items-center gap-4 w-full sm:w-auto justify-between sm:justify-end border-t sm:border-t-0 border-delta-hairline-light pt-3 sm:pt-0">
                      <div className="text-right">
                        <div className="text-[20px] font-[800] text-delta-red">
                          ${flight.price}
                        </div>
                        <div className="text-[11px] text-delta-ink-muted uppercase">per traveler</div>
                      </div>

                      <a
                        href={flightUrl}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="rounded-[4px] bg-delta-red px-5 py-2.5 text-[14px] font-[700] text-white hover:bg-delta-red/90 transition-colors shrink-0"
                      >
                        Book Deal
                      </a>
                    </div>
                  </div>
                )
              })}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
