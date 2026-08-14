"use client"

import React, { useState } from "react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import {
  Plane,
  Clock,
  Tag,
  Award,
  Info,
  Globe,
  User,
  LogOut,
  Menu,
  X,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Book Flights", href: "/", icon: Plane },
  { label: "Flight Status", href: "/flight-status", icon: Clock },
  { label: "Curated Deals", href: "/deals", icon: Tag },
  { label: "SkyMiles Benefits", href: "/skymiles", icon: Award },
  { label: "Travel Info", href: "/travel-info", icon: Info },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)

  return (
    <header className="sticky top-0 z-50 h-16 bg-delta-navy text-white shadow-md font-delta select-none">
      <div className="mx-auto flex h-full max-w-[1280px] items-center justify-between px-6 sm:px-8">
        {/* Left: Logo & Brand Identity */}
        <div className="flex items-center shrink-0">
          <Link href="/" className="flex items-center gap-3 group h-full">
            <div className="flex h-9 w-9 items-center justify-center bg-white text-delta-navy transition-transform duration-200 group-hover:scale-105 rounded-[4px] shadow-sm">
              <Plane className="h-5 w-5 fill-delta-navy text-delta-navy" />
            </div>
            <span className="text-[20px] font-[800] tracking-tight text-white font-delta">
              SkyLedger
            </span>
          </Link>
        </div>

        {/* Center: Navigation Links (centered to match the example design) */}
        <nav className="hidden lg:flex items-center justify-center gap-1 h-full flex-1 mx-8">
          {NAV_LINKS.map((link) => {
            const isActive = pathname === link.href
            const LinkIcon = link.icon
            return (
              <Link
                key={link.label}
                href={link.href}
                className={cn(
                  "px-3 py-2 text-[12px] font-[750] uppercase tracking-wider transition-colors h-full flex items-center gap-2 whitespace-nowrap hover:bg-white/5",
                  isActive
                    ? "text-delta-red font-[800]"
                    : "text-white/80 hover:text-white"
                )}
              >
                <LinkIcon className="h-4 w-4 shrink-0" />
                <span>{link.label}</span>
              </Link>
            )
          })}
        </nav>

        {/* Right Actions Block (matching the example structure) */}
        <div className="hidden lg:flex items-center gap-4 shrink-0">
          {/* Outlined Contact/Locale box */}
          <div className="flex items-center gap-1.5 rounded-[4px] px-3.5 py-2 text-[12px] font-[700] uppercase tracking-wide text-white/80 border border-white/20 hover:bg-white/5 hover:text-white transition-colors cursor-pointer">
            <Globe className="h-4 w-4" />
            <span>BDT (৳)</span>
          </div>

          {user ? (
            <>
              {/* Primary Filled CTA Button */}
              <Link
                href={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
                className="flex items-center justify-center rounded-[4px] bg-delta-red px-5 py-2 text-[13px] font-[700] uppercase tracking-wider text-white hover:bg-delta-red-hover transition-colors shadow-sm"
              >
                Dashboard
              </Link>

              {/* Text Login/Out Link with User Icon */}
              <button
                type="button"
                onClick={logout}
                className="flex items-center gap-1.5 text-white/80 hover:text-white text-[13px] font-[700] uppercase tracking-wider transition-colors cursor-pointer pl-1"
              >
                <LogOut className="h-4.5 w-4.5" />
                <span>Sign Out</span>
              </button>
            </>
          ) : (
            <>
              {/* Primary Filled CTA Button */}
              <Link
                href="/register"
                className="flex items-center justify-center rounded-[4px] bg-delta-red px-5 py-2 text-[13px] font-[700] uppercase tracking-wider text-white hover:bg-delta-red-hover transition-colors shadow-sm"
              >
                Join Free
              </Link>

              {/* Text Login Link with User Icon */}
              <Link
                href="/login"
                className="flex items-center gap-1.5 text-white/80 hover:text-white text-[13px] font-[700] uppercase tracking-wider transition-colors pl-1"
              >
                <User className="h-4.5 w-4.5" />
                <span>Sign In</span>
              </Link>
            </>
          )}
        </div>

        {/* Mobile Hamburger Menu Toggle */}
        <div className="lg:hidden flex items-center gap-3">
          <div className="flex items-center gap-1 rounded-[4px] px-2 py-1 text-[11px] font-[600] text-white/80 border border-white/20">
            <Globe className="h-3.5 w-3.5" />
            <span>BDT</span>
          </div>

          <button
            type="button"
            onClick={() => setMobileMenuOpen((o) => !o)}
            className="p-1.5 text-white hover:bg-white/10 rounded-[4px] transition-colors cursor-pointer"
          >
            {mobileMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden absolute top-16 left-0 w-full bg-delta-navy-dark shadow-lg flex flex-col p-5 gap-4 animate-in fade-in slide-in-from-top-4 duration-200">
          <nav className="flex flex-col gap-2">
            {NAV_LINKS.map((link) => {
              const isActive = pathname === link.href
              const LinkIcon = link.icon
              return (
                <Link
                  key={link.label}
                  href={link.href}
                  onClick={() => setMobileMenuOpen(false)}
                  className={cn(
                    "px-4 py-2.5 rounded-[4px] text-[13px] font-[700] uppercase tracking-wider transition-colors flex items-center gap-2.5",
                    isActive
                      ? "bg-white/10 text-delta-red"
                      : "text-white/80 hover:bg-white/5 hover:text-white"
                  )}
                >
                  <LinkIcon className="h-4 w-4 shrink-0" />
                  <span>{link.label}</span>
                </Link>
              )
            })}
          </nav>

          {user ? (
            <div className="flex flex-col gap-3 mt-2">
              <Link
                href={user.role === "admin" ? "/admin/dashboard" : "/user/dashboard"}
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center gap-2 rounded-[4px] bg-white/10 py-2.5 text-[13px] font-[600] text-white border border-white/20"
              >
                <User className="h-4 w-4" />
                <span>
                  {user.first_name} ({user.role === "admin" ? "Admin" : "Dashboard"})
                </span>
              </Link>
              <button
                type="button"
                onClick={() => {
                  logout()
                  setMobileMenuOpen(false)
                }}
                className="w-full flex items-center justify-center gap-2 rounded-[4px] bg-delta-red py-2.5 text-[13px] font-[700] text-white hover:bg-delta-red-hover transition-colors cursor-pointer"
              >
                <LogOut className="h-4 w-4" />
                <span>Sign Out</span>
              </button>
            </div>
          ) : (
            <div className="flex flex-col gap-3 mt-2">
              <Link
                href="/login"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-[4px] border border-white/60 py-2.5 text-[13px] font-[600] text-white hover:bg-white hover:text-delta-navy transition-all"
              >
                Sign In
              </Link>
              <Link
                href="/register"
                onClick={() => setMobileMenuOpen(false)}
                className="flex items-center justify-center rounded-[4px] bg-delta-red py-2.5 text-[13px] font-[700] text-white hover:bg-delta-red-hover transition-colors"
              >
                Join Free
              </Link>
            </div>
          )}
        </div>
      )}
    </header>
  )
}
