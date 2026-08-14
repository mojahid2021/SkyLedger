"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { UserNavbar } from "@/components/user/user-navbar"
import { UserSidebar } from "@/components/user/user-sidebar"
import { useAutoPageSize } from "@/hooks/use-auto-page-size"
import { ArrowLeft, ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"
// Use Lucide icons instead of Tabler for the arrow markers matching anti-slop
import { ArrowDownLeft, ArrowUpRight } from "lucide-react"

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

export default function UserTransactionsPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  
  const [transactions, setTransactions] = useState<UserTransaction[]>([])
  const [loadingTxns, setLoadingTxns] = useState(true)
  const [currentPage, setCurrentPage] = useState(1)
  const [manualPageSize, setManualPageSize] = useState<number | "auto">("auto")

  const autoPageSize = useAutoPageSize(80, 280, 6)
  const pageSize = manualPageSize === "auto" ? autoPageSize : manualPageSize

  const fetchTransactions = useCallback(() => {
    if (!user?.id) return
    setLoadingTxns(true)
    fetch(`/api/transactions?userId=${user.id}`)
      .then((res) => res.json())
      .then((data) => {
        if (data.success && Array.isArray(data.data)) {
          setTransactions(data.data)
        }
      })
      .catch((err) => console.log("Failed to fetch transactions", err))
      .finally(() => setLoadingTxns(false))
  }, [user?.id])

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
      return
    }
    
    fetchTransactions()
  }, [user, isLoading, router, fetchTransactions])

  if (isLoading || !user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-background text-slate-500 text-sm">
        Loading Context...
      </div>
    )
  }

  const totalPages = Math.ceil(transactions.length / pageSize) || 1
  const validPage = Math.min(Math.max(currentPage, 1), totalPages)
  const startIndex = (validPage - 1) * pageSize
  const endIndex = Math.min(startIndex + pageSize, transactions.length)
  const paginatedTxns = transactions.slice(startIndex, endIndex)

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-delta-canvas font-sans text-delta-ink">
      <UserNavbar />

      <div className="flex min-h-0 flex-1">
        <UserSidebar 
          activeTab="transactions" 
          setActiveTab={(t) => {
            if (t === "wallet") router.push("/user/wallet")
            else if (t === "trips") router.push("/user/trips")
            else if (t !== "transactions") router.push("/user/dashboard")
          }} 
        />

        <main className="min-w-0 flex-1 overflow-y-auto bg-delta-canvas font-sans">
          <div className="w-full mx-auto px-6 py-12 md:py-16 lg:px-12">
            
            <header className="mb-12 border-b border-delta-hairline pb-8">
              <span className="block text-[11px] font-bold text-delta-navy-mid mb-3 uppercase tracking-wider select-none">Ledger Activity</span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                <div>
                  <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-delta-navy mb-2">
                    Transactions
                  </h1>
                  <p className="text-delta-ink-muted text-sm font-medium max-w-md leading-relaxed">
                    A chronological feed of all synchronized accounting events, wallet recharges, and purchases.
                  </p>
                </div>
                
                <button 
                  onClick={fetchTransactions} 
                  className="text-sm font-bold text-delta-navy-mid hover:text-delta-navy transition-colors shrink-0 cursor-pointer select-none"
                >
                   Refresh Feed
                </button>
              </div>
            </header>

            <section>
              {loadingTxns ? (
                 <div className="space-y-3">
                   {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-14 bg-delta-surface-1 border border-delta-hairline rounded-sm animate-pulse" />)}
                 </div>
              ) : transactions.length === 0 ? (
                 <div className="pt-8 pb-16">
                   <p className="text-sm font-medium text-delta-ink-muted">No transactions recorded.</p>
                 </div>
              ) : (
                 <div className="border border-delta-hairline rounded-sm overflow-hidden bg-delta-canvas">
                    {paginatedTxns.map((txn, index) => {
                      const isCredit = txn.type === "credit"
                      const val = typeof txn.amount === "number" ? txn.amount : parseFloat(txn.amount) || 0
                      return (
                        <div 
                          key={txn.id} 
                          className={cn(
                            "flex items-start md:items-center justify-between py-4 px-5 border-b border-delta-hairline transition-colors last:border-0",
                            index % 2 === 0 ? "bg-delta-canvas" : "bg-delta-surface-1/50"
                          )}
                        >
                          <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 lg:gap-16">
                            <div className="text-xs font-bold w-32 tracking-tight text-delta-ink-muted">{txn.date}</div>
                            <div>
                              <div className="text-base font-bold text-delta-navy">{txn.description}</div>
                              <div className="text-[10px] font-bold text-delta-ink-muted mt-1 uppercase tracking-widest">{txn.category} &middot; {txn.reference}</div>
                            </div>
                          </div>
                          <div className="flex flex-col items-end pl-4 shrink-0">
                            <div className={cn("text-base font-bold tracking-tight tabular-nums", isCredit ? "text-delta-success" : "text-delta-navy")}>
                              {isCredit ? "+" : "-"}৳{val.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                            </div>
                            {txn.status === "pending" && <span className="text-[10px] text-delta-warning font-bold uppercase tracking-widest mt-1">Pending</span>}
                            {txn.status === "failed" && <span className="text-[10px] text-delta-error font-bold uppercase tracking-widest mt-1">Failed</span>}
                          </div>
                        </div>
                      )
                    })}
                 </div>
              )}

              {/* Pagination Controls */}
              {transactions.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 pt-6 border-t border-delta-hairline text-sm text-delta-ink-muted">
                  <div className="mb-4 sm:mb-0 font-medium">
                    Showing <span className="font-bold text-delta-navy">{startIndex + 1}</span> to <span className="font-bold text-delta-navy">{endIndex}</span> of <span className="font-bold text-delta-navy">{transactions.length}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={manualPageSize}
                      onChange={(e) => {
                        const val = e.target.value
                        setManualPageSize(val === "auto" ? "auto" : Number(val))
                        setCurrentPage(1)
                      }}
                      className="bg-delta-surface-1 border border-delta-hairline h-9 px-3 rounded-sm text-xs font-bold text-delta-navy focus:outline-none cursor-pointer"
                    >
                      <option value="auto">Auto ({autoPageSize})</option>
                      <option value={5}>5 Rows</option>
                      <option value={10}>10 Rows</option>
                      <option value={20}>20 Rows</option>
                    </select>
                    
                    <div className="flex gap-2">
                       <button
                         onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                         disabled={validPage <= 1}
                         className="h-9 w-9 flex items-center justify-center rounded-sm border border-delta-hairline bg-delta-canvas text-delta-navy hover:bg-delta-surface-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                       >
                         <ArrowLeft className="h-4 w-4" />
                       </button>
                       <button
                         onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                         disabled={validPage >= totalPages}
                         className="h-9 w-9 flex items-center justify-center rounded-sm border border-delta-hairline bg-delta-canvas text-delta-navy hover:bg-delta-surface-1 disabled:opacity-30 disabled:cursor-not-allowed transition-colors cursor-pointer"
                       >
                         <ArrowRight className="h-4 w-4" />
                       </button>
                    </div>
                  </div>
                </div>
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  )
}
