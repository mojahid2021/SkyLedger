"use client"

import React, { useState } from "react"
import {
  IconSearch,
  IconFilter,
  IconDownload,
  IconDotsVertical,
  IconArrowUpRight,
  IconArrowDownRight,
  IconCircleCheck,
  IconClock,
  IconAlertTriangle,
  IconBuildingBank,
  IconCreditCard,
  IconCash,
  IconReceipt,
  IconEye,
  IconFileExport,
  IconTrash,
  IconChevronLeft,
  IconChevronRight,
} from "@tabler/icons-react"

import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

export interface Transaction {
  id: number
  reference: string
  description: string
  category: string
  account: string
  type: "credit" | "debit"
  amount: number
  status: "completed" | "pending" | "failed"
  date: string
}

export function TransactionsTable() {
  const [search, setSearch] = useState("")
  const [statusFilter, setStatusFilter] = useState("all")
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loading, setLoading] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const pageSize = 5

  React.useEffect(() => {
    fetch("/api/transactions")
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTransactions(data.data)
        }
      })
      .catch((err) => console.log("Failed to fetch transactions", err))
      .finally(() => setLoading(false))
  }, [])

  const filteredTransactions = transactions.filter((txn) => {
    const matchesSearch =
      txn.description.toLowerCase().includes(search.toLowerCase()) ||
      txn.reference.toLowerCase().includes(search.toLowerCase()) ||
      String(txn.id).includes(search) ||
      txn.category.toLowerCase().includes(search.toLowerCase())

    const matchesStatus =
      statusFilter === "all" || txn.status === statusFilter

    return matchesSearch && matchesStatus
  })

  const totalPages = Math.ceil(filteredTransactions.length / pageSize) || 1
  const validPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (validPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, filteredTransactions.length)
  const paginatedTxns = filteredTransactions.slice(startIndex, endIndex)

  return (
    <div className="space-y-4">
      {/* Search and Filters */}
      <div className="flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3">
        <div className="flex items-center gap-2 flex-1 max-w-md">
          <div className="relative w-full">
            <IconSearch className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
            <Input
              placeholder="Filter by description, reference, ID or category..."
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              className="pl-9 h-9 text-sm"
            />
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Select value={statusFilter} onValueChange={setStatusFilter}>
            <SelectTrigger className="w-[140px] h-9 text-xs">
              <IconFilter className="h-3.5 w-3.5 mr-1.5 text-muted-foreground" />
              <SelectValue placeholder="All Status" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Status</SelectItem>
              <SelectItem value="completed">Completed</SelectItem>
              <SelectItem value="pending">Pending</SelectItem>
              <SelectItem value="failed">Failed</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" className="h-9 gap-1.5 text-xs">
            <IconDownload className="h-3.5 w-3.5" />
            <span>Export CSV</span>
          </Button>
        </div>
      </div>

      {/* Table */}
      <div className="rounded-xl border bg-card overflow-hidden shadow-xs">
        <Table>
          <TableHeader className="bg-muted/40">
            <TableRow>
              <TableHead className="w-[120px]">TXN ID</TableHead>
              <TableHead>Description & Reference</TableHead>
              <TableHead>Category</TableHead>
              <TableHead>Ledger Account</TableHead>
              <TableHead>Status</TableHead>
              <TableHead className="text-right">Amount</TableHead>
              <TableHead className="w-[50px]"></TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {filteredTransactions.length === 0 ? (
              <TableRow>
                <TableCell colSpan={7} className="text-center py-8 text-muted-foreground">
                  <div className="flex flex-col items-center justify-center gap-2">
                    <IconReceipt className="h-8 w-8 text-muted-foreground/50" />
                    <p className="text-sm font-medium">No matching transactions found</p>
                  </div>
                </TableCell>
              </TableRow>
            ) : (
              paginatedTxns.map((txn) => (
                <TableRow key={txn.id} className="hover:bg-muted/30 transition-colors">
                  <TableCell className="font-mono text-xs font-semibold text-primary">
                    {txn.id}
                  </TableCell>
                  <TableCell>
                    <div className="flex flex-col">
                      <span className="font-medium text-sm text-foreground">
                        {txn.description}
                      </span>
                      <span className="text-xs text-muted-foreground font-mono">
                        {txn.reference} • {txn.date}
                      </span>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge variant="outline" className="text-xs font-normal">
                      {txn.category}
                    </Badge>
                  </TableCell>
                  <TableCell className="text-xs text-muted-foreground">
                    <div className="flex items-center gap-1.5">
                      <IconBuildingBank className="h-3.5 w-3.5 text-muted-foreground/70" />
                      <span>{txn.account}</span>
                    </div>
                  </TableCell>
                  <TableCell>
                    {txn.status === "completed" && (
                      <Badge className="bg-emerald-500/15 text-emerald-700 dark:text-emerald-300 hover:bg-emerald-500/20 border-emerald-500/20 text-xs gap-1 font-medium">
                        <IconCircleCheck className="h-3 w-3" />
                        Completed
                      </Badge>
                    )}
                    {txn.status === "pending" && (
                      <Badge className="bg-amber-500/15 text-amber-700 dark:text-amber-300 hover:bg-amber-500/20 border-amber-500/20 text-xs gap-1 font-medium">
                        <IconClock className="h-3 w-3 animate-spin" />
                        Pending
                      </Badge>
                    )}
                    {txn.status === "failed" && (
                      <Badge variant="destructive" className="text-xs gap-1 font-medium">
                        <IconAlertTriangle className="h-3 w-3" />
                        Failed
                      </Badge>
                    )}
                  </TableCell>
                  <TableCell className="text-right font-mono font-semibold text-sm">
                    <span
                      className={
                        txn.type === "credit"
                          ? "text-emerald-600 dark:text-emerald-400"
                          : "text-foreground"
                      }
                    >
                      {txn.type === "credit" ? "+" : "-"}
                      ৳{txn.amount.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                    </span>
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" size="icon" className="h-8 w-8">
                          <IconDotsVertical className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Actions</DropdownMenuLabel>
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <IconEye className="h-4 w-4 text-muted-foreground" />
                          View Entry Details
                        </DropdownMenuItem>
                        <DropdownMenuItem className="gap-2 cursor-pointer">
                          <IconFileExport className="h-4 w-4 text-muted-foreground" />
                          Download Receipt
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem className="gap-2 cursor-pointer text-destructive focus:text-destructive">
                          <IconTrash className="h-4 w-4" />
                          Void Transaction
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      {filteredTransactions.length > 0 && (
        <div className="flex items-center justify-between border-t pt-3 text-xs text-muted-foreground">
          <div>
            Showing <span className="font-semibold text-foreground">{startIndex + 1}</span> to{" "}
            <span className="font-semibold text-foreground">{endIndex}</span> of{" "}
            <span className="font-semibold text-foreground">{filteredTransactions.length}</span> entries
          </div>
          <div className="flex items-center gap-2">
            <span className="mr-2 font-medium">
              Page {validPage} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.max(p - 1, 1))}
              disabled={validPage <= 1}
              className="h-8 w-8 p-0"
            >
              <IconChevronLeft className="h-4 w-4" />
            </Button>
            <Button
              size="sm"
              variant="outline"
              onClick={() => setCurrentPage((p) => Math.min(p + 1, totalPages))}
              disabled={validPage >= totalPages}
              className="h-8 w-8 p-0"
            >
              <IconChevronRight className="h-4 w-4" />
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
