"use client"

import React from "react"
import { Info, Luggage, ShieldCheck, Wallet, RefreshCw } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"

export default function TravelInfoPage() {
  return (
    <div className="min-h-screen bg-delta-surface-1 text-delta-ink font-delta flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1280px] px-6 sm:px-8 py-10 flex flex-col gap-8">
        {/* Header Block */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 bg-delta-navy text-white px-3 py-1 text-[11px] font-[700] uppercase tracking-wider w-fit rounded-[2px]">
            <Info className="h-3.5 w-3.5" />
            <span>Essential Travel Policies</span>
          </div>
          <h1 className="text-[32px] sm:text-[40px] font-[700] text-delta-navy tracking-tight leading-none mt-2">
            Baggage, Changes & Vouchers
          </h1>
          <p className="text-[15px] text-delta-ink-muted max-w-[640px] mt-1 font-normal">
            Understand baggage limits, risk-free ticket cancellation, refund policies, and how to utilize your digital wallet.
          </p>
        </div>

        {/* Policies Grid (No horizontal dividing lines) */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          {/* Baggage */}
          <div className="border border-delta-hairline bg-white p-6 rounded-[4px] shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[4px] mb-4">
              <Luggage className="h-6 w-6 text-delta-navy" />
            </div>
            <h3 className="text-[18px] font-[700] text-delta-navy">
              Flexible Baggage Allowances
            </h3>
            <p className="mt-3 text-[14px] text-delta-ink-muted leading-[22px] font-normal">
              Enjoy transparent baggage rules. A 7kg Cabin carry-on bag is included with all ticket tiers. Standard checked baggage weight limits are explicitly displayed before checkout to ensure no surprises.
            </p>
          </div>

          {/* Cancellation */}
          <div className="border border-delta-hairline bg-white p-6 rounded-[4px] shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[4px] mb-4">
              <ShieldCheck className="h-6 w-6 text-delta-navy" />
            </div>
            <h3 className="text-[18px] font-[700] text-delta-navy">
              24-Hour Risk-Free Cancellation
            </h3>
            <p className="mt-3 text-[14px] text-delta-ink-muted leading-[22px] font-normal">
              Cancel any flight reservation within 24 hours of booking for a full refund back to your payment method. Zero change fees apply to Main Cabin tickets or higher when updating dates.
            </p>
          </div>

          {/* Wallet */}
          <div className="border border-delta-hairline bg-white p-6 rounded-[4px] shadow-2xs hover:shadow-xs transition-shadow">
            <div className="flex h-12 w-12 items-center justify-center bg-delta-surface-2 text-delta-navy rounded-[4px] mb-4">
              <Wallet className="h-6 w-6 text-delta-navy" />
            </div>
            <h3 className="text-[18px] font-[700] text-delta-navy">
              SkyLedger Digital Wallet
            </h3>
            <p className="mt-3 text-[14px] text-delta-ink-muted leading-[22px] font-normal">
              Store flight credits, accumulated MQD loyalty rewards, and compensation vouchers directly in your personal secure wallet. Recharge instantly using SSLCommerz and redeem without blackout dates.
            </p>
          </div>
        </div>
      </main>
    </div>
  )
}
