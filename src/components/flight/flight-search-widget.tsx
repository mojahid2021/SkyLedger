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
  Luggage,
  Wifi,
  Zap,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  Clock,
  FileText,
  Tag,
  Award,
  Armchair,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"



interface LocationResult {
  id: number
  name: string
  iata_code: string | null
  icao_code: string | null
  country_code: string | null
}

interface Carrier {
  id?: string
  name?: string
  iata_code?: string
  logo_symbol_url?: string | null
  logo_lockup_url?: string | null
  conditions_of_carriage_url?: string | null
}

interface Location {
  id?: string
  name?: string
  iata_code?: string
  city_name?: string | null
  iata_country_code?: string | null
  time_zone?: string | null
}

interface Baggage {
  quantity?: number
  type?: "checked" | "carry_on" | string
}

interface AmenityDetail {
  seat?: { pitch?: string | null; legroom?: string | null; type?: string | null }
  wifi?: { available?: boolean | null; cost?: string | null }
  power?: { available?: boolean | null }
}

interface PassengerSegment {
  passenger_id?: string
  cabin_class?: string
  cabin_class_marketing_name?: string | null
  fare_basis_code?: string | null
  cabin?: {
    name?: string
    marketing_name?: string
    amenities?: AmenityDetail
  }
  baggages?: Baggage[]
}

interface Segment {
  id?: string
  departing_at?: string
  arriving_at?: string
  duration?: string
  origin_terminal?: string | null
  destination_terminal?: string | null
  operating_carrier_flight_number?: string | null
  marketing_carrier_flight_number?: string | null
  distance?: string | null
  aircraft?: { id?: string; iata_code?: string | null; name?: string | null } | null
  stops?: any[]
  operating_carrier?: Carrier | null
  marketing_carrier?: Carrier | null
  origin?: Location | null
  destination?: Location | null
  passengers?: PassengerSegment[]
}

interface Slice {
  id?: string
  duration?: string
  fare_brand_name?: string | null
  ngs_shelf?: number | null
  origin?: Location | null
  destination?: Location | null
  segments?: Segment[]
  conditions?: {
    change_before_departure?: { allowed?: boolean; penalty_amount?: string | null; penalty_currency?: string | null } | null
    priority_check_in?: boolean | null
    priority_boarding?: boolean | null
    advance_seat_selection?: boolean | null
  } | null
}

interface Offer {
  id: string
  total_amount: string
  total_currency: string
  base_amount: string
  base_currency: string
  tax_amount: string
  tax_currency: string
  total_emissions_kg?: string | null
  created_at?: string
  expires_at?: string
  passenger_identity_documents_required?: boolean
  supported_passenger_identity_document_types?: string[]
  supported_loyalty_programmes?: string[]
  payment_requirements?: {
    requires_instant_payment?: boolean
    price_guarantee_expires_at?: string | null
    payment_required_by?: string | null
  } | null
  owner?: Carrier | null
  conditions?: {
    refund_before_departure?: { allowed?: boolean; penalty_amount?: string | null; penalty_currency?: string | null } | null
    change_before_departure?: { allowed?: boolean; penalty_amount?: string | null; penalty_currency?: string | null } | null
  } | null
  slices?: Slice[]
  passengers?: any[]
}

function formatDuration(isoDuration?: string | null): string {
  if (!isoDuration) return ""
  const match = isoDuration.match(/PT(?:(\d+)H)?(?:(\d+)M)?/)
  if (!match) return isoDuration
  const hours = parseInt(match[1] || "0", 10)
  const mins = parseInt(match[2] || "0", 10)
  if (hours > 0 && mins > 0) return `${hours}h ${mins}m`
  if (hours > 0) return `${hours}h`
  if (mins > 0) return `${mins}m`
  return ""
}

function formatFlightTime(isoString?: string | null): string {
  if (!isoString) return ""
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    return format(d, "HH:mm")
  } catch {
    return isoString
  }
}

function formatFlightDate(isoString?: string | null): string {
  if (!isoString) return ""
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    return format(d, "EEE, d MMM yyyy")
  } catch {
    return isoString
  }
}

function formatFlightDateTime(isoString?: string | null): string {
  if (!isoString) return ""
  try {
    const d = new Date(isoString)
    if (isNaN(d.getTime())) return isoString
    return format(d, "d MMM yyyy, HH:mm")
  } catch {
    return isoString
  }
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

  // Keep internal query input synchronized with incoming value prop
  useEffect(() => {
    setQuery(value)
  }, [value])

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

function FlightOfferCard({
  offer,
  index,
  airlineNames,
}: {
  offer: Offer
  index: number
  airlineNames: Record<string, string>
}) {
  const { user } = useAuth()
  const owner = offer.owner || {}
  const ownerName = owner.name || (owner.iata_code ? airlineNames[owner.iata_code.toUpperCase()] : undefined) || "Airline"
  const ownerLogo = owner.logo_symbol_url || owner.logo_lockup_url || (owner.iata_code ? `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${owner.iata_code}.svg` : null)

  const slices = offer.slices || []
  const firstSlice = slices[0]
  const firstSeg = firstSlice?.segments?.[0]

  const flightNumber = firstSeg?.operating_carrier_flight_number || firstSeg?.marketing_carrier_flight_number || ""
  const carrierCode = firstSeg?.operating_carrier?.iata_code || owner.iata_code || ""

  const emissionsKg = offer.total_emissions_kg
  const baseTotalAmount = parseFloat(offer.total_amount || "0")
  const currency = offer.total_currency || "BDT"
  const baseAmount = offer.base_amount
  const taxAmount = offer.tax_amount
  const finalTotalAmount = baseTotalAmount.toFixed(2)

  const refCond = offer.conditions?.refund_before_departure
  const chgCond = offer.conditions?.change_before_departure

  const payReq = offer.payment_requirements
  const priceGuaranteeExp = payReq?.price_guarantee_expires_at ? formatFlightDateTime(payReq.price_guarantee_expires_at) : null
  const payRequiredBy = payReq?.payment_required_by ? formatFlightDateTime(payReq.payment_required_by) : null

  const carriageUrl = owner.conditions_of_carriage_url || firstSeg?.operating_carrier?.conditions_of_carriage_url
  const loyaltyProgs = offer.supported_loyalty_programmes || []
  const docsRequired = offer.passenger_identity_documents_required

  // Format passengers for SeatMapDialog
  const dialogPassengers = (offer.passengers && offer.passengers.length > 0)
    ? offer.passengers.map((p: any, idx: number) => ({
        id: p.id || (idx + 1),
        label: `Passenger ${idx + 1} (${p.type || "Adult"})`,
      }))
    : [{ id: 1, label: "Passenger 1 (Adult)" }]

  return (
    <div className="group rounded-[8px] border border-delta-hairline bg-white shadow-sm hover:border-delta-navy hover:shadow-md transition-all overflow-hidden">
      {/* Top Header Bar */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-slate-50/80 px-5 py-3 border-b border-delta-hairline-light">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Airline Logo */}
          <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded bg-white border border-delta-hairline p-1 shadow-2xs">
            {ownerLogo ? (
              <img
                src={ownerLogo}
                alt={ownerName}
                className="max-h-full max-w-full object-contain"
                onError={(e) => {
                  const target = e.target as HTMLImageElement
                  if (owner.iata_code && !target.src.includes("pics.avs.io")) {
                    target.src = `https://pics.avs.io/80/40/${owner.iata_code}.png`
                  } else {
                    target.style.display = "none"
                  }
                }}
              />
            ) : (
              <span className="font-bold text-[11px] text-delta-navy">{owner.iata_code || "FL"}</span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-[700] text-[15px] text-delta-navy">{ownerName}</span>
            {flightNumber && (
              <span className="rounded bg-delta-navy/10 px-2 py-0.5 text-[11px] font-mono font-[700] text-delta-navy">
                {carrierCode} {flightNumber}
              </span>
            )}
            {firstSlice?.fare_brand_name && (
              <span className="rounded bg-purple-50 text-purple-700 border border-purple-200 px-2 py-0.5 text-[11px] font-[600]">
                {firstSlice.fare_brand_name}
              </span>
            )}
            {firstSlice?.ngs_shelf && (
              <span className="rounded bg-slate-100 text-slate-700 px-2 py-0.5 text-[10px] font-mono font-[600]">
                Shelf {firstSlice.ngs_shelf}
              </span>
            )}
          </div>
        </div>

        {/* Top Right Badges: Eco Emissions & Price Guarantee */}
        <div className="flex items-center gap-2 flex-wrap text-[11px]">
          {emissionsKg && (
            <span className={cn(
              "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-[600] border",
              parseInt(emissionsKg, 10) < 100
                ? "bg-emerald-50 text-emerald-800 border-emerald-200"
                : "bg-emerald-50/70 text-emerald-900 border-emerald-200/60"
            )}>
              <Leaf className="h-3.5 w-3.5 text-emerald-600" />
              <span>{emissionsKg} kg CO₂</span>
            </span>
          )}

          {priceGuaranteeExp && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-200 px-2.5 py-1 font-[500]">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>Price locked until {priceGuaranteeExp}</span>
            </span>
          )}
        </div>
      </div>

      {/* Slices (Itinerary / Route info) */}
      <div className="p-5 space-y-4">
        {slices.map((slice, sIdx) => {
          const sSeg0 = slice.segments?.[0]
          const sSegLast = slice.segments?.[slice.segments.length - 1]
          if (!sSeg0 || !sSegLast) return null

          const origin = sSeg0.origin || slice.origin || {}
          const dest = sSegLast.destination || slice.destination || {}
          const stopsCount = (slice.segments?.length || 1) - 1

          const departTime = formatFlightTime(sSeg0.departing_at)
          const departDateStr = formatFlightDate(sSeg0.departing_at)
          const arrivalTime = formatFlightTime(sSegLast.arriving_at)
          const arrivalDateStr = formatFlightDate(sSegLast.arriving_at)
          const durationStr = formatDuration(slice.duration || sSeg0.duration)
          const aircraftName = sSeg0.aircraft?.name || (sSeg0.aircraft?.iata_code ? `Aircraft (${sSeg0.aircraft.iata_code})` : null)

          return (
            <div key={slice.id || sIdx} className={cn(sIdx > 0 && "pt-4 border-t border-delta-hairline-light")}>
              {slices.length > 1 && (
                <div className="mb-2 text-[12px] font-[700] uppercase tracking-wider text-delta-red flex items-center gap-1.5">
                  <Plane className={cn("h-3.5 w-3.5", sIdx === 1 && "rotate-180")} />
                  {sIdx === 0 ? "Outbound Flight" : "Return Flight"}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Origin */}
                <div className="md:col-span-4 flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[22px] font-[800] text-delta-navy">{departTime}</span>
                    <span className="text-[14px] font-[700] text-delta-navy">{origin.iata_code}</span>
                  </div>
                  <span className="text-[13px] font-[500] text-delta-ink truncate">{origin.city_name || origin.name}</span>
                  <span className="text-[11px] text-delta-ink-muted truncate">
                    {origin.name}
                    {sSeg0.origin_terminal && ` · Terminal ${sSeg0.origin_terminal}`}
                  </span>
                  <span className="text-[11px] text-delta-ink-muted font-mono">{departDateStr}</span>
                </div>

                {/* Timeline / Duration / Stops */}
                <div className="md:col-span-4 flex flex-col items-center justify-center px-2">
                  <span className="text-[12px] font-[600] text-delta-ink-muted">{durationStr}</span>
                  <div className="relative w-full my-1.5 flex items-center justify-center">
                    <div className="w-full h-[2px] bg-delta-hairline" />
                    <div className="absolute bg-white px-1">
                      <Plane className="h-4 w-4 text-delta-navy rotate-90" />
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    {stopsCount === 0 ? (
                      <span className="text-[11px] font-[700] text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                        Non-stop
                      </span>
                    ) : (
                      <span className="text-[11px] font-[700] text-amber-700 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                        {stopsCount} stop{stopsCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {aircraftName && (
                      <span className="text-[11px] text-delta-ink-muted truncate max-w-[150px]" title={aircraftName}>
                        {aircraftName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Destination */}
                <div className="md:col-span-4 flex flex-col md:text-right">
                  <div className="flex items-baseline gap-2 md:justify-end">
                    <span className="text-[22px] font-[800] text-delta-navy">{arrivalTime}</span>
                    <span className="text-[14px] font-[700] text-delta-navy">{dest.iata_code}</span>
                  </div>
                  <span className="text-[13px] font-[500] text-delta-ink truncate">{dest.city_name || dest.name}</span>
                  <span className="text-[11px] text-delta-ink-muted truncate">
                    {dest.name}
                    {sSegLast.destination_terminal && ` · Terminal ${sSegLast.destination_terminal}`}
                  </span>
                  <span className="text-[11px] text-delta-ink-muted font-mono">{arrivalDateStr}</span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Passenger Amenities & Features Footer */}
        {(() => {
          const pass0 = firstSeg?.passengers?.[0]
          const amenities = pass0?.cabin?.amenities
          const baggages = pass0?.baggages || []
          let checkedQty = 0
          let carryOnQty = 0
          baggages.forEach((b) => {
            if (b.type === "checked") checkedQty += b.quantity || 1
            if (b.type === "carry_on") carryOnQty += b.quantity || 1
          })

          const seatPitch = amenities?.seat?.pitch
          const seatLegroom = amenities?.seat?.legroom
          const wifi = amenities?.wifi
          const power = amenities?.power
          const fareCode = pass0?.fare_basis_code

          return (
            <div className="mt-3 pt-3 border-t border-delta-hairline-light flex flex-wrap items-center justify-between gap-3 text-[12px]">
              <div className="flex flex-wrap items-center gap-2">
                {/* Baggage */}
                {(checkedQty > 0 || carryOnQty > 0) && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-slate-100 px-2.5 py-1 font-[500] text-delta-navy border border-slate-200">
                    <Luggage className="h-3.5 w-3.5 text-delta-navy" />
                    {carryOnQty > 0 && `${carryOnQty} Carry-on`}
                    {carryOnQty > 0 && checkedQty > 0 && " · "}
                    {checkedQty > 0 && `${checkedQty} Checked`}
                  </span>
                )}

                {/* Wi-Fi */}
                {wifi?.available && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-emerald-50 px-2.5 py-1 font-[500] text-emerald-800 border border-emerald-200">
                    <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                    {wifi.cost === "paid" ? "Wi-Fi (Paid)" : "Free Wi-Fi"}
                  </span>
                )}

                {/* Power */}
                {power?.available && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-amber-50 px-2.5 py-1 font-[500] text-amber-800 border border-amber-200">
                    <Zap className="h-3.5 w-3.5 text-amber-600" />
                    In-seat Power
                  </span>
                )}

                {/* Seat Pitch */}
                {seatPitch && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-slate-100 px-2.5 py-1 font-[500] text-slate-700 border border-slate-200">
                    <span>Pitch: {seatPitch}&quot;</span>
                    {seatLegroom && seatLegroom !== "n/a" && <span className="capitalize">({seatLegroom})</span>}
                  </span>
                )}

                {/* Loyalty */}
                {loyaltyProgs.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-blue-50 px-2.5 py-1 font-[500] text-blue-800 border border-blue-200">
                    <Award className="h-3.5 w-3.5 text-blue-600" />
                    <span>Earn {loyaltyProgs.join(", ")} miles</span>
                  </span>
                )}

                {/* Fare Code */}
                {fareCode && (
                  <span className="inline-flex items-center gap-1 rounded bg-slate-50 px-2 py-0.5 font-mono text-[10px] font-[600] text-slate-600 border border-slate-200" title="Fare basis code">
                    <Tag className="h-3 w-3 text-slate-400" />
                    {fareCode}
                  </span>
                )}
              </div>

              {/* Conditions / Policy Badges */}
              <div className="flex flex-wrap items-center gap-2 font-[600] text-[11px]">
                {refCond?.allowed ? (
                  <span className="inline-flex items-center gap-1 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded border border-emerald-200">
                    <ShieldCheck className="h-3 w-3 text-emerald-600" />
                    {refCond.penalty_amount ? `Refundable (৳${refCond.penalty_amount} fee)` : "Fully Refundable"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    <ShieldAlert className="h-3 w-3 text-slate-500" />
                    Non-refundable
                  </span>
                )}

                {chgCond?.allowed ? (
                  <span className="inline-flex items-center gap-1 text-blue-700 bg-blue-50 px-2 py-0.5 rounded border border-blue-200">
                    <RefreshCw className="h-3 w-3 text-blue-600" />
                    {chgCond.penalty_amount ? `Changeable (৳${chgCond.penalty_amount} fee)` : "Free Changes"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1 text-slate-600 bg-slate-100 px-2 py-0.5 rounded border border-slate-200">
                    Non-changeable
                  </span>
                )}

                {docsRequired && (
                  <span className="inline-flex items-center gap-1 text-amber-800 bg-amber-50 px-2 py-0.5 rounded border border-amber-200">
                    <FileText className="h-3 w-3 text-amber-600" />
                    Passport Required
                  </span>
                )}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Card Footer Bar: Price, Tax & Book Action */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-slate-50 px-5 py-3 border-t border-delta-hairline-light">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-[800] text-delta-red">৳{finalTotalAmount}</span>
              <span className="text-[12px] font-[700] text-delta-navy">{currency}</span>
            </div>
            <div className="text-[11px] text-delta-ink-muted">
              Base: ৳{baseAmount} + Tax: ৳{taxAmount} · Total per traveler
            </div>
          </div>

          {payRequiredBy && (
            <div className="hidden sm:block text-[11px] text-slate-600 border-l border-delta-hairline-light pl-3">
              <span className="font-[600]">Payment due:</span> {payRequiredBy}
            </div>
          )}
        </div>

        <div className="flex items-center gap-3 ml-auto">
          {carriageUrl && (
            <a
              href={carriageUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="hidden lg:inline-flex items-center gap-1 text-[11px] font-[500] text-delta-navy hover:underline"
            >
              Conditions of carriage <ExternalLink className="h-3 w-3" />
            </a>
          )}

          <Button
            size="sm"
            onClick={() => {
              if (!user) {
                window.location.href = "/login"
                return
              }
              try {
                sessionStorage.setItem("skyledger_selected_offer", JSON.stringify(offer))
              } catch {}
              window.location.href = `/booking?offerId=${encodeURIComponent(offer.id)}`
            }}
            className="bg-delta-red hover:bg-delta-red/90 text-white font-[700] px-6 h-10 flex items-center gap-2 rounded-[4px]"
          >
            <span>{user ? "Book Now" : "Sign In to Book"}</span>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}

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
  const [cabin, setCabin] = useState("Main Cabin")
  const [showPassengerPopover, setShowPassengerPopover] = useState(false)

  const [searching, setSearching] = useState(false)
  const [searchError, setSearchError] = useState<string | null>(null)
  const [searchResults, setSearchResults] = useState<Offer[] | null>(null)
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
      let reqCabin = "economy"
      if (cabin === "Comfort+") reqCabin = "premium_economy"
      if (cabin === "First Class") reqCabin = "first"
      if (cabin === "Delta One") reqCabin = "business"

      const url = `/api/flights/search?origin=${encodeURIComponent(originParam)}&destination=${encodeURIComponent(destParam)}&departure_at=${depart}&one_way=${tripType === "oneway"}&cabin=${reqCabin}&passengers=${passengers}`
      const res = await fetch(tripType === "round" && returnDate ? url + `&return_at=${returnDate}` : url)
      const flightData = await res.json()

      if (flightData.success && Array.isArray(flightData.data)) {
        setSearchResults(flightData.data)
        setRouteInfo({ origin: originParam, destination: destParam })
      } else {
        const errMessage = flightData.details ? flightData.details[0]?.message : (flightData.error || "No flights found matching your search criteria.")
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
            <div className="space-y-4">
              {searchResults.map((offer, idx) => (
                <FlightOfferCard key={offer.id || `offer-${idx}`} offer={offer} index={idx} airlineNames={airlineNames} />
              ))}
            </div>
          )}
        </div>
      )}
    </div>
  )
}
