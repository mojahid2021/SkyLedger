"use client"

import React, { useState, useEffect, useRef, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import {
  Sparkles,
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
        <section id="search-section" className="bg-delta-surface-1 py-16">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-8">
            <div className="max-w-[780px] mb-8">
              <div className="inline-flex items-center gap-1.5 bg-delta-navy text-white px-3 py-1 text-[11px] font-[700] uppercase tracking-wider mb-4 rounded-[2px]">
                <Sparkles className="h-3 w-3 text-delta-red" />
                <span>Next-Gen Flight Booking Experience</span>
              </div>
              <h1 className="text-[36px] sm:text-[48px] font-[700] leading-[44px] sm:leading-[56px] tracking-[-0.5px] text-delta-navy">
                Fly wherever you desire with effortless ease.
              </h1>
              <p className="mt-4 text-[16px] sm:text-[18px] leading-[24px] sm:leading-[28px] text-delta-ink-muted font-normal">
                Explore hundreds of direct and connected routes across our global fleet. Real-time seat layouts,
                transparent fares in Bangladeshi Taka (৳), and zero booking blackout dates.
              </p>
            </div>

            {/* Search widget wrapper */}
            <div ref={searchWidgetRef}>
              <FlightSearchWidget
                initialOrigin={prefilledSearch.origin}
                initialOriginCode={prefilledSearch.originCode}
                initialDestination={prefilledSearch.destination}
                initialDestinationCode={prefilledSearch.destinationCode}
              />
            </div>

            {/* Quick trust metrics (Redesigned with spacing, no divider lines) */}
            <div className="mt-12 grid grid-cols-2 sm:grid-cols-4 gap-6 pt-6">
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-delta-surface-2 text-delta-navy font-bold rounded-[4px] border border-delta-hairline-light">
                  ✓
                </div>
                <div>
                  <p className="text-[13px] font-[700] text-delta-navy">Instant E-Ticket</p>
                  <p className="text-[11px] text-delta-ink-muted font-normal">Confirmed on checkout</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-delta-surface-2 text-delta-navy font-bold rounded-[4px] border border-delta-hairline-light">
                  ৳
                </div>
                <div>
                  <p className="text-[13px] font-[700] text-delta-navy">Transparent Pricing</p>
                  <p className="text-[11px] text-delta-ink-muted font-normal">No surprise hidden fees</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[4px] border border-delta-hairline-light">
                  <Luggage className="h-5 w-5 text-delta-navy" />
                </div>
                <div>
                  <p className="text-[13px] font-[700] text-delta-navy">Baggage Clarity</p>
                  <p className="text-[11px] text-delta-ink-muted font-normal">Clear carry-on & check-in</p>
                </div>
              </div>
              <div className="flex items-center gap-3.5">
                <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[4px] border border-delta-hairline-light">
                  <Headphones className="h-5 w-5 text-delta-navy" />
                </div>
                <div>
                  <p className="text-[13px] font-[700] text-delta-navy">24/7 Support</p>
                  <p className="text-[11px] text-delta-ink-muted font-normal">Live booking assistance</p>
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

        {/* Curated Deals Section (Featured top 3, borderless card design) */}
        <section className="bg-delta-surface-1 py-16">
          <div className="mx-auto max-w-[1280px] px-6 sm:px-8 flex flex-col gap-8">
            <div className="flex flex-col sm:flex-row sm:items-end justify-between gap-4">
              <div>
                <p className="text-[12px] font-[700] uppercase tracking-wider text-delta-red flex items-center gap-1.5">
                  <Sparkles className="h-3.5 w-3.5 text-delta-red" />
                  Featured Travel Offers
                </p>
                <h2 className="text-[24px] sm:text-[32px] font-[700] leading-tight text-delta-navy mt-1">
                  Featured Destination Deals
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
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
                {dbDeals.slice(0, 3).map((deal) => {
                  const destCity = getCityFromAirport(deal.destination_name, deal.destination_iata)
                  const origCity = getCityFromAirport(deal.origin_name, deal.origin_iata)
                  const routeStr = `${deal.origin_iata} → ${deal.destination_iata}`
                  const fareStr = `৳${Number(deal.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`

                  return (
                    <div
                      key={deal.flight_id}
                      className="group rounded-[4px] border border-delta-hairline bg-white hover:border-delta-navy hover:shadow-md transition-all flex flex-col justify-between overflow-hidden"
                    >
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
                          Flight from <span className="font-[600] text-delta-ink">{origCity}</span>
                        </p>
                      </div>

                      {/* Outlined block footer - no horizontal border rule */}
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
            )}
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
                    <Sparkles className="h-5 w-5 text-delta-red" />
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

      {/* Footer (Using clean layout spacing, no top border line) */}
      <footer className="bg-delta-navy-dark text-white py-16">
        <div className="mx-auto max-w-[1280px] px-6 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
          <div>
            <h4 className="text-[12px] font-[700] uppercase tracking-wider text-white pb-3 select-none">
              Fly SkyLedger
            </h4>
            <ul className="space-y-2 text-[13px] text-white/70">
              <li><Link href="/" className="hover:text-white hover:underline">Search Flights</Link></li>
              <li><Link href="/deals" className="hover:text-white hover:underline">Curated Deals</Link></li>
              <li><Link href="/flight-status" className="hover:text-white hover:underline">Flight Status</Link></li>
              <li><Link href="/travel-info" className="hover:text-white hover:underline">Baggage & Travel Fees</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-[700] uppercase tracking-wider text-white pb-3 select-none">
              SkyMiles Loyalty
            </h4>
            <ul className="space-y-2 text-[13px] text-white/70">
              <li><Link href="/skymiles" className="hover:text-white hover:underline">About SkyMiles</Link></li>
              <li><Link href="/skymiles" className="hover:text-white hover:underline">Medallion Status Tiers</Link></li>
              <li><Link href="/user/wallet" className="hover:text-white hover:underline">SkyLedger Wallet</Link></li>
              <li><Link href="/user/dashboard" className="hover:text-white hover:underline">Member Account</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-[700] uppercase tracking-wider text-white pb-3 select-none">
              Customer Support
            </h4>
            <ul className="space-y-2 text-[13px] text-white/70">
              <li><Link href="/travel-info" className="hover:text-white hover:underline">Help Center</Link></li>
              <li><Link href="/travel-info" className="hover:text-white hover:underline">Refund Policies</Link></li>
              <li><Link href="/travel-info" className="hover:text-white hover:underline">24-Hour Cancellation</Link></li>
              <li><Link href="/travel-info" className="hover:text-white hover:underline">Flight Delay Info</Link></li>
            </ul>
          </div>
          <div>
            <h4 className="text-[12px] font-[700] uppercase tracking-wider text-white pb-3 select-none">
              Corporate Info
            </h4>
            <ul className="space-y-2 text-[13px] text-white/70">
              <li><a href="#" className="hover:text-white hover:underline">Fleet Seat Map Layouts</a></li>
              <li><a href="#" className="hover:text-white hover:underline">Partner Airlines</a></li>
              <li><a href="#" className="hover:text-white hover:underline">About Us</a></li>
            </ul>
          </div>
        </div>
        <div className="mx-auto max-w-[1280px] px-6 sm:px-8 mt-12 text-[12px] text-white/40 flex flex-wrap justify-between items-center gap-4">
          <p>© {new Date().getFullYear()} SkyLedger Airways. All rights reserved. Delta Air Lines Design Standard.</p>
          <div className="flex gap-4">
            <a href="#" className="hover:underline">Privacy Policy</a>
            <a href="#" className="hover:underline">Terms of Use</a>
          </div>
        </div>
      </footer>
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
