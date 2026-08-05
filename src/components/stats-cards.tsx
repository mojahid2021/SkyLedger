"use client"

import React from "react"
import {
  IconWallet,
  IconTrendingUp,
  IconTrendingDown,
  IconPigMoney,
  IconReceipt,
  IconArrowUpRight,
  IconArrowDownRight,
  IconBuildingBank,
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function StatsCards() {
  const stats = [
    {
      title: "Total Ledger Balance",
      value: "$4,852,910.45",
      change: "+14.2%",
      isPositive: true,
      subtext: "vs. previous month",
      icon: IconWallet,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      title: "Monthly Revenue",
      value: "$842,120.00",
      change: "+8.5%",
      isPositive: true,
      subtext: "vs. $776,100 target",
      icon: IconTrendingUp,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      title: "Operational Expenses",
      value: "$218,450.30",
      change: "-3.1%",
      isPositive: true, // Lower expenses is positive
      subtext: "-$7,000 under budget",
      icon: IconTrendingDown,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      title: "Net Profit Margin",
      value: "$623,669.70",
      change: "+18.9%",
      isPositive: true,
      subtext: "74.05% margin rate",
      icon: IconPigMoney,
      color: "text-indigo-600 bg-indigo-50 dark:bg-indigo-950/40 dark:text-indigo-400",
    },
  ]

  return (
    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, idx) => {
        const Icon = stat.icon
        return (
          <Card key={idx} className="shadow-xs hover:shadow-md transition-shadow">
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium text-muted-foreground">
                {stat.title}
              </CardTitle>
              <div className={`p-2 rounded-lg ${stat.color}`}>
                <Icon className="h-5 w-5" />
              </div>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold tracking-tight">{stat.value}</div>
              <div className="flex items-center gap-1.5 mt-1 text-xs">
                <Badge
                  variant={stat.isPositive ? "default" : "destructive"}
                  className="px-1.5 py-0.5 text-[11px] font-medium flex items-center gap-0.5"
                >
                  {stat.isPositive ? (
                    <IconArrowUpRight className="h-3 w-3" />
                  ) : (
                    <IconArrowDownRight className="h-3 w-3" />
                  )}
                  {stat.change}
                </Badge>
                <span className="text-muted-foreground">{stat.subtext}</span>
              </div>
            </CardContent>
          </Card>
        )
      })}
    </div>
  )
}
