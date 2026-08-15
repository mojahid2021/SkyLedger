"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Tag, MapPin, ArrowRight } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"
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

const destinationImages: Record<string, string> = {
  CXB: "/images/dest_coxs_bazar.jpg",
  JFK: "/images/dest_new_york.jpg",
  DXB: "/images/dest_dubai.jpg",
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
      `/?origin=${encodeURIComponent(originLabel)}&originCode=${deal.origin_iata}&destination=${encodeURIComponent(destinationLabel)}&destinationCode=${deal.destination_iata}`
    )
  }

  const categories = Array.from(new Set(dbDeals.map((d: any) => d.tag)))

  return (
    <div className="min-h-screen bg-delta-surface-1 text-delta-ink font-delta flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1280px] px-6 sm:px-8 py-10 flex flex-col gap-8">
        {/* Header Block with Hero Banner */}
        <div 
          className="relative rounded-[8px] overflow-hidden bg-cover bg-center text-white border border-white/10 shadow-xl p-8 md:p-12"
          style={{ backgroundImage: "url('/images/promo_vacation.jpg')" }}
        >
          {/* Gradients overlay to ensure legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-delta-navy-dark/95 via-delta-navy-dark/80 to-delta-navy-dark/30 pointer-events-none" />

          <div className="relative z-10 max-w-[650px] flex flex-col gap-3">
            <div className="inline-flex items-center gap-1.5 bg-delta-red/35 border border-delta-red/30 text-white px-3 py-1 text-[11px] font-[800] uppercase tracking-wider w-fit rounded-full shadow-sm">
              <Tag className="h-3.5 w-3.5 text-white animate-pulse" />
              <span>Featured Travel Offers</span>
            </div>
            <h1 className="text-[32px] sm:text-[40px] font-[800] text-white tracking-tight leading-none mt-2 text-shadow-md">
              Today&apos;s Curated Deals
            </h1>
            <p className="text-[15px] text-white/80 max-w-[580px] mt-2 font-normal leading-[22px] text-shadow-sm">
              Special promotional airfares for popular domestic and international flight routes. Prefill your search instantly by selecting any route.
            </p>
          </div>
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
                      const destImage = destinationImages[deal.destination_iata] || "/images/hero_flight.jpg"

                      return (
                        <div
                          key={deal.flight_id}
                          className="group rounded-[4px] border border-delta-hairline bg-white hover:border-delta-navy hover:shadow-md transition-all duration-300 flex flex-col justify-between overflow-hidden"
                        >
                          {/* Card Visual Header */}
                          <div className="relative h-[150px] overflow-hidden">
                            <div 
                              className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105"
                              style={{ backgroundImage: `url('${destImage}')` }}
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/50 to-transparent pointer-events-none" />
                            <div className="absolute top-4 left-4">
                              <span className="rounded-full bg-delta-red text-white px-2.5 py-0.5 text-[10px] font-[800] uppercase tracking-wider shadow-sm">
                                {deal.tag}
                              </span>
                            </div>
                            <div className="absolute bottom-3 left-4 right-4 flex items-center justify-between text-white">
                              <span className="flex items-center gap-1 font-mono text-[11px] font-[700] bg-black/40 backdrop-blur-xs px-2.5 py-0.5 rounded border border-white/10 text-shadow-sm">
                                <MapPin className="h-3 w-3 text-delta-red shrink-0" />
                                {routeStr}
                              </span>
                            </div>
                          </div>

                          {/* Card Content Area */}
                          <div className="p-5 flex flex-col flex-1">
                            <h3 className="text-[20px] font-[800] text-delta-navy group-hover:text-delta-red transition-colors leading-tight">
                              {destCity}
                            </h3>
                            <p className="mt-1.5 text-[13px] text-delta-ink-muted font-normal">
                              {tripTypeStr} from <span className="font-[600] text-delta-ink">{origCity}</span>
                            </p>
                          </div>

                          {/* Card Footer */}
                          <div className="bg-delta-surface-1 px-5 py-4 flex items-end justify-between border-t border-delta-hairline-light">
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
      <Footer />
    </div>
  )
}
