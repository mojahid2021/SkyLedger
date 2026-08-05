"use client"

import React, { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import {
  IconBuildingBank,
  IconShieldCheck,
  IconUserCheck,
  IconLock,
  IconMail,
  IconArrowRight,
  IconSparkles,
  IconAlertCircle,
  IconShield,
  IconUser,
} from "@tabler/icons-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function LoginPage() {
  const { user, login, loginAsRole, isLoading } = useAuth()
  const router = useRouter()

  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [error, setError] = useState("")
  const [submitting, setSubmitting] = useState(false)

  useEffect(() => {
    if (!isLoading && user) {
      if (user.role === "admin") {
        router.replace("/admin/dashboard")
      } else {
        router.replace("/user/dashboard")
      }
    }
  }, [user, isLoading, router])

  const handleFormSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    setError("")
    setSubmitting(true)

    setTimeout(() => {
      const res = login(email, password)
      setSubmitting(false)
      if (!res.success && res.error) {
        setError(res.error)
      }
    }, 400)
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col justify-center items-center p-4 sm:p-6 relative overflow-hidden">
      {/* Background Subtle Gradient Blobs */}
      <div className="absolute -top-40 -left-40 w-96 h-96 bg-primary/10 rounded-full blur-3xl pointer-events-none" />
      <div className="absolute -bottom-40 -right-40 w-96 h-96 bg-emerald-500/10 rounded-full blur-3xl pointer-events-none" />

      <div className="w-full max-w-md space-y-6 relative z-10">
        {/* Brand Header */}
        <div className="text-center space-y-2">
          <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-primary text-primary-foreground shadow-lg shadow-primary/20">
            <IconBuildingBank className="h-8 w-8" />
          </div>
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight flex items-center justify-center gap-2">
            SkyLedger
            <Badge variant="secondary" className="text-xs font-normal">
              Auth Gateway
            </Badge>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Role-Based Accounting Portal (Admin & Member Dashboards)
          </p>
        </div>

        {/* Quick Demo Role Selection Card */}
        <Card className="border-primary/20 bg-muted/30">
          <CardHeader className="p-4 pb-2">
            <CardTitle className="text-xs font-bold uppercase tracking-wider text-muted-foreground flex items-center gap-1.5">
              <IconSparkles className="h-4 w-4 text-amber-500" />
              Quick Demo Access (Select Role)
            </CardTitle>
          </CardHeader>
          <CardContent className="p-4 pt-1 grid grid-cols-2 gap-3">
            <Button
              type="button"
              variant="outline"
              onClick={() => loginAsRole("admin")}
              className="h-auto py-2.5 px-3 flex flex-col items-start text-left gap-1 border-indigo-500/30 hover:border-indigo-500 hover:bg-indigo-500/10 transition-all group"
            >
              <div className="flex items-center justify-between w-full">
                <Badge className="bg-indigo-600 hover:bg-indigo-700 text-[10px] gap-1">
                  <IconShield className="h-3 w-3" />
                  Admin
                </Badge>
                <IconArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-xs font-bold text-foreground">Alexander Vance</span>
              <span className="text-[11px] text-muted-foreground">System Administrator</span>
            </Button>

            <Button
              type="button"
              variant="outline"
              onClick={() => loginAsRole("user")}
              className="h-auto py-2.5 px-3 flex flex-col items-start text-left gap-1 border-emerald-500/30 hover:border-emerald-500 hover:bg-emerald-500/10 transition-all group"
            >
              <div className="flex items-center justify-between w-full">
                <Badge className="bg-emerald-600 hover:bg-emerald-700 text-[10px] gap-1">
                  <IconUser className="h-3 w-3" />
                  User
                </Badge>
                <IconArrowRight className="h-3.5 w-3.5 text-muted-foreground group-hover:translate-x-0.5 transition-transform" />
              </div>
              <span className="text-xs font-bold text-foreground">Sarah Jenkins</span>
              <span className="text-[11px] text-muted-foreground">Financial Analyst</span>
            </Button>
          </CardContent>
        </Card>

        {/* Credentials Login Form */}
        <Card className="shadow-lg border">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Sign In to SkyLedger</CardTitle>
            <CardDescription className="text-xs">
              Enter your credentials to access your dedicated role dashboard.
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleFormSubmit} className="space-y-4">
              {error && (
                <div className="p-3 rounded-lg bg-destructive/15 border border-destructive/30 text-destructive text-xs flex items-center gap-2">
                  <IconAlertCircle className="h-4 w-4 shrink-0" />
                  <span>{error}</span>
                </div>
              )}

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  Email Address
                </label>
                <div className="relative">
                  <IconMail className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="email"
                    placeholder="e.g. admin@skyledger.io or user@skyledger.io"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground flex items-center justify-between">
                  Password
                </label>
                <div className="relative">
                  <IconLock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    type="password"
                    placeholder="Enter password (admin123 / user123)"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    className="pl-9 text-sm"
                  />
                </div>
              </div>

              <Button
                type="submit"
                disabled={submitting}
                className="w-full font-semibold gap-2 shadow-xs"
              >
                {submitting ? (
                  <span>Authenticating...</span>
                ) : (
                  <>
                    <span>Log In & Auto-Redirect</span>
                    <IconArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col text-center border-t bg-muted/20 pt-3 pb-3">
            <p className="text-[11px] text-muted-foreground">
              Demo Credentials: <span className="font-mono font-semibold">admin@skyledger.io</span> (pass: <span className="font-mono font-semibold">admin123</span>) | <span className="font-mono font-semibold">user@skyledger.io</span> (pass: <span className="font-mono font-semibold">user123</span>)
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
