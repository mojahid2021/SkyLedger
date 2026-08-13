"use client"

import React, { useEffect, useState, useCallback } from "react"
import { useRouter } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { UserNavbar } from "@/components/user/user-navbar"
import { UserSidebar } from "@/components/user/user-sidebar"

export interface UserTransaction {
  id: number
  type: "credit" | "debit"
  amount: number | string
}

export default function UserDashboardPage() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const [activeSection, setActiveSection] = useState("dashboard")
  
  const [transactions, setTransactions] = useState<UserTransaction[]>([])
  const [loadingTxns, setLoadingTxns] = useState(true)

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

  let totalCredit = 0
  let totalDebit = 0
  transactions.forEach((t) => {
    const amt = typeof t.amount === "number" ? t.amount : parseFloat(t.amount) || 0
    if (t.type === "credit") totalCredit += amt
    else if (t.type === "debit") totalDebit += amt
  })
  const netBalance = totalCredit - totalDebit

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background font-sans text-slate-900">
      <UserNavbar />

      <div className="flex min-h-0 flex-1">
        <UserSidebar 
          activeTab={activeSection} 
          setActiveTab={(t) => {
            if (t === "wallet") router.push("/user/wallet")
            else if (t === "transactions") router.push("/user/transactions")
            else if (t === "trips") router.push("/user/trips")
            else setActiveSection(t)
          }} 
        />

        <main className="min-w-0 flex-1 overflow-y-auto bg-white">
          <div className="max-w-5xl mx-auto px-6 py-12 md:py-20 lg:px-12">
            
            <section className="mb-24">
              <header className="mb-16">
                <h1 className="text-5xl md:text-6xl tracking-tight font-medium text-slate-900 mb-4">
                  Welcome, {user.first_name}
                </h1>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-12 border-t border-slate-100 pt-16">
                 <div>
                   <span className="block text-sm font-medium text-slate-400 mb-3 tracking-tight">Net Treasury</span>
                   <div className="text-4xl md:text-5xl font-semibold tracking-tight text-slate-900">
                     {loadingTxns ? <div className="h-12 w-32 bg-slate-50 animate-pulse rounded" /> : `$${netBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                   </div>
                 </div>
                 <div>
                   <span className="block text-sm font-medium text-slate-400 mb-3 tracking-tight">Total Inflow</span>
                   <div className="text-3xl md:text-4xl font-medium tracking-tight text-emerald-600/80">
                     {loadingTxns ? <div className="h-10 w-28 bg-slate-50 animate-pulse rounded" /> : `$${totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                   </div>
                 </div>
                 <div>
                   <span className="block text-sm font-medium text-slate-400 mb-3 tracking-tight">Total Outflow</span>
                   <div className="text-3xl md:text-4xl font-medium tracking-tight text-slate-300">
                     {loadingTxns ? <div className="h-10 w-28 bg-slate-50 animate-pulse rounded" /> : `$${totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`}
                   </div>
                 </div>
              </div>
            </section>

          </div>
        </main>
      </div>
    </div>
  )
}
