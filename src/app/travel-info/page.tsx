"use client"

import React from "react"
import { Info, Luggage, ShieldCheck, Wallet, RefreshCw } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function TravelInfoPage() {
  return (
    <div className="min-h-screen bg-delta-surface-1 text-delta-ink font-delta flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1280px] px-6 sm:px-8 py-10 flex flex-col gap-8">
        {/* Header Block with Hero Banner */}
        <div 
          className="relative rounded-[8px] overflow-hidden bg-cover bg-center text-white border border-white/10 shadow-xl p-8 md:p-12"
          style={{ backgroundImage: "url('/images/hero_travel_info.jpg')" }}
        >
          {/* Gradients overlay to ensure legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-delta-navy-dark/95 via-delta-navy-dark/80 to-delta-navy-dark/30 pointer-events-none" />

          <div className="relative z-10 max-w-[650px] flex flex-col gap-3">
            <div className="inline-flex items-center gap-1.5 bg-delta-red/35 border border-delta-red/30 text-white px-3 py-1 text-[11px] font-[800] uppercase tracking-wider w-fit rounded-full shadow-sm animate-pulse">
              <Info className="h-3.5 w-3.5 text-white" />
              <span>Essential Travel Policies</span>
            </div>
            <h1 className="text-[32px] sm:text-[40px] font-[800] text-white tracking-tight leading-none mt-2 text-shadow-md">
              Baggage, Changes & Vouchers
            </h1>
            <p className="text-[15px] text-white/80 max-w-[580px] mt-2 font-normal leading-[22px] text-shadow-sm">
              Understand baggage limits, risk-free ticket cancellation, refund policies, and how to utilize your digital wallet.
            </p>
          </div>
        </div>

        {/* Policies Grid (Clean styled rounded cards) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Baggage */}
          <div className="border border-delta-hairline-light bg-white p-6 rounded-[6px] shadow-2xs hover:shadow-md hover:border-delta-navy transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[6px] mb-4 border border-delta-hairline-light">
              <Luggage className="h-6 w-6 text-delta-navy" />
            </div>
            <h3 className="text-[18px] font-[800] text-delta-navy tracking-tight leading-snug">
              Flexible Baggage Allowances
            </h3>
            <p className="mt-3 text-[14px] text-delta-ink-muted leading-[22px] font-normal">
              Enjoy transparent baggage rules. A 7kg Cabin carry-on bag is included with all ticket tiers. Standard checked baggage weight limits are explicitly displayed before checkout to ensure no surprises.
            </p>
          </div>

          {/* Cancellation */}
          <div className="border border-delta-hairline-light bg-white p-6 rounded-[6px] shadow-2xs hover:shadow-md hover:border-delta-navy transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[6px] mb-4 border border-delta-hairline-light">
              <ShieldCheck className="h-6 w-6 text-delta-navy" />
            </div>
            <h3 className="text-[18px] font-[800] text-delta-navy tracking-tight leading-snug">
              24-Hour Risk-Free Cancellation
            </h3>
            <p className="mt-3 text-[14px] text-delta-ink-muted leading-[22px] font-normal">
              Cancel any flight reservation within 24 hours of booking for a full refund back to your payment method. Zero change fees apply to Main Cabin tickets or higher when updating dates.
            </p>
          </div>

          {/* Wallet */}
          <div className="border border-delta-hairline-light bg-white p-6 rounded-[6px] shadow-2xs hover:shadow-md hover:border-delta-navy transition-all duration-300">
            <div className="flex h-12 w-12 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[6px] mb-4 border border-delta-hairline-light">
              <Wallet className="h-6 w-6 text-delta-navy" />
            </div>
            <h3 className="text-[18px] font-[800] text-delta-navy tracking-tight leading-snug">
              SkyLedger Digital Wallet
            </h3>
            <p className="mt-3 text-[14px] text-delta-ink-muted leading-[22px] font-normal">
              Store flight credits, accumulated MQD loyalty rewards, and compensation vouchers directly in your personal secure wallet. Recharge instantly using SSLCommerz and redeem without blackout dates.
            </p>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
