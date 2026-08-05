"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconUser,
  IconShield,
  IconBuildingBank,
  IconReceipt,
  IconWallet,
  IconTrendingUp,
  IconTrendingDown,
  IconPlus,
  IconRefresh,
  IconLogout,
  IconFileText,
  IconCheck,
  IconArrowUpRight,
  IconArrowDownRight,
  IconDownload,
  IconDotsVertical,
  IconSearch,
  IconFilter,
} from "@tabler/icons-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { QuickTransactionDialog } from "@/components/quick-transaction-dialog"

export default function UserDashboardPage() {
  const { user, role, isLoading, logout } = useAuth()
  const router = useRouter()
  const [dialogOpen, setDialogOpen] = useState(false)

  useEffect(() => {
    if (!isLoading && !user) {
      router.replace("/login")
    }
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Loading User Session...
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background text-foreground flex flex-col font-sans">
      {/* Top Navbar for Standard User */}
      <header className="sticky top-0 z-40 border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="flex h-16 items-center justify-between px-4 sm:px-8 max-w-7xl mx-auto w-full">
          <div className="flex items-center gap-3">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-emerald-600 text-white shadow-md">
              <IconBuildingBank className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-lg font-bold tracking-tight flex items-center gap-2">
                SkyLedger Member Portal
                <Badge className="bg-emerald-600 text-white text-[11px]">
                  User Mode
                </Badge>
              </h1>
              <p className="text-xs text-muted-foreground">Treasury & Personal Financial Workspace</p>
            </div>
          </div>

          <div className="flex items-center gap-3">
            <div className="flex items-center gap-2 border-l pl-3">
              <Avatar className="h-8 w-8 border border-border">
                <AvatarFallback className="bg-emerald-500/10 text-emerald-600 font-bold">
                  {user.first_name?.[0]}{user.last_name?.[0]}
                </AvatarFallback>
              </Avatar>
              <div className="hidden md:flex flex-col text-left">
                <span className="text-xs font-bold leading-none">{user.first_name} {user.last_name}</span>
                <span className="text-[10px] text-muted-foreground">{user.email}</span>
              </div>
              <Button
                variant="ghost"
                size="icon"
                onClick={logout}
                title="Sign out"
                className="text-muted-foreground hover:text-destructive"
              >
                <IconLogout className="h-4 w-4" />
              </Button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content Area */}
      <main className="flex-1 p-4 sm:p-6 lg:p-8 space-y-6 max-w-7xl mx-auto w-full">
        {/* Welcome Banner */}
        <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/10 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-600 text-white">
              <IconUser className="h-5 w-5" />
            </div>
            <div>
              <h2 className="text-sm font-bold text-foreground flex items-center gap-2">
                Welcome back, {user.first_name}!
                <Badge variant="outline" className="text-[10px] border-emerald-500/40 text-emerald-700 dark:text-emerald-300">
                  Member
                </Badge>
              </h2>
              <p className="text-xs text-muted-foreground">
                Manage your Treasury account balances, submit expense requests, and view personal ledgers.
              </p>
            </div>
          </div>

          <Button
            size="sm"
            onClick={() => setDialogOpen(true)}
            className="bg-emerald-600 hover:bg-emerald-700 text-white gap-1.5 text-xs shrink-0"
          >
            <IconPlus className="h-3.5 w-3.5" />
            <span>New Transaction Entry</span>
          </Button>
        </div>

        {/* User Stats */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
          <Card className="shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Treasury Reserve Account
              </CardTitle>
              <IconWallet className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">$1,412,800.45</div>
              <span className="text-xs text-muted-foreground">Active balance in Bank of America</span>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Pending Expense Claims
              </CardTitle>
              <IconFileText className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">$1,250.75</div>
              <span className="text-xs text-muted-foreground">1 Claim awaiting manager approval</span>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Monthly Approved Invoices
              </CardTitle>
              <IconReceipt className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">14 Statements</div>
              <span className="text-xs text-muted-foreground">All vouchers verified & reconciled</span>
            </CardContent>
          </Card>
        </div>

        {/* My Activity & Ledger Table */}
        <Card className="shadow-xs">
          <CardHeader className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
            <div>
              <CardTitle className="text-base font-bold flex items-center gap-2">
                <IconReceipt className="h-5 w-5 text-emerald-600" />
                My Recent Ledger Activity
              </CardTitle>
              <CardDescription className="text-xs">
                Transactions initiated or authorized by your account.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" className="gap-1.5 text-xs">
              <IconDownload className="h-3.5 w-3.5" />
              Download My Statements
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                <TableRow>
                  <TableCell className="font-mono text-xs font-semibold text-emerald-600">REF-2026-0803</TableCell>
                  <TableCell className="font-medium text-sm">Executive Payroll Direct Deposit</TableCell>
                  <TableCell className="text-xs text-muted-foreground">Payroll Account - BoA</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs">Completed</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-sm text-emerald-600">
                    +$48,500.00
                  </TableCell>
                </TableRow>
                <TableRow>
                  <TableCell className="font-mono text-xs font-semibold text-emerald-600">REF-2026-0805</TableCell>
                  <TableCell className="font-medium text-sm">Office Supplies & Hardware Lease</TableCell>
                  <TableCell className="text-xs text-muted-foreground">Petty Cash Reserve</TableCell>
                  <TableCell>
                    <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs">Completed</Badge>
                  </TableCell>
                  <TableCell className="text-right font-mono font-bold text-sm text-foreground">
                    -$1,250.75
                  </TableCell>
                </TableRow>
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>

      <QuickTransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}
