"use client"

import React, { useEffect, useState, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { UserNavbar } from "@/components/user/user-navbar"
import { UserSidebar } from "@/components/user/user-sidebar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogDescription, DialogTrigger } from "@/components/ui/dialog"
import { Loader2, ArrowDownLeft, ArrowUpRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface Transaction {
  id: number
  reference: string
  description: string
  category: string
  type: "credit" | "debit"
  amount: string
  status: string
  date: string
}

function WalletContent() {
  const { user, isLoading } = useAuth()
  const router = useRouter()
  const searchParams = useSearchParams()

  const statusParam = searchParams.get("status")
  const amountParam = searchParams.get("amount")
  const refParam = searchParams.get("ref")
  const errorParam = searchParams.get("error")

  const [walletBalance, setWalletBalance] = useState<number | null>(null)
  const [loadingBalance, setLoadingBalance] = useState<boolean>(true)

  // Transactions state
  const [transactions, setTransactions] = useState<Transaction[]>([])
  const [loadingTxs, setLoadingTxs] = useState(true)

  // Deposit state
  const [amountInput, setAmountInput] = useState<string>("")
  const [recharging, setRecharging] = useState<boolean>(false)
  const [rechargeSuccess, setRechargeSuccess] = useState<string | null>(null)
  const [rechargeError, setRechargeError] = useState<string | null>(null)
  const [depositOpen, setDepositOpen] = useState(false)

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState<string>("")
  const [withdrawing, setWithdrawing] = useState<boolean>(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)
  const [withdrawOpen, setWithdrawOpen] = useState(false)

  const fetchWalletBalance = useCallback(async () => {
    setLoadingBalance(true)
    try {
      const res = await fetch("/api/accounts")
      const data = await res.json()
      if (data.success && Array.isArray(data.data)) {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const userWallet = data.data.find((a: any) => a.user_id === user?.id)
        if (userWallet) {
          setWalletBalance(parseFloat(userWallet.balance || "0"))
        } else {
          setWalletBalance(0)
        }
      }
    } catch {
      setWalletBalance(0)
    } finally {
      setLoadingBalance(false)
    }
  }, [user?.id])

  const fetchTransactions = useCallback(async () => {
    if (!user?.id) return
    setLoadingTxs(true)
    try {
      const res = await fetch(`/api/transactions?userId=${user.id}`)
      const data = await res.json()
      if (data.success) {
        setTransactions(data.data)
      }
    } catch {
      // Background failure
    } finally {
      setLoadingTxs(false)
    }
  }, [user?.id])

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
      return
    }
    fetchWalletBalance()
    fetchTransactions()

    // Handle payment redirect parameters
    if (statusParam === "success") {
      // Re-fetch transactions instantly on success
      fetchTransactions()
      setRechargeSuccess(`Recharged $${Number(amountParam).toFixed(2)} to your wallet. Ref: ${refParam}`)
      setDepositOpen(true)
      router.replace("/user/wallet")
    } else if (statusParam === "fail") {
      setRechargeError(`Wallet recharge failed. Ref: ${refParam || "N/A"}`)
      setDepositOpen(true)
      router.replace("/user/wallet")
    } else if (statusParam === "cancel") {
      setRechargeError("Wallet recharge was cancelled.")
      setDepositOpen(true)
      router.replace("/user/wallet")
    } else if (statusParam === "error") {
      setRechargeError(errorParam || "An error occurred during payment verification.")
      setDepositOpen(true)
      router.replace("/user/wallet")
    }
  }, [user, isLoading, router, statusParam, amountParam, refParam, errorParam, fetchWalletBalance, fetchTransactions])

  const handleAddFunds = async (amount: number) => {
    if (!user?.id) return
    setRecharging(true)
    setRechargeSuccess(null)
    setRechargeError(null)

    try {
      const res = await fetch("/api/wallet/recharge/sslcommerz/initiate", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, amount }),
      })

      const data = await res.json()
      if (data.success && data.redirectUrl) {
        window.location.href = data.redirectUrl
      } else {
        setRechargeError(data.error || "Failed to initiate SSLCommerz payment.")
        setRecharging(false)
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setRechargeError("An error occurred while recharging: " + err.message)
      setRecharging(false)
    }
  }

  const handleWithdraw = async (amount: number) => {
    if (!user?.id) return
    setWithdrawing(true)
    setWithdrawSuccess(null)
    setWithdrawError(null)

    try {
      const res = await fetch("/api/wallet/withdraw", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ userId: user.id, amount, description: "Wallet Funds Withdrawn" }),
      })

      const data = await res.json()
      if (data.success) {
        setWalletBalance(data.data.newBalance)
        setWithdrawSuccess(`Successfully withdrew $${amount.toFixed(2)} from your wallet!`)
        setWithdrawAmount("")
        fetchTransactions()
      } else {
        setWithdrawError(data.error || "Failed to withdraw from wallet.")
      }
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    } catch (err: any) {
      setWithdrawError("An error occurred while withdrawing: " + err.message)
    } finally {
      setWithdrawing(false)
    }
  }

  const depositPresets = [50, 100, 250, 500, 1000, 2000]
  const withdrawPresets = [25, 50, 100, 250, 500, 1000]

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background font-sans text-slate-900">
      <UserNavbar />

      <div className="flex min-h-0 flex-1">
        <UserSidebar 
          activeTab="wallet" 
          setActiveTab={(t) => {
            if (t === "transactions") router.push("/user/transactions")
            else if (t === "trips") router.push("/user/trips")
            else if (t !== "wallet") router.push("/user/dashboard")
          }} 
        />

        <main className="min-w-0 flex-1 overflow-y-auto bg-white">
          <div className="max-w-3xl mx-auto px-6 py-12 md:py-24 lg:px-8">
            
            <header className="mb-12">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-8">
                  <div>
                    <span className="block text-sm font-medium text-slate-500 mb-3 tracking-tight">Available Balance</span>
                    {loadingBalance ? (
                      <div className="animate-pulse h-16 w-48 bg-slate-100 rounded-md"></div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-4">
                        <h1 className="text-6xl md:text-8xl tracking-[-0.04em] font-semibold text-slate-900 leading-none">
                          ${walletBalance !== null ? Math.floor(walletBalance).toString() : "0"}
                          <span className="text-4xl md:text-6xl text-slate-300">
                            .{walletBalance !== null ? (walletBalance % 1).toFixed(2).substring(2) : "00"}
                          </span>
                        </h1>
                      </div>
                    )}
                  </div>
                  
                  <div className="flex items-center gap-3">
                     {/* Deposit Sub-view Dialog */}
                     <Dialog open={depositOpen} onOpenChange={setDepositOpen}>
                       <DialogTrigger asChild>
                         <button className="h-10 px-6 rounded-full bg-slate-900 text-white text-sm font-medium transition-transform hover:scale-[0.98] active:scale-[0.95]">
                           Deposit
                         </button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-md border-0 shadow-2xl p-6 rounded-2xl bg-white">
                          <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl font-medium tracking-tight">Deposit Funds</DialogTitle>
                            <DialogDescription>Top up your balance instantly via secure transfer.</DialogDescription>
                          </DialogHeader>
                          
                          <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-2">
                              {depositPresets.map((amt) => {
                                const isSelected = amountInput === amt.toString()
                                return (
                                  <button
                                    key={amt}
                                    type="button"
                                    disabled={recharging}
                                    onClick={() => setAmountInput(amt.toString())}
                                    className={cn(
                                      "h-12 flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                                      isSelected ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 hover:bg-slate-100 text-slate-700",
                                      "disabled:opacity-50 disabled:cursor-not-allowed"
                                    )}
                                  >
                                    ${amt}
                                  </button>
                                )
                              })}
                            </div>

                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                <Input
                                  type="number"
                                  placeholder="Custom"
                                  disabled={recharging}
                                  value={amountInput}
                                  onChange={(e) => setAmountInput(e.target.value)}
                                  className="pl-8 h-12 bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-slate-300 text-base font-medium rounded-lg shadow-none"
                                />
                              </div>
                              <Button
                                disabled={recharging || !amountInput || isNaN(Number(amountInput)) || Number(amountInput) <= 0}
                                onClick={() => handleAddFunds(Number(amountInput))}
                                className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-none font-medium transition-colors"
                              >
                                {recharging ? <Loader2 className="h-4 w-4 animate-spin" /> : "Next"}
                              </Button>
                            </div>

                            {rechargeSuccess && (
                              <div className="text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg">
                                {rechargeSuccess}
                              </div>
                            )}
                            {rechargeError && (
                              <div className="text-sm font-medium text-rose-700 bg-rose-50 px-4 py-3 rounded-lg">
                                {rechargeError}
                              </div>
                            )}
                          </div>
                       </DialogContent>
                     </Dialog>

                     {/* Withdraw Sub-view Dialog */}
                     <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                       <DialogTrigger asChild>
                         <button className="h-10 px-6 rounded-full bg-slate-100 text-slate-900 text-sm font-medium transition-transform hover:scale-[0.98] active:scale-[0.95]">
                           Withdraw
                         </button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-md border-0 shadow-2xl p-6 rounded-2xl bg-white">
                          <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl font-medium tracking-tight">Withdraw Funds</DialogTitle>
                            <DialogDescription>Transfer funds back to your primary bank account.</DialogDescription>
                          </DialogHeader>

                          <div className="space-y-6">
                            <div className="grid grid-cols-3 gap-2">
                              {withdrawPresets.map((amt) => {
                                const isDisabled = withdrawing || (walletBalance !== null && walletBalance < amt)
                                const isSelected = withdrawAmount === amt.toString()
                                return (
                                  <button
                                    key={amt}
                                    type="button"
                                    disabled={isDisabled}
                                    onClick={() => setWithdrawAmount(amt.toString())}
                                    className={cn(
                                      "h-12 flex items-center justify-center rounded-lg text-sm font-medium transition-colors",
                                      isSelected ? "bg-slate-900 text-white shadow-sm" : "bg-slate-50 hover:bg-slate-100 text-slate-700",
                                      isDisabled && "opacity-50 hover:bg-slate-50 cursor-not-allowed text-slate-400"
                                    )}
                                  >
                                    ${amt}
                                  </button>
                                )
                              })}
                            </div>

                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-slate-400 font-medium">$</span>
                                <Input
                                  type="number"
                                  placeholder="Custom"
                                  disabled={withdrawing}
                                  value={withdrawAmount}
                                  onChange={(e) => setWithdrawAmount(e.target.value)}
                                  className="pl-8 h-12 bg-slate-50 border-0 focus-visible:ring-1 focus-visible:ring-slate-300 text-base font-medium rounded-lg shadow-none"
                                />
                              </div>
                              <Button
                                disabled={withdrawing || !withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0 || (walletBalance !== null && walletBalance < Number(withdrawAmount))}
                                onClick={() => handleWithdraw(Number(withdrawAmount))}
                                className="h-12 px-6 bg-slate-900 hover:bg-slate-800 text-white rounded-lg shadow-none font-medium transition-colors"
                              >
                                {withdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Next"}
                              </Button>
                            </div>

                            {withdrawSuccess && (
                              <div className="text-sm font-medium text-emerald-700 bg-emerald-50 px-4 py-3 rounded-lg">
                                {withdrawSuccess}
                              </div>
                            )}
                            {withdrawError && (
                              <div className="text-sm font-medium text-rose-700 bg-rose-50 px-4 py-3 rounded-lg">
                                {withdrawError}
                              </div>
                            )}
                          </div>
                       </DialogContent>
                     </Dialog>
                  </div>
               </div>
            </header>

            {/* Transactions Feed */}
            <section className="pt-16 border-t border-slate-100">
              <h2 className="text-lg font-medium tracking-tight mb-8 text-slate-900">Recent Activity</h2>
              
              {loadingTxs ? (
                 <div className="space-y-6">
                   {[1, 2, 3].map(i => <div key={i} className="h-12 bg-slate-50 animate-pulse rounded-lg" />)}
                 </div>
              ) : transactions.length === 0 ? (
                 <p className="text-sm text-slate-400">No recent transactions.</p>
              ) : (
                 <div className="flex flex-col gap-6">
                   {transactions.map(tx => (
                     <div key={tx.id} className="flex items-center justify-between group">
                       <div className="flex items-center gap-4">
                         <div className={cn(
                           "flex h-10 w-10 items-center justify-center rounded-full shrink-0",
                           tx.type === "credit" ? "bg-emerald-50 text-emerald-600" : "bg-slate-50 text-slate-600"
                         )}>
                           {tx.type === "credit" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                         </div>
                         <div>
                           <p className="text-sm font-medium text-slate-900">{tx.description}</p>
                           <p className="text-xs text-slate-400 mt-0.5">{tx.date} &middot; {tx.reference}</p>
                         </div>
                       </div>
                       <div className={cn(
                         "text-sm font-medium tabular-nums text-right",
                         tx.type === "credit" ? "text-emerald-600" : "text-slate-900"
                       )}>
                         {tx.type === "credit" ? "+" : "-"}${Number(tx.amount).toFixed(2)}
                         {tx.status === "pending" && <span className="block text-[10px] text-amber-500 uppercase tracking-wider mt-0.5">Pending</span>}
                         {tx.status === "failed" && <span className="block text-[10px] text-rose-500 uppercase tracking-wider mt-0.5">Failed</span>}
                       </div>
                     </div>
                   ))}
                 </div>
              )}
            </section>

          </div>
        </main>
      </div>
    </div>
  )
}

export default function UserWalletPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex items-center justify-center bg-background text-muted-foreground text-sm">
        Loading Wallet Context...
      </div>
    }>
      <WalletContent />
    </Suspense>
  )
}
