"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  Plane,
  ShieldCheck
} from "lucide-react"

import { useAuth } from "@/context/auth-context"

export default function LoginPage() {
  const { user, login, isLoading } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "admin") {
        router.replace("/admin/overview")
      } else {
        router.replace("/user/dashboard")
      }
    }
  }, [user, isLoading, router])

  const handleFormSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    const res = await login(email, password)
    setSubmitting(false)
    if (!res.success && res.error) {
      setError(res.error)
    }
  }

  return (
    <div className="min-h-screen bg-white text-delta-ink font-delta flex select-none">

      {/* Left Panel: High-End Cover Visuals (Hidden on mobile) */}
      <div className="hidden md:flex md:w-3/2 relative bg-delta-navy-dark overflow-hidden select-none">
        {/* Cover Photo */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-75"
          style={{ backgroundImage: "url('/images/hero_flight.jpg')" }}
        />
        {/* Glassmorphism Dark Tint Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-delta-navy-dark via-delta-navy-dark/70 to-delta-navy-dark/40" />

        {/* Content Overlay */}
        <div className="relative z-10 p-12 lg:p-16 flex flex-col justify-between h-full w-full text-white">
          <div className="flex items-center gap-3">
            <div className="flex h-9 w-9 items-center justify-center rounded-[4px] bg-white text-delta-navy shadow-sm">
              <Plane className="h-5 w-5 fill-delta-navy text-delta-navy" />
            </div>
            <span className="text-xl font-[800] tracking-tight text-white font-delta">SkyLedger</span>
          </div>

          <div className="flex flex-col gap-6 max-w-lg">
            <h2 className="text-[36px] sm:text-[42px] font-[800] tracking-tight leading-none text-white">
              Fly Beyond Boundaries.
            </h2>
            <p className="text-[16px] text-white/80 font-normal leading-relaxed">
              &ldquo;The journey of a thousand miles begins with a single step. Track, manage, and book your global operations in real-time.&rdquo;
            </p>
            <div className="flex items-center gap-4 mt-2">
              <div className="flex -space-x-2">
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-delta-red text-[11px] font-[800] ring-2 ring-delta-navy-dark">DAC</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-delta-navy text-[11px] font-[800] ring-2 ring-delta-navy-dark">JFK</span>
                <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-delta-navy-mid text-[11px] font-[800] ring-2 ring-delta-navy-dark">DXB</span>
              </div>
              <span className="text-[12px] text-white/60 font-semibold tracking-wider uppercase">Active Global Routes</span>
            </div>
          </div>

          <div className="text-[12px] text-white/50 font-normal">
            &copy; {new Date().getFullYear()} SkyLedger Systems Inc. All rights reserved.
          </div>
        </div>
      </div>

      {/* Right Panel: Clean Form Panel (Centered layout) */}
      <div className="w-full md:w-1/2 flex flex-col justify-between bg-white relative p-6 sm:p-10 lg:p-16">

        {/* Form Container */}
        <div className="w-full max-w-sm mx-auto my-auto py-12 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[26px] font-[800] text-delta-navy tracking-tight leading-none">
              Sign In
            </h1>
            <p className="text-[14px] text-delta-ink-muted font-normal leading-relaxed">
              Enter your account credentials to access your booking ledger.
            </p>
          </div>
          <form onSubmit={handleFormSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3.5 rounded-[6px] bg-delta-red/5 border border-delta-red/20 text-delta-red text-[13px] flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-delta-red mt-0.5" />
                <span className="font-medium leading-normal">{error}</span>
              </div>
            )}

            {/* Email Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-[800] text-delta-navy uppercase tracking-wider">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-delta-ink-muted/60" />
                <input
                  type="email"
                  placeholder="name@company.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-4 text-[14px] bg-white border border-delta-hairline hover:border-delta-navy-mid focus:border-delta-red focus:ring-1 focus:ring-delta-red focus:outline-none rounded-[4px] text-delta-navy transition-all placeholder:text-delta-ink-muted/40"
                />
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <div className="flex justify-between items-center">
                <label className="text-[12px] font-[800] text-delta-navy uppercase tracking-wider">
                  Password
                </label>
                <span className="text-[12px] text-delta-ink-muted hover:text-delta-red cursor-pointer transition-colors font-medium">
                  Forgot?
                </span>
              </div>
              <div className="relative">
                <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-delta-ink-muted/60" />
                <input
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  className="w-full h-11 pl-10 pr-4 text-[14px] bg-white border border-delta-hairline hover:border-delta-navy-mid focus:border-delta-red focus:ring-1 focus:ring-delta-red focus:outline-none rounded-[4px] text-delta-navy transition-all placeholder:text-delta-ink-muted/40"
                />
              </div>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 mt-2 bg-delta-navy hover:bg-delta-navy-mid text-white text-[12px] font-[800] uppercase tracking-wider rounded-[4px] shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-none"
            >
              {submitting ? (
                <span>Authenticating...</span>
              ) : (
                <>
                  <span>Sign In</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Registration Redirect Link */}
          <div className="text-center mt-2">
            <p className="text-[13px] text-delta-ink-muted font-normal">
              New to SkyLedger?{" "}
              <Link
                href="/register"
                className="font-[800] text-delta-red hover:underline underline-offset-4 cursor-pointer"
              >
                Create standard account
              </Link>
            </p>
          </div>
        </div>

        {/* Footer for mobile only */}
        <div className="block md:hidden text-center text-[11px] text-delta-ink-muted mt-6 font-normal">
          &copy; {new Date().getFullYear()} SkyLedger Systems Inc.
        </div>
      </div>
    </div>
  )
}
