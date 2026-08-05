"use client"

import React, { useEffect } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { IconBuildingBank, IconShieldCheck, IconUserCheck, IconArrowRight } from "@tabler/icons-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export default function RootPage() {
  const { user, role, isLoading, loginAsRole } = useAuth()
  const router = useRouter()

  useEffect(() => {
    if (!isLoading) {
      if (user) {
        if (role === "admin") {
          router.replace("/admin/dashboard")
        } else {
          router.replace("/user/dashboard")
        }
      }
    }
  }, [user, role, isLoading, router])

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Initializing SkyLedger Auth Router...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col items-center justify-center p-4">
      <Card className="max-w-md w-full text-center shadow-lg border">
        <CardHeader className="space-y-2">
          <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-xl bg-primary text-primary-foreground shadow-md">
            <IconBuildingBank className="h-7 w-7" />
          </div>
          <CardTitle className="text-2xl font-extrabold flex items-center justify-center gap-2">
            SkyLedger
            <Badge variant="secondary" className="text-xs">Role Portal</Badge>
          </CardTitle>
          <CardDescription className="text-xs">
            Redirecting to your dedicated role dashboard...
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-3">
          <Button
            className="w-full font-semibold gap-2"
            onClick={() => router.push("/login")}
          >
            <span>Go to Login Page</span>
            <IconArrowRight className="h-4 w-4" />
          </Button>

          <div className="pt-2 grid grid-cols-2 gap-2">
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold border-indigo-500/30 text-indigo-600 hover:bg-indigo-500/10"
              onClick={() => loginAsRole("admin")}
            >
              <IconShieldCheck className="h-3.5 w-3.5 mr-1" />
              Login as Admin
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="text-xs font-semibold border-emerald-500/30 text-emerald-600 hover:bg-emerald-500/10"
              onClick={() => loginAsRole("user")}
            >
              <IconUserCheck className="h-3.5 w-3.5 mr-1" />
              Login as User
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}
