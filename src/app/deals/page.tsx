"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Sparkles, MapPin, ArrowRight } from "lucide-react"
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

export default function DealsPage() {
  const router = useRouter()
  const [dbDeals, setDbDeals] = useState<any[]>([])
  const [loading, setLoading] = useState(true)

  useEffect(() => {
    fetch("/api/flights/deals")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.deals) {
          setDbDeals(data.deals)
        }
      })
      .catch((err) => console.error("Error loading deals:", err))
      .finally(() => setLoading(false))
  }, [])

  const handleSelectDeal = (deal: any) => {
    const originLabel = `${deal.origin_name} (${deal.origin_iata})`
    const destinationLabel = `${deal.destination_name} (${deal.destination_iata})`
    router.push(
      `/?origin=${encodeURIComponent(originLabel)}&originCode={deal.origin_iata}&destination=${encodeURIComponent(destinationLabel)}&destinationCode=${deal.destination_iata}`
    )
  }

  const categories = Array.from(new Set(dbDeals.map((d: any) => d.tag)))

  return (
    <div className="min-h-screen bg-delta-surface-1 text-delta-ink font-delta flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1280px] px-6 sm:px-8 py-10 flex flex-col gap-8">
        {/* Header Block */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 bg-delta-navy text-white px-3 py-1 text-[11px] font-[700] uppercase tracking-wider w-fit rounded-[2px]">
            <Sparkles className="h-3.5 w-3.5 text-delta-red" />
            <span>Featured Travel Offers</span>
          </div>
          <h1 className="text-[32px] sm:text-[40px] font-[700] text-delta-navy tracking-tight leading-none mt-2">
            Today&apos;s Curated Deals
          </h1>
          <p className="text-[15px] text-delta-ink-muted max-w-[640px] mt-1 font-normal">
            Special promotional airfares for popular domestic and international flight routes. Prefill your search instantly by selecting any route.
          </p>
        </div>

        {/* Loading / Results Grid */}
        {loading ? (
          <div className="flex h-64 items-center justify-center text-[15px] font-[600] text-delta-ink-muted animate-pulse">
            Fetching available promotional deals...
          </div>
        ) : dbDeals.length === 0 ? (
          <div className="bg-white p-10 rounded-[6px] border border-delta-hairline-light text-center text-delta-ink-muted text-xs font-[700] uppercase tracking-wider">
            No promotional deals currently featured. Check back soon!
          </div>
        ) : (
          <div className="flex flex-col gap-10">
            {categories.map((category) => {
              const categoryDeals = dbDeals.filter((deal) => deal.tag === category)
              return (
                <div key={category} className="flex flex-col gap-5">
                  {/* Category Title - visual spacing divider instead of border line */}
                  <div className="flex items-center gap-2">
                    <span className="h-2.5 w-2.5 rounded-full bg-delta-red" />
                    <h2 className="text-[14px] font-[750] uppercase tracking-wider text-delta-navy">
                      {category} Flights & Escapes
                    </h2>
                  </div>

                  {/* Deals Grid */}
                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                    {categoryDeals.map((deal) => {
                      const destCity = getCityFromAirport(deal.destination_name, deal.destination_iata)
                      const origCity = getCityFromAirport(deal.origin_name, deal.origin_iata)
                      const routeStr = `${deal.origin_iata} → ${deal.destination_iata}`
                      const fareStr = `৳${Number(deal.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                      const tripTypeStr = deal.flight_type === "direct" ? "One-way Direct" : "Round Trip / Connecting"

                      return (
                        <div
                          key={deal.flight_id}
                          className="group rounded-[4px] border border-delta-hairline bg-white hover:border-delta-navy hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                        >
                          {/* Card Content Area */}
                          <div className="p-5 flex flex-col">
                            <div className="flex items-center justify-between">
                              <span className="rounded-full bg-delta-surface-2 px-2.5 py-0.5 text-[11px] font-[700] uppercase tracking-wide text-delta-navy">
                                {deal.tag}
                              </span>
                              <span className="flex items-center gap-1 font-mono text-[12px] font-[700] text-delta-navy bg-delta-surface-1 px-2.5 py-0.5 rounded border border-delta-hairline-light">
                                <MapPin className="h-3 w-3 text-delta-red shrink-0" />
                                {routeStr}
                              </span>
                            </div>

                            <h3 className="mt-5 text-[24px] font-[700] text-delta-navy group-hover:text-delta-red transition-colors">
                              {destCity}
                            </h3>
                            <p className="mt-1 text-[13px] text-delta-ink-muted font-normal">
                              {tripTypeStr} from <span className="font-[600] text-delta-ink">{origCity}</span>
                            </p>
                          </div>

                          {/* Card Footer - styled with block background instead of border-t line */}
                          <div className="bg-delta-surface-1 px-5 py-4 flex items-end justify-between">
                            <div>
                              <span className="text-[10px] font-[700] uppercase tracking-wide text-delta-ink-muted">
                                Fares from
                              </span>
                              <div className="text-[24px] font-[700] leading-none text-delta-red mt-0.5">
                                {fareStr}
                              </div>
                            </div>

                            <button
                              type="button"
                              onClick={() => handleSelectDeal(deal)}
                              className="rounded-[4px] bg-delta-navy hover:bg-delta-navy-mid px-4 py-2 text-[12px] font-[700] text-white transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer uppercase tracking-wider"
                            >
                              <span>Book</span>
                              <ArrowRight className="h-3.5 w-3.5" />
                            </button>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </div>
              )
            })}
          </div>
        )}
      </main>
    </div>
  )
}
