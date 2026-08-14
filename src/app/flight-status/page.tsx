"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Clock, Plane, ArrowRight, ShieldCheck, HelpCircle } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { cn } from "@/lib/utils"

function getCityFromAirport(name: string, iata: string): string {
  const mappings: Record<string, string> = {
    JFK: "New York",
    LAX: "Los Angeles",
    LHR: "London",
    DAC: "Dhaka",
    CGP: "Chittagong",
    CXB: "Cox's Bazar",
    DXB: "Dubai",
    SIN: "Singapore",
    BKK: "Bangkok",
    KUL: "Kuala Lumpur",
    ATL: "Atlanta",
    DOH: "Doha",
    IST: "Istanbul",
  }
  if (mappings[iata]) return mappings[iata]
  let clean = name.replace(/(International|Airport|Regional|Intercontinental|Municipal|Field|Aero)/gi, "").trim()
  if (clean.includes(",")) {
    clean = clean.split(",")[0].trim()
  }
  return clean || name
}

export default function FlightStatusPage() {
  const router = useRouter()
  const [departures, setDepartures] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/flights")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.flights) {
          setDepartures(data.flights)
        }
      })
      .catch((err) => console.error("Error loading departures:", err))
      .finally(() => setLoading(false))
  }, [])

  const formatTime = (timeStr: string) => {
    try {
      const d = new Date(timeStr)
      if (isNaN(d.getTime())) return timeStr
      return d.toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })
    } catch {
      return timeStr
    }
  }

  const formatDate = (timeStr: string) => {
    try {
      const d = new Date(timeStr)
      if (isNaN(d.getTime())) return timeStr
      return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" })
    } catch {
      return timeStr
    }
  }

  const getStatusBadge = (status: string) => {
    switch (status?.toLowerCase()) {
      case "delayed":
        return (
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] font-[700] px-2.5 py-1 rounded-[4px]">
            Delayed
          </span>
        )
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-800 text-[11px] font-[700] px-2.5 py-1 rounded-[4px]">
            Cancelled
          </span>
        )
      case "landed":
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-[11px] font-[700] px-2.5 py-1 rounded-[4px]">
            Landed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-[700] px-2.5 py-1 rounded-[4px]">
            On Time
          </span>
        )
    }
  }

  const handleBookRoute = (item: any) => {
    const originLabel = `${item.origin_name} (${item.origin_iata})`
    const destinationLabel = `${item.destination_name} (${item.destination_iata})`
    router.push(
      `/?origin=${encodeURIComponent(originLabel)}&originCode=${item.origin_iata}&destination=${encodeURIComponent(destinationLabel)}&destinationCode=${item.destination_iata}`
    )
  }

  return (
    <div className="min-h-screen bg-delta-surface-1 text-delta-ink font-delta flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1280px] px-6 sm:px-8 py-10 flex flex-col gap-8">
        {/* Header Block */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 bg-delta-navy text-white px-3 py-1 text-[11px] font-[700] uppercase tracking-wider w-fit rounded-[2px]">
            <Clock className="h-3.5 w-3.5" />
            <span>Live Boarding Monitor</span>
          </div>
          <h1 className="text-[32px] sm:text-[40px] font-[700] text-delta-navy tracking-tight leading-none mt-2">
            Flight Status & Schedules
          </h1>
          <p className="text-[15px] text-delta-ink-muted max-w-[640px] mt-1 font-normal">
            View active flight status, scheduled departure details, and current fares. Select any flight card to book that route immediately.
          </p>
        </div>

        {/* Live Board Grid (Borderless, spacing & block coloring for segmentation) */}
        {loading ? (
          <div className="flex h-64 items-center justify-center text-[15px] font-[600] text-delta-ink-muted animate-pulse">
            Fetching active scheduled departures...
          </div>
        ) : departures.length === 0 ? (
          <div className="bg-white p-10 rounded-[6px] border border-delta-hairline-light text-center text-delta-ink-muted text-xs font-[700] uppercase tracking-wider">
            No flights currently scheduled for departure.
          </div>
        ) : (
          <div className="flex flex-col gap-3">
            {/* Header Labels (Desktop-only representation) */}
            <div className="hidden lg:grid grid-cols-12 gap-4 px-6 py-2 text-[12px] font-[700] text-delta-navy uppercase tracking-wider">
              <div className="col-span-4">Route</div>
              <div className="col-span-2">Flight No</div>
              <div className="col-span-2">Departure Date</div>
              <div className="col-span-1">Time</div>
              <div className="col-span-1 text-right">Fares From</div>
              <div className="col-span-1 text-center">Status</div>
              <div className="col-span-1 text-right">Action</div>
            </div>

            {/* Departures List Blocks */}
            <div className="flex flex-col gap-2.5">
              {departures.map((item, idx) => {
                const originCity = getCityFromAirport(item.origin_name, item.origin_iata)
                const destCity = getCityFromAirport(item.destination_name, item.destination_iata)
                const routeStr = `${originCity} (${item.origin_iata})`
                const destStr = `${destCity} (${item.destination_iata})`

                return (
                  <div
                    key={item.id || idx}
                    className="bg-white p-5 lg:p-6 rounded-[4px] border border-delta-hairline-light shadow-2xs hover:shadow-xs transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
                  >
                    {/* Route */}
                    <div className="col-span-1 lg:col-span-4 flex items-center gap-3">
                      <div className="flex flex-col">
                        <span className="font-[700] text-[15px] text-delta-navy flex items-center gap-2">
                          {routeStr}
                          <ArrowRight className="h-3.5 w-3.5 text-delta-red shrink-0" />
                          {destStr}
                        </span>
                        <span className="text-[11px] text-delta-ink-muted font-normal mt-0.5 truncate max-w-[280px]">
                          {item.origin_name} to {item.destination_name}
                        </span>
                      </div>
                    </div>

                    {/* Flight Number */}
                    <div className="col-span-1 lg:col-span-2 flex items-center lg:block">
                      <span className="lg:hidden text-[11px] font-[700] uppercase text-delta-navy w-24 shrink-0">
                        Flight No:
                      </span>
                      <span className="font-mono text-[13px] font-[700] text-delta-navy bg-delta-surface-2 px-2 py-0.5 rounded-[2px]">
                        {item.flight_number}
                      </span>
                    </div>

                    {/* Departure Date */}
                    <div className="col-span-1 lg:col-span-2 flex items-center lg:block">
                      <span className="lg:hidden text-[11px] font-[700] uppercase text-delta-navy w-24 shrink-0">
                        Date:
                      </span>
                      <span className="text-[14px] font-[500] text-delta-ink">
                        {formatDate(item.departure_time)}
                      </span>
                    </div>

                    {/* Time */}
                    <div className="col-span-1 lg:col-span-1 flex items-center lg:block">
                      <span className="lg:hidden text-[11px] font-[700] uppercase text-delta-navy w-24 shrink-0">
                        Time:
                      </span>
                      <span className="text-[14px] font-[600] text-delta-ink">
                        {formatTime(item.departure_time)}
                      </span>
                    </div>

                    {/* Fares */}
                    <div className="col-span-1 lg:col-span-1 flex items-center lg:block lg:text-right">
                      <span className="lg:hidden text-[11px] font-[700] uppercase text-delta-navy w-24 shrink-0">
                        Fare From:
                      </span>
                      <span className="text-[16px] font-[700] text-delta-red">
                        ৳{Number(item.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                      </span>
                    </div>

                    {/* Status */}
                    <div className="col-span-1 lg:col-span-1 flex items-center lg:block lg:text-center">
                      <span className="lg:hidden text-[11px] font-[700] uppercase text-delta-navy w-24 shrink-0">
                        Status:
                      </span>
                      {getStatusBadge(item.status)}
                    </div>

                    {/* Action */}
                    <div className="col-span-1 lg:col-span-1 flex justify-end">
                      <button
                        type="button"
                        onClick={() => handleBookRoute(item)}
                        className="bg-delta-navy hover:bg-delta-navy-mid text-white text-[12px] font-[700] px-4 py-2 rounded-[4px] shadow-sm transition-colors cursor-pointer w-full lg:w-auto text-center uppercase tracking-wider"
                      >
                        Book
                      </button>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}
      </main>
    </div>
  )
}
