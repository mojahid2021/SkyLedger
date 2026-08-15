"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  IconBuildingBank,
  IconUserPlus,
  IconShieldOff,
  IconLock,
  IconMail,
  IconUser,
  IconPhone,
  IconCalendar,
  IconArrowRight,
  IconAlertCircle,
} from "@tabler/icons-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    <div className="min-h-screen bg-delta-navy-dark text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Subtle Background Glows */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,#003366,transparent_70%)] opacity-[0.4] -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,#e31837,transparent_70%)] opacity-[0.25] -ml-20 -mb-20 pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-delta-red text-white shadow-lg shadow-delta-red/35 transform hover:scale-105 transition-transform duration-300">
            <IconUserPlus className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-white">
            SkyLedger
            <Badge variant="outline" className="text-xs font-bold bg-white/10 text-white border border-white/20">
              New Account
            </Badge>
          </h1>
          <p className="text-xs sm:text-sm text-white/60">
            Register as a Treasury & Financial Ledger Member
          </p>
        </div>

        {/* Security Rule Banner: Admin Registration Restriction */}
        <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-500/10 text-xs text-white space-y-1">
          <div className="flex items-center gap-2 font-bold text-amber-400">
            <IconShieldOff className="h-4 w-4 shrink-0 text-amber-400" />
            <span>Admin Restriction Notice</span>
          </div>
          <p className="text-[11px] leading-relaxed text-white/80">
            All public registrations create standard <strong className="font-bold text-amber-300">User</strong> accounts.
            Administrative roles (<strong className="font-bold text-amber-300">Admin</strong>) cannot be registered publicly and must be assigned internally by existing System Administrators.
          </p>
        </div>

        {/* Registration Form Card */}
        <Card className="shadow-2xl border border-white/10 bg-delta-navy/70 backdrop-blur-md text-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Create Member Account</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Enter your information to gain standard user access to SkyLedger.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-delta-red/20 border border-delta-red/30 text-white text-xs flex items-center gap-2">
                  <IconAlertCircle className="h-4 w-4 shrink-0 text-delta-red" />
                  <span>{error}</span>
                </div>
              )}

              {/* First Name & Last Name */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">First Name</label>
                  <div className="relative">
                    <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      type="text"
                      placeholder="First Name"
                      value={firstName}
                      onChange={(e) => setFirstName(e.target.value)}
                      required
                      className="pl-9 text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus-visible:ring-delta-red focus-visible:border-delta-red rounded-[4px] shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Last Name</label>
                  <div className="relative">
                    <IconUser className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      type="text"
                      placeholder="Last Name"
                      value={lastName}
                      onChange={(e) => setLastName(e.target.value)}
                      required
                      className="pl-9 text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus-visible:ring-delta-red focus-visible:border-delta-red rounded-[4px] shadow-none"
                    />
                  </div>
                </div>
              </div>

              {/* Email Address */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">Email Address</label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    type="email"
                    placeholder="e.g. user@skyledger.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus-visible:ring-delta-red focus-visible:border-delta-red rounded-[4px] shadow-none"
                  />
                </div>
              </div>

              {/* Phone & Date of Birth */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Phone Number</label>
                  <div className="relative">
                    <IconPhone className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      type="tel"
                      placeholder="+1 (555) 000-0000"
                      value={phone}
                      onChange={(e) => setPhone(e.target.value)}
                      className="pl-9 text-xs bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus-visible:ring-delta-red focus-visible:border-delta-red rounded-[4px] shadow-none"
                    />
                  </div>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-white/80">Date of Birth</label>
                  <div className="relative">
                    <IconCalendar className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                    <Input
                      type="date"
                      value={dateOfBirth}
                      onChange={(e) => setDateOfBirth(e.target.value)}
                      className="pl-9 text-xs bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus-visible:ring-delta-red focus-visible:border-delta-red rounded-[4px] shadow-none"
                    />
                  </div>
                </div>
              </div>

              {/* Password */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80">Password</label>
                <div className="relative">
                  <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    type="password"
                    placeholder="Create secure password"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus-visible:ring-delta-red focus-visible:border-delta-red rounded-[4px] shadow-none"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full font-bold gap-2 shadow-lg bg-delta-red hover:bg-delta-red-hover text-white transition-colors cursor-pointer select-none rounded-[4px] border-none"
              >
                {submitting ? (
                  <span>Registering Member...</span>
                ) : (
                  <>
                    <span>Register as Standard User</span>
                    <IconArrowRight className="h-4 w-4 animate-bounce-horizontal" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col text-center border-t border-white/10 bg-white/5 pt-4 pb-4 rounded-b-[4px]">
            <p className="text-xs text-white/60">
              Already have a SkyLedger account?{" "}
              <Link href="/login" className="font-bold text-delta-red hover:text-delta-red-hover underline underline-offset-4">
                Sign In here
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
