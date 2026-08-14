"use client"

import React, { useState, useEffect } from "react"
import { motion } from "framer-motion"
import { Button } from "@/components/ui/button"
import {
  AlertTriangle,
  Check,
  Plane,
  User,
  Loader2,
  RefreshCw,
  ArrowRight,
  ChevronRight,
} from "lucide-react"
import {
  SeatMap,
  Cabin,
  CabinRow,
  RowElement,
  SeatElement,
  AvailableService,
  SelectedSeatChoice,
} from "@/types/seat-map"

interface SeatMapInlineProps {
  offerId: string
  passengersCount?: number
  initialSelections?: SelectedSeatChoice[]
  onConfirmSeats?: (selectedSeats: SelectedSeatChoice[]) => void
  onCancel?: () => void
}

const CABIN_LABELS: Record<string, string> = {
  first:           "First Class",
  business:        "Business Class",
  premium_economy: "Premium Economy",
  economy:         "Economy",
}

// DESIGN.md palette cabin zone styling (no dark colors)
const CABIN_STYLES: Record<string, { bg: string; label: string; border: string }> = {
  first:           { bg: "bg-amber-50",    label: "text-amber-800",   border: "border-amber-200" },
  business:        { bg: "bg-delta-surface-2",  label: "text-delta-navy",   border: "border-delta-hairline" },
  premium_economy: { bg: "bg-sky-50",      label: "text-sky-800",     border: "border-sky-200" },
  economy:         { bg: "bg-delta-surface-1",  label: "text-delta-ink",    border: "border-delta-hairline" },
}

// Color per passenger — standard palette colors only
const PAX_COLORS = ["#e31837", "#005480", "#2e7d32", "#e65100"]
const PAX_BG     = ["bg-red-100",  "bg-sky-100",  "bg-green-100",  "bg-orange-100"]
const PAX_TEXT   = ["text-red-700","text-sky-700","text-green-700","text-orange-700"]
const PAX_BORDER = ["border-red-300","border-sky-300","border-green-300","border-orange-300"]

export function SeatMapInline({
  offerId,
  passengersCount = 1,
  initialSelections = [],
  onConfirmSeats,
  onCancel,
}: SeatMapInlineProps) {
  const [loading, setLoading]           = useState<boolean>(false)
  const [error, setError]               = useState<string | null>(null)
  const [fallbackNotice, setFallback]   = useState<string | null>(null)
  const [seatMaps, setSeatMaps]         = useState<SeatMap[]>([])
  const [activeSegmentIndex, setActiveSeg]  = useState<number>(0)
  const [activePassengerIndex, setActivePax] = useState<number>(0)
  const [activeDeck, setActiveDeck]         = useState<number>(0)
  const [selectedSeats, setSelectedSeats]   = useState<SelectedSeatChoice[]>(initialSelections)

  useEffect(() => { if (offerId) fetchSeatMaps(offerId) }, [offerId])
  useEffect(() => { if (initialSelections.length > 0) setSelectedSeats(initialSelections) }, [initialSelections])

  async function fetchSeatMaps(id: string) {
    setLoading(true); setError(null); setFallback(null)
    try {
      const res  = await fetch(`/api/flights/seat-maps?offer_id=${encodeURIComponent(id)}`)
      const data = await res.json()
      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setSeatMaps(data.data)
        if (data.fallbackNotice) setFallback(data.fallbackNotice)
      } else {
        setError(data.error || "No seat map data available for this offer.")
      }
    } catch (err: any) {
      setError(err.message || "Failed to load seat maps.")
    } finally {
      setLoading(false)
    }
  }

  const currentSeatMap = seatMaps[activeSegmentIndex] || null
  const currentCabins  = currentSeatMap
    ? currentSeatMap.cabins.filter((c) => c.deck === activeDeck)
    : []

  const handleSeatClick = (
    segmentId: string | number,
    seat: SeatElement,
    service: AvailableService,
    cabinClass?: string
  ) => {
    const totalAmt = parseFloat(service.total_amount || "0")
    setSelectedSeats((prev) => {
      const filtered = prev.filter(
        (s) => !(s.segmentId === segmentId && s.passengerIndex === activePassengerIndex)
      )
      const existing = prev.find(
        (s) =>
          s.segmentId === segmentId &&
          s.passengerIndex === activePassengerIndex &&
          s.seatDesignator === seat.designator
      )
      if (existing) return filtered
      return [...filtered, {
        segmentId,
        passengerId: service.passenger_id || (activePassengerIndex + 1),
        passengerIndex: activePassengerIndex,
        seatDesignator: seat.designator,
        serviceId: service.id,
        totalAmount: totalAmt,
        totalCurrency: service.total_currency || "BDT",
        disclosures: seat.disclosures || [],
        cabinClass,
      }]
    })
    // Auto-advance to next passenger
    if (activePassengerIndex < passengersCount - 1) {
      setTimeout(() => setActivePax(activePassengerIndex + 1), 250)
    }
  }

  const handleConfirm = () => { if (onConfirmSeats) onConfirmSeats(selectedSeats) }
  const totalSeatsPrice = selectedSeats.reduce((acc, s) => acc + s.totalAmount, 0)

  return (
    <div className="bg-delta-canvas border border-delta-hairline rounded-sm overflow-hidden shadow-[0_1px_4px_rgba(0,0,0,0.06)]">
      {/* Header */}
      <div className="bg-delta-navy px-5 py-4 flex items-center justify-between gap-3 flex-wrap">
        <div className="flex items-center gap-2.5">
          <div className="bg-delta-red p-1.5 rounded-sm">
            <Plane className="h-4 w-4 text-white rotate-90" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-white uppercase tracking-wide">Select Aircraft Seats</h3>
            <p className="text-xs text-white/60 mt-0.5">
              {passengersCount} passenger{passengersCount > 1 ? "s" : ""} · choose preferred seats
            </p>
          </div>
        </div>
        {totalSeatsPrice > 0 && (
          <div className="text-right">
            <p className="text-[10px] text-white/50 uppercase tracking-wider font-bold">Seat Fee</p>
            <p className="text-base font-bold text-white">+৳{totalSeatsPrice.toFixed(2)}</p>
          </div>
        )}
      </div>

      {/* Fallback notice */}
      {fallbackNotice && (
        <div className="mx-4 mt-3 bg-delta-warning/10 border border-delta-warning/25 rounded-sm p-3 flex items-center gap-2">
          <AlertTriangle className="h-4 w-4 text-delta-warning shrink-0" />
          <p className="text-xs text-delta-warning font-medium">{fallbackNotice}</p>
        </div>
      )}

      {/* Segment tabs */}
      {seatMaps.length > 1 && (
        <div className="px-4 pt-4 flex gap-2 border-b border-delta-hairline pb-3">
          {seatMaps.map((sm, idx) => (
            <button
              key={sm.id || idx}
              onClick={() => setActiveSeg(idx)}
              className={`px-4 py-1.5 rounded-sm text-xs font-bold border transition-colors cursor-pointer ${
                activeSegmentIndex === idx
                  ? "bg-delta-navy text-white border-delta-navy"
                  : "bg-delta-canvas text-delta-ink border-delta-hairline hover:bg-delta-surface-1"
              }`}
            >
              Segment {idx + 1}
            </button>
          ))}
        </div>
      )}

      {loading ? (
        <div className="p-4 space-y-3">
          <div className="flex items-center justify-center gap-3 py-6">
            <Loader2 className="w-6 h-6 animate-spin text-delta-navy" />
            <p className="text-sm text-delta-ink-muted font-medium">Loading seat map...</p>
          </div>
          {/* Skeleton */}
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="flex items-center justify-center gap-1.5">
              <div className="w-5 h-5 bg-delta-surface-2 rounded-sm animate-pulse" />
              {Array.from({ length: 6 }).map((_, j) => (
                <div
                  key={j}
                  className="w-8 h-8 bg-delta-surface-2 rounded-sm animate-pulse"
                  style={{ animationDelay: `${(i * 6 + j) * 40}ms` }}
                />
              ))}
            </div>
          ))}
        </div>
      ) : error ? (
        <div className="p-10 text-center space-y-4">
          <div className="w-14 h-14 rounded-sm bg-delta-warning/10 border border-delta-warning/25 flex items-center justify-center mx-auto">
            <AlertTriangle className="h-6 w-6 text-delta-warning" />
          </div>
          <p className="text-sm text-delta-ink font-medium">{error}</p>
          <button
            onClick={() => fetchSeatMaps(offerId)}
            className="h-9 px-4 rounded-sm border border-delta-navy text-delta-navy bg-delta-canvas hover:bg-delta-surface-1 text-xs font-bold transition-colors cursor-pointer flex items-center gap-1.5 mx-auto"
          >
            <RefreshCw className="h-3.5 w-3.5" /> Retry
          </button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Passenger selector */}
          <div className="bg-delta-surface-1 border border-delta-hairline rounded-sm p-3 flex flex-wrap gap-2 items-center">
            <span className="text-[11px] font-bold uppercase text-delta-navy tracking-wider flex items-center gap-1">
              <User className="h-3.5 w-3.5 text-delta-red" />
              Selecting for:
            </span>
            {Array.from({ length: passengersCount }, (_, idx) => {
              const isCurrent = activePassengerIndex === idx
              const chosen = selectedSeats.find(
                (s) =>
                  s.segmentId === (currentSeatMap?.id || activeSegmentIndex) &&
                  s.passengerIndex === idx
              )
              return (
                <button
                  key={idx}
                  onClick={() => setActivePax(idx)}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-sm border text-xs font-bold transition-colors cursor-pointer ${
                    isCurrent
                      ? "bg-delta-red text-white border-delta-red"
                      : chosen
                      ? "bg-delta-success/10 text-delta-success border-delta-success/40"
                      : "bg-delta-canvas text-delta-ink border-delta-hairline hover:bg-delta-surface-2"
                  }`}
                >
                  Pax {idx + 1}
                  {chosen && (
                    <span className={`font-mono text-[10px] px-1 rounded-sm ${
                      isCurrent ? "bg-white/20" : "bg-delta-success/10 text-delta-success"
                    }`}>
                      {chosen.seatDesignator}
                    </span>
                  )}
                </button>
              )
            })}
          </div>

          {/* Seat grid */}
          {currentSeatMap && (
            <div className="border border-delta-hairline rounded-sm overflow-hidden">
              {/* Aircraft nose indicator */}
              <div className="flex justify-center py-2 bg-delta-surface-2 border-b border-delta-hairline">
                <div className="flex items-center gap-2 text-delta-ink-muted">
                  <div className="h-[1px] w-12 bg-delta-hairline" />
                  <Plane className="h-3.5 w-3.5 rotate-90" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Front</span>
                  <div className="h-[1px] w-12 bg-delta-hairline" />
                </div>
              </div>

              <div className="max-h-[420px] overflow-y-auto bg-delta-canvas p-4 space-y-5">
                {currentCabins.map((cabin, cIdx) => {
                  const cabinKey = cabin.cabin_class?.toLowerCase().replace(" ", "_") || "economy"
                  const style = CABIN_STYLES[cabinKey] || CABIN_STYLES.economy
                  const label = CABIN_LABELS[cabinKey] || cabin.cabin_class || "Cabin"

                  return (
                    <div key={cIdx}>
                      {/* Cabin zone header */}
                      <div className={`flex items-center gap-3 mb-3 rounded-sm px-3 py-1.5 border ${style.bg} ${style.border}`}>
                        <span className={`text-[10px] font-bold uppercase tracking-widest ${style.label}`}>{label}</span>
                        <div className="flex-1 h-[1px] bg-delta-hairline-light" />
                        <span className="text-[10px] text-delta-ink-muted font-mono">Deck {cabin.deck}</span>
                      </div>

                      {/* Rows */}
                      <div className="space-y-1.5">
                        {cabin.rows.map((row, rIdx) => {
                          const rowNum = rIdx + (cabin.wings?.first_row_index || 1)
                          return (
                            <div key={rIdx} className="flex items-center justify-center gap-1.5">
                              <span className="w-5 text-[10px] font-mono text-delta-ink-muted text-right shrink-0 select-none">
                                {rowNum}
                              </span>
                              <div className="flex items-center gap-1 flex-wrap justify-center">
                                {row.sections.flatMap((sec) => sec.elements).map((el, elIdx) => {
                                  if (el.type === "empty") return <div key={elIdx} className="w-8 h-8" />
                                  if (el.type !== "seat") return null

                                  const seat = el as SeatElement
                                  const service = seat.available_services?.[0]
                                  const isAvailable = (seat.available_services?.length || 0) > 0
                                  const isSelectedByThisPax = selectedSeats.some(
                                    (s) =>
                                      s.segmentId === (currentSeatMap.id || activeSegmentIndex) &&
                                      s.passengerIndex === activePassengerIndex &&
                                      s.seatDesignator === seat.designator
                                  )
                                  const otherPaxSeat = selectedSeats.find(
                                    (s) =>
                                      s.segmentId === (currentSeatMap.id || activeSegmentIndex) &&
                                      s.passengerIndex !== activePassengerIndex &&
                                      s.seatDesignator === seat.designator
                                  )
                                  const isSelectedByOtherPax = !!otherPaxSeat
                                  const cost = service ? parseFloat(service.total_amount || "0") : 0
                                  const otherPaxIdx = otherPaxSeat?.passengerIndex ?? 0

                                  return (
                                    <motion.button
                                      key={elIdx}
                                      type="button"
                                      disabled={!isAvailable || isSelectedByOtherPax}
                                      onClick={() => service && handleSeatClick(currentSeatMap.id || activeSegmentIndex, seat, service, cabin.cabin_class)}
                                      whileHover={isAvailable && !isSelectedByOtherPax ? { scale: 1.1, y: -1 } : {}}
                                      whileTap={isAvailable && !isSelectedByOtherPax ? { scale: 0.95 } : {}}
                                      className={`w-8 h-8 rounded-sm border text-[9px] font-mono font-bold flex flex-col items-center justify-center transition-colors select-none ${
                                        isSelectedByThisPax
                                          ? "bg-delta-red border-delta-red text-white"
                                          : isSelectedByOtherPax
                                          ? `${PAX_BG[otherPaxIdx % 4]} ${PAX_BORDER[otherPaxIdx % 4]} ${PAX_TEXT[otherPaxIdx % 4]} cursor-not-allowed`
                                          : isAvailable
                                          ? "bg-delta-canvas border-delta-hairline text-delta-navy hover:border-delta-navy hover:bg-delta-surface-1 cursor-pointer"
                                          : "bg-delta-surface-2 border-delta-hairline-light text-delta-ink-muted opacity-40 cursor-not-allowed"
                                      }`}
                                      title={`Seat ${seat.designator}${cost > 0 ? ` (+৳${cost})` : ""}${!isAvailable ? " — Occupied" : ""}`}
                                    >
                                      {isSelectedByThisPax ? (
                                        <Check className="h-3 w-3" />
                                      ) : (
                                        <>
                                          <span>{seat.designator}</span>
                                          {cost > 0 && <span className="text-[6px] font-sans opacity-75 leading-none">৳{cost}</span>}
                                        </>
                                      )}
                                    </motion.button>
                                  )
                                })}
                              </div>
                            </div>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>

              {/* Tail */}
              <div className="flex justify-center py-2 bg-delta-surface-2 border-t border-delta-hairline">
                <div className="flex items-center gap-2 text-delta-ink-muted">
                  <div className="h-[1px] w-8 bg-delta-hairline" />
                  <span className="text-[9px] font-bold uppercase tracking-widest">Tail</span>
                  <div className="h-[1px] w-8 bg-delta-hairline" />
                </div>
              </div>
            </div>
          )}

          {/* Legend */}
          <div className="flex flex-wrap items-center gap-3">
            {[
              { cls: "bg-delta-canvas border-delta-hairline text-delta-navy",   label: "Available" },
              { cls: "bg-delta-red border-delta-red text-white",                label: "Your Seat" },
              { cls: "bg-red-100 border-red-300 text-red-700",                  label: "Other Passenger" },
              { cls: "bg-delta-surface-2 border-delta-hairline-light opacity-40", label: "Occupied" },
            ].map((item) => (
              <div key={item.label} className="flex items-center gap-1.5">
                <div className={`w-4 h-4 rounded-sm border ${item.cls}`} />
                <span className="text-[11px] text-delta-ink-muted font-medium">{item.label}</span>
              </div>
            ))}
          </div>

          {/* Footer Actions */}
          <div className="flex items-center justify-between pt-3 border-t border-delta-hairline">
            <span className="text-xs text-delta-ink-muted font-medium">
              {selectedSeats.length} of {passengersCount} seat{passengersCount !== 1 ? "s" : ""} selected
            </span>
            <div className="flex items-center gap-2">
              {onCancel && (
                <button
                  onClick={onCancel}
                  className="h-10 px-4 rounded-sm border border-delta-navy text-delta-navy bg-delta-canvas hover:bg-delta-surface-1 text-xs font-bold transition-colors cursor-pointer"
                >
                  Cancel
                </button>
              )}
              <button
                onClick={handleConfirm}
                className="h-10 px-6 rounded-sm bg-delta-red hover:bg-delta-red-hover text-white text-xs font-bold uppercase tracking-wider flex items-center gap-1.5 transition-colors cursor-pointer shadow-none"
              >
                Confirm Seats
                <ChevronRight className="h-4 w-4" />
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
