"use client"

import React from "react"
import {
  Plane,
  Leaf,
  Clock,
  Luggage,
  Wifi,
  Zap,
  Award,
  Tag,
  ShieldCheck,
  ShieldAlert,
  RefreshCw,
  FileText,
  ExternalLink,
} from "lucide-react"

import { Button } from "@/components/ui/button"
import { format } from "date-fns"
import { cn } from "@/lib/utils"
import { useAuth } from "@/context/auth-context"
import { Offer } from "./types"

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

export function FlightOfferCard({
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
  const ownerName =
    owner.name ||
    (owner.iata_code ? airlineNames[owner.iata_code.toUpperCase()] : undefined) ||
    "Airline"
  const ownerLogo =
    owner.logo_symbol_url ||
    owner.logo_lockup_url ||
    (owner.iata_code
      ? `https://assets.duffel.com/img/airlines/for-light-background/full-color-logo/${owner.iata_code}.svg`
      : null)

  const slices = offer.slices || []
  const firstSlice = slices[0]
  const firstSeg = firstSlice?.segments?.[0]

  const flightNumber =
    firstSeg?.operating_carrier_flight_number ||
    firstSeg?.marketing_carrier_flight_number ||
    ""
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
  const priceGuaranteeExp = payReq?.price_guarantee_expires_at
    ? formatFlightDateTime(payReq.price_guarantee_expires_at)
    : null
  const payRequiredBy = payReq?.payment_required_by
    ? formatFlightDateTime(payReq.payment_required_by)
    : null

  const carriageUrl =
    owner.conditions_of_carriage_url ||
    firstSeg?.operating_carrier?.conditions_of_carriage_url
  const loyaltyProgs = offer.supported_loyalty_programmes || []
  const docsRequired = offer.passenger_identity_documents_required

  return (
    <div className="group rounded-[4px] bg-delta-canvas transition-all overflow-hidden flex flex-col gap-0 border border-delta-hairline font-delta">
      {/* Top Header Bar - styled with delta-surface-1 background (no border-b line) */}
      <div className="flex flex-wrap items-center justify-between gap-3 bg-delta-surface-1 px-5 py-3">
        <div className="flex items-center gap-3 flex-wrap">
          {/* Airline Logo */}
          <div className="flex h-9 w-12 shrink-0 items-center justify-center rounded bg-white p-1 border border-delta-hairline-light">
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
              <span className="font-bold text-[11px] text-delta-navy">
                {owner.iata_code || "FL"}
              </span>
            )}
          </div>

          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-[700] text-[15px] text-delta-navy">{ownerName}</span>
            {flightNumber && (
              <span className="rounded bg-delta-navy/5 px-2 py-0.5 text-[11px] font-mono font-[700] text-delta-navy">
                {carrierCode} {flightNumber}
              </span>
            )}
            {firstSlice?.fare_brand_name && (
              <span className="rounded bg-purple-50 text-purple-700 border border-purple-100 px-2 py-0.5 text-[11px] font-[600]">
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
            <span
              className={cn(
                "inline-flex items-center gap-1.5 rounded-full px-2.5 py-1 font-[600] border",
                parseInt(emissionsKg, 10) < 100
                  ? "bg-emerald-50 text-emerald-800 border-emerald-100"
                  : "bg-emerald-50/70 text-emerald-900 border-emerald-100/60"
              )}
            >
              <Leaf className="h-3.5 w-3.5 text-emerald-600" />
              <span>{emissionsKg} kg CO₂</span>
            </span>
          )}

          {priceGuaranteeExp && (
            <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-50 text-amber-800 border border-amber-100 px-2.5 py-1 font-[550]">
              <Clock className="h-3.5 w-3.5 text-amber-600" />
              <span>Price locked until {priceGuaranteeExp}</span>
            </span>
          )}
        </div>
      </div>

      {/* Slices (Itinerary / Route info) */}
      <div className="p-5 space-y-5">
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
          const aircraftName =
            sSeg0.aircraft?.name ||
            (sSeg0.aircraft?.iata_code ? `Aircraft (${sSeg0.aircraft.iata_code})` : null)

          return (
            <div
              key={slice.id || sIdx}
              className={cn(
                sIdx > 0 && "pt-5 bg-delta-surface-2/30 rounded-[4px] p-4" // Visual grouping using background instead of border-t lines
              )}
            >
              {slices.length > 1 && (
                <div className="mb-3 text-[12px] font-[700] uppercase tracking-wider text-delta-red flex items-center gap-1.5">
                  <Plane className={cn("h-3.5 w-3.5", sIdx === 1 && "rotate-180")} />
                  {sIdx === 0 ? "Outbound Flight" : "Return Flight"}
                </div>
              )}

              <div className="grid grid-cols-1 md:grid-cols-12 gap-4 items-center">
                {/* Origin */}
                <div className="md:col-span-4 flex flex-col">
                  <div className="flex items-baseline gap-2">
                    <span className="text-[22px] font-[700] text-delta-navy">{departTime}</span>
                    <span className="text-[14px] font-[700] text-delta-navy">{origin.iata_code}</span>
                  </div>
                  <span className="text-[13px] font-[500] text-delta-ink truncate">
                    {origin.city_name || origin.name}
                  </span>
                  <span className="text-[11px] text-delta-ink-muted truncate">
                    {origin.name}
                    {sSeg0.origin_terminal && ` · Terminal ${sSeg0.origin_terminal}`}
                  </span>
                  <span className="text-[11px] text-delta-ink-muted font-mono mt-0.5">
                    {departDateStr}
                  </span>
                </div>

                {/* Duration / Stops (Redesigned connector to avoid lines) */}
                <div className="md:col-span-4 flex flex-col items-center justify-center px-4 py-2">
                  <span className="text-[12px] font-[700] text-delta-navy">{durationStr}</span>
                  
                  {/* Visual connector with simple clean spacing dots, no line */}
                  <div className="flex items-center gap-1.5 my-1 text-delta-navy/40">
                    <span className="h-1 w-1 rounded-full bg-delta-navy-mid/30" />
                    <Plane className="h-3.5 w-3.5 text-delta-red rotate-90 mx-1 opacity-75" />
                    <span className="h-1 w-1 rounded-full bg-delta-navy-mid/30" />
                  </div>

                  <div className="flex flex-col items-center gap-0.5">
                    {stopsCount === 0 ? (
                      <span className="text-[10px] font-[700] uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                        Non-stop
                      </span>
                    ) : (
                      <span className="text-[10px] font-[700] uppercase tracking-wider text-amber-700 bg-amber-50 px-2 py-0.5 rounded">
                        {stopsCount} stop{stopsCount > 1 ? "s" : ""}
                      </span>
                    )}
                    {aircraftName && (
                      <span
                        className="text-[10px] text-delta-ink-muted truncate max-w-[150px] mt-0.5 block"
                        title={aircraftName}
                      >
                        {aircraftName}
                      </span>
                    )}
                  </div>
                </div>

                {/* Destination */}
                <div className="md:col-span-4 flex flex-col md:text-right">
                  <div className="flex items-baseline gap-2 md:justify-end">
                    <span className="text-[22px] font-[700] text-delta-navy">{arrivalTime}</span>
                    <span className="text-[14px] font-[700] text-delta-navy">{dest.iata_code}</span>
                  </div>
                  <span className="text-[13px] font-[500] text-delta-ink truncate">
                    {dest.city_name || dest.name}
                  </span>
                  <span className="text-[11px] text-delta-ink-muted truncate">
                    {dest.name}
                    {sSegLast.destination_terminal && ` · Terminal ${sSegLast.destination_terminal}`}
                  </span>
                  <span className="text-[11px] text-delta-ink-muted font-mono mt-0.5">
                    {arrivalDateStr}
                  </span>
                </div>
              </div>
            </div>
          )
        })}

        {/* Passenger Amenities & Features Section */}
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
            <div className="mt-3 flex flex-col gap-3.5 text-[12px]">
              {/* Badges container */}
              <div className="flex flex-wrap items-center gap-2">
                {/* Baggage */}
                {(checkedQty > 0 || carryOnQty > 0) && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-delta-surface-1 px-2.5 py-1 font-[500] text-delta-navy border border-delta-hairline-light">
                    <Luggage className="h-3.5 w-3.5 text-delta-navy" />
                    {carryOnQty > 0 && `${carryOnQty} Carry-on`}
                    {carryOnQty > 0 && checkedQty > 0 && " · "}
                    {checkedQty > 0 && `${checkedQty} Checked`}
                  </span>
                )}

                {/* Wi-Fi */}
                {wifi?.available && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-emerald-50 px-2.5 py-1 font-[500] text-emerald-800 border border-emerald-100">
                    <Wifi className="h-3.5 w-3.5 text-emerald-600" />
                    {wifi.cost === "paid" ? "Wi-Fi (Paid)" : "Free Wi-Fi"}
                  </span>
                )}

                {/* Power */}
                {power?.available && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-amber-50 px-2.5 py-1 font-[500] text-amber-800 border border-amber-100">
                    <Zap className="h-3.5 w-3.5 text-amber-600" />
                    In-seat Power
                  </span>
                )}

                {/* Seat Pitch */}
                {seatPitch && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-delta-surface-1 px-2.5 py-1 font-[500] text-slate-700 border border-delta-hairline-light">
                    <span>Pitch: {seatPitch}&quot;</span>
                    {seatLegroom && seatLegroom !== "n/a" && (
                      <span className="capitalize">({seatLegroom})</span>
                    )}
                  </span>
                )}

                {/* Loyalty */}
                {loyaltyProgs.length > 0 && (
                  <span className="inline-flex items-center gap-1.5 rounded bg-blue-50 px-2.5 py-1 font-[500] text-blue-800 border border-blue-100">
                    <Award className="h-3.5 w-3.5 text-blue-600" />
                    <span>Earn {loyaltyProgs.join(", ")} miles</span>
                  </span>
                )}

                {/* Fare Code */}
                {fareCode && (
                  <span
                    className="inline-flex items-center gap-1 rounded bg-delta-surface-1 px-2 py-0.5 font-mono text-[10px] font-[600] text-slate-600 border border-delta-hairline-light"
                    title="Fare basis code"
                  >
                    <Tag className="h-3 w-3 text-slate-400" />
                    {fareCode}
                  </span>
                )}
              </div>

              {/* Conditions / Policy Badges */}
              <div className="flex flex-wrap items-center gap-2 font-[600] text-[11px]">
                {refCond?.allowed ? (
                  <span className="inline-flex items-center gap-1.5 text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                    <ShieldCheck className="h-3 w-3.5 text-emerald-600" />
                    {refCond.penalty_amount
                      ? `Refundable (৳${refCond.penalty_amount} fee)`
                      : "Fully Refundable"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    <ShieldAlert className="h-3 w-3.5 text-slate-500" />
                    Non-refundable
                  </span>
                )}

                {chgCond?.allowed ? (
                  <span className="inline-flex items-center gap-1.5 text-blue-700 bg-blue-50 px-2 py-0.5 rounded">
                    <RefreshCw className="h-3 w-3.5 text-blue-600" />
                    {chgCond.penalty_amount
                      ? `Changeable (৳${chgCond.penalty_amount} fee)`
                      : "Free Changes"}
                  </span>
                ) : (
                  <span className="inline-flex items-center gap-1.5 text-slate-600 bg-slate-100 px-2 py-0.5 rounded">
                    Non-changeable
                  </span>
                )}

                {docsRequired && (
                  <span className="inline-flex items-center gap-1.5 text-amber-800 bg-amber-50 px-2 py-0.5 rounded">
                    <FileText className="h-3.5 w-3.5 text-amber-600" />
                    Passport Required
                  </span>
                )}
              </div>
            </div>
          )
        })()}
      </div>

      {/* Card Footer Bar: Price, Tax & Book Action (Styled with delta-surface-1, height 48px CTA, no border-t line) */}
      <div className="flex flex-wrap items-center justify-between gap-4 bg-delta-surface-1 px-5 py-3">
        <div className="flex items-center gap-4">
          <div>
            <div className="flex items-baseline gap-1">
              <span className="text-[22px] font-[700] text-delta-red">৳{finalTotalAmount}</span>
              <span className="text-[12px] font-[700] text-delta-navy">{currency}</span>
            </div>
            <div className="text-[11px] text-delta-ink-muted">
              Base: ৳{baseAmount} + Tax: ৳{taxAmount} · Total per traveler
            </div>
          </div>

          {payRequiredBy && (
            <div className="hidden sm:block text-[11px] text-slate-600 bg-white px-2 py-1 rounded-[4px] border border-delta-hairline-light">
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
            size="lg"
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
            className="bg-delta-red hover:bg-delta-red-hover text-white font-[700] px-6 h-[48px] flex items-center gap-2 rounded-[4px] cursor-pointer"
          >
            <span>{user ? "Book Now" : "Sign In to Book"}</span>
            <ExternalLink className="h-4 w-4" />
          </Button>
        </div>
      </div>
    </div>
  )
}
