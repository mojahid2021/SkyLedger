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
    <div className="flex h-dvh flex-col overflow-hidden bg-delta-canvas font-sans text-delta-ink">
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

        <main className="min-w-0 flex-1 overflow-y-auto bg-delta-canvas font-sans">
          <div className="w-full mx-auto px-6 py-12 md:py-16 lg:px-12">
            
            <section className="mb-16">
              <header className="mb-12 border-b border-delta-hairline pb-8">
                <h1 className="text-4xl md:text-5xl font-bold tracking-tight text-delta-navy mb-2">
                  Welcome, {user.first_name}
                </h1>
                <p className="text-delta-ink-muted text-sm font-medium">Manage your loyalty profile, transactions, and confirmed flight reservations.</p>
              </header>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                 <div className="bg-delta-canvas border border-delta-hairline rounded-sm p-6 shadow-none">
                   <span className="block text-[11px] font-bold text-delta-navy mb-3 uppercase tracking-wider select-none">Net Treasury Balance</span>
                   <div className="text-3xl md:text-4xl font-bold tracking-tight text-delta-navy">
                     {loadingTxns ? (
                       <div className="h-10 w-32 bg-delta-surface-1 animate-pulse rounded-sm" />
                     ) : (
                       `৳${netBalance.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                     )}
                   </div>
                 </div>
                 <div className="bg-delta-canvas border border-delta-hairline rounded-sm p-6 shadow-none">
                   <span className="block text-[11px] font-bold text-delta-navy mb-3 uppercase tracking-wider select-none">Total Lifetime Inflow</span>
                   <div className="text-3xl md:text-4xl font-bold tracking-tight text-delta-success">
                     {loadingTxns ? (
                       <div className="h-10 w-28 bg-delta-surface-1 animate-pulse rounded-sm" />
                     ) : (
                       `৳${totalCredit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                     )}
                   </div>
                 </div>
                 <div className="bg-delta-canvas border border-delta-hairline rounded-sm p-6 shadow-none">
                   <span className="block text-[11px] font-bold text-delta-navy mb-3 uppercase tracking-wider select-none">Total Lifetime Outflow</span>
                   <div className="text-3xl md:text-4xl font-bold tracking-tight text-delta-ink-muted">
                     {loadingTxns ? (
                       <div className="h-10 w-28 bg-delta-surface-1 animate-pulse rounded-sm" />
                     ) : (
                       `৳${totalDebit.toLocaleString("en-US", { minimumFractionDigits: 2 })}`
                     )}
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
