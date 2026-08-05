"use client"

import React, { useEffect, useState } from "react"
import { useRouter } from "next/navigation"
import {
  IconUser,
  IconBuildingBank,
  IconReceipt,
  IconWallet,
  IconTrendingUp,
  IconTrendingDown,
  IconPlus,
  IconLogout,
  IconFileText,
  IconDownload,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"

import { useAuth } from "@/context/auth-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Avatar, AvatarFallback } from "@/components/ui/avatar"
import { UserNavbar } from "@/components/user/user-navbar"
import { UserSidebar } from "@/components/user/user-sidebar"
import { QuickTransactionDialog } from "@/components/quick-transaction-dialog"
import { useAutoPageSize } from "@/hooks/use-auto-page-size"

export interface UserTransaction {
  id: number
  reference: string
  description: string
  category: string
  account?: string
  type: "credit" | "debit"
  amount: number | string
  status: "completed" | "pending" | "failed"
  date: string
}

export default function UserDashboardPage() {
  const { user, isLoading, logout } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("dashboard")
  const [dialogOpen, setDialogOpen] = useState(false)
  const [transactions, setTransactions] = useState<UserTransaction[]>([])
  const [loadingTxns, setLoadingTxns] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [manualPageSize, setManualPageSize] = useState<number | "auto">("auto")

  // Auto-detect optimal page size based on viewport height
  const autoPageSize = useAutoPageSize(56, 380, 5)
  const pageSize = manualPageSize === "auto" ? autoPageSize : manualPageSize

  const fetchTransactions = () => {
    setLoadingTxns(true)
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTransactions(data.data)
        }
      })
      .catch((err) => console.log("Failed to fetch transactions", err))
      .finally(() => setLoadingTxns(false))
  }

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
      return
    }
    fetchTransactions()
  }, [user, isLoading, router])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Loading User Session...
      </div>
    )
  }

  // Calculate real balances from database transactions
  let totalCredit = 0
  let totalDebit = 0
  transactions.forEach((t) => {
    const amt = typeof t.amount === "number" ? t.amount : parseFloat(t.amount) || 0
    if (t.type === "credit") totalCredit += amt
    else if (t.type === "debit") totalDebit += amt
  })
  const netBalance = totalCredit - totalDebit

  const totalPages = Math.ceil(transactions.length / pageSize) || 1
  const validPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (validPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, transactions.length)
  const paginatedTxns = transactions.slice(startIndex, endIndex)

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background font-sans text-foreground">
      <UserNavbar />

      <div className="flex min-h-0 flex-1">
        <UserSidebar activeTab={activeSection} setActiveTab={setActiveSection} />

        <main className="min-w-0 flex-1 overflow-y-auto">
          <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
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
                Net Balance
              </CardTitle>
              <IconWallet className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">
                ${netBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-muted-foreground">Calculated from live database</span>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Total Credit (Revenue)
              </CardTitle>
              <IconTrendingUp className="h-4 w-4 text-emerald-600" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">
                ${totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-muted-foreground">Total credit entries</span>
            </CardContent>
          </Card>

          <Card className="shadow-xs">
            <CardHeader className="p-4 pb-2 flex flex-row items-center justify-between">
              <CardTitle className="text-xs font-semibold text-muted-foreground uppercase">
                Total Debit (Expenses)
              </CardTitle>
              <IconTrendingDown className="h-4 w-4 text-amber-500" />
            </CardHeader>
            <CardContent className="p-4 pt-0">
              <div className="text-2xl font-bold">
                ${totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}
              </div>
              <span className="text-xs text-muted-foreground">Total debit entries</span>
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
                Transactions recorded in the central database.
              </CardDescription>
            </div>
            <Button variant="outline" size="sm" onClick={fetchTransactions} className="gap-1.5 text-xs">
              <IconDownload className="h-3.5 w-3.5" />
              Refresh Activity
            </Button>
          </CardHeader>
          <CardContent>
            <Table>
              <TableHeader className="bg-muted/40">
                <TableRow>
                  <TableHead>Reference</TableHead>
                  <TableHead>Description</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Account</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead className="text-right">Amount</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {loadingTxns ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                      Loading transactions...
                    </TableCell>
                  </TableRow>
                ) : transactions.length === 0 ? (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-6 text-xs text-muted-foreground">
                      No transactions recorded in database yet.
                    </TableCell>
                  </TableRow>
                ) : (
                  paginatedTxns.map((txn) => {
                    const isCredit = txn.type === "credit"
                    const val = typeof txn.amount === "number" ? txn.amount : parseFloat(txn.amount) || 0
                    return (
                      <TableRow key={txn.id}>
                        <TableCell className="font-mono text-xs font-semibold text-emerald-600">
                          {txn.reference}
                        </TableCell>
                        <TableCell className="font-medium text-sm">{txn.description}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{txn.category}</TableCell>
                        <TableCell className="text-xs text-muted-foreground">{txn.account || "Treasury Account"}</TableCell>
                        <TableCell>
                          <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 text-xs">
                            {txn.status || "Completed"}
                          </Badge>
                        </TableCell>
                        <TableCell
                          className={`text-right font-mono font-bold text-sm ${
                            isCredit ? "text-emerald-600" : "text-foreground"
                          }`}
                        >
                          {isCredit ? "+" : "-"}${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                        </TableCell>
                      </TableRow>
                    )
                  })
                )}
              </TableBody>
            </Table>
            {transactions.length > 0 && (
              <div className="flex flex-col gap-3 border-t pt-3 mt-3 text-xs text-muted-foreground sm:flex-row sm:items-center sm:justify-between">
                <div className="flex items-center gap-4">
                  <div>
                    Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
                    <span className="font-semibold text-foreground">{endIndex}</span> of{" "}
                    <span className="font-semibold text-foreground">{transactions.length}</span> transactions
                  </div>
                  <div className="flex items-center gap-1.5">
                    <span className="text-[11px]">Rows:</span>
                    <select
                      value={manualPageSize}
                      onChange={(e) => {
                        const val = e.target.value
                        setManualPageSize(val === "auto" ? "auto" : Number(val))
                        setCurrentPage(1)
                      }}
                      className="h-7 rounded-md border bg-background px-2 text-xs font-medium text-foreground focus:outline-none"
                    >
                      <option value="auto">Auto ({autoPageSize})</option>
                      <option value={5}>5</option>
                      <option value={10}>10</option>
                      <option value={25}>25</option>
                    </select>
                  </div>
                </div>

                <div className="flex items-center gap-1.5">
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
                    disabled={validPage <= 1}
                    className="h-7 gap-1 px-2 text-xs"
                  >
                    <IconChevronLeft className="h-3.5 w-3.5" />
                    <span>Prev</span>
                  </Button>

                  {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
                    <button
                      key={page}
                      type="button"
                      onClick={() => setCurrentPage(page)}
                      className={`flex h-7 w-7 items-center justify-center rounded-md border text-xs font-medium transition-colors ${
                        page === validPage
                          ? "bg-primary text-primary-foreground border-primary"
                          : "bg-background text-foreground hover:bg-muted"
                      }`}
                    >
                      {page}
                    </button>
                  ))}

                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
                    disabled={validPage >= totalPages}
                    className="h-7 gap-1 px-2 text-xs"
                  >
                    <span>Next</span>
                    <IconChevronRight className="h-3.5 w-3.5" />
                  </Button>
                </div>
              </div>
            )}
          </CardContent>
        </Card>
        </div>
      </main>
      </div>

      <QuickTransactionDialog open={dialogOpen} onOpenChange={setDialogOpen} />
    </div>
  )
}