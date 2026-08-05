"use client"

import React from "react"
import { Users, Shield, Activity, UserPlus } from "lucide-react"

interface AdminStatsCardsProps {
  usersCount: number
  adminCount: number
  userCount: number
  newUsersThisMonth: number
}

/**
 * AdminStatsCards — hairline stat cards per DESIGN.md:
 * white canvas, 1px hairline border, 4px radius, uppercase micro-labels,
 * navy numerals, muted subtext. No shadows, no decorative color.
 */
export function AdminStatsCards({
  usersCount,
  adminCount,
  userCount,
  newUsersThisMonth,
}: AdminStatsCardsProps) {
  const stats = [
    {
      label: "Registered Users",
      icon: Users,
      value: String(usersCount),
      subtext: `${userCount} members · ${adminCount} admins`,
    },
    {
      label: "Admin Accounts",
      icon: Shield,
      value: String(adminCount),
      subtext: "Privileged access granted",
    },
    {
      label: "New Users This Month",
      icon: UserPlus,
      value: String(newUsersThisMonth),
      subtext: "Signed up since month start",
    },
    {
      label: "Active Sessions",
      icon: Activity,
      value: "1",
      subtext: "Current admin session",
    },
  ]

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      {stats.map((stat) => {
        const Icon = stat.icon
        return (
          <div
            key={stat.label}
            className="rounded-[4px] border border-delta-hairline bg-delta-canvas p-4"
          >
            <div className="flex items-center gap-1.5 text-[11px] font-[600] uppercase tracking-wider text-delta-ink-muted">
              <Icon className="h-3.5 w-3.5 text-delta-navy" />
              {stat.label}
            </div>
            <div className="mt-2 text-[28px] font-[700] leading-tight text-delta-navy">
              {stat.value}
            </div>
            <p className="mt-1 text-[12px] text-delta-ink-muted">{stat.subtext}</p>
          </div>
        )
      })}
    </div>
  )
}
