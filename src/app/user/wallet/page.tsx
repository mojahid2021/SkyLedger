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
      setRechargeSuccess(`Recharged ৳${Number(amountParam).toFixed(2)} to your wallet. Ref: ${refParam}`)
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
        setWithdrawSuccess(`Successfully withdrew ৳${amount.toFixed(2)} from your wallet!`)
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
    <div className="flex h-dvh flex-col overflow-hidden bg-delta-canvas font-sans text-delta-ink">
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

        <main className="min-w-0 flex-1 overflow-y-auto bg-delta-canvas">
          <div className="w-full mx-auto px-6 py-12 md:py-16 lg:px-8">
            
            <header className="mb-12 border-b border-delta-hairline pb-8">
               <div className="flex flex-col md:flex-row md:items-end justify-between gap-6">
                  <div>
                    <span className="block text-[11px] font-bold text-delta-navy-mid mb-3 uppercase tracking-wider select-none">Available Balance</span>
                    {loadingBalance ? (
                      <div className="animate-pulse h-16 w-48 bg-delta-surface-1 rounded-sm"></div>
                    ) : (
                      <div className="flex flex-col sm:flex-row sm:items-baseline gap-2">
                        <h1 className="text-6xl md:text-8xl tracking-[-0.04em] font-bold text-delta-navy leading-none">
                          ৳{walletBalance !== null ? Math.floor(walletBalance).toString() : "0"}
                          <span className="text-4xl md:text-6xl text-delta-navy-mid/60">
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
                         <button className="h-11 px-6 rounded-sm bg-delta-red hover:bg-delta-red-hover text-white text-sm font-bold transition-colors cursor-pointer select-none">
                           Deposit
                         </button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-md border border-delta-hairline shadow-2xl p-6 rounded-md bg-delta-canvas">
                          <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl font-bold tracking-tight text-delta-navy">Deposit Funds</DialogTitle>
                            <DialogDescription className="text-delta-ink-muted text-sm">Top up your balance instantly via secure transfer.</DialogDescription>
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
                                      "h-12 flex items-center justify-center rounded-sm text-sm font-bold transition-colors",
                                      isSelected 
                                        ? "bg-delta-navy text-white shadow-none" 
                                        : "bg-delta-surface-1 hover:bg-delta-surface-2 text-delta-ink border border-delta-hairline",
                                      "disabled:opacity-50 disabled:cursor-not-allowed cursor-pointer"
                                    )}
                                  >
                                    ৳{amt}
                                  </button>
                                )
                              })}
                            </div>

                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-delta-ink-muted font-bold">৳</span>
                                <Input
                                  type="number"
                                  placeholder="Custom"
                                  disabled={recharging}
                                  value={amountInput}
                                  onChange={(e) => setAmountInput(e.target.value)}
                                  className="pl-8 h-12 bg-delta-canvas border border-delta-hairline text-base font-bold text-delta-navy rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-delta-navy focus-visible:border-delta-navy"
                                />
                              </div>
                              <Button
                                disabled={recharging || !amountInput || isNaN(Number(amountInput)) || Number(amountInput) <= 0}
                                onClick={() => handleAddFunds(Number(amountInput))}
                                className="h-12 px-6 bg-delta-red hover:bg-delta-red-hover text-white rounded-sm shadow-none font-bold transition-colors cursor-pointer select-none"
                              >
                                {recharging ? <Loader2 className="h-4 w-4 animate-spin" /> : "Next"}
                              </Button>
                            </div>

                            {rechargeSuccess && (
                              <div className="text-sm font-bold text-delta-success bg-delta-success/10 border border-delta-success/20 px-4 py-3 rounded-sm">
                                {rechargeSuccess}
                              </div>
                            )}
                            {rechargeError && (
                              <div className="text-sm font-bold text-delta-error bg-delta-error/10 border border-delta-error/20 px-4 py-3 rounded-sm">
                                {rechargeError}
                              </div>
                            )}
                          </div>
                       </DialogContent>
                     </Dialog>

                     {/* Withdraw Sub-view Dialog */}
                     <Dialog open={withdrawOpen} onOpenChange={setWithdrawOpen}>
                       <DialogTrigger asChild>
                         <button className="h-11 px-6 rounded-sm border border-delta-navy text-delta-navy bg-delta-canvas hover:bg-delta-surface-1 text-sm font-bold transition-colors cursor-pointer select-none">
                           Withdraw
                         </button>
                       </DialogTrigger>
                       <DialogContent className="sm:max-w-md border border-delta-hairline shadow-2xl p-6 rounded-md bg-delta-canvas">
                          <DialogHeader className="mb-4">
                            <DialogTitle className="text-xl font-bold tracking-tight text-delta-navy">Withdraw Funds</DialogTitle>
                            <DialogDescription className="text-delta-ink-muted text-sm">Transfer funds back to your primary bank account.</DialogDescription>
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
                                      "h-12 flex items-center justify-center rounded-sm text-sm font-bold transition-colors",
                                      isSelected 
                                        ? "bg-delta-navy text-white shadow-none" 
                                        : "bg-delta-surface-1 hover:bg-delta-surface-2 text-delta-ink border border-delta-hairline",
                                      isDisabled && "opacity-50 hover:bg-delta-surface-1 cursor-not-allowed text-delta-ink-muted border-delta-hairline/50"
                                    )}
                                  >
                                    ৳{amt}
                                  </button>
                                )
                              })}
                            </div>

                            <div className="flex gap-2">
                              <div className="relative flex-1">
                                <span className="absolute left-4 top-1/2 -translate-y-1/2 text-delta-ink-muted font-bold">৳</span>
                                <Input
                                  type="number"
                                  placeholder="Custom"
                                  disabled={withdrawing}
                                  value={withdrawAmount}
                                  onChange={(e) => setWithdrawAmount(e.target.value)}
                                  className="pl-8 h-12 bg-delta-canvas border border-delta-hairline text-base font-bold text-delta-navy rounded-sm shadow-none focus-visible:ring-1 focus-visible:ring-delta-navy focus-visible:border-delta-navy"
                                />
                              </div>
                              <Button
                                disabled={withdrawing || !withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0 || (walletBalance !== null && walletBalance < Number(withdrawAmount))}
                                onClick={() => handleWithdraw(Number(withdrawAmount))}
                                className="h-12 px-6 bg-delta-red hover:bg-delta-red-hover text-white rounded-sm shadow-none font-bold transition-colors cursor-pointer select-none"
                              >
                                {withdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Next"}
                              </Button>
                            </div>

                            {withdrawSuccess && (
                              <div className="text-sm font-bold text-delta-success bg-delta-success/10 border border-delta-success/20 px-4 py-3 rounded-sm">
                                {withdrawSuccess}
                              </div>
                            )}
                            {withdrawError && (
                              <div className="text-sm font-bold text-delta-error bg-delta-error/10 border border-delta-error/20 px-4 py-3 rounded-sm">
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
            <section className="pt-8">
              <h2 className="text-lg font-bold tracking-tight mb-8 text-delta-navy select-none">Recent Activity</h2>
              
              {loadingTxs ? (
                 <div className="space-y-4">
                   {[1, 2, 3].map(i => <div key={i} className="h-12 bg-delta-surface-1 animate-pulse border border-delta-hairline rounded-sm" />)}
                 </div>
              ) : transactions.length === 0 ? (
                 <p className="text-sm font-medium text-delta-ink-muted">No recent transactions.</p>
              ) : (
                 <div className="flex flex-col border border-delta-hairline rounded-sm overflow-hidden bg-delta-canvas">
                   {transactions.map((tx, index) => (
                     <div 
                       key={tx.id} 
                       className={cn(
                         "flex items-center justify-between p-4 border-b border-delta-hairline last:border-0",
                         index % 2 === 0 ? "bg-delta-canvas" : "bg-delta-surface-1/50"
                       )}
                     >
                       <div className="flex items-center gap-4">
                         <div className={cn(
                           "flex h-10 w-10 items-center justify-center rounded-full shrink-0",
                           tx.type === "credit" ? "bg-delta-success/10 text-delta-success" : "bg-delta-surface-2 text-delta-navy"
                         )}>
                           {tx.type === "credit" ? <ArrowDownLeft className="h-5 w-5" /> : <ArrowUpRight className="h-5 w-5" />}
                         </div>
                         <div>
                           <p className="text-sm font-bold text-delta-navy">{tx.description}</p>
                           <p className="text-[10px] font-bold text-delta-ink-muted mt-0.5 uppercase tracking-widest">{tx.date} &middot; {tx.reference}</p>
                         </div>
                       </div>
                       <div className={cn(
                         "text-sm font-bold tabular-nums text-right",
                         tx.type === "credit" ? "text-delta-success" : "text-delta-navy"
                       )}>
                         {tx.type === "credit" ? "+" : "-"}৳{Number(tx.amount).toFixed(2)}
                         {tx.status === "pending" && <span className="block text-[10px] text-delta-warning font-bold uppercase tracking-wider mt-0.5">Pending</span>}
                         {tx.status === "failed" && <span className="block text-[10px] text-delta-error font-bold uppercase tracking-wider mt-0.5">Failed</span>}
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
