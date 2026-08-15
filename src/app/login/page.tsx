"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  IconBuildingBank,
  IconLock,
  IconMail,
  IconArrowRight,
  IconAlertCircle,
} from "@tabler/icons-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

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
    <div className="min-h-screen bg-delta-navy-dark text-white flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute top-0 right-0 w-[600px] h-[600px] bg-[radial-gradient(circle_at_center,#003366,transparent_70%)] opacity-[0.4] -mr-40 -mt-40 pointer-events-none" />
      <div className="absolute bottom-0 left-0 w-[400px] h-[400px] bg-[radial-gradient(circle_at_center,#e31837,transparent_70%)] opacity-[0.25] -ml-20 -mb-20 pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-delta-red text-white shadow-lg shadow-delta-red/35 transform hover:scale-105 transition-transform duration-300">
            <IconBuildingBank className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2 text-white">
            SkyLedger
            <Badge variant="secondary" className="text-xs font-bold bg-white/10 text-white border border-white/20">
              Portal
            </Badge>
          </h1>
          <p className="text-xs sm:text-sm text-white/60">
            Role-Based Accounting & Ledger System
          </p>
        </div>

        {/* Credentials Login Form */}
        <Card className="shadow-2xl border border-white/10 bg-delta-navy/70 backdrop-blur-md text-white">
          <CardHeader>
            <CardTitle className="text-lg font-bold text-white">Sign In to SkyLedger</CardTitle>
            <CardDescription className="text-xs text-white/60">
              Enter your account credentials to access your dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-delta-red/20 border border-delta-red/30 text-white text-xs flex items-center gap-2">
                  <IconAlertCircle className="h-4 w-4 shrink-0 text-delta-red" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                  Email Address
                </label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    type="email"
                    placeholder="Enter your registered email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 text-sm bg-white/5 border border-white/10 text-white placeholder:text-white/30 focus-visible:ring-delta-red focus-visible:border-delta-red rounded-[4px] shadow-none"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-white/80 flex items-center justify-between">
                  Password
                </label>
                <div className="relative">
                  <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-white/40" />
                  <Input
                    type="password"
                    placeholder="Enter your password"
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
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Log In</span>
                    <IconArrowRight className="h-4 w-4 animate-bounce-horizontal" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col text-center border-t border-white/10 bg-white/5 pt-4 pb-4 space-y-1.5 rounded-b-[4px]">
            <p className="text-xs text-white/60">
              Don&apos;t have a member account?{" "}
              <Link href="/register" className="font-bold text-delta-red hover:text-delta-red-hover underline underline-offset-4">
                Register as Standard User
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
