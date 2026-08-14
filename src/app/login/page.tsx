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
              Portal
            </Badge>
          </h1>
          <p className="text-xs sm:text-sm text-muted-foreground">
            Role-Based Accounting & Ledger System
          </p>
        </div>

        {/* Credentials Login Form */}
        <Card className="shadow-lg border">
          <CardHeader>
            <CardTitle className="text-lg font-bold">Sign In to SkyLedger</CardTitle>
            <CardDescription className="text-xs">
              Enter your account credentials to access your dashboard.
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
                    placeholder="Enter your registered email address"
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
                    placeholder="Enter your password"
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
                    <span>Log In</span>
                    <IconArrowRight className="h-4 w-4" />
                  </>
                )}
              </Button>
            </form>
          </CardContent>
          <CardFooter className="flex flex-col text-center border-t bg-muted/20 pt-3 pb-3 space-y-1.5">
            <p className="text-xs text-muted-foreground">
              Don&apos;t have a member account?{" "}
              <Link href="/register" className="font-semibold text-primary underline underline-offset-4 hover:text-primary/80">
                Register as Standard User
              </Link>
            </p>
          </CardFooter>
        </Card>
      </div>
    </div>
  )
}
