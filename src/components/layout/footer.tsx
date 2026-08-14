"use client"

import React from "react"
import Link from "next/link"

export function Footer() {
  return (
    <footer className="bg-delta-navy-dark text-white py-16">
      <div className="mx-auto px-6 sm:px-8 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
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
        <p>© {new Date().getFullYear()} SkyLedger Airways. All rights reserved.</p>
        <div className="flex gap-4">
          <a href="#" className="hover:underline">Privacy Policy</a>
          <a href="#" className="hover:underline">Terms of Use</a>
        </div>
      </div>
    </footer>
  )
}
