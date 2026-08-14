"use client"

import React, { useState, useEffect } from "react"
import Link from "next/link"
import {
  Plane,
  Globe,
  ChevronDown,
  MapPin,
  Clock,
  ShieldCheck,
  CreditCard,
  Wifi,
  CheckCircle2,
  ArrowRight,
} from "lucide-react"
import { FlightSearchWidget } from "@/components/flight/flight-search-widget"
import { cn } from "@/lib/utils"

const NAV_LINKS = ["Book", "Check-in", "My Trips", "Travel Info", "Loyalty"]

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
  }
  if (mappings[iata]) return mappings[iata]
  let clean = name.replace(/(International|Airport|Regional|Intercontinental|Municipal|Field|Aero)/gi, "").trim()
  if (clean.includes(",")) {
    clean = clean.split(",")[0].trim()
  }
  return clean || name
}

const BENEFITS = [
  {
    icon: ShieldCheck,
    title: "Book with confidence",
    body: "Flexible change policies and free cancellation on most Main Cabin fares.",
  },
  {
    icon: Clock,
    title: "On-time, every time",
    body: "Industry-leading operational reliability backed by a global route network.",
  },
  {
    icon: Wifi,
    title: "Connected in the sky",
    body: "Complimentary in-flight messaging and fast Wi-Fi on select aircraft.",
  },
  {
    icon: CreditCard,
    title: "Earn every mile",
    body: "SkyMiles members earn on every dollar, every trip, with no blackout dates.",
  },
]

const MEDALLION_TIERS = [
  { tier: "Silver", miles: "25,000 MQMs", fill: "bg-delta-surface-2", text: "text-delta-navy", border: "border-delta-hairline" },
  { tier: "Gold", miles: "50,000 MQMs", fill: "bg-amber-600", text: "text-white", border: "border-amber-700" },
  { tier: "Platinum", miles: "75,000 MQMs", fill: "bg-delta-navy-mid", text: "text-white", border: "border-delta-navy" },
  { tier: "Diamond", miles: "125,000 MQMs", fill: "bg-delta-navy-dark", text: "text-white", border: "border-delta-navy-dark" },
]

const FOOTER_COLUMNS = [
  { title: "Book", links: ["Search flights", "Round trip", "One way", "Vacation packages", "Hotels & cars"] },
  { title: "SkyMiles", links: ["Join SkyMiles", "Medallion status", "Mileage calculator", "SkyMiles credit cards", "Shop with miles"] },
  { title: "Help & Support", links: ["Customer service", "Manage booking", "Baggage info", "Travel alerts", "Contact us"] },
  { title: "About", links: ["Our story", "Newsroom", "Investor relations", "Careers", "Sustainability"] },
]

export default function RootPage() {
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

  const categories = Array.from(new Set(dbDeals.map((d: any) => d.tag)))
  return (
    <div className="min-h-screen bg-delta-canvas text-delta-ink font-delta">
      {/* ===== Top Nav — navy #003366, 56px, no radius ===== */}
      <header className="bg-delta-navy text-white">
        <div className="mx-auto flex h-14 max-w-[1280px] items-center justify-between px-4 sm:px-8">
          {/* Left: wordmark + globe */}
          <div className="flex items-center gap-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-full bg-white text-delta-navy">
              <Plane className="h-4 w-4" />
            </div>
            <span className="text-[20px] font-[700] tracking-tight">SkyLedger</span>
          </div>

          {/* Center: nav links */}
          <nav className="hidden md:flex items-center gap-1">
            {NAV_LINKS.map((link) => (
              <a
                key={link}
                href="#"
                className="rounded-[4px] px-3 py-2 text-[14px] text-white/90 hover:bg-white/10 hover:text-white transition-colors"
              >
                {link}
              </a>
            ))}
          </nav>

          {/* Right: language + sign in */}
          <div className="flex items-center gap-3">
            <button
              type="button"
              className="flex items-center gap-1.5 rounded-[4px] px-2 py-2 text-[14px] text-white/90 hover:bg-white/10 hover:text-white transition-colors"
            >
              <Globe className="h-4 w-4" />
              <span className="hidden sm:inline">EN</span>
              <ChevronDown className="h-3.5 w-3.5" />
            </button>
            <Link
              href="/login"
              className="rounded-[4px] border border-white/70 px-4 py-2 text-[14px] font-[500] text-white hover:bg-white hover:text-delta-navy transition-colors"
            >
              Sign in
            </Link>
          </div>
        </div>
      </header>

      {/* ===== Hero — white canvas, navy headline, search widget ===== */}
      <section className="bg-delta-surface-1">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-14 sm:py-20">
          <div className="max-w-[720px]">
            <h1 className="text-[36px] sm:text-[48px] font-[700] leading-[44px] sm:leading-[56px] tracking-[-0.5px] text-delta-navy">
              Find your next flight
            </h1>
            <p className="mt-4 text-[18px] leading-[28px] text-delta-ink-muted">
              Search hundreds of destinations across our global network. Transparent
              fares, no blackout dates, and flexibility built into every booking.
            </p>
          </div>

          {/* Search widget — the page's primary interactive surface */}
          <div className="mt-8">
            <FlightSearchWidget />
          </div>
        </div>
      </section>

      {/* ===== Deals — deal cards, hairline borders, red price tags ===== */}
      <section className="bg-delta-canvas">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-14 sm:py-20">
          <div className="border-b border-delta-hairline pb-4">
            <p className="text-[11px] font-[600] uppercase tracking-wider text-delta-red">
              Flight Offers
            </p>
            <h2 className="text-[24px] font-[700] leading-[32px] text-delta-navy">
              Today&apos;s deals
            </h2>
          </div>

          {loading ? (
            <div className="flex h-48 items-center justify-center text-xs text-delta-ink-muted">
              Loading featured deals...
            </div>
          ) : dbDeals.length === 0 ? (
            <div className="mt-6 rounded-[4px] border border-delta-hairline bg-delta-surface-1 p-8 text-center text-delta-ink-muted text-xs font-bold uppercase tracking-wider">
              No deals currently featured.
            </div>
          ) : (
            <div className="space-y-12 mt-8">
              {categories.map((category) => {
                const categoryDeals = dbDeals.filter((deal) => deal.tag === category)
                return (
                  <div key={category} className="space-y-4">
                    <div className="flex items-center gap-2 border-b border-delta-hairline pb-2">
                      <span className="h-2 w-2 rounded-full bg-delta-red" />
                      <h3 className="text-[16px] font-[700] uppercase tracking-wider text-delta-navy">
                        {category} Deals
                      </h3>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                      {categoryDeals.map((deal) => {
                        const destCity = getCityFromAirport(deal.destination_name, deal.destination_iata)
                        const origCity = getCityFromAirport(deal.origin_name, deal.origin_iata)
                        const routeStr = `${deal.origin_iata} → ${deal.destination_iata}`
                        const fareStr = `৳${Number(deal.price).toLocaleString("en-US", { maximumFractionDigits: 0 })}`
                        const tripTypeStr = deal.flight_type === "direct" ? "One-way" : "Round trip"

                        return (
                          <div
                            key={deal.flight_id}
                            className="rounded-[4px] border border-delta-hairline bg-delta-canvas p-4 shadow-xs hover:border-delta-navy/30 transition-all duration-200"
                          >
                            <div className="flex items-center justify-between">
                              <span className="text-[12px] font-[500] uppercase tracking-wide text-delta-ink-muted">
                                {deal.tag}
                              </span>
                              <span className="flex items-center gap-1 rounded-full bg-delta-surface-1 px-2.5 py-0.5 text-[12px] text-delta-navy">
                                <MapPin className="h-3 w-3" />
                                {routeStr}
                              </span>
                            </div>
                            <h3 className="mt-3 text-[24px] font-[700] leading-[32px] text-delta-navy">
                              {destCity}
                            </h3>
                            <p className="mt-1 text-[13px] text-delta-ink-muted">
                              {tripTypeStr} from {origCity}
                            </p>
                            <div className="mt-4 flex items-center justify-between border-t border-delta-hairline-light pt-4">
                              <div>
                                <span className="text-[12px] text-delta-ink-muted">Fare from</span>
                                <div className="text-[24px] font-[700] leading-[32px] text-delta-red">
                                  {fareStr}
                                </div>
                              </div>
                              <Link
                                href={`/booking?offerId=${deal.flight_id}`}
                                className="rounded-[4px] border border-delta-navy px-4 py-2 text-[14px] font-[700] text-delta-navy hover:bg-delta-surface-1 transition-colors inline-block"
                              >
                                Book now
                              </Link>
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

      {/* ===== Benefits — 4-column grid, hairline dividers ===== */}
      <section className="bg-delta-surface-1">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-14 sm:py-20">
          <h2 className="text-[24px] font-[700] leading-[32px] text-delta-navy">
            Why fly SkyLedger
          </h2>
          <div className="mt-6 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            {BENEFITS.map((b) => {
              const Icon = b.icon
              return (
                <div
                  key={b.title}
                  className="rounded-[4px] border border-delta-hairline bg-delta-canvas p-6"
                >
                  <div className="flex h-10 w-10 items-center justify-center rounded-[4px] bg-delta-surface-2 text-delta-navy">
                    <Icon className="h-5 w-5" />
                  </div>
                  <h3 className="mt-4 text-[16px] font-[700] leading-[24px] text-delta-navy">
                    {b.title}
                  </h3>
                  <p className="mt-2 text-[14px] leading-[20px] text-delta-ink-muted">
                    {b.body}
                  </p>
                </div>
              )
            })}
          </div>
        </div>
      </section>

      {/* ===== SkyMiles — medallion status badges ===== */}
      <section className="bg-delta-canvas">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-14 sm:py-20">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-10 items-center">
            <div>
              <h2 className="text-[36px] font-[700] leading-[44px] tracking-[-0.3px] text-delta-navy">
                SkyMiles. The loyalty program built on you.
              </h2>
              <p className="mt-4 text-[16px] leading-[24px] text-delta-ink-muted">
                Earn miles on every flight and reach Medallion status for priority
                boarding, complimentary upgrades, and exclusive member fares.
              </p>
              <button
                type="button"
                className="mt-6 flex items-center gap-2 rounded-[4px] bg-delta-red px-6 py-3 text-[16px] font-[700] text-white hover:bg-delta-red-hover transition-colors"
              >
                Join SkyMiles
                <ArrowRight className="h-4 w-4" />
              </button>
            </div>

            {/* Medallion tiers */}
            <div className="rounded-[4px] border border-delta-hairline bg-delta-surface-1 p-6">
              <h3 className="text-[18px] font-[700] leading-[26px] text-delta-navy">
                Medallion status tiers
              </h3>
              <div className="mt-4 grid grid-cols-2 gap-3">
                {MEDALLION_TIERS.map((m) => (
                  <div
                    key={m.tier}
                    className={`rounded-[4px] border ${m.border} ${m.fill} p-4`}
                  >
                    <span
                      className={`inline-flex items-center rounded-full px-3 py-1 text-[12px] font-[500] ${m.fill} ${m.text}`}
                    >
                      {m.tier}
                    </span>
                    <p className={`mt-2 text-[12px] ${m.text}`}>{m.miles}</p>
                  </div>
                ))}
              </div>
              <p className="mt-4 flex items-start gap-2 text-[12px] leading-[16px] text-delta-ink-muted">
                <CheckCircle2 className="mt-0.5 h-3.5 w-3.5 shrink-0 text-delta-success" />
                Status is earned by flying. No credit card spend required.
              </p>
            </div>
          </div>
        </div>
      </section>

      {/* ===== Footer — navy-dark #001e3d ===== */}
      <footer className="bg-delta-navy-dark text-white">
        <div className="mx-auto max-w-[1280px] px-4 sm:px-8 py-12 sm:py-16">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
            {FOOTER_COLUMNS.map((col) => (
              <div key={col.title}>
                <h4 className="text-[14px] font-[700] uppercase tracking-wide text-white">
                  {col.title}
                </h4>
                <ul className="mt-4 space-y-2.5">
                  {col.links.map((link) => (
                    <li key={link}>
                      <a
                        href="#"
                        className="text-[14px] leading-[20px] text-white/70 hover:text-white transition-colors"
                      >
                        {link}
                      </a>
                    </li>
                  ))}
                </ul>
              </div>
            ))}
          </div>

          <div className="mt-12 flex flex-col sm:flex-row items-center justify-between gap-4 border-t border-white/15 pt-6">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-full bg-white text-delta-navy">
                <Plane className="h-3.5 w-3.5" />
              </div>
              <span className="text-[16px] font-[700]">SkyLedger</span>
            </div>
            <p className="text-[12px] text-white/60">
              © 2026 SkyLedger Airlines. All rights reserved.
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

