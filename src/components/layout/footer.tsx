"use client"

import React from "react"
import Link from "next/link"
import { Plane, Mail, MapPin, Phone } from "lucide-react"
import { IconBrandFacebook, IconBrandTwitter, IconBrandInstagram, IconBrandLinkedin } from "@tabler/icons-react"

export function Footer() {
  return (
    <footer className="bg-gradient-to-b from-delta-navy to-delta-navy-dark text-white pt-20 pb-8 relative overflow-hidden">
      {/* Decorative background element */}
      <div className="absolute top-0 right-0 -mr-32 -mt-32 opacity-5 pointer-events-none">
        <Plane className="w-[500px] h-[500px] -rotate-45" />
      </div>

      <div className="mx-auto px-6 sm:px-8 relative z-10">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-12 gap-12 lg:gap-8 mb-16">

          {/* Brand & Contact Section */}
          <div className="lg:col-span-4">
            <Link href="/" className="inline-flex items-center gap-2 mb-6 group">
              <div className="bg-delta-red p-2 rounded-lg transform transition-transform group-hover:scale-105 shadow-lg shadow-delta-red/20">
                <Plane className="h-6 w-6 text-white" />
              </div>
              <span className="text-2xl font-[800] tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-white to-white/70">
                SkyLedger
              </span>
            </Link>
            <p className="text-white/60 text-sm leading-relaxed mb-8 max-w-sm">
              Experience the new standard of air travel. We connect the world with cutting-edge technology and unparalleled service.
            </p>

            <div className="space-y-3 text-sm text-white/70">
              <div className="flex items-center gap-3">
                <Phone className="w-4 h-4 text-delta-red" />
                <span>+1 (800) 555-0199</span>
              </div>
              <div className="flex items-center gap-3">
                <Mail className="w-4 h-4 text-delta-red" />
                <span>support@skyledger.io</span>
              </div>
              <div className="flex items-start gap-3">
                <MapPin className="w-4 h-4 text-delta-red mt-1" />
                <span>123 Aviation Way, Suite 500<br />New York, NY 10001</span>
              </div>
            </div>
          </div>

          {/* Navigation Links */}
          <div className="lg:col-span-2">
            <h4 className="text-[13px] font-[700] uppercase tracking-widest text-white pb-6 select-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-delta-red"></span>
              Fly With Us
            </h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link href="/" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Search Flights</Link></li>
              <li><Link href="/deals" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Curated Deals</Link></li>
              <li><Link href="/flight-status" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Flight Status</Link></li>
              <li><Link href="/travel-info" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Baggage & Fees</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[13px] font-[700] uppercase tracking-widest text-white pb-6 select-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-delta-red"></span>
              SkyMiles
            </h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link href="/skymiles" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">About SkyMiles</Link></li>
              <li><Link href="/skymiles" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Medallion Tiers</Link></li>
              <li><Link href="/user/wallet" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">SkyLedger Wallet</Link></li>
              <li><Link href="/user/dashboard" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Member Account</Link></li>
            </ul>
          </div>

          <div className="lg:col-span-2">
            <h4 className="text-[13px] font-[700] uppercase tracking-widest text-white pb-6 select-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-delta-red"></span>
              Support
            </h4>
            <ul className="space-y-3 text-sm text-white/60">
              <li><Link href="/travel-info" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Help Center</Link></li>
              <li><Link href="/travel-info" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Refund Policies</Link></li>
              <li><Link href="/travel-info" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Cancellations</Link></li>
              <li><Link href="/travel-info" className="hover:text-white hover:translate-x-1 inline-block transition-all duration-200">Delay Info</Link></li>
            </ul>
          </div>

          {/* Newsletter Section */}
          <div className="lg:col-span-2">
            <h4 className="text-[13px] font-[700] uppercase tracking-widest text-white pb-6 select-none flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-delta-red"></span>
              Stay Updated
            </h4>
            <p className="text-xs text-white/60 mb-4">
              Subscribe to get the latest deals and travel news.
            </p>
            <div className="flex flex-col gap-3">
              <input
                type="email"
                placeholder="Email address"
                className="w-full bg-white/5 border border-white/10 rounded-md px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:outline-none focus:border-delta-red focus:ring-1 focus:ring-delta-red transition-all"
              />
              <button className="w-full bg-delta-red hover:bg-delta-red-hover text-white rounded-md px-4 py-2.5 text-sm font-bold transition-colors">
                Subscribe
              </button>
            </div>
          </div>
        </div>

        {/* Divider */}
        <div className="h-px w-full bg-gradient-to-r from-transparent via-white/10 to-transparent mb-8"></div>

        {/* Bottom Footer */}
        <div className="flex flex-col md:flex-row justify-between items-center gap-4 text-xs text-white/40">
          <p>© {new Date().getFullYear()} SkyLedger Airways. All rights reserved.</p>

          <div className="flex items-center gap-6">
            <a href="#" className="hover:text-white transition-colors">Privacy Policy</a>
            <a href="#" className="hover:text-white transition-colors">Terms of Use</a>
            <a href="#" className="hover:text-white transition-colors">Sitemap</a>
          </div>

          <div className="flex items-center gap-4">
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-delta-red hover:text-white transition-all text-white/60">
              <IconBrandFacebook className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-delta-red hover:text-white transition-all text-white/60">
              <IconBrandTwitter className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-delta-red hover:text-white transition-all text-white/60">
              <IconBrandInstagram className="w-4 h-4" />
            </a>
            <a href="#" className="w-8 h-8 rounded-full bg-white/5 flex items-center justify-center hover:bg-delta-red hover:text-white transition-all text-white/60">
              <IconBrandLinkedin className="w-4 h-4" />
            </a>
          </div>
        </div>
      </div>
    </footer>
  )
}
