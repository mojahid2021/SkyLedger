"use client"

import React, { useState, useEffect, useRef } from "react"
import Link from "next/link"
import {
  Plane,
  Globe,
  MapPin,
  ArrowRight,
  Sparkles,
  Luggage,
  Headphones,
  User,
  LogOut,
  Clock,
  ShieldCheck,
  Award,
  Wallet,
  Info,
} from "lucide-react"
import { FlightSearchWidget } from "@/components/flight/flight-search-widget"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"

/**
 * Navigation links with anchors/routes for easy discovery
 */
const NAV_LINKS = [
  { label: "Book Flights", href: "#search-section" },
  { label: "Flight Status", href: "#departure-board" },
  { label: "Curated Deals", href: "#deals-section" },
  { label: "SkyMiles Benefits", href: "#loyalty-section" },
  { label: "Travel Info", href: "#policies-section" },
]

/**
 * City name resolver helper for clean UI presentation
 */
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

/**
 * Footer Column Directory
 */
const FOOTER_COLUMNS = [
  {
    title: "Fly SkyLedger",
    links: [
      { name: "Search Flights", href: "#search-section" },
      { name: "Curated Deals", href: "#deals-section" },
      { name: "Flight Status", href: "#departure-board" },
      { name: "Baggage & Travel Fees", href: "#policies-section" },
    ],
  },
  {
    title: "SkyMiles Loyalty",
    links: [
      { name: "About SkyMiles", href: "#loyalty-section" },
      { name: "Medallion Status Tiers", href: "#loyalty-section" },
      { name: "SkyLedger Wallet", href: "/user/wallet" },
      { name: "Member Account", href: "/user/dashboard" },
    ],
  },
  {
    title: "Customer Support",
    links: [
      { name: "Help Center", href: "#policies-section" },
      { name: "Refund Policies", href: "#policies-section" },
      { name: "24-Hour Cancel Option", href: "#policies-section" },
      { name: "Flight Delay Compensation", href: "#policies-section" },
    ],
  },
  {
    title: "Corporate Info",
    links: [
      { name: "Fleet Seat Map Layouts", href: "#" },
      { name: "Partner Airlines", href: "#" },
      { name: "About Us", href: "#" },
    ],
  },
]

export default function RootPage() {
  const { user, logout } = useAuth()
  const [dbDeals, setDbDeals] = useState<any[]>([])
  const [loadingDeals, setLoadingDeals] = useState(true)
  
  const [departures, setDepartures] = useState<any[]>([])
  const [loadingDepartures, setLoadingDepartures] = useState(true)

  const [activeTab, setActiveTab] = useState("Book Flights")

  // Quick-booking prefill state for search widget
  const [prefilledSearch, setPrefilledSearch] = useState<{
    origin?: string
    originCode?: string
    destination?: string
    destinationCode?: string
  }>({})

  const searchWidgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    // Fetch Deals
    fetch("/api/flights/deals")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.deals) {
          setDbDeals(data.deals)
        }
      })
      .catch((err) => console.error("Error loading deals:", err))
      .finally(() => setLoadingDeals(false))

    // Fetch departures/flight schedule
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

  const handleSelectDeal = (deal: any) => {
    setPrefilledSearch({
      origin: `${deal.origin_name} (${deal.origin_iata})`,
      originCode: deal.origin_iata,
      destination: `${deal.destination_name} (${deal.destination_iata})`,
      destinationCode: deal.destination_iata,
    })

    setActiveTab("Book Flights")

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

    setActiveTab("Book Flights")

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
          <span className="inline-flex items-center gap-1 bg-amber-50 text-amber-800 text-[11px] font-[700] px-2.5 py-0.5 rounded-full border border-amber-200">
            Delayed
          </span>
        )
      case "cancelled":
        return (
          <span className="inline-flex items-center gap-1 bg-red-50 text-red-800 text-[11px] font-[700] px-2.5 py-0.5 rounded-full border border-red-200">
            Cancelled
          </span>
        )
      case "landed":
        return (
          <span className="inline-flex items-center gap-1 bg-slate-100 text-slate-800 text-[11px] font-[700] px-2.5 py-0.5 rounded-full border border-slate-200">
            Landed
          </span>
        )
      default:
        return (
          <span className="inline-flex items-center gap-1 bg-emerald-50 text-emerald-800 text-[11px] font-[700] px-2.5 py-0.5 rounded-full border border-emerald-200">
            On Time
          </span>
        )
    }
  }

  const categories = Array.from(new Set(dbDeals.map((d: any) => d.tag)))

  return (
    <div className="min-h-screen bg-delta-canvas text-delta-ink font-sans flex flex-col selection:bg-delta-red/20 selection:text-delta-red">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & NAVIGATION                                                */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 h-14 bg-delta-navy text-white border-b border-white/10">
        <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-4 sm:px-8">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-3 group h-full">
            <div className="flex h-8 w-8 items-center justify-center bg-white text-delta-navy transition-transform duration-200 group-hover:scale-105 rounded-[4px] shadow-sm">
              <Plane className="h-4.5 w-4.5 fill-delta-navy text-delta-navy" />
            </div>
            <div className="flex flex-col">
              <span className="text-[18px] font-[700] tracking-tight leading-none text-white">SkyLedger</span>
              <span className="text-[9px] text-white/70 tracking-wider font-medium uppercase mt-0.5">Delta Design Standard</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1 h-full">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className={cn(
                  "px-3.5 py-2 text-[14px] font-[500] text-white/90 hover:text-white relative transition-colors h-full flex items-center hover:bg-white/5",
                  activeTab === link.label && "text-delta-red hover:text-delta-red font-[600]"
                )}
                onClick={() => setActiveTab(link.label)}
              >
                {link.label}
                {activeTab === link.label && (
                  <span className="absolute bottom-0 left-0 right-0 h-[2px] bg-delta-red" />
                )}
              </a>
            ))}
          </nav>

          {/* User Authentication & Language Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-[4px] px-2.5 py-1 text-[13px] text-white/80 border border-white/20">
              <Globe className="h-3.5 w-3.5" />
              <span>BDT (৳)</span>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
                  className="flex items-center gap-2 rounded-[4px] bg-white/10 px-3 py-1.5 text-[13px] font-[600] text-white hover:bg-white/20 transition-colors border border-white/20"
                >
                  <User className="h-3.5 w-3.5 text-white" />
                  <span className="hidden sm:inline">
                    {user.first_name} ({user.role === "admin" ? "Admin" : "Dashboard"})
                  </span>
                </Link>
                <button
                  type="button"
                  onClick={logout}
                  title="Log out"
                  className="rounded-[4px] p-2 text-white/80 hover:bg-delta-red hover:text-white transition-colors"
                >
                  <LogOut className="h-4.5 w-4.5" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-[4px] border border-white/70 px-4 py-1.5 text-[13px] font-[600] text-white hover:bg-white hover:text-delta-navy transition-all duration-150"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex rounded-[4px] bg-delta-red px-4 py-1.5 text-[13px] font-[700] text-white hover:bg-delta-red-hover transition-colors shadow-sm"
                >
                  Join Free
                </Link>
              </div>
            )}
          </div>
        </div>
      </header>

      {/* ========================================================================= */}
      {/* 2. HERO SECTION & FLIGHT SEARCH WIDGET                                    */}
      {/* ========================================================================= */}
      <section id="search-section" className="bg-delta-surface-1 py-16 border-b border-delta-hairline-light">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
          {/* Headline and quick highlights */}
          <div className="max-w-[780px] mb-8">
            <div className="inline-flex items-center gap-1.5 bg-delta-navy text-white px-3 py-1 text-[11px] font-[700] uppercase tracking-wider mb-4 rounded-none">
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

          {/* Quick trust metrics */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-8 border-t border-delta-hairline">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-delta-surface-2 text-delta-navy font-bold rounded-[4px] border border-delta-hairline-light">
                ✓
              </div>
              <div>
                <p className="text-[13px] font-[700] text-delta-navy">Instant E-Ticket</p>
                <p className="text-[11px] text-delta-ink-muted">Confirmed on checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-delta-surface-2 text-delta-navy font-bold rounded-[4px] border border-delta-hairline-light">
                ৳
              </div>
              <div>
                <p className="text-[13px] font-[700] text-delta-navy">Transparent Pricing</p>
                <p className="text-[11px] text-delta-ink-muted">No surprise hidden fees</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[4px] border border-delta-hairline-light">
                <Luggage className="h-5 w-5 text-delta-navy" />
              </div>
              <div>
                <p className="text-[13px] font-[700] text-delta-navy">Baggage Transparency</p>
                <p className="text-[11px] text-delta-ink-muted">Clear carry-on & check-in</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[4px] border border-delta-hairline-light">
                <Headphones className="h-5 w-5 text-delta-navy" />
              </div>
              <div>
                <p className="text-[13px] font-[700] text-delta-navy">24/7 Member Support</p>
                <p className="text-[11px] text-delta-ink-muted">Live booking assistance</p>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 3. DEPARTURE BOARD & FARE MATRIX                                          */}
      {/* ========================================================================= */}
      <section id="departure-board" className="bg-delta-canvas py-16 border-b border-delta-hairline-light">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
          <div className="border-b border-delta-hairline pb-4 mb-6">
            <p className="text-[12px] font-[700] uppercase tracking-wider text-delta-navy-mid flex items-center gap-1.5">
              <Clock className="h-3.5 w-3.5" />
              Airport Boarding Monitor
            </p>
            <h2 className="text-[24px] sm:text-[32px] font-[700] leading-tight text-delta-navy mt-1">
              Today&apos;s Departures & Featured Fares
            </h2>
            <p className="text-[14px] text-delta-ink-muted mt-2 max-w-[640px]">
              Active scheduled flights departures. Select a route below to instantly prefill the booking widget above.
            </p>
          </div>

          {loadingDepartures ? (
            <div className="flex h-48 items-center justify-center text-[14px] font-[600] text-delta-ink-muted animate-pulse">
              Fetching active scheduled departures...
            </div>
          ) : departures.length === 0 ? (
            <div className="rounded-[4px] border border-delta-hairline bg-delta-surface-1 p-8 text-center text-delta-ink-muted text-xs font-[700] uppercase tracking-wider">
              No flights currently scheduled for departure.
            </div>
          ) : (
            <div className="overflow-x-auto border border-delta-hairline rounded-[4px]">
              <table className="w-full text-left border-collapse">
                <thead>
                  <tr className="bg-delta-surface-1 border-b border-delta-hairline text-delta-navy text-[13px] font-[700]">
                    <th className="px-4 py-3.5">Route</th>
                    <th className="px-4 py-3.5">Flight No</th>
                    <th className="px-4 py-3.5">Departure Date</th>
                    <th className="px-4 py-3.5">Departure Time</th>
                    <th className="px-4 py-3.5">Cabin Class</th>
                    <th className="px-4 py-3.5 text-right">Fares From</th>
                    <th className="px-4 py-3.5 text-center">Status</th>
                    <th className="px-4 py-3.5 text-right">Action</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-delta-hairline-light text-[14px] text-delta-ink">
                  {departures.map((item, idx) => {
                    const routeStr = `${getCityFromAirport(item.origin_name, item.origin_iata)} (${item.origin_iata}) → ${getCityFromAirport(item.destination_name, item.destination_iata)} (${item.destination_iata})`
                    const cabinClass = item.flight_type === "direct" ? "Main Cabin" : "Connecting"
                    return (
                      <tr key={item.id || idx} className="hover:bg-delta-surface-2 transition-colors">
                        <td className="px-4 py-4 font-[600] text-delta-navy">
                          {routeStr}
                        </td>
                        <td className="px-4 py-4 font-mono text-[13px] text-delta-ink-muted">
                          {item.flight_number}
                        </td>
                        <td className="px-4 py-4 font-medium">
                          {formatDate(item.departure_time)}
                        </td>
                        <td className="px-4 py-4">
                          {formatTime(item.departure_time)}
                        </td>
                        <td className="px-4 py-4 text-delta-ink-muted">
                          {cabinClass}
                        </td>
                        <td className="px-4 py-4 text-right font-[700] text-delta-red text-[16px]">
                          ৳{Number(item.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}
                        </td>
                        <td className="px-4 py-4 text-center">
                          {getStatusBadge(item.status)}
                        </td>
                        <td className="px-4 py-4 text-right">
                          <button
                            type="button"
                            onClick={() => handleSelectRoute(item)}
                            className="bg-delta-navy hover:bg-delta-navy-mid text-white text-[12px] font-[700] px-3.5 py-1.5 rounded-[4px] shadow-sm transition-colors cursor-pointer"
                          >
                            Book Route
                          </button>
                        </td>
                      </tr>
                    )
                  })}
                </tbody>
              </table>
            </div>
          )}
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 4. CURATED DEALS & FLIGHT OFFERS                                          */}
      {/* ========================================================================= */}
      <section id="deals-section" className="bg-delta-surface-1 py-16 border-b border-delta-hairline-light">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-delta-hairline pb-4 gap-4">
            <div>
              <p className="text-[12px] font-[700] uppercase tracking-wider text-delta-red flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Featured Travel Offers
              </p>
              <h2 className="text-[24px] sm:text-[32px] font-[700] leading-tight text-delta-navy mt-1">
                Today&apos;s Curated Deals
              </h2>
            </div>
            <p className="text-[14px] text-delta-ink-muted max-w-[420px]">
              Special promotional airfares for popular domestic and international flight routes.
            </p>
          </div>

          {loadingDeals ? (
            <div className="flex h-48 items-center justify-center text-[14px] font-[600] text-delta-ink-muted animate-pulse">
              Fetching available promotional deals...
            </div>
          ) : dbDeals.length === 0 ? (
            <div className="mt-8 rounded-[4px] border border-delta-hairline bg-delta-canvas p-8 text-center text-delta-ink-muted text-xs font-[700] uppercase tracking-wider">
              No promotional deals currently featured. Check back soon!
            </div>
          ) : (
            <div className="space-y-12 mt-8">
              {categories.map((category) => {
                const categoryDeals = dbDeals.filter((deal) => deal.tag === category)
                return (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-delta-hairline pb-2">
                      <span className="h-2.5 w-2.5 rounded-full bg-delta-red" />
                      <h3 className="text-[14px] font-[700] uppercase tracking-wider text-delta-navy">
                        {category} Flights & Escapes
                      </h3>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-3 gap-5">
                      {categoryDeals.map((deal) => {
                        const destCity = getCityFromAirport(deal.destination_name, deal.destination_iata)
                        const origCity = getCityFromAirport(deal.origin_name, deal.origin_iata)
                        const routeStr = `${deal.origin_iata} → ${deal.destination_iata}`
                        const fareStr = `৳${Number(deal.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                        const tripTypeStr = deal.flight_type === "direct" ? "One-way Direct" : "Round Trip / Connecting"

                        return (
                          <div
                            key={deal.flight_id}
                            className="group rounded-[4px] border border-delta-hairline bg-delta-canvas p-5 hover:border-delta-navy transition-all duration-200 flex flex-col justify-between"
                          >
                            <div>
                              <div className="flex items-center justify-between">
                                <span className="rounded-full bg-delta-surface-2 px-2.5 py-0.5 text-[11px] font-[700] uppercase tracking-wide text-delta-navy">
                                  {deal.tag}
                                </span>
                                <span className="flex items-center gap-1 font-mono text-[12px] font-[700] text-delta-navy bg-delta-surface-1 px-2.5 py-0.5 rounded border border-delta-hairline-light">
                                  <MapPin className="h-3 w-3 text-delta-red" />
                                  {routeStr}
                                </span>
                              </div>

                              <h4 className="mt-4 text-[24px] font-[700] text-delta-navy group-hover:text-delta-red transition-colors">
                                {destCity}
                              </h4>
                              <p className="mt-1 text-[13px] text-delta-ink-muted">
                                {tripTypeStr} from <span className="font-semibold text-delta-ink">{origCity}</span>
                              </p>
                            </div>

                            <div className="mt-6 flex items-end justify-between border-t border-delta-hairline-light pt-4">
                              <div>
                                <span className="text-[11px] font-medium uppercase tracking-wide text-delta-ink-muted">
                                  Fares from
                                </span>
                                <div className="text-[24px] font-[700] leading-none text-delta-red mt-0.5">
                                  {fareStr}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleSelectDeal(deal)}
                                className="rounded-[4px] bg-delta-navy hover:bg-delta-navy-mid px-4 py-2 text-[13px] font-[700] text-white transition-colors inline-flex items-center gap-1.5 shadow-sm cursor-pointer"
                              >
                                <span>Book Route</span>
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
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 5. SKYMILES MEDALLION LOYALTY                                             */}
      {/* ========================================================================= */}
      <section id="loyalty-section" className="bg-delta-canvas py-16 border-b border-delta-hairline-light">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
          <div className="border-b border-delta-hairline pb-4 mb-8">
            <p className="text-[12px] font-[700] uppercase tracking-wider text-delta-red flex items-center gap-1.5">
              <Award className="h-3.5 w-3.5" />
              Exclusive SkyMiles® Benefits
            </p>
            <h2 className="text-[24px] sm:text-[32px] font-[700] leading-tight text-delta-navy mt-1">
              Medallion® Status Tiers
            </h2>
            <p className="text-[14px] text-delta-ink-muted mt-2 max-w-[640px]">
              Earn miles on every booking and unlock elite travel privileges across our global airline network.
            </p>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Silver Medallion */}
            <div className="border border-delta-hairline bg-delta-canvas p-6 rounded-[4px] hover:border-delta-navy transition-colors flex flex-col justify-between">
              <div>
                <div className="inline-flex bg-slate-100 text-delta-navy border border-slate-200 text-[12px] font-[700] uppercase tracking-wider px-3 py-1 rounded-full">
                  Silver Medallion
                </div>
                <h4 className="mt-4 text-[18px] font-[700] text-delta-navy">
                  Essential Privileges
                </h4>
                <ul className="mt-4 space-y-2.5 text-[13px] text-delta-ink-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span><strong>7x Miles</strong> earned per BDT spent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span>Free First Checked Bag</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span>Priority Boarding (Zone 4)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span>Complimentary Cabin Upgrades</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-delta-hairline-light">
                <span className="text-[12px] text-delta-navy font-[600]">Requires 25,000 MQDs</span>
              </div>
            </div>

            {/* Gold Medallion */}
            <div className="border border-delta-hairline bg-delta-canvas p-6 rounded-[4px] hover:border-delta-navy transition-colors flex flex-col justify-between">
              <div>
                <div className="inline-flex bg-amber-100 text-amber-900 border border-amber-300 text-[12px] font-[700] uppercase tracking-wider px-3 py-1 rounded-full">
                  Gold Medallion
                </div>
                <h4 className="mt-4 text-[18px] font-[700] text-delta-navy">
                  Enhanced Travel Comfort
                </h4>
                <ul className="mt-4 space-y-2.5 text-[13px] text-delta-ink-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span><strong>8x Miles</strong> earned per BDT spent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span>Waived Baggage Fees</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span>Priority Boarding (Zone 3)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span>SkyTeam Elite Plus Status</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-delta-hairline-light">
                <span className="text-[12px] text-delta-navy font-[600]">Requires 50,000 MQDs</span>
              </div>
            </div>

            {/* Platinum Medallion */}
            <div className="border border-delta-hairline bg-delta-canvas p-6 rounded-[4px] hover:border-delta-navy transition-colors flex flex-col justify-between">
              <div>
                <div className="inline-flex bg-delta-navy-mid/10 text-delta-navy-mid border border-delta-navy-mid/30 text-[12px] font-[700] uppercase tracking-wider px-3 py-1 rounded-full">
                  Platinum Medallion
                </div>
                <h4 className="mt-4 text-[18px] font-[700] text-delta-navy">
                  Premium Privileges
                </h4>
                <ul className="mt-4 space-y-2.5 text-[13px] text-delta-ink-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span><strong>9x Miles</strong> earned per BDT spent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span>Annual Choice Benefits selection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span>Priority Boarding (Zone 2)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span>Regional Upgrade Certificates</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-delta-hairline-light">
                <span className="text-[12px] text-delta-navy font-[600]">Requires 75,000 MQDs</span>
              </div>
            </div>

            {/* Diamond Medallion */}
            <div className="border border-delta-hairline bg-delta-canvas p-6 rounded-[4px] hover:border-delta-navy transition-colors flex flex-col justify-between">
              <div>
                <div className="inline-flex bg-delta-navy-dark text-white border border-delta-navy-dark text-[12px] font-[700] uppercase tracking-wider px-3 py-1 rounded-full">
                  Diamond Medallion
                </div>
                <h4 className="mt-4 text-[18px] font-[700] text-delta-navy">
                  Elite Global Luxury
                </h4>
                <ul className="mt-4 space-y-2.5 text-[13px] text-delta-ink-muted">
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span><strong>11x Miles</strong> earned per BDT spent</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span>Immediate complimentary upgrades</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span>Priority Boarding (Zone 1)</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="text-delta-navy font-bold">•</span>
                    <span>Global Upgrade Certificates</span>
                  </li>
                </ul>
              </div>
              <div className="mt-6 pt-4 border-t border-delta-hairline-light">
                <span className="text-[12px] text-delta-navy font-[600]">Requires 125,000 MQDs</span>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 6. TRAVEL INFO & BAGGAGE POLICIES                                         */}
      {/* ========================================================================= */}
      <section id="policies-section" className="bg-delta-surface-1 py-16 border-b border-delta-hairline-light">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
          <div className="border-b border-delta-hairline pb-4 mb-8">
            <p className="text-[12px] font-[700] uppercase tracking-wider text-delta-navy-mid flex items-center gap-1.5">
              <Info className="h-3.5 w-3.5" />
              Essential Travel Policies
            </p>
            <h2 className="text-[24px] sm:text-[32px] font-[700] leading-tight text-delta-navy mt-1">
              Baggage, Changes & Support Info
            </h2>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            {/* Baggage */}
            <div className="border border-delta-hairline bg-delta-canvas p-6 rounded-[4px]">
              <div className="flex h-12 w-12 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[4px] mb-4">
                <Luggage className="h-6 w-6 text-delta-navy" />
              </div>
              <h4 className="text-[18px] font-[700] text-delta-navy">
                Flexible Baggage Allowances
              </h4>
              <p className="mt-2 text-[14px] text-delta-ink-muted leading-[20px]">
                Enjoy transparent baggage rules. A 7kg Cabin bag is included with all fares. Standard checked baggage weight limits are explicitly displayed before checkout.
              </p>
            </div>

            {/* Cancel/Change */}
            <div className="border border-delta-hairline bg-delta-canvas p-6 rounded-[4px]">
              <div className="flex h-12 w-12 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[4px] mb-4">
                <ShieldCheck className="h-6 w-6 text-delta-navy" />
              </div>
              <h4 className="text-[18px] font-[700] text-delta-navy">
                24-Hour Risk-Free Cancellation
              </h4>
              <p className="mt-2 text-[14px] text-delta-ink-muted leading-[20px]">
                Cancel any flight reservation within 24 hours of booking for a full refund back to your payment method. Zero change fees apply to Main Cabin tickets or higher.
              </p>
            </div>

            {/* Wallet */}
            <div className="border border-delta-hairline bg-delta-canvas p-6 rounded-[4px]">
              <div className="flex h-12 w-12 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[4px] mb-4">
                <Wallet className="h-6 w-6 text-delta-navy" />
              </div>
              <h4 className="text-[18px] font-[700] text-delta-navy">
                SkyLedger Digital Wallet
              </h4>
              <p className="mt-2 text-[14px] text-delta-ink-muted leading-[20px]">
                Store flight credits, accumulated loyalty rewards, and compensation vouchers directly in your personal secure wallet. Redeemable instantly with no blackout dates.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ========================================================================= */}
      {/* 7. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="bg-delta-navy-dark text-white border-t border-white/10 mt-auto">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-[12px] font-[700] uppercase tracking-wider text-white border-b border-white/10 pb-2">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link.name}>
                      <a
                        href={link.href}
                        className="text-[13px] leading-[20px] text-white/70 hover:text-white transition-colors"
                      >
                        {link.name}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/10 pt-8">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-white text-delta-navy">
                <Plane className="h-4 w-4 fill-delta-navy text-delta-navy" />
              </div>
              <span className="text-[16px] font-[700] tracking-tight">SkyLedger Airlines</span>
            </div>
            <p className="text-[12px] text-white/60">
              © {new Date().getFullYear()} SkyLedger Airlines, Inc. All rights reserved. Built in partnership with Delta Design Standards.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}
