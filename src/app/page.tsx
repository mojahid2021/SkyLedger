"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  Compass,
  Tag,
  Luggage,
  Headphones,
  Info,
  Clock,
  Award,
  ArrowRight,
  Plane,
  MapPin,
} from "lucide-react"
import Link from "next/link"
import { FlightSearchWidget } from "@/components/flight/flight-search-widget"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

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

function LandingPageContent() {
  const searchParams = useSearchParams()
  const [prefilledSearch, setPrefilledSearch] = useState<{
    origin?: string
    originCode?: string
    destination?: string
    destinationCode?: string
  }>({})

  const [dbDeals, setDbDeals] = useState<any[]>([])
  const [loadingDeals, setLoadingDeals] = useState(true)
  const [departures, setDepartures] = useState<any[]>([])
  const [loadingDepartures, setLoadingDepartures] = useState(true)

  const searchWidgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch top deals
    fetch("/api/flights/deals")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.deals) {
          setDbDeals(data.deals)
        }
      })
      .catch((err) => console.error("Error loading deals:", err))
      .finally(() => setLoadingDeals(false))

    // Fetch departures
    fetch("/api/flights")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.flights) {
          setDepartures(data.flights)
        }
      })
      .catch((err) => console.error("Error loading departures:", err))
      .finally(() => setLoadingDepartures(false))
  }, [])

  useEffect(() => {
    const origin = searchParams.get("origin")
    const originCode = searchParams.get("originCode")
    const destination = searchParams.get("destination")
    const destinationCode = searchParams.get("destinationCode")

    if (originCode || destinationCode) {
      setPrefilledSearch({
        origin: origin || undefined,
        originCode: originCode || undefined,
        destination: destination || undefined,
        destinationCode: destinationCode || undefined,
      })

      // Scroll to widget if prefilled from URL query parameters
      if (searchWidgetRef.current) {
        searchWidgetRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
      }
    }
  }, [searchParams])

  const handleSelectDeal = (deal: any) => {
    setPrefilledSearch({
      origin: `${deal.origin_name} (${deal.origin_iata})`,
      originCode: deal.origin_iata,
      destination: `${deal.destination_name} (${deal.destination_iata})`,
      destinationCode: deal.destination_iata,
    })
    if (searchWidgetRef.current) {
      searchWidgetRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

  const handleSelectRoute = (item: any) => {
    setPrefilledSearch({
      origin: `${item.origin_name} (${item.origin_iata})`,
      originCode: item.origin_iata,
      destination: `${item.destination_name} (${item.destination_iata})`,
      destinationCode: item.destination_iata,
    })
    if (searchWidgetRef.current) {
      searchWidgetRef.current.scrollIntoView({ behavior: "smooth", block: "center" })
    }
  }

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
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] font-[700] px-2.5 py-0.5 rounded-[4px]">
            Delayed
          </span>
        )
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-800 text-[11px] font-[700] px-2.5 py-0.5 rounded-[4px]">
            Cancelled
          </span>
        )
      case "landed":
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-[11px] font-[700] px-2.5 py-0.5 rounded-[4px]">
            Landed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-[700] px-2.5 py-0.5 rounded-[4px]">
            On Time
          </span>
        )
    }
  }

  return (
    <div className="min-h-screen bg-delta-canvas text-delta-ink font-delta flex flex-col selection:bg-delta-red/20 selection:text-delta-red">
      <Navbar />

      {/* Hero Content Section */}
      <main className="flex-1">
        <section id="search-section" className="relative py-24 bg-cover bg-center overflow-hidden" style={{ backgroundImage: "url('/images/hero_flight.jpg')" }}>
          {/* Subtle gradient overlay to make sure text is extremely legible */}
          <div className="absolute inset-0 bg-gradient-to-r from-delta-navy-dark/95 via-delta-navy-dark/80 to-delta-navy-dark/35 pointer-events-none" />

          <div className="mx-auto max-w-[1280px] px-6 sm:px-8 relative z-10">
            <div className="max-w-[820px] mb-10 text-shadow-sm">
              <div className="inline-flex items-center gap-2 bg-delta-red/20 text-white border border-delta-red/30 px-3.5 py-1.5 text-[11px] font-[800] uppercase tracking-widest rounded-full mb-5 select-none shadow-md">
                <Compass className="h-3.5 w-3.5 text-delta-red animate-spin-slow" />
                <span>Next-Gen Flight Booking Experience</span>
              </div>
              
              <h1 className="text-[40px] sm:text-[56px] font-[800] leading-[48px] sm:leading-[64px] tracking-[-1.5px] text-white max-w-[820px] font-delta text-shadow-md">
                Fly wherever you desire with <span className="text-delta-red relative inline-block whitespace-nowrap">effortless ease<span className="absolute left-0 bottom-1 w-full h-[3px] bg-delta-red/50 rounded-full" /></span>.
              </h1>
              
              <p className="mt-5 text-[16px] sm:text-[18px] leading-[26px] sm:leading-[30px] text-white/90 max-w-[720px] font-normal">
                Explore hundreds of direct and connected routes across our global fleet. Experience{" "}
                <strong className="font-[750] text-white">real-time seat layouts</strong>, transparent fares in{" "}
                <strong className="font-[750] text-white">Bangladeshi Taka (৳)</strong>, and{" "}
                <strong className="font-[750] text-white">zero booking blackout dates</strong>.
              </p>
            </div>

            {/* Search widget wrapper - Direct rendering (delegated to widget glassmorphic card) */}
            <div ref={searchWidgetRef} className="w-full">
              <FlightSearchWidget
                initialOrigin={prefilledSearch.origin}
                initialOriginCode={prefilledSearch.originCode}
                initialDestination={prefilledSearch.destination}
                initialDestinationCode={prefilledSearch.destinationCode}
              />
            </div>

            {/* Quick trust metrics (Redesigned with glassmorphic cards, no divider lines) */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6 border-t border-white/10">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white/10 backdrop-blur-xs text-white font-bold rounded-[4px] border border-white/20">
                  ✓
                </div>
                <div>
                  <p className="text-[13px] font-[700] text-white">Instant E-Ticket</p>
                  <p className="text-[11px] text-white/70 font-normal">Confirmed on checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white/10 backdrop-blur-xs text-white font-bold rounded-[4px] border border-white/20">
                  ৳
                </div>
                <div>
                  <p className="text-[13px] font-[700] text-white">Transparent Pricing</p>
                  <p className="text-[11px] text-white/70 font-normal">No surprise hidden fees</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white/10 backdrop-blur-xs text-white rounded-[4px] border border-white/20">
                  <Luggage className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-[700] text-white">Baggage Clarity</p>
                  <p className="text-[11px] text-white/70 font-normal">Clear carry-on & check-in</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-white/10 backdrop-blur-xs text-white rounded-[4px] border border-white/20">
                  <Headphones className="h-5 w-5 text-white" />
                </div>
                <div>
                  <p className="text-[13px] font-[700] text-white">24/7 Support</p>
                  <p className="text-[11px] text-white/70 font-normal">Live booking assistance</p>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Today's Departures schedules block (Featured list, borderless block row design) */}
        <section className="bg-delta-canvas py-16">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-8 flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-[12px] font-[700] uppercase tracking-wider text-delta-navy-mid flex items-center gap-1.5 animate-pulse">
                  <Clock className="h-3.5 w-3.5" />
                  Live Boarding Monitor
                </p>
                <h2 className="text-[24px] sm:text-[32px] font-[700] leading-tight text-delta-navy mt-1">
                  Today&apos;s Featured Departures
                </h2>
              </div>
              <Link
                href="/flight-status"
                className="text-[13px] font-[750] uppercase tracking-wider text-delta-navy hover:text-delta-red transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                <span>View Full Board</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loadingDepartures ? (
              <div className="flex h-36 items-center justify-center text-[14px] font-[600] text-delta-ink-muted animate-pulse">
                Fetching active departures...
              </div>
            ) : departures.length === 0 ? (
              <div className="bg-delta-surface-1 p-8 rounded-[4px] text-center text-delta-ink-muted text-xs font-[700] uppercase tracking-wider">
                No flights scheduled for departure today.
              </div>
            ) : (
              <div className="flex flex-col gap-2.5">
                {departures.slice(0, 5).map((item, idx) => {
                  const originCity = getCityFromAirport(item.origin_name, item.origin_iata)
                  const destCity = getCityFromAirport(item.destination_name, item.destination_iata)
                  const routeStr = `${originCity} (${item.origin_iata})`
                  const destStr = `${destCity} (${item.destination_iata})`

                  return (
                    <div
                      key={item.id || idx}
                      className="bg-white p-5 lg:p-6 rounded-[4px] border border-delta-hairline-light shadow-2xs hover:shadow-xs transition-shadow grid grid-cols-1 lg:grid-cols-12 gap-4 items-center"
                    >
                      <div className="col-span-1 lg:col-span-5 flex items-center gap-3">
                        <div className="flex flex-col">
                          <span className="font-[700] text-[15px] text-delta-navy flex items-center gap-2">
                            {routeStr}
                            <ArrowRight className="h-3.5 w-3.5 text-delta-red shrink-0" />
                            {destStr}
                          </span>
                        </div>
                      </div>

                      <div className="col-span-1 lg:col-span-2 flex items-center lg:block">
                        <span className="font-mono text-[13px] font-[700] text-delta-navy bg-delta-surface-2 px-2 py-0.5 rounded-[2px]">
                          {item.flight_number}
                        </span>
                      </div>

                      <div className="col-span-1 lg:col-span-2 flex items-center lg:block">
                        <span className="text-[14px] font-[500] text-delta-ink">
                          {formatTime(item.departure_time)}
                        </span>
                      </div>

                      <div className="col-span-1 lg:col-span-1 flex items-center lg:block lg:text-right">
                        <span className="text-[15px] font-[700] text-delta-red">
                          ৳{Number(item.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </span>
                      </div>

                      <div className="col-span-1 lg:col-span-1 flex items-center lg:block lg:text-center">
                        {getStatusBadge(item.status)}
                      </div>

                      <div className="col-span-1 lg:col-span-1 flex justify-end">
                        <button
                          type="button"
                          onClick={() => handleSelectRoute(item)}
                          className="bg-delta-navy hover:bg-delta-navy-mid text-white text-[12px] font-[700] px-4 py-2 rounded-[4px] shadow-sm transition-colors cursor-pointer w-full lg:w-auto text-center uppercase tracking-wider"
                        >
                          Book
                        </button>
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </div>
        </section>

        {/* Offers & Partner Promotions Section (NEW Standard Ads Grid) */}
        <section className="bg-delta-canvas py-16 border-t border-delta-hairline-light">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-8 flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <p className="text-[12px] font-[700] uppercase tracking-wider text-delta-red flex items-center gap-1.5 animate-pulse">
                <Compass className="h-3.5 w-3.5 text-delta-red" />
                Exclusive Campaigns
              </p>
              <h2 className="text-[24px] sm:text-[32px] font-[700] text-delta-navy leading-tight">
                Offers & Partner Promotions
              </h2>
              <p className="text-[14px] text-delta-ink-muted max-w-[580px] font-normal">
                Take advantage of our exclusive digital wallet deals, co-branded reward schemes, mobile apps, and bundled package discounts.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Wallet Recharge Promotion */}
              <Link 
                href="/user/wallet"
                className="group relative h-[260px] rounded-[6px] overflow-hidden border border-delta-hairline bg-white shadow-2xs hover:shadow-lg hover:border-delta-navy transition-all duration-300 cursor-pointer"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                  style={{ backgroundImage: "url('/images/promo_wallet.jpg')" }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/35 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 w-full p-6 text-white z-10 flex flex-col justify-end h-full">
                  <span className="bg-delta-red text-white text-[10px] font-[800] uppercase px-2.5 py-0.5 rounded-[4px] self-start mb-2 tracking-wider shadow-sm">
                    Recharge Bonus
                  </span>
                  <h3 className="text-[22px] font-[800] tracking-tight leading-snug text-white text-shadow-sm text-shadow-md">
                    Earn up to 15% Instant Cashback!
                  </h3>
                  <p className="text-[13px] text-white/90 mt-1 font-normal max-w-[420px] text-shadow-sm">
                    Recharge your SkyLedger Wallet via SSLCommerz today and unlock exclusive flight discount credits.
                  </p>
                  <span className="mt-3 text-[11px] font-[750] uppercase tracking-wider text-delta-red group-hover:text-white transition-colors flex items-center gap-1.5 self-start">
                    <span>Recharge Now</span>
                    <ArrowRight className="h-3.5 w-3.5 animate-bounce-horizontal" />
                  </span>
                </div>
              </Link>

              {/* Visa Credit Card Promo */}
              <Link 
                href="/skymiles"
                className="group relative h-[260px] rounded-[6px] overflow-hidden border border-delta-hairline bg-white shadow-2xs hover:shadow-lg hover:border-delta-navy transition-all duration-300 cursor-pointer"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                  style={{ backgroundImage: "url('/images/promo_credit_card.jpg')" }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/35 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 w-full p-6 text-white z-10 flex flex-col justify-end h-full">
                  <span className="bg-delta-navy text-white text-[10px] font-[800] uppercase px-2.5 py-0.5 rounded-[4px] self-start mb-2 tracking-wider shadow-sm border border-white/10">
                    Co-Branded Offer
                  </span>
                  <h3 className="text-[22px] font-[800] tracking-tight leading-snug text-white text-shadow-md">
                    Apply for the Visa Platinum Card
                  </h3>
                  <p className="text-[13px] text-white/90 mt-1 font-normal max-w-[420px] text-shadow-sm">
                    Unlock airport luxury lounge access, priority check-in, and earn 3x points on every ticket.
                  </p>
                  <span className="mt-3 text-[11px] font-[750] uppercase tracking-wider text-delta-red group-hover:text-white transition-colors flex items-center gap-1.5 self-start">
                    <span>Learn More</span>
                    <ArrowRight className="h-3.5 w-3.5 animate-bounce-horizontal" />
                  </span>
                </div>
              </Link>

              {/* Mobile App download banner */}
              <div 
                className="group relative h-[260px] rounded-[6px] overflow-hidden border border-delta-hairline bg-white shadow-2xs hover:shadow-lg transition-all duration-300"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                  style={{ backgroundImage: "url('/images/promo_mobile_app.jpg')" }}
                />
                <div className="absolute inset-0 bg-black/45" />
                <div className="absolute bottom-0 left-0 w-full p-6 text-white z-10 flex flex-col justify-end h-full">
                  <span className="bg-emerald-600 text-white text-[10px] font-[800] uppercase px-2.5 py-0.5 rounded-[4px] self-start mb-2 tracking-wider shadow-sm">
                    Mobile App
                  </span>
                  <h3 className="text-[22px] font-[800] tracking-tight leading-snug text-white text-shadow-md">
                    Install SkyLedger on your Phone
                  </h3>
                  <p className="text-[13px] text-white/90 mt-1 font-normal max-w-[400px] text-shadow-sm">
                    Scan the QR code to install our iOS or Android app for live flight alerts and fast offline bookings.
                  </p>
                  <div className="mt-3 flex items-center gap-4 text-[10px] font-[700] text-white/70 uppercase tracking-widest">
                    <span>App Store</span>
                    <span className="w-1.5 h-1.5 rounded-full bg-white/40" />
                    <span>Google Play</span>
                  </div>
                </div>
              </div>

              {/* Vacation Combo Promo */}
              <Link 
                href="/deals"
                className="group relative h-[260px] rounded-[6px] overflow-hidden border border-delta-hairline bg-white shadow-2xs hover:shadow-lg hover:border-delta-navy transition-all duration-300 cursor-pointer"
              >
                <div 
                  className="absolute inset-0 bg-cover bg-center transition-transform duration-500 group-hover:scale-105" 
                  style={{ backgroundImage: "url('/images/promo_vacation.jpg')" }}
                />
                <div className="absolute inset-0 bg-black/40 group-hover:bg-black/35 transition-colors duration-300" />
                <div className="absolute bottom-0 left-0 w-full p-6 text-white z-10 flex flex-col justify-end h-full">
                  <span className="bg-amber-600 text-white text-[10px] font-[800] uppercase px-2.5 py-0.5 rounded-[4px] self-start mb-2 tracking-wider shadow-sm">
                    Vacation Deals
                  </span>
                  <h3 className="text-[22px] font-[800] tracking-tight leading-snug text-white text-shadow-md">
                    Book Flight + Hotel & Save 35%!
                  </h3>
                  <p className="text-[13px] text-white/90 mt-1 font-normal max-w-[420px] text-shadow-sm">
                    Discover luxury resort packages, direct flights, and staycations at unbeatable bundle prices.
                  </p>
                  <span className="mt-3 text-[11px] font-[750] uppercase tracking-wider text-delta-red group-hover:text-white transition-colors flex items-center gap-1.5 self-start">
                    <span>View Combos</span>
                    <ArrowRight className="h-3.5 w-3.5 animate-bounce-horizontal" />
                  </span>
                </div>
              </Link>
            </div>
          </div>
        </section>

        {/* Curated Deals Section (Grouped by Tag) */}
        <section className="bg-delta-surface-1 py-16">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-8 flex flex-col gap-12">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-[12px] font-[700] uppercase tracking-wider text-delta-red flex items-center gap-1.5">
                  <Tag className="h-3.5 w-3.5 text-delta-red" />
                  Special Travel Offers
                </p>
                <h2 className="text-[24px] sm:text-[32px] font-[700] leading-tight text-delta-navy mt-1">
                  Explore Curated Deals
                </h2>
              </div>
              <Link
                href="/deals"
                className="text-[13px] font-[750] uppercase tracking-wider text-delta-navy hover:text-delta-red transition-colors inline-flex items-center gap-1.5 shrink-0"
              >
                <span>View All Deals</span>
                <ArrowRight className="h-4 w-4" />
              </Link>
            </div>

            {loadingDeals ? (
              <div className="flex h-36 items-center justify-center text-[14px] font-[600] text-delta-ink-muted animate-pulse">
                Fetching deals...
              </div>
            ) : dbDeals.length === 0 ? (
              <div className="bg-white p-8 rounded-[4px] text-center text-delta-ink-muted text-xs font-[700] uppercase tracking-wider">
                No promotional deals currently featured.
              </div>
            ) : (
              <div className="flex flex-col gap-12">
                {Object.entries(
                  dbDeals.reduce((acc: any, deal) => {
                    const tag = deal.tag || "Featured Deals"
                    if (!acc[tag]) acc[tag] = []
                    acc[tag].push(deal)
                    return acc
                  }, {})
                ).map(([tag, dealsGroup]: [string, any]) => (
                  <div key={tag} className="flex flex-col gap-5">
                    <h3 className="text-[20px] font-[700] text-delta-navy border-b border-delta-hairline pb-2 flex justify-between items-center">
                      <span>{tag}</span>
                      <span className="text-[12px] text-delta-ink-muted font-normal">{dealsGroup.length} Flights Available</span>
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                      {dealsGroup.slice(0, 3).map((deal: any) => {
                        const destCity = getCityFromAirport(deal.destination_name, deal.destination_iata)
                        const origCity = getCityFromAirport(deal.origin_name, deal.origin_iata)
                        const routeStr = `${deal.origin_iata} → ${deal.destination_iata}`
                        const fareStr = `৳${Number(deal.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
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

                            <div className="p-5 flex flex-col flex-1">
                              <h3 className="text-[20px] font-[800] text-delta-navy group-hover:text-delta-red transition-colors leading-tight">
                                {destCity}
                              </h3>
                              <p className="mt-1.5 text-[13px] text-delta-ink-muted font-normal">
                                Flight from <span className="font-[600] text-delta-ink">{origCity}</span>
                              </p>
                            </div>

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
                ))}
              </div>
            )}
          </div>
        </section>

        {/* Premium Loyalty Banner Section */}
        <section className="bg-delta-surface-2 py-16 border-t border-delta-hairline-light">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-8">
            <div className="relative overflow-hidden rounded-[8px] bg-gradient-to-r from-delta-navy-dark via-delta-navy to-delta-navy-mid text-white border border-white/10 shadow-xl">
              {/* Decorative elements */}
              <div className="absolute right-0 top-0 bottom-0 w-1/2 opacity-30 md:opacity-100 hidden md:block">
                <div 
                  className="w-full h-full bg-cover bg-center"
                  style={{ backgroundImage: "url('/images/loyalty_promo.jpg')" }}
                />
                <div className="absolute inset-0 bg-gradient-to-r from-delta-navy via-transparent to-transparent" />
              </div>

              <div className="relative z-10 p-8 md:p-12 max-w-[650px] flex flex-col gap-6">
                <div>
                  <div className="inline-flex items-center gap-2 bg-delta-red/35 border border-delta-red/30 text-white text-[10px] font-[800] uppercase tracking-wider px-3 py-1 rounded-full mb-4 shadow-sm">
                    <Award className="w-3.5 h-3.5 text-white animate-pulse" />
                    SkyMiles Loyalty Program
                  </div>
                  <h2 className="text-[28px] sm:text-[36px] font-[800] tracking-tight leading-tight text-white text-shadow-md">
                    Elevate your travel experience to elite status
                  </h2>
                  <p className="mt-4 text-[14px] sm:text-[15px] text-white/80 leading-[22px] font-normal">
                    Join SkyMiles to earn miles on every flight, qualify for elite Medallion tiers, and unlock luxury travel privileges like airport lounge access and priority boarding.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 my-2">
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-delta-red font-bold text-xs border border-white/20">
                      ✓
                    </div>
                    <span className="text-[13px] text-white/90 font-medium">Lounge Access (Club Lounge)</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-delta-red font-bold text-xs border border-white/20">
                      ✓
                    </div>
                    <span className="text-[13px] text-white/90 font-medium">Unlimited Miles Validity</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-delta-red font-bold text-xs border border-white/20">
                      ✓
                    </div>
                    <span className="text-[13px] text-white/90 font-medium">Priority Baggage Handling</span>
                  </div>
                  <div className="flex items-center gap-3">
                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-white/10 text-delta-red font-bold text-xs border border-white/20">
                      ✓
                    </div>
                    <span className="text-[13px] text-white/90 font-medium">100% Free Tiers Enrollment</span>
                  </div>
                </div>

                <div className="flex flex-wrap items-center gap-4 mt-2">
                  <Link 
                    href="/skymiles" 
                    className="bg-delta-red hover:bg-delta-red-hover text-white text-[12px] font-[800] uppercase tracking-wider px-6 py-3 rounded-[4px] shadow-lg shadow-delta-red/35 transition-all text-center hover:scale-[1.02]"
                  >
                    Explore Medallion Tiers
                  </Link>
                  <Link 
                    href="/register" 
                    className="bg-white/10 hover:bg-white/25 text-white border border-white/30 text-[12px] font-[800] uppercase tracking-wider px-6 py-3 rounded-[4px] transition-all text-center hover:scale-[1.02]"
                  >
                    Join SkyMiles Free
                  </Link>
                </div>
              </div>
            </div>
          </div>
        </section>

        {/* Feature Shortcuts Grid - visual redirection to dedicated pages (no horizontal lines) */}
        <section className="bg-delta-canvas py-16">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-8 flex flex-col gap-10">
            <div className="flex flex-col gap-2">
              <h2 className="text-[24px] sm:text-[32px] font-[700] text-delta-navy leading-tight">
                Explore SkyLedger Services
              </h2>
              <p className="text-[14px] text-delta-ink-muted max-w-[580px] font-normal">
                Quick access to active flights departures schedule board, special promotional packages, Medallion loyalty tiers, and airline policies.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Link
                href="/flight-status"
                className="group p-6 border border-delta-hairline rounded-[4px] hover:border-delta-navy transition-colors flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[4px] mb-4">
                    <Clock className="h-5 w-5" />
                  </div>
                  <h3 className="text-[16px] font-[700] text-delta-navy group-hover:text-delta-red transition-colors">
                    Flight Status
                  </h3>
                  <p className="mt-2 text-[13px] text-delta-ink-muted leading-[20px] font-normal">
                    Check today's active departures, arrival boards, and live status monitor.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-[11px] font-[700] text-delta-navy uppercase tracking-wider">
                  <span>View Board</span>
                  <ArrowRight className="h-3.5 w-3.5 text-delta-red transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link
                href="/deals"
                className="group p-6 border border-delta-hairline rounded-[4px] hover:border-delta-navy transition-colors flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[4px] mb-4">
                    <Tag className="h-5 w-5 text-delta-red" />
                  </div>
                  <h3 className="text-[16px] font-[700] text-delta-navy group-hover:text-delta-red transition-colors">
                    Curated Deals
                  </h3>
                  <p className="mt-2 text-[13px] text-delta-ink-muted leading-[20px] font-normal">
                    Browse featured destinations and special promotional airfares for popular routes.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-[11px] font-[700] text-delta-navy uppercase tracking-wider">
                  <span>View Deals</span>
                  <ArrowRight className="h-3.5 w-3.5 text-delta-red transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link
                href="/skymiles"
                className="group p-6 border border-delta-hairline rounded-[4px] hover:border-delta-navy transition-colors flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[4px] mb-4">
                    <Award className="h-5 w-5" />
                  </div>
                  <h3 className="text-[16px] font-[700] text-delta-navy group-hover:text-delta-red transition-colors">
                    SkyMiles Loyalty
                  </h3>
                  <p className="mt-2 text-[13px] text-delta-ink-muted leading-[20px] font-normal">
                    Discover elite Medallion status privileges, MQDs, and exclusive member miles.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-[11px] font-[700] text-delta-navy uppercase tracking-wider">
                  <span>View Benefits</span>
                  <ArrowRight className="h-3.5 w-3.5 text-delta-red transition-transform group-hover:translate-x-1" />
                </div>
              </Link>

              <Link
                href="/travel-info"
                className="group p-6 border border-delta-hairline rounded-[4px] hover:border-delta-navy transition-colors flex flex-col justify-between shadow-2xs hover:shadow-xs"
              >
                <div>
                  <div className="flex h-10 w-10 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[4px] mb-4">
                    <Info className="h-5 w-5" />
                  </div>
                  <h3 className="text-[16px] font-[700] text-delta-navy group-hover:text-delta-red transition-colors">
                    Travel Info
                  </h3>
                  <p className="mt-2 text-[13px] text-delta-ink-muted leading-[20px] font-normal">
                    Access details on checked baggage limits, risk-free refunds, and digital wallet credits.
                  </p>
                </div>
                <div className="mt-5 flex items-center gap-1.5 text-[11px] font-[700] text-delta-navy uppercase tracking-wider">
                  <span>View Info</span>
                  <ArrowRight className="h-3.5 w-3.5 text-delta-red transition-transform group-hover:translate-x-1" />
                </div>
              </Link>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  )
}

export default function RootPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen bg-delta-surface-1 flex items-center justify-center font-delta font-bold animate-pulse text-delta-navy">
          Loading SkyLedger...
        </div>
      }
    >
      <LandingPageContent />
    </Suspense>
  )
}
