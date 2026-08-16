"use client"

import React, { useState, useEffect, useRef } from "react"
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
  Wallet,
  Mail,
  Users,
} from "lucide-react"
import { useAuth } from "@/context/auth-context"
import { cn } from "@/lib/utils"

const NAV_LINKS = [
  { label: "Book", href: "/", icon: Plane },
  { label: "Status", href: "/flight-status", icon: Clock },
  { label: "Deals", href: "/deals", icon: Tag },
  { label: "SkyMiles", href: "/skymiles", icon: Award },
  { label: "Info", href: "/travel-info", icon: Info },
  { label: "Contact", href: "/contact", icon: Mail },
  { label: "Team", href: "/team", icon: Users },
]

export function Navbar() {
  const pathname = usePathname()
  const { user, logout } = useAuth()
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const [dropdownOpen, setDropdownOpen] = useState(false)
  const dropdownRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setDropdownOpen(false)
      }
    }
    document.addEventListener("mousedown", handleClickOutside)
    return () => {
      document.removeEventListener("mousedown", handleClickOutside)
    }
  }, [])

  return (
    <header className="sticky top-0 z-50 h-16 bg-delta-navy text-white shadow-md font-delta select-none">
      <div className="mx-auto flex h-full items-center justify-between px-6 sm:px-8">
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
          {user ? (
            <div ref={dropdownRef} className="relative">
              {/* User Profile Circle Trigger */}
              <button
                type="button"
                onClick={() => setDropdownOpen((o) => !o)}
                className="flex h-9 w-9 items-center justify-center rounded-full bg-white/10 hover:bg-white/20 border border-white/10 text-white font-[800] text-sm uppercase tracking-wider transition-all cursor-pointer transform hover:scale-105 active:scale-95"
                title={`${user.first_name} ${user.last_name}`}
              >
                {user.first_name[0]}{user.last_name[0]}
              </button>

              {/* Profile Dropdown Menu */}
              {dropdownOpen && (
                <div className="absolute right-0 mt-2.5 w-56 rounded-[6px] border border-white/10 bg-delta-navy-dark text-white p-2.5 shadow-2xl z-55 flex flex-col gap-1 animate-in fade-in slide-in-from-top-2 duration-150">
                  <div className="px-3 py-2 border-b border-white/10 mb-1">
                    <p className="text-xs font-extrabold truncate text-white">{user.first_name} {user.last_name}</p>
                    <p className="text-[10px] text-white/60 truncate font-normal mt-0.5">{user.email}</p>
                  </div>
                  
                  <Link
                    href={user.role === "admin" ? "/admin/overview" : "/user/dashboard"}
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-[700] text-white/80 hover:text-white hover:bg-white/5 rounded-[4px] transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="h-4 w-4 shrink-0 text-delta-red" />
                    <span>Dashboard</span>
                  </Link>

                  <Link
                    href="/user/profile"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-[700] text-white/80 hover:text-white hover:bg-white/5 rounded-[4px] transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <User className="h-4 w-4 shrink-0 text-delta-red" />
                    <span>My Profile</span>
                  </Link>

                  <Link
                    href="/user/wallet"
                    className="flex items-center gap-2.5 px-3 py-2 text-xs font-[700] text-white/80 hover:text-white hover:bg-white/5 rounded-[4px] transition-colors"
                    onClick={() => setDropdownOpen(false)}
                  >
                    <Wallet className="h-4 w-4 shrink-0 text-delta-red" />
                    <span>Wallet</span>
                  </Link>

                  <button
                    type="button"
                    onClick={() => {
                      logout()
                      setDropdownOpen(false)
                    }}
                    className="w-full flex items-center gap-2.5 px-3 py-2 text-xs font-[800] text-delta-red hover:text-delta-red-hover hover:bg-white/5 rounded-[4px] transition-colors text-left cursor-pointer border-t border-white/10 mt-1 pt-2.5"
                  >
                    <LogOut className="h-4 w-4 shrink-0" />
                    <span>Sign Out</span>
                  </button>
                </div>
              )}
            </div>
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
                href={user.role === "admin" ? "/admin/overview" : "/user/dashboard"}
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
