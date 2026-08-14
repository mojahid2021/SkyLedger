"use client"

import React from "react"
import { Award, Star, Compass, Anchor, UserCheck } from "lucide-react"
import { Navbar } from "@/components/layout/navbar"

export default function SkyMilesPage() {
  return (
    <div className="min-h-screen bg-delta-surface-1 text-delta-ink font-delta flex flex-col">
      <Navbar />

      <main className="flex-1 mx-auto w-full max-w-[1280px] px-6 sm:px-8 py-10 flex flex-col gap-8">
        {/* Header Block */}
        <div className="flex flex-col gap-2">
          <div className="inline-flex items-center gap-1.5 bg-delta-navy text-white px-3 py-1 text-[11px] font-[700] uppercase tracking-wider w-fit rounded-[2px]">
            <Award className="h-3.5 w-3.5" />
            <span>SkyMiles® Loyalty Benefits</span>
          </div>
          <h1 className="text-[32px] sm:text-[40px] font-[700] text-delta-navy tracking-tight leading-none mt-2">
            Medallion® Status Tiers
          </h1>
          <p className="text-[15px] text-delta-ink-muted max-w-[640px] mt-1 font-normal">
            Earn miles on every booking and unlock elite travel privileges. Climb the Medallion tiers to experience premier comfort, waiver fees, and upgrades.
          </p>
        </div>

        {/* Tiers Grid (No horizontal divider lines, clean rounded cards) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
          {/* Silver Medallion */}
          <div className="border border-delta-hairline bg-white p-6 rounded-[4px] hover:border-delta-navy hover:shadow-sm transition-all flex flex-col justify-between">
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
          <div className="border border-delta-hairline bg-white p-6 rounded-[4px] hover:border-delta-navy hover:shadow-sm transition-all flex flex-col justify-between">
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
          <div className="border border-delta-hairline bg-white p-6 rounded-[4px] hover:border-delta-navy hover:shadow-sm transition-all flex flex-col justify-between">
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
          <div className="border border-delta-hairline bg-white p-6 rounded-[4px] hover:border-delta-navy hover:shadow-sm transition-all flex flex-col justify-between">
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
    </div>
  )
}
