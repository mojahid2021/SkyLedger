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

  const currentPassengerId = activePassengerIndex + 1

  const handleSelectSeat = (
    segmentId: string | number,
    seat: SeatElement,
    service: AvailableService,
    cabinClass?: string
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
        cabinClass,
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
    <div className="w-full bg-delta-canvas border border-delta-hairline rounded-sm overflow-hidden shadow-none my-4 font-sans">
      {/* Header Bar */}
      <div className="bg-delta-navy text-white p-4 flex flex-wrap items-center justify-between gap-3 select-none">
        <div className="flex items-center gap-2.5">
          <div className="bg-delta-red p-1.5 rounded-sm text-white">
            <Armchair className="h-5 w-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-white tracking-wide uppercase">
              SELECT AIRCRAFT SEATS (STEP 1 OF 3)
            </h3>
            <p className="text-xs text-white/70">
              Interactive cabin seat map layout for {passengersCount} passenger{passengersCount > 1 ? "s" : ""}
            </p>
          </div>
        </div>

        {totalSeatsPrice > 0 && (
          <div className="text-right">
            <span className="text-[10px] uppercase tracking-wider text-white/70 block font-bold">
              Seat Selection Fee
            </span>
            <span className="text-lg font-bold text-white">
              +৳{totalSeatsPrice.toFixed(2)}
            </span>
          </div>
        )}
      </div>

      {loading ? (
        <div className="flex flex-col items-center justify-center py-16 gap-3 text-delta-ink-muted">
          <Loader2 className="w-8 h-8 animate-spin text-delta-navy" />
          <p className="text-sm font-medium">Fetching real-time seat maps...</p>
        </div>
      ) : error ? (
        <div className="p-8 text-center space-y-3">
          <AlertTriangle className="h-8 w-8 text-delta-warning mx-auto" />
          <p className="text-sm font-bold text-delta-navy">{error}</p>
          <Button variant="outline" size="sm" onClick={() => fetchSeatMaps(offerId)} className="text-xs border border-delta-navy text-delta-navy bg-delta-canvas hover:bg-delta-surface-1 rounded-sm font-bold">
            <RefreshCw className="h-3.5 w-3.5 mr-1" /> Retry Loading Seat Map
          </Button>
        </div>
      ) : (
        <div className="p-4 space-y-4">
          {/* Segment & Passenger Toolbar */}
          <div className="bg-delta-surface-1 border border-delta-hairline rounded-sm p-3 flex flex-wrap items-center justify-between gap-3">
            {/* Segment selector */}
            {seatMaps.length > 1 && (
              <div className="flex items-center gap-1.5 select-none">
                <span className="text-[11px] font-bold uppercase text-delta-navy">Segment:</span>
                {seatMaps.map((sm, idx) => (
                  <Button
                    key={sm.id || idx}
                    size="sm"
                    variant={activeSegmentIndex === idx ? "default" : "outline"}
                    onClick={() => setActiveSegmentIndex(idx)}
                    className={`text-xs h-7 px-3 rounded-sm font-bold cursor-pointer select-none transition-colors ${
                      activeSegmentIndex === idx
                        ? "bg-delta-navy text-white border-delta-navy"
                        : "bg-delta-canvas border-delta-hairline text-delta-ink hover:bg-delta-surface-2"
                    }`}
                  >
                    Segment {idx + 1}
                  </Button>
                ))}
              </div>
            )}

            {/* Passenger Selector */}
            <div className="flex items-center gap-1.5 select-none">
              <span className="text-[11px] font-bold uppercase text-delta-navy flex items-center gap-1">
                <User className="h-3.5 w-3.5 text-delta-red" />
                Selecting For:
              </span>
              {Array.from({ length: passengersCount }, (_, idx) => {
                const isCurrent = activePassengerIndex === idx
                const chosen = selectedSeats.find(
                  (s) =>
                    s.segmentId === (currentSeatMap?.id || activeSegmentIndex) &&
                    s.passengerIndex === idx
                )
                return (
                  <Button
                    key={idx}
                    size="sm"
                    onClick={() => setActivePassengerIndex(idx)}
                    className={`text-xs h-7 px-3 rounded-sm font-bold cursor-pointer select-none transition-colors ${
                      isCurrent
                        ? "bg-delta-red text-white border-delta-red"
                        : chosen
                        ? "bg-delta-success text-white border-delta-success"
                        : "bg-delta-canvas border-delta-hairline text-delta-ink hover:bg-delta-surface-2"
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
            <div className="border border-delta-hairline rounded-sm p-4 bg-delta-surface-1/40 max-h-[400px] overflow-y-auto space-y-6">
              {currentCabins.map((cabin, cIdx) => (
                <div key={cIdx} className="space-y-3">
                  <div className="bg-delta-surface-2 border border-delta-hairline px-3 py-1.5 rounded-sm text-xs font-bold text-delta-navy uppercase tracking-wider flex items-center justify-between select-none">
                    <span>{cabin.cabin_class || "Main Cabin"}</span>
                    <span className="text-[11px] font-bold text-delta-ink-muted">
                      Deck {cabin.deck} · Layout {cabin.wings?.first_row_index ? `Row ${cabin.wings.first_row_index}-${cabin.wings.last_row_index}` : "Standard"}
                    </span>
                  </div>

                  {/* Seat Rows */}
                  <div className="space-y-2">
                    {cabin.rows.map((row, rIdx) => {
                      const rowNum = rIdx + (cabin.wings?.first_row_index || 1)
                      return (
                        <div key={rIdx} className="flex items-center justify-center gap-2 text-xs">
                          <span className="w-6 font-mono font-bold text-delta-navy text-right select-none">
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
                                    s.segmentId === (currentSeatMap.id || activeSegmentIndex) &&
                                    s.passengerIndex === activePassengerIndex &&
                                    s.seatDesignator === seat.designator
                                )
                                const isSelectedByOtherPax = selectedSeats.some(
                                  (s) =>
                                    s.segmentId === (currentSeatMap.id || activeSegmentIndex) &&
                                    s.passengerIndex !== activePassengerIndex &&
                                    s.seatDesignator === seat.designator
                                )

                                const cost = availableService ? parseFloat(availableService.total_amount || "0") : 0

                                return (
                                  <button
                                    key={elIdx}
                                    type="button"
                                    disabled={!isAvailable || isSelectedByOtherPax}
                                    onClick={() => availableService && handleSelectSeat(currentSeatMap.id || activeSegmentIndex, seat, availableService, cabin.cabin_class)}
                                    className={`w-9 h-9 rounded-sm border text-[11px] font-mono font-bold flex flex-col items-center justify-center transition-all ${
                                      isSelectedByThisPax
                                        ? "bg-delta-red text-white border-delta-red shadow-none scale-105"
                                        : isSelectedByOtherPax
                                        ? "bg-delta-success text-white border-delta-success/40 opacity-80 cursor-not-allowed"
                                        : isAvailable
                                        ? "bg-delta-canvas text-delta-navy border-delta-hairline hover:border-delta-navy hover:bg-delta-surface-2 cursor-pointer"
                                        : "bg-delta-surface-2 text-delta-ink-muted border-delta-hairline-light opacity-50 cursor-not-allowed"
                                    }`}
                                    title={`Seat ${seat.designator}${cost > 0 ? ` (+${cost})` : ""}`}
                                  >
                                    <span>{seat.designator}</span>
                                    {cost > 0 && <span className="text-[8px] font-sans font-normal opacity-90">৳{cost}</span>}
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
          <div className="flex items-center justify-between pt-4 border-t border-delta-hairline">
            <div className="text-xs font-bold text-delta-ink-muted select-none">
              {selectedSeats.length} seat{selectedSeats.length === 1 ? "" : "s"} selected
            </div>
            <div className="flex items-center gap-2">
              {onCancel && (
                <Button 
                  variant="outline" 
                  size="sm" 
                  onClick={onCancel} 
                  className="border border-delta-navy text-delta-navy bg-delta-canvas hover:bg-delta-surface-1 rounded-sm text-xs font-bold px-4 py-2 cursor-pointer select-none"
                >
                  Cancel
                </Button>
              )}
              <Button
                size="sm"
                onClick={handleConfirm}
                className="bg-delta-red hover:bg-delta-red-hover text-white text-xs font-bold uppercase tracking-wider px-6 h-10 rounded-sm flex items-center gap-1.5 cursor-pointer shadow-none select-none"
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
