"use client"

import React, { useState, useEffect } from "react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Armchair,
  Baby,
  Bath,
  Coffee,
  Shirt,
  Layers,
  AlertTriangle,
  Check,
  Plane,
  Info,
  User,
  Loader2,
  RefreshCw,
  ArrowRight,
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

export function SeatMapInline({
  offerId,
  passengersCount = 1,
  initialSelections = [],
  onConfirmSeats,
  onCancel,
}: SeatMapInlineProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null)
  const [seatMaps, setSeatMaps] = useState<SeatMap[]>([])
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0)
  const [activePassengerIndex, setActivePassengerIndex] = useState<number>(0)
  const [activeDeck, setActiveDeck] = useState<number>(0)
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeatChoice[]>(initialSelections)

  useEffect(() => {
    if (offerId) {
      fetchSeatMaps(offerId)
    }
  }, [offerId])

  useEffect(() => {
    if (initialSelections.length > 0) {
      setSelectedSeats(initialSelections)
    }
  }, [initialSelections])

  async function fetchSeatMaps(id: string) {
    setLoading(true)
    setError(null)
    setFallbackNotice(null)
    try {
      const res = await fetch(`/api/flights/seat-maps?offer_id=${encodeURIComponent(id)}`)
      const data = await res.json()

      if (data.success && Array.isArray(data.data) && data.data.length > 0) {
        setSeatMaps(data.data)
        if (data.fallbackNotice) {
          setFallbackNotice(data.fallbackNotice)
        }
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

  // Collect available decks for current segment
  const availableDecks = currentSeatMap
    ? Array.from(new Set(currentSeatMap.cabins.map((c) => c.deck))).sort((a, b) => a - b)
    : [0]

  // Filter cabins for current deck
  const currentCabins = currentSeatMap
    ? currentSeatMap.cabins.filter((c) => c.deck === activeDeck)
    : []

  const currentPassengerId = `pas_${activePassengerIndex + 1}`

  const handleSelectSeat = (
    segmentId: string,
    seat: SeatElement,
    service: AvailableService
  ) => {
    const totalAmt = parseFloat(service.total_amount || "0")

    setSelectedSeats((prev) => {
      // Remove any previous seat selected by THIS passenger on THIS segment
      const filtered = prev.filter(
        (s) =>
          !(s.segmentId === segmentId && s.passengerIndex === activePassengerIndex)
      )

      // Check if clicking the same seat again (toggle off)
      const existing = prev.find(
        (s) =>
          s.segmentId === segmentId &&
          s.passengerIndex === activePassengerIndex &&
          s.seatDesignator === seat.designator
      )

      if (existing) {
        return filtered
      }

      const newChoice: SelectedSeatChoice = {
        segmentId,
        passengerId: service.passenger_id || currentPassengerId,
        passengerIndex: activePassengerIndex,
        seatDesignator: seat.designator,
        serviceId: service.id,
        totalAmount: totalAmt,
        totalCurrency: service.total_currency || "USD",
        disclosures: seat.disclosures || [],
      }

      return [...filtered, newChoice]
    })
  }

  const handleConfirm = () => {
    if (onConfirmSeats) {
      onConfirmSeats(selectedSeats)
    }
  }

  const totalSeatsPrice = selectedSeats.reduce((acc, s) => acc + s.totalAmount, 0)
  const currency = selectedSeats[0]?.totalCurrency || "USD"

  return (
    <div className="w-full bg-white border border-delta-hairline rounded-[6px] overflow-hidden shadow-sm my-4">
      {/* Header Bar */}
      <div className="bg-delta-navy text-white p-4 flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-2.5">
          <div className="bg-delta-red p-1.5 rounded-[3px] text-white">
            <Armchair className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide uppercase">
              SELECT AIRCRAFT SEATS (STEP 1 OF 3)
            </h3>
            <p className="text-xs text-slate-300">
              Interactive cabin seat map layout for {passengersCount} passenger{passengersCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {totalSeatsPrice > 0 && (
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-slate-300 block font-semibold">
              Seat Selection Fee
            </span>
            <span className="text-lg font-bold text-white">
              +{currency === "GBP" ? "£" : currency === "EUR" ? "€" : "$"}
              {totalSeatsPrice.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-slate-600">
          <Loader2 className="w-8 h-8 animate-spin text-delta-navy" />
          <p className="text-sm font-medium">Fetching real-time seat maps...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-amber-500 mx-auto" />
          <p className="text-sm font-semibold text-delta-navy">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchSeatMaps(offerId)} className="text-xs">
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry Loading Seat Map
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Segment & Passenger Toolbar */}
          <div className="bg-slate-50 border border-delta-hairline rounded-[4px] p-3 flex flex-wrap items-center justify-between gap-3">
            {/* Segment selector */}
            {seatMaps.length > 1 && (
              <div className="flex items-center gap-1.5">
                <span className="text-[11px] font-bold uppercase text-delta-navy">Segment:</span>
                {seatMaps.map((sm, idx) => (
                  <Button
                    key={sm.id || idx}
                    size="sm"
                    variant={activeSegmentIndex === idx ? "default" : "outline"}
                    onClick={() => setActiveSegmentIndex(idx)}
                    className={`text-xs h-7 px-3 rounded-[3px] font-semibold ${
                      activeSegmentIndex === idx
                        ? "bg-delta-navy text-white"
                        : "bg-white border-delta-hairline text-slate-700"
                    }`}
                  >
                    Segment {idx + 1}
                  </Button>
                ))}
              </div>
            )}

            {/* Passenger Selector */}
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase text-delta-navy flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-delta-red" />
                Selecting For:
              </span>
              {Array.from({ length: passengersCount }, (_, idx) => {
                const isCurrent = activePassengerIndex === idx
                const chosen = selectedSeats.find(
                  (s) =>
                    s.segmentId === (currentSeatMap?.id || `seg_${activeSegmentIndex}`) &&
                    s.passengerIndex === idx
                )
                return (
                  <Button
                    key={idx}
                    size="sm"
                    onClick={() => setActivePassengerIndex(idx)}
                    className={`text-xs h-7 px-3 rounded-[3px] font-bold ${
                      isCurrent
                        ? "bg-delta-navy text-white ring-2 ring-delta-red"
                        : chosen
                        ? "bg-emerald-600 text-white"
                        : "bg-white border-delta-hairline text-slate-700"
                    }`}
                  >
                    Pax {idx + 1} {chosen ? `(${chosen.seatDesignator})` : ""}
                  </Button>
                )
              })}
            </div>
          </div>

          {/* Seat Grid Display */}
          {currentSeatMap && (
            <div className="border border-delta-hairline rounded-[4px] p-4 bg-slate-50/50 max-h-[400px] overflow-y-auto space-y-6">
              {currentCabins.map((cabin, cIdx) => (
                <div key={cIdx} className="space-y-3">
                  <div className="bg-delta-navy/10 px-3 py-1.5 rounded text-xs font-bold text-delta-navy uppercase tracking-wider flex items-center justify-between">
                    <span>{cabin.cabin_class || "Main Cabin"}</span>
                    <span className="text-[11px] font-normal text-delta-ink-muted">
                      Deck {cabin.deck} · Layout {cabin.wings?.first_row_index ? `Row ${cabin.wings.first_row_index}-${cabin.wings.last_row_index}` : "Standard"}
                    </span>
                  </div>

                  {/* Seat Rows */}
                  <div className="space-y-2">
                    {cabin.rows.map((row, rIdx) => {
                      const rowNum = rIdx + (cabin.wings?.first_row_index || 1)
                      return (
                        <div key={rIdx} className="flex items-center justify-center gap-2 text-xs">
                          <span className="w-6 font-mono font-bold text-delta-navy text-right">
                            {rowNum}
                          </span>

                          <div className="flex items-center gap-1.5 flex-wrap justify-center">
                            {row.sections.flatMap((sec) => sec.elements).map((el, elIdx) => {
                              if (el.type === "empty") {
                                return <div key={elIdx} className="w-8 h-8" />
                              }
                              if (el.type === "seat") {
                                const seat = el as SeatElement
                                const availableService = seat.available_services?.[0]
                                const isAvailable = seat.available_services && seat.available_services.length > 0
                                const isSelectedByThisPax = selectedSeats.some(
                                  (s) =>
                                    s.segmentId === (currentSeatMap.id || `seg_${activeSegmentIndex}`) &&
                                    s.passengerIndex === activePassengerIndex &&
                                    s.seatDesignator === seat.designator
                                )
                                const isSelectedByOtherPax = selectedSeats.some(
                                  (s) =>
                                    s.segmentId === (currentSeatMap.id || `seg_${activeSegmentIndex}`) &&
                                    s.passengerIndex !== activePassengerIndex &&
                                    s.seatDesignator === seat.designator
                                )

                                const cost = availableService ? parseFloat(availableService.total_amount || "0") : 0

                                return (
                                  <button
                                    key={elIdx}
                                    type="button"
                                    disabled={!isAvailable || isSelectedByOtherPax}
                                    onClick={() => availableService && handleSelectSeat(currentSeatMap.id || `seg_${activeSegmentIndex}`, seat, availableService)}
                                    className={`w-9 h-9 rounded-[4px] border text-[11px] font-mono font-bold flex flex-col items-center justify-center transition-all ${
                                      isSelectedByThisPax
                                        ? "bg-delta-red text-white border-delta-red shadow-md scale-105"
                                        : isSelectedByOtherPax
                                        ? "bg-emerald-600 text-white border-emerald-700 opacity-80 cursor-not-allowed"
                                        : isAvailable
                                        ? "bg-white text-delta-navy border-delta-hairline hover:border-delta-navy hover:bg-slate-100"
                                        : "bg-slate-200 text-slate-400 border-slate-300 cursor-not-allowed"
                                    }`}
                                    title={`Seat ${seat.designator}${cost > 0 ? ` (+${cost})` : ""}`}
                                  >
                                    <span>{seat.designator}</span>
                                    {cost > 0 && <span className="text-[8px] font-sans font-normal opacity-90">${cost}</span>}
                                  </button>
                                )
                              }
                              return null
                            })}
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              ))}
            </div>
          )}

          {/* Action Toolbar */}
          <div className="flex items-center justify-between pt-2 border-t border-delta-hairline">
            <div className="text-xs text-delta-ink-muted">
              {selectedSeats.length} seat{selectedSeats.length === 1 ? "" : "s"} selected
            </div>
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button variant="outline" size="sm" onClick={onCancel} className="text-xs font-bold uppercase">
                  Cancel
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleConfirm}
                className="bg-delta-red hover:bg-red-700 text-white text-xs font-bold uppercase tracking-wider px-5 rounded-[4px] flex items-center gap-1.5"
              >
                <span>Confirm Seats & Proceed</span>
                <ArrowRight className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      )}
    </div>
  )
}
