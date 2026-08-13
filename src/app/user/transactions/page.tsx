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
    <div className="flex h-dvh flex-col overflow-hidden bg-background font-sans text-slate-900">
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

        <main className="min-w-0 flex-1 overflow-y-auto bg-white">
          <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 lg:px-12">
            
            <header className="mb-16">
              <span className="block text-sm font-medium text-slate-500 mb-4 tracking-tight">Ledger Activity</span>
              <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                <div>
                  <h1 className="text-4xl md:text-5xl tracking-tight font-medium text-slate-900 mb-2">
                    Transactions
                  </h1>
                  <p className="text-slate-500 text-sm max-w-md leading-relaxed">
                    A chronological feed of all synchronised accounting events, wallet recharges, and purchases.
                  </p>
                </div>
                
                <button 
                  onClick={fetchTransactions} 
                  className="text-sm font-medium text-slate-400 hover:text-slate-900 transition-colors shrink-0"
                >
                   Refresh Feed
                </button>
              </div>
            </header>

            <section>
              {loadingTxns ? (
                 <div className="space-y-4">
                   {[1, 2, 3, 4, 5].map(i => <div key={i} className="h-16 bg-slate-50 rounded-lg animate-pulse" />)}
                 </div>
              ) : transactions.length === 0 ? (
                 <div className="pt-8 pb-16">
                   <p className="text-sm text-slate-400">No transactions recorded.</p>
                 </div>
              ) : (
                 <div className="flex flex-col">
                   {paginatedTxns.map((txn) => {
                     const isCredit = txn.type === "credit"
                     const val = typeof txn.amount === "number" ? txn.amount : parseFloat(txn.amount) || 0
                     return (
                       <div key={txn.id} className="flex items-start md:items-center justify-between py-6 border-b border-slate-50 group">
                         <div className="flex flex-col md:flex-row md:items-center gap-2 md:gap-8 lg:gap-16">
                           <div className="text-sm font-medium w-32 tracking-tight text-slate-500">{txn.date}</div>
                           <div>
                             <div className="text-base font-medium text-slate-900">{txn.description}</div>
                             <div className="text-xs font-medium text-slate-400 mt-1.5 uppercase tracking-widest">{txn.category} &middot; {txn.reference}</div>
                           </div>
                         </div>
                         <div className="flex flex-col items-end pl-4 shrink-0">
                           <div className={cn("text-base font-medium tracking-tight tabular-nums", isCredit ? "text-slate-900" : "text-slate-400")}>
                             {isCredit ? "+" : "-"}${val.toLocaleString("en-US", { minimumFractionDigits: 2 })}
                           </div>
                           {txn.status === "pending" && <span className="text-[10px] text-amber-500 uppercase tracking-widest mt-1">Pending</span>}
                           {txn.status === "failed" && <span className="text-[10px] text-rose-500 uppercase tracking-widest mt-1">Failed</span>}
                         </div>
                       </div>
                     )
                   })}
                 </div>
              )}

              {/* Pagination Controls */}
              {transactions.length > 0 && (
                <div className="flex flex-col sm:flex-row sm:items-center justify-between mt-8 pt-8 text-sm text-slate-400">
                  <div className="mb-4 sm:mb-0">
                    Showing <span className="font-medium text-slate-900">{startIndex + 1}</span> to <span className="font-medium text-slate-900">{endIndex}</span> of <span className="font-medium text-slate-900">{transactions.length}</span>
                  </div>
                  <div className="flex items-center gap-4">
                    <select
                      value={manualPageSize}
                      onChange={(e) => {
                        const val = e.target.value
                        setManualPageSize(val === "auto" ? "auto" : Number(val))
                        setCurrentPage(1)
                      }}
                      className="bg-slate-50 border-0 h-9 px-3 rounded-lg text-sm font-medium text-slate-600 focus:ring-1 focus:ring-slate-200"
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
                        className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
                      >
                        <ArrowLeft className="h-4 w-4" />
                      </button>
                      <button
                        onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                        disabled={validPage >= totalPages}
                        className="h-9 w-9 flex items-center justify-center rounded-lg border border-slate-100 bg-white text-slate-600 hover:bg-slate-50 disabled:opacity-50 transition-colors"
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
