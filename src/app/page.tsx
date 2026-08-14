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
} from "lucide-react"
import { FlightSearchWidget } from "@/components/flight/flight-search-widget"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"

/**
 * Navigation links with anchors/routes for easy discovery
 */
const NAV_LINKS = [
  { label: "Book Flights", href: "#search-section" },
  { label: "Curated Deals", href: "#deals-section" },
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
    title: "Flight Services",
    links: [
      { name: "Search Flights", href: "#search-section" },
      { name: "Curated Deals", href: "#deals-section" },
      { name: "SkyLedger Wallet", href: "/user/wallet" },
    ],
  },
  {
    title: "Member Accounts",
    links: [
      { name: "Sign In", href: "/login" },
      { name: "Register", href: "/register" },
      { name: "Dashboard", href: "/user/dashboard" },
    ],
  },
]

export default function RootPage() {
  const { user, logout } = useAuth()
  const [dbDeals, setDbDeals] = useState<any[]>([])
  const [loadingDeals, setLoadingDeals] = useState(true)

  // Quick-booking prefill state for search widget
  const [prefilledSearch, setPrefilledSearch] = useState<{
    origin?: string
    originCode?: string
    destination?: string
    destinationCode?: string
  }>({})

  const searchWidgetRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    fetch("/api/flights/deals")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && data.deals) {
          setDbDeals(data.deals)
        }
      })
      .catch((err) => console.error("Error loading deals:", err))
      .finally(() => setLoadingDeals(false))
  }, [])

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

  const categories = Array.from(new Set(dbDeals.map((d: any) => d.tag)))

  return (
    <div className="min-h-screen bg-delta-canvas text-delta-ink font-delta flex flex-col selection:bg-delta-red/20 selection:text-delta-red">
      {/* ========================================================================= */}
      {/* 1. TOP HEADER & NAVIGATION                                                */}
      {/* ========================================================================= */}
      <header className="sticky top-0 z-50 bg-delta-navy text-white shadow-md">
        <div className="mx-auto flex h-16 max-w-[1280px] items-center justify-between px-4 sm:px-8">
          {/* Logo & Brand Identity */}
          <Link href="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-[6px] bg-white text-delta-navy transition-transform duration-200 group-hover:scale-105 shadow-sm">
              <Plane className="h-5 w-5 fill-delta-navy" />
            </div>
            <div className="flex flex-col">
              <span className="text-[20px] font-[800] tracking-tight leading-none text-white">SkyLedger</span>
              <span className="text-[10px] text-white/70 tracking-wider font-semibold uppercase">Airlines & Booking</span>
            </div>
          </Link>

          {/* Desktop Navigation Links */}
          <nav className="hidden lg:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link.label}
                href={link.href}
                className="rounded-[4px] px-3.5 py-2 text-[14px] font-[500] text-white/90 hover:bg-white/10 hover:text-white transition-colors"
              >
                {link.label}
              </a>
            ))}
          </nav>

          {/* User Authentication & Language Actions */}
          <div className="flex items-center gap-3">
            <div className="hidden sm:flex items-center gap-1.5 rounded-[4px] px-2 py-1.5 text-[13px] text-white/80 border border-white/20">
              <Globe className="h-4 w-4" />
              <span>BDT (৳)</span>
            </div>

            {user ? (
              <div className="flex items-center gap-2">
                <Link
                  href={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
                  className="flex items-center gap-2 rounded-[4px] bg-white/15 px-3 py-1.5 text-[14px] font-[600] text-white hover:bg-white/25 transition-colors border border-white/30"
                >
                  <User className="h-4 w-4 text-white" />
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
                  <LogOut className="h-4 w-4" />
                </button>
              </div>
            ) : (
              <div className="flex items-center gap-2">
                <Link
                  href="/login"
                  className="rounded-[4px] border border-white/70 px-4 py-1.5 text-[14px] font-[600] text-white hover:bg-white hover:text-delta-navy transition-all duration-150"
                >
                  Sign in
                </Link>
                <Link
                  href="/register"
                  className="hidden sm:inline-flex rounded-[4px] bg-delta-red px-4 py-1.5 text-[14px] font-[700] text-white hover:bg-delta-red-hover transition-colors shadow-sm"
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
      <section id="search-section" className="relative bg-gradient-to-b from-delta-surface-1 to-delta-canvas pt-12 pb-16 sm:pt-16 sm:pb-24 border-b border-delta-hairline-light">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
          {/* Headline and quick highlights */}
          <div className="max-w-[780px]">
            <div className="inline-flex items-center gap-2 rounded-full bg-delta-navy/10 px-3.5 py-1 text-[12px] font-[700] text-delta-navy uppercase tracking-wider mb-4 border border-delta-navy/20">
              <Sparkles className="h-3.5 w-3.5 text-delta-red" />
              <span>Next-Gen Flight Booking Experience</span>
            </div>
            <h1 className="text-[34px] sm:text-[48px] lg:text-[54px] font-[800] leading-[40px] sm:leading-[54px] lg:leading-[60px] tracking-[-0.02em] text-delta-navy">
              Fly wherever you desire with effortless ease.
            </h1>
            <p className="mt-4 text-[16px] sm:text-[18px] leading-[26px] sm:leading-[28px] text-delta-ink-muted font-[450]">
              Explore hundreds of direct and connected routes across our global fleet. Real-time seat layouts,
              transparent fares in Bangladeshi Taka (৳), and zero booking blackout dates.
            </p>
          </div>

          {/* Search widget wrapper */}
          <div ref={searchWidgetRef} className="mt-8 sm:mt-10">
            <FlightSearchWidget
              initialOrigin={prefilledSearch.origin}
              initialOriginCode={prefilledSearch.originCode}
              initialDestination={prefilledSearch.destination}
              initialDestinationCode={prefilledSearch.destinationCode}
            />
          </div>

          {/* Quick trust metrics */}
          <div className="mt-8 grid grid-cols-2 sm:grid-cols-4 gap-4 pt-6 border-t border-delta-hairline-light">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-delta-surface-2 text-delta-navy font-bold">
                ✓
              </div>
              <div>
                <p className="text-[13px] font-[700] text-delta-navy">Instant E-Ticket</p>
                <p className="text-[11px] text-delta-ink-muted">Confirmed on checkout</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-delta-surface-2 text-delta-navy font-bold">
                ৳
              </div>
              <div>
                <p className="text-[13px] font-[700] text-delta-navy">Transparent Pricing</p>
                <p className="text-[11px] text-delta-ink-muted">No surprise hidden fees</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-delta-surface-2 text-delta-navy font-bold">
                <Luggage className="h-5 w-5 text-delta-navy" />
              </div>
              <div>
                <p className="text-[13px] font-[700] text-delta-navy">Baggage Transparency</p>
                <p className="text-[11px] text-delta-ink-muted">Clear carry-on & check-in</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-[6px] bg-delta-surface-2 text-delta-navy font-bold">
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
      {/* 3. FEATURED DEALS & FLIGHT OFFERS                                         */}
      {/* ========================================================================= */}
      <section id="deals-section" className="bg-delta-canvas py-16 sm:py-20 border-b border-delta-hairline-light">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8">
          <div className="flex flex-col sm:flex-row sm:items-end justify-between border-b border-delta-hairline pb-4 gap-4">
            <div>
              <p className="text-[12px] font-[700] uppercase tracking-wider text-delta-red flex items-center gap-1.5">
                <Sparkles className="h-3.5 w-3.5" />
                Featured Travel Offers
              </p>
              <h2 className="text-[26px] sm:text-[32px] font-[800] leading-tight text-delta-navy mt-1">
                Today&apos;s Curated Deals
              </h2>
            </div>
            <p className="text-[13px] text-delta-ink-muted max-w-[420px]">
              Special promotional airfares for popular domestic and international flight routes.
            </p>
          </div>

          {loadingDeals ? (
            <div className="flex h-48 items-center justify-center text-sm font-semibold text-delta-ink-muted animate-pulse">
              Fetching available promotional deals...
            </div>
          ) : dbDeals.length === 0 ? (
            <div className="mt-8 rounded-[6px] border border-delta-hairline bg-delta-surface-1 p-8 text-center text-delta-ink-muted text-xs font-bold uppercase tracking-wider">
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
                      <h3 className="text-[16px] font-[800] uppercase tracking-wider text-delta-navy">
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
                            className="group rounded-[8px] border border-delta-hairline bg-delta-canvas p-5 shadow-xs hover:border-delta-navy hover:shadow-md transition-all duration-200 flex flex-col justify-between"
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

                              <h4 className="mt-4 text-[24px] font-[800] text-delta-navy group-hover:text-delta-red transition-colors">
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
                                <div className="text-[24px] font-[800] leading-none text-delta-red mt-0.5">
                                  {fareStr}
                                </div>
                              </div>

                              <button
                                type="button"
                                onClick={() => handleSelectDeal(deal)}
                                className="rounded-[4px] bg-delta-navy px-4 py-2 text-[13px] font-[700] text-white hover:bg-delta-navy-mid transition-colors inline-flex items-center gap-1.5 shadow-sm"
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
      {/* 7. FOOTER                                                                 */}
      {/* ========================================================================= */}
      <footer className="bg-delta-navy-dark text-white mt-auto">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-[13px] font-[700] uppercase tracking-wider text-white border-b border-white/10 pb-2">
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

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/15 pt-6">
            <div className="flex items-center gap-2.5">
              <div className="flex h-7 w-7 items-center justify-center rounded-[4px] bg-white text-delta-navy">
                <Plane className="h-4 w-4 fill-delta-navy" />
              </div>
              <span className="text-[16px] font-[800] tracking-tight">SkyLedger Airlines</span>
            </div>
            <p className="text-[12px] text-white/60">
              © {new Date().getFullYear()} SkyLedger Airlines, Inc. All rights reserved. Transparent Fare System.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

