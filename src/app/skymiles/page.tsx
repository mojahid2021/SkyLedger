"use client"

import React from "react"
import { Award, Star, Compass, Anchor, UserCheck } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"
import { Footer } from "@/components/layout/footer"

export default function SkyMilesPage() {
  return (
    <div className="min-h-screen bg-delta-surface-1 text-delta-ink font-delta flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1280px] px-6 sm:px-8 py-10 flex flex-col gap-8">
        {/* Header Block with Loyalty Hero Banner */}
        <div 
          className="relative rounded-[8px] overflow-hidden bg-cover bg-center text-white border border-white/10 shadow-xl p-8 md:p-12"
          style={{ backgroundImage: "url('/images/promo_credit_card.jpg')" }}
        >
          {/* Gradients overlay to ensure legibility */}
          <div className="absolute inset-0 bg-gradient-to-r from-delta-navy-dark/95 via-delta-navy-dark/80 to-delta-navy-dark/30 pointer-events-none" />

          <div className="relative z-10 max-w-[650px] flex flex-col gap-3">
            <div className="inline-flex items-center gap-1.5 bg-delta-red/35 border border-delta-red/30 text-white px-3 py-1 text-[11px] font-[800] uppercase tracking-wider w-fit rounded-full shadow-sm animate-pulse">
              <Award className="h-3.5 w-3.5 text-white" />
              <span>SkyMiles® Loyalty Benefits</span>
            </div>
            <h1 className="text-[32px] sm:text-[40px] font-[800] text-white tracking-tight leading-none mt-2 text-shadow-md">
              Medallion® Status Tiers
            </h1>
            <p className="text-[15px] text-white/80 max-w-[580px] mt-2 font-normal leading-[22px] text-shadow-sm">
              Earn miles on every booking and unlock elite travel privileges. Climb the Medallion tiers to experience premier comfort, waiver fees, and upgrades.
            </p>
          </div>
        </div>

        {/* Tiers Grid (No horizontal divider lines, clean rounded cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Silver Medallion */}
          <div className="border border-delta-hairline bg-white p-6 rounded-[4px] hover:border-delta-navy hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="inline-flex bg-slate-100 text-delta-navy border border-slate-200 text-[11px] font-[700] uppercase tracking-wider px-3 py-1 rounded-[9999px] items-center gap-1">
                <Compass className="h-3 w-3" />
                <span>Silver Medallion</span>
              </div>
              <h3 className="mt-5 text-[18px] font-[700] text-delta-navy">
                Essential Privileges
              </h3>
              <ul className="mt-4 space-y-3 text-[13px] text-delta-ink-muted">
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
            <div className="mt-6 pt-2">
              <span className="text-[11px] font-[700] text-delta-navy bg-delta-surface-2 px-2.5 py-1 rounded-[2px] uppercase tracking-wide">
                Requires 25,000 MQDs
              </span>
            </div>
          </div>

          {/* Gold Medallion */}
          <div className="border border-delta-hairline bg-white p-6 rounded-[4px] hover:border-delta-navy hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="inline-flex bg-amber-100 text-amber-900 border border-amber-300 text-[11px] font-[700] uppercase tracking-wider px-3 py-1 rounded-[9999px] items-center gap-1">
                <Star className="h-3 w-3 fill-amber-900 text-amber-900" />
                <span>Gold Medallion</span>
              </div>
              <h3 className="mt-5 text-[18px] font-[700] text-delta-navy">
                Enhanced Travel Comfort
              </h3>
              <ul className="mt-4 space-y-3 text-[13px] text-delta-ink-muted">
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
            <div className="mt-6 pt-2">
              <span className="text-[11px] font-[700] text-delta-navy bg-delta-surface-2 px-2.5 py-1 rounded-[2px] uppercase tracking-wide">
                Requires 50,000 MQDs
              </span>
            </div>
          </div>

          {/* Platinum Medallion */}
          <div className="border border-delta-hairline bg-white p-6 rounded-[4px] hover:border-delta-navy hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="inline-flex bg-delta-navy-mid/10 text-delta-navy-mid border border-delta-navy-mid/30 text-[11px] font-[700] uppercase tracking-wider px-3 py-1 rounded-[9999px] items-center gap-1">
                <Anchor className="h-3 w-3" />
                <span>Platinum Medallion</span>
              </div>
              <h3 className="mt-5 text-[18px] font-[700] text-delta-navy">
                Premium Privileges
              </h3>
              <ul className="mt-4 space-y-3 text-[13px] text-delta-ink-muted">
                <li className="flex items-start gap-2">
                  <span className="text-delta-navy font-bold">•</span>
                  <span><strong>9x Miles</strong> earned per BDT spent</span>
                </li>
                <li className="flex items-start gap-2">
                  <span className="text-delta-navy font-bold">•</span>
                  <span>Choice Benefits Selection</span>
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
            <div className="mt-6 pt-2">
              <span className="text-[11px] font-[700] text-delta-navy bg-delta-surface-2 px-2.5 py-1 rounded-[2px] uppercase tracking-wide">
                Requires 75,000 MQDs
              </span>
            </div>
          </div>

          {/* Diamond Medallion */}
          <div className="border border-delta-hairline bg-white p-6 rounded-[4px] hover:border-delta-navy hover:shadow-md hover:-translate-y-1 transition-all duration-300 flex flex-col justify-between">
            <div>
              <div className="inline-flex bg-delta-navy-dark text-white border border-delta-navy-dark text-[11px] font-[700] uppercase tracking-wider px-3 py-1 rounded-[9999px] items-center gap-1">
                <UserCheck className="h-3 w-3" />
                <span>Diamond Medallion</span>
              </div>
              <h3 className="mt-5 text-[18px] font-[700] text-delta-navy">
                Elite Global Luxury
              </h3>
              <ul className="mt-4 space-y-3 text-[13px] text-delta-ink-muted">
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
            <div className="mt-6 pt-2">
              <span className="text-[11px] font-[700] text-delta-navy bg-delta-surface-2 px-2.5 py-1 rounded-[2px] uppercase tracking-wide">
                Requires 125,000 MQDs
              </span>
            </div>
          </div>
        </div>
      </main>
      <Footer />
    </div>
  )
}
