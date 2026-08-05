"use client"

import React, { useEffect, useState } from "react"
import {
  IconWallet,
  IconTrendingUp,
  IconTrendingDown,
  IconPigMoney,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

export function StatsCards() {
  const [data, setData] = useState<{
    totalCredit: number
    totalDebit: number
    netBalance: number
    count: number
  }>({
    totalCredit: 0,
    totalDebit: 0,
    netBalance: 0,
    count: 0,
  })

  useEffect(() => {
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((resData) => {
        if (resData.success && Array.isArray(resData.data)) {
          let credit = 0
          let debit = 0
          resData.data.forEach((t: any) => {
            const amt = parseFloat(t.amount) || 0
            if (t.type === "credit") credit += amt
            else if (t.type === "debit") debit += amt
          })
          setData({
            totalCredit: credit,
            totalDebit: debit,
            netBalance: credit - debit,
            count: resData.data.length,
          })
        }
      })
      .catch((err) => console.log("Failed to fetch stats", err))
  }, [])

  const stats = [
    {
      title: "Net Balance",
      value: `$${data.netBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      change: "Live",
      isPositive: data.netBalance >= 0,
      subtext: `${data.count} total ledger entries`,
      icon: IconWallet,
      color: "text-blue-600 bg-blue-50 dark:bg-blue-950/40 dark:text-blue-400",
    },
    {
      title: "Total Revenue (Credit)",
      value: `$${data.totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      change: "Live",
      isPositive: true,
      subtext: "Calculated from database",
      icon: IconTrendingUp,
      color: "text-emerald-600 bg-emerald-50 dark:bg-emerald-950/40 dark:text-emerald-400",
    },
    {
      title: "Total Expenses (Debit)",
      value: `$${data.totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`,
      change: "Live",
      isPositive: false,
      subtext: "Calculated from database",
      icon: IconTrendingDown,
      color: "text-amber-600 bg-amber-50 dark:bg-amber-950/40 dark:text-amber-400",
    },
    {
      title: "Ledger Entries Recorded",
      value: `${data.count}`,
      change: "Live",
      isPositive: true,
      subtext: "Real-time records",
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
