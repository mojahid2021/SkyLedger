"use client"

import React, { useState, useEffect } from "react"
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs"
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

interface SeatMapDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  offerId: string
  passengersCount?: number
  onConfirmSeats?: (selectedSeats: SelectedSeatChoice[]) => void
  initialSelections?: SelectedSeatChoice[]
}

export function SeatMapDialog({
  open,
  onOpenChange,
  offerId,
  passengersCount = 1,
  onConfirmSeats,
  initialSelections = [],
}: SeatMapDialogProps) {
  const [loading, setLoading] = useState<boolean>(false)
  const [error, setError] = useState<string | null>(null)
  const [fallbackNotice, setFallbackNotice] = useState<string | null>(null)
  const [seatMaps, setSeatMaps] = useState<SeatMap[]>([])
  const [activeSegmentIndex, setActiveSegmentIndex] = useState<number>(0)
  const [activePassengerIndex, setActivePassengerIndex] = useState<number>(0)
  const [activeDeck, setActiveDeck] = useState<number>(0)
  const [selectedSeats, setSelectedSeats] = useState<SelectedSeatChoice[]>(initialSelections)

  useEffect(() => {
    if (open && offerId) {
      fetchSeatMaps(offerId)
    }
  }, [open, offerId])

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
    onOpenChange(false)
  }

  const totalSeatsPrice = selectedSeats.reduce((acc, s) => acc + s.totalAmount, 0)
  const currency = selectedSeats[0]?.totalCurrency || "USD"

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-4xl w-[95vw] max-h-[92vh] flex flex-col p-0 gap-0 overflow-hidden bg-white text-[#212121] border border-[#d0d5dd] rounded-[4px] shadow-2xl">
        {/* Delta Air Lines Branded Header */}
        <DialogHeader className="bg-[#003366] text-white p-4 sm:p-5 flex flex-row items-center justify-between shrink-0">
          <div>
            <div className="flex items-center gap-2">
              <Plane className="w-5 h-5 text-[#e31837]" />
              <DialogTitle className="text-lg sm:text-xl font-bold tracking-tight text-white uppercase font-sans">
                Interactive Aircraft Seat Selection
              </DialogTitle>
            </div>
            <DialogDescription className="text-xs text-slate-300 mt-0.5">
              Select preferred seats for all passengers across flight segments
            </DialogDescription>
          </div>
          {totalSeatsPrice > 0 && (
            <div className="text-right">
              <span className="text-[10px] uppercase tracking-wider text-slate-300 block font-semibold">
                Total Seat Extra
              </span>
              <span className="text-lg font-bold text-white">
                +৳{totalSeatsPrice.toFixed(2)}
              </span>
            </div>
          )}
        </DialogHeader>

        {loading ? (
          <div className="flex flex-col items-center justify-center py-24 gap-3 text-slate-600 min-h-[350px]">
            <Loader2 className="w-9 h-9 animate-spin text-[#003366]" />
            <p className="text-sm font-medium">Loading aircraft seat layout...</p>
          </div>
        ) : error ? (
          <div className="flex flex-col items-center justify-center py-20 px-6 text-center gap-4 min-h-[350px]">
            <div className="w-14 h-14 rounded-full bg-red-50 text-[#c62828] flex items-center justify-center border border-red-200">
              <AlertTriangle className="w-7 h-7" />
            </div>
            <div className="max-w-md">
              <h3 className="text-base font-bold text-[#003366] mb-1">
                Seat Maps Unavailable
              </h3>
              <p className="text-xs text-slate-600">{error}</p>
            </div>
            <Button
              onClick={() => fetchSeatMaps(offerId)}
              variant="outline"
              size="sm"
              className="gap-2 border-[#003366] text-[#003366] hover:bg-[#003366]/5 rounded-[4px]"
            >
              <RefreshCw className="w-3.5 h-3.5" /> Retry Request
            </Button>
          </div>
        ) : seatMaps.length === 0 ? (
          <div className="p-12 text-center text-slate-500 text-sm">
            No seat map available for this flight offer.
          </div>
        ) : (
          <div className="flex-1 overflow-y-auto flex flex-col min-h-0">
            {/* Top Toolbar: Segment Tabs & Passenger Selector */}
            <div className="bg-[#f5f7fa] border-b border-[#d0d5dd] p-3 sm:p-4 flex flex-col md:flex-row md:items-center justify-between gap-3 shrink-0">
              {/* Segment Selector Tabs */}
              {seatMaps.length > 1 && (
                <div className="flex items-center gap-1 overflow-x-auto">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#003366] mr-1 shrink-0">
                    Segment:
                  </span>
                  {seatMaps.map((sm, idx) => (
                    <Button
                      key={sm.id || idx}
                      size="sm"
                      variant={activeSegmentIndex === idx ? "default" : "outline"}
                      onClick={() => setActiveSegmentIndex(idx)}
                      className={`text-xs h-8 px-3 rounded-[4px] font-semibold ${
                        activeSegmentIndex === idx
                          ? "bg-[#003366] text-white hover:bg-[#001e3d]"
                          : "bg-white border-[#d0d5dd] text-slate-700 hover:bg-slate-50"
                      }`}
                    >
                      Segment {idx + 1}
                    </Button>
                  ))}
                </div>
              )}

              {/* Passenger Selector Tabs */}
              <div className="flex items-center gap-2 overflow-x-auto">
                <span className="text-[11px] font-bold uppercase tracking-wider text-[#003366] shrink-0 flex items-center gap-1">
                  <User className="w-3.5 h-3.5" /> Passenger:
                </span>
                <div className="flex gap-1">
                  {Array.from({ length: passengersCount }).map((_, pIdx) => {
                    const assignedSeat = selectedSeats.find(
                      (s) =>
                        s.segmentId === currentSeatMap?.segment_id &&
                        s.passengerIndex === pIdx
                    )
                    const isActive = activePassengerIndex === pIdx

                    return (
                      <button
                        key={pIdx}
                        onClick={() => setActivePassengerIndex(pIdx)}
                        className={`text-xs px-3 py-1.5 rounded-[4px] border transition-all flex items-center gap-1.5 font-medium ${
                          isActive
                            ? "bg-[#003366] text-white border-[#003366] shadow-sm font-semibold"
                            : "bg-white text-slate-700 border-[#d0d5dd] hover:border-slate-400"
                        }`}
                      >
                        <span>Pass {pIdx + 1}</span>
                        {assignedSeat ? (
                          <Badge className="bg-[#e31837] text-white text-[10px] px-1.5 py-0 h-4 border-0 font-bold">
                            {assignedSeat.seatDesignator}
                          </Badge>
                        ) : (
                          <span className="text-[10px] text-slate-400">(Unassigned)</span>
                        )}
                      </button>
                    )
                  })}
                </div>
              </div>

              {/* Deck Switcher (if multi-deck) */}
              {availableDecks.length > 1 && (
                <div className="flex items-center gap-1">
                  <span className="text-[11px] font-bold uppercase tracking-wider text-[#003366]">
                    Deck:
                  </span>
                  {availableDecks.map((deckNum) => (
                    <Button
                      key={deckNum}
                      size="sm"
                      variant={activeDeck === deckNum ? "default" : "outline"}
                      onClick={() => setActiveDeck(deckNum)}
                      className={`text-xs h-7 px-2.5 rounded-[4px] ${
                        activeDeck === deckNum
                          ? "bg-[#005480] text-white"
                          : "bg-white text-slate-600 border-[#d0d5dd]"
                      }`}
                    >
                      {deckNum === 0 ? "Main Deck" : `Upper Deck (${deckNum})`}
                    </Button>
                  ))}
                </div>
              )}
            </div>

            {/* Fallback Notice Banner if API returns no seat map for this offer */}
            {fallbackNotice && (
              <div className="bg-blue-50 border-b border-blue-200 px-4 py-2 text-xs text-blue-900 flex items-center justify-between gap-2 shrink-0">
                <div className="flex items-center gap-2">
                  <Info className="w-4 h-4 text-blue-600 shrink-0" />
                  <span>{fallbackNotice}</span>
                </div>
                <Badge className="bg-blue-100 text-blue-800 border-blue-300 text-[10px] shrink-0 font-semibold">
                  Sample Layout
                </Badge>
              </div>
            )}

            {/* Aircraft Diagram Canvas */}
            <div className="p-4 sm:p-6 bg-[#f5f7fa] flex-1 overflow-x-auto flex justify-center">
              <div className="bg-white border border-[#d0d5dd] rounded-t-full rounded-b-xl shadow-md p-6 sm:p-8 max-w-xl w-full min-w-[340px] relative">
                {/* Aircraft Nose Cone Indicator */}
                <div className="w-full text-center pb-6 border-b border-dashed border-slate-200 mb-6">
                  <div className="inline-flex items-center gap-2 text-slate-400 text-xs uppercase tracking-widest font-bold">
                    <Plane className="w-4 h-4 transform -rotate-90 text-[#003366]" />
                    Front of Aircraft
                  </div>
                </div>

                {/* Render Cabins */}
                {currentCabins.map((cabin, cIdx) => (
                  <CabinView
                    key={cIdx}
                    cabin={cabin}
                    segmentId={currentSeatMap.segment_id}
                    activePassengerIndex={activePassengerIndex}
                    selectedSeats={selectedSeats}
                    onSelectSeat={handleSelectSeat}
                  />
                ))}

                {/* Aircraft Tail Indicator */}
                <div className="w-full text-center pt-6 border-t border-dashed border-slate-200 mt-6">
                  <span className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
                    Rear of Aircraft
                  </span>
                </div>
              </div>
            </div>

            {/* Disclosures & Warnings Footer Banner */}
            {selectedSeats.some((s) => s.disclosures && s.disclosures.length > 0) && (
              <div className="bg-amber-50 border-t border-b border-amber-200 px-4 py-3 text-xs text-amber-900 flex items-start gap-2.5 shrink-0">
                <Info className="w-4 h-4 text-amber-600 shrink-0 mt-0.5" />
                <div>
                  <span className="font-bold block text-amber-950 mb-0.5">
                    Important Seat Disclosures & Restrictions:
                  </span>
                  <ul className="list-disc list-inside space-y-0.5 text-amber-900">
                    {selectedSeats.flatMap((s) => s.disclosures || []).map((disc, idx) => (
                      <li key={idx}>{disc}</li>
                    ))}
                  </ul>
                </div>
              </div>
            )}

            {/* Visual Legend */}
            <div className="bg-white border-t border-[#d0d5dd] px-4 py-3 flex flex-wrap items-center justify-center gap-4 text-xs shrink-0 text-slate-700">
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-[3px] bg-white border-2 border-[#003366] flex items-center justify-center text-[10px] font-bold text-[#003366]">
                  1A
                </div>
                <span>Available</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-[3px] bg-[#e31837] text-white flex items-center justify-center text-[10px] font-bold">
                  1A
                </div>
                <span>Selected (Current)</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-[3px] bg-slate-200 border border-slate-300 text-slate-400 flex items-center justify-center text-[10px]">
                  1A
                </div>
                <span>Unavailable</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-[3px] bg-amber-100 border border-amber-400 flex items-center justify-center text-amber-800 text-[10px]">
                  EXIT
                </div>
                <span>Exit Row</span>
              </div>
              <div className="flex items-center gap-1.5">
                <div className="w-6 h-6 rounded-[3px] bg-slate-100 border border-slate-300 flex items-center justify-center text-slate-600">
                  <Coffee className="w-3.5 h-3.5" />
                </div>
                <span>Galley / Lavatory</span>
              </div>
            </div>
          </div>
        )}

        {/* Modal Footer Actions */}
        <div className="bg-[#f5f7fa] border-t border-[#d0d5dd] p-4 flex items-center justify-between shrink-0">
          <div className="text-xs text-slate-600">
            {selectedSeats.length > 0 ? (
              <span className="font-medium">
                {selectedSeats.length} of {passengersCount} seat(s) selected
              </span>
            ) : (
              <span className="text-slate-400">No seats selected yet</span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={() => onOpenChange(false)}
              className="border-[#d0d5dd] text-slate-700 hover:bg-slate-100 rounded-[4px]"
            >
              Cancel
            </Button>
            <Button
              size="sm"
              onClick={handleConfirm}
              className="bg-[#e31837] hover:bg-[#c0112a] text-white font-bold px-5 rounded-[4px] shadow-sm"
            >
              Confirm Seat Selection
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}

function CabinView({
  cabin,
  segmentId,
  activePassengerIndex,
  selectedSeats,
  onSelectSeat,
}: {
  cabin: Cabin
  segmentId: string | number
  activePassengerIndex: number
  selectedSeats: SelectedSeatChoice[]
  onSelectSeat: (segmentId: string | number, seat: SeatElement, service: AvailableService) => void
}) {
  const cabinClassLabel = cabin.cabin_class.replace("_", " ").toUpperCase()

  return (
    <div className="mb-8 last:mb-0">
      {/* Cabin Header */}
      <div className="flex items-center justify-between border-b border-[#003366]/20 pb-2 mb-4">
        <span className="text-xs font-bold uppercase tracking-wider text-[#003366] flex items-center gap-1.5">
          <Armchair className="w-4 h-4 text-[#005480]" />
          {cabinClassLabel} CABIN
        </span>
        <span className="text-[10px] text-slate-500 font-medium">
          {cabin.aisles === 1 ? "1 Aisle" : `${cabin.aisles} Aisles`}
        </span>
      </div>

      {/* Rows Container */}
      <div className="space-y-2">
        {cabin.rows.map((row, rIdx) => {
          const isOverWing =
            cabin.wings &&
            rIdx >= cabin.wings.first_row_index &&
            rIdx <= cabin.wings.last_row_index

          return (
            <div key={rIdx} className="relative flex items-center justify-center gap-3">
              {/* Left Wing Indicator Bracket */}
              {isOverWing && (
                <div
                  className="absolute -left-5 top-0 bottom-0 w-2.5 bg-slate-300 border-l-2 border-slate-500 rounded-l"
                  title="Overwing Row"
                />
              )}

              {/* Sections rendered per aisle */}
              <div className="flex items-center gap-4 sm:gap-6">
                {row.sections.map((sec, sIdx) => (
                  <div key={sIdx} className="flex items-center gap-1.5">
                    {sec.elements.map((elem, eIdx) => (
                      <ElementCell
                        key={eIdx}
                        element={elem}
                        segmentId={segmentId}
                        activePassengerIndex={activePassengerIndex}
                        selectedSeats={selectedSeats}
                        onSelectSeat={onSelectSeat}
                      />
                    ))}
                  </div>
                ))}
              </div>

              {/* Right Wing Indicator Bracket */}
              {isOverWing && (
                <div
                  className="absolute -right-5 top-0 bottom-0 w-2.5 bg-slate-300 border-r-2 border-slate-500 rounded-r"
                  title="Overwing Row"
                />
              )}
            </div>
          )
        })}
      </div>
    </div>
  )
}

function ElementCell({
  element,
  segmentId,
  activePassengerIndex,
  selectedSeats,
  onSelectSeat,
}: {
  element: RowElement
  segmentId: string | number
  activePassengerIndex: number
  selectedSeats: SelectedSeatChoice[]
  onSelectSeat: (segmentId: string | number, seat: SeatElement, service: AvailableService) => void
}) {
  // Fixed size for seat, bassinet, empty element
  const fixedBoxStyle = "w-9 h-9 sm:w-10 sm:h-10 shrink-0 flex items-center justify-center text-xs font-bold rounded-[4px] transition-all"

  if (element.type === "empty") {
    return <div className={`${fixedBoxStyle} bg-transparent`} />
  }

  if (element.type === "bassinet") {
    return (
      <div
        className={`${fixedBoxStyle} bg-blue-50 border border-blue-200 text-blue-700`}
        title="Bassinet Cradle"
      >
        <Baby className="w-4 h-4" />
      </div>
    )
  }

  if (element.type === "exit_row") {
    return (
      <div
        className="h-8 px-2 bg-amber-100 border border-amber-300 text-amber-800 text-[10px] font-bold uppercase tracking-wider flex items-center justify-center rounded-[4px] shrink-0"
        title="Exit Row Access"
      >
        <AlertTriangle className="w-3 h-3 mr-1 text-amber-600" /> EXIT
      </div>
    )
  }

  if (element.type === "lavatory") {
    return (
      <div
        className="h-9 px-2 bg-slate-100 border border-slate-300 text-slate-600 text-[10px] font-medium flex items-center justify-center gap-1 rounded-[4px]"
        title="Lavatory"
      >
        <Bath className="w-4 h-4 text-slate-500" />
        <span className="hidden sm:inline">WC</span>
      </div>
    )
  }

  if (element.type === "galley") {
    return (
      <div
        className="h-9 px-2 bg-slate-100 border border-slate-300 text-slate-600 text-[10px] font-medium flex items-center justify-center gap-1 rounded-[4px]"
        title="Galley"
      >
        <Coffee className="w-4 h-4 text-slate-500" />
        <span className="hidden sm:inline">Galley</span>
      </div>
    )
  }

  if (element.type === "closet") {
    return (
      <div
        className="h-9 px-2 bg-slate-100 border border-slate-300 text-slate-600 text-[10px] font-medium flex items-center justify-center gap-1 rounded-[4px]"
        title="Storage Closet"
      >
        <Shirt className="w-4 h-4 text-slate-500" />
      </div>
    )
  }

  if (element.type === "stairs") {
    return (
      <div
        className="h-9 px-2 bg-slate-100 border border-slate-300 text-slate-600 text-[10px] font-medium flex items-center justify-center gap-1 rounded-[4px]"
        title="Stairs to another deck"
      >
        <Layers className="w-4 h-4 text-slate-500" />
      </div>
    )
  }

  if (element.type === "restricted_seat_general") {
    return (
      <div
        className={`${fixedBoxStyle} bg-slate-200 border border-slate-400 text-slate-500 cursor-not-allowed`}
        title="Restricted Seat"
      >
        <AlertTriangle className="w-3.5 h-3.5 text-slate-400" />
      </div>
    )
  }

  // Seat element handling
  if (element.type === "seat") {
    const seat = element as SeatElement
    const availableServices = seat.available_services || []
    const isAvailable = availableServices.length > 0

    // Find service matching current active passenger, or fallback to first service
    const matchingService =
      availableServices.find(
        (s) => s.passenger_id === activePassengerIndex + 1 || s.passenger_id === `pas_${activePassengerIndex + 1}`
      ) || availableServices[0]

    // Check if this seat is selected by ANY passenger
    const selectedByChoice = selectedSeats.find(
      (s) => s.segmentId === segmentId && s.seatDesignator === seat.designator
    )

    const isSelectedByActive =
      selectedByChoice && selectedByChoice.passengerIndex === activePassengerIndex
    const isSelectedByOther =
      selectedByChoice && selectedByChoice.passengerIndex !== activePassengerIndex

    const totalAmt = matchingService ? parseFloat(matchingService.total_amount || "0") : 0
    const priceDisplay = totalAmt > 0 ? `+৳${totalAmt}` : ""

    if (!isAvailable) {
      return (
        <button
          disabled
          className={`${fixedBoxStyle} bg-slate-100 text-slate-400 border border-dashed border-slate-300 cursor-not-allowed`}
          title={`Seat ${seat.designator} (Unavailable)`}
        >
          {seat.designator}
        </button>
      )
    }

    if (isSelectedByActive) {
      return (
        <button
          onClick={() => onSelectSeat(segmentId, seat, matchingService)}
          className={`${fixedBoxStyle} bg-[#e31837] text-white font-bold ring-2 ring-red-400 shadow-md border border-red-700 relative`}
          title={`Seat ${seat.designator} selected for Passenger ${activePassengerIndex + 1}`}
        >
          <span>{seat.designator}</span>
          <Check className="w-3 h-3 absolute top-0.5 right-0.5" />
        </button>
      )
    }

    if (isSelectedByOther) {
      return (
        <button
          disabled
          className={`${fixedBoxStyle} bg-[#003366] text-white border border-[#001e3d] cursor-not-allowed opacity-90 relative`}
          title={`Seat ${seat.designator} assigned to Passenger ${(selectedByChoice?.passengerIndex ?? 0) + 1}`}
        >
          <span>{seat.designator}</span>
          <span className="text-[8px] absolute bottom-0.5">P{(selectedByChoice?.passengerIndex ?? 0) + 1}</span>
        </button>
      )
    }

    return (
      <button
        onClick={() => onSelectSeat(segmentId, seat, matchingService)}
        className={`${fixedBoxStyle} bg-white border-2 border-[#003366] text-[#003366] hover:bg-[#003366] hover:text-white cursor-pointer relative group`}
        title={`Select Seat ${seat.designator} ${seat.name ? `(${seat.name})` : ""} ${priceDisplay}`}
      >
        <span>{seat.designator}</span>
        {totalAmt > 0 && (
          <span className="absolute -top-1 -right-1 text-[8px] bg-amber-500 text-white font-bold px-1 rounded-full border border-amber-600">
          ৳
          </span>
        )}
      </button>
    )
  }

  return null
}
