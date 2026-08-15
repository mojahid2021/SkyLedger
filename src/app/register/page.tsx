"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  Mail,
  Lock,
  User,
  Phone,
  Calendar,
  ArrowRight,
  AlertCircle,
  ArrowLeft,
  Plane,
  ShieldOff
} from "lucide-react"

import { useAuth } from "@/context/auth-context"

export default function RegisterPage() {
  const { user, register, isLoading } = useAuth()
  const router = useRouter()

  const [firstName, setFirstName] = useState("")
  const [lastName, setLastName] = useState("")
  const [email, setEmail] = useState("")
  const [phone, setPhone] = useState("")
  const [dateOfBirth, setDateOfBirth] = useState("")
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

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)
    if (phone.length !== 11) {
      setError("Phone number must be exactly 11 digits without country code.")
      setSubmitting(false)
      return
    }

    const result = await register({
      first_name: firstName,
      last_name: lastName,
      email,
      phone,
      date_of_birth: dateOfBirth,
      password,
    })

    setSubmitting(false)
    if (!result.success && result.error) {
      setError(result.error)
    }
  }

  return (
    <div className="min-h-screen bg-white text-delta-ink font-delta flex select-none">

      {/* Left Panel: High-End Cover Visuals (Hidden on mobile) */}
      <div className="hidden md:flex md:w-3/2 relative bg-delta-navy-dark overflow-hidden select-none">
        {/* Cover Photo */}
        <div
          className="absolute inset-0 bg-cover bg-center opacity-75"
          style={{ backgroundImage: "url('/images/hero_airplane_flying.jpg')" }}
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
              Unlock Elite Privileges.
            </h2>
            <p className="text-[16px] text-white/80 font-normal leading-relaxed">
              Create a free standard member account to access your digital travel wallet, track transaction history, and earn partner promotions instantly.
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

      {/* Right Panel: Clean Form Panel (Centered layout, scrollable for form length) */}
      <div className="w-full md:w-1/2 flex flex-col justify-between bg-white relative p-6 sm:p-10 lg:p-16 overflow-y-auto max-h-screen">

        {/* Form Container */}
        <div className="w-full max-w-sm mx-auto my-auto py-8 flex flex-col gap-6">
          <div className="flex flex-col gap-1.5">
            <h1 className="text-[26px] font-[800] text-delta-navy tracking-tight leading-none">
              Create Account
            </h1>
            <p className="text-[14px] text-delta-ink-muted font-normal leading-relaxed">
              Register as a travel member to access our global flight booking system.
            </p>
          </div>
          <form onSubmit={handleSubmit} className="flex flex-col gap-4">
            {error && (
              <div className="p-3.5 rounded-[6px] bg-delta-red/5 border border-delta-red/20 text-delta-red text-[13px] flex items-start gap-2.5">
                <AlertCircle className="h-4 w-4 shrink-0 text-delta-red mt-0.5" />
                <span className="font-medium leading-normal">{error}</span>
              </div>
            )}

            {/* First & Last Name */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-[800] text-delta-navy uppercase tracking-wider">
                  First Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-delta-ink-muted/60" />
                  <input
                    type="text"
                    placeholder="First Name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-4 text-[14px] bg-white border border-delta-hairline hover:border-delta-navy-mid focus:border-delta-red focus:ring-1 focus:ring-delta-red focus:outline-none rounded-[4px] text-delta-navy transition-all placeholder:text-delta-ink-muted/40"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-[800] text-delta-navy uppercase tracking-wider">
                  Last Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-delta-ink-muted/60" />
                  <input
                    type="text"
                    placeholder="Last Name"
                    value={lastName}
                    onChange={(e) => setLastName(e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-4 text-[14px] bg-white border border-delta-hairline hover:border-delta-navy-mid focus:border-delta-red focus:ring-1 focus:ring-delta-red focus:outline-none rounded-[4px] text-delta-navy transition-all placeholder:text-delta-ink-muted/40"
                  />
                </div>
              </div>
            </div>

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

            {/* Phone & Date of Birth */}
            <div className="grid grid-cols-2 gap-3">
              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-[800] text-delta-navy uppercase tracking-wider">
                  Phone
                </label>
                <div className="relative">
                  <Phone className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-delta-ink-muted/60" />
                  <input
                    type="tel"
                    placeholder="Phone"
                    value={phone}
                    onChange={(e) => {
                      const val = e.target.value.replace(/\D/g, '').slice(0, 11);
                      setPhone(val);
                    }}
                    maxLength={11}
                    pattern="[0-9]*"
                    required
                    className="w-full h-11 pl-10 pr-4 text-[13px] bg-white border border-delta-hairline hover:border-delta-navy-mid focus:border-delta-red focus:ring-1 focus:ring-delta-red focus:outline-none rounded-[4px] text-delta-navy transition-all placeholder:text-delta-ink-muted/40"
                  />
                </div>
              </div>

              <div className="flex flex-col gap-1.5">
                <label className="text-[12px] font-[800] text-delta-navy uppercase tracking-wider">
                  Date of Birth
                </label>
                <div className="relative">
                  <Calendar className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-delta-ink-muted/60" />
                  <input
                    type="date"
                    value={dateOfBirth}
                    onChange={(e) => setDateOfBirth(e.target.value)}
                    required
                    className="w-full h-11 pl-10 pr-4 text-[13px] bg-white border border-delta-hairline hover:border-delta-navy-mid focus:border-delta-red focus:ring-1 focus:ring-delta-red focus:outline-none rounded-[4px] text-delta-navy transition-all placeholder:text-delta-ink-muted/40"
                  />
                </div>
              </div>
            </div>

            {/* Password Field */}
            <div className="flex flex-col gap-1.5">
              <label className="text-[12px] font-[800] text-delta-navy uppercase tracking-wider">
                Create Password
              </label>
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

            {/* Register Button */}
            <button
              type="submit"
              disabled={submitting}
              className="w-full h-11 mt-2 bg-delta-navy hover:bg-delta-navy-mid text-white text-[12px] font-[800] uppercase tracking-wider rounded-[4px] shadow-sm transition-colors flex items-center justify-center gap-1.5 cursor-pointer border-none"
            >
              {submitting ? (
                <span>Registering Account...</span>
              ) : (
                <>
                  <span>Create Account</span>
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </form>

          {/* Login Redirect Link */}
          <div className="text-center mt-2">
            <p className="text-[13px] text-delta-ink-muted font-normal">
              Already registered?{" "}
              <Link
                href="/login"
                className="font-[800] text-delta-red hover:underline underline-offset-4 cursor-pointer"
              >
                Sign In here
              </Link>
            </p>
          </div>
        </div>

        {/* Footer for mobile only */}
        <div className="block md:hidden text-center text-[11px] text-delta-ink-muted mt-6 font-normal shrink-0">
          &copy; {new Date().getFullYear()} SkyLedger Systems Inc.
        </div>
      </div>
    </div>
  )
}
