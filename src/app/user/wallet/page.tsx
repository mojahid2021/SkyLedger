"use client"

import React, { useEffect, useState, Suspense, useCallback } from "react"
import { useRouter, useSearchParams } from "next/navigation"
import { useAuth } from "@/context/auth-context"
import { UserNavbar } from "@/components/user/user-navbar"
import { UserSidebar } from "@/components/user/user-sidebar"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Wallet, Plus, ShieldCheck, Loader2, Info, Banknote, ArrowUpRight, MinusCircle } from "lucide-react"

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

  // Deposit state
  const [amountInput, setAmountInput] = useState<string>("")
  const [recharging, setRecharging] = useState<boolean>(false)
  const [rechargeSuccess, setRechargeSuccess] = useState<string | null>(null)
  const [rechargeError, setRechargeError] = useState<string | null>(null)

  // Withdraw state
  const [withdrawAmount, setWithdrawAmount] = useState<string>("")
  const [withdrawing, setWithdrawing] = useState<boolean>(false)
  const [withdrawSuccess, setWithdrawSuccess] = useState<string | null>(null)
  const [withdrawError, setWithdrawError] = useState<string | null>(null)

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

  useEffect(() => {
    if (isLoading) return
    if (!user) {
      router.replace("/login")
      return
    }
    fetchWalletBalance()

    // Handle payment redirect parameters
    if (statusParam === "success") {
      setRechargeSuccess(`Successfully recharged $${Number(amountParam).toFixed(2)} to your wallet! Reference: ${refParam}`)
      router.replace("/user/wallet")
    } else if (statusParam === "fail") {
      setRechargeError(`Wallet recharge failed. Reference: ${refParam || "N/A"}`)
      router.replace("/user/wallet")
    } else if (statusParam === "cancel") {
      setRechargeError("Wallet recharge was cancelled.")
      router.replace("/user/wallet")
    } else if (statusParam === "error") {
      setRechargeError(errorParam || "An error occurred during payment verification.")
      router.replace("/user/wallet")
    }
  }, [user, isLoading, router, statusParam, amountParam, refParam, errorParam, fetchWalletBalance])

  const handleAddFunds = async (amount: number) => {
    if (!user?.id) return
    setRecharging(true)
    setRechargeSuccess(null)
    setRechargeError(null)
    setWithdrawSuccess(null)
    setWithdrawError(null)

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
    setRechargeSuccess(null)
    setRechargeError(null)

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

  return (
    <div className="flex h-dvh flex-col overflow-hidden bg-background font-sans text-foreground">
      <UserNavbar />

      <div className="flex min-h-0 flex-1">
        <UserSidebar activeTab="wallet" setActiveTab={(t) => {
          if (t !== "wallet") {
            router.push("/user/dashboard")
          }
        }} />

        <main className="min-w-0 flex-1 overflow-y-auto w-full bg-slate-50">
          <div className="max-w-4xl mx-auto p-4 sm:p-6 lg:p-8 space-y-6">
            
            <div className="mb-2">
              <h1 className="text-2xl font-extrabold text-delta-navy tracking-tight uppercase flex items-center gap-2">
                <Wallet className="h-6 w-6 text-delta-red" />
                SkyLedger Digital Wallet
              </h1>
              <p className="text-sm text-delta-ink-muted">
                Manage your available funds, top up your balance, and pay for flight reservations seamlessly.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Balance Card */}
              <Card className="shadow-xs border-delta-hairline">
                <CardHeader className="bg-delta-navy p-5 pb-4 rounded-t-[6px]">
                  <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center justify-between">
                    <span>Available Balance</span>
                    <ShieldCheck className="h-4 w-4 text-emerald-400" />
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-6 bg-white min-h-[140px] flex flex-col justify-center">
                  {loadingBalance ? (
                    <div className="flex items-center gap-2 text-delta-ink-muted">
                      <Loader2 className="h-5 w-5 animate-spin" />
                      <span className="text-sm font-medium">Fetching secure ledger...</span>
                    </div>
                  ) : (
                    <div>
                      <div className="text-5xl font-black text-delta-navy font-mono tracking-tighter">
                        ${walletBalance !== null ? walletBalance.toFixed(2) : "0.00"}
                      </div>
                      <p className="text-xs text-emerald-700 font-bold mt-2 flex items-center gap-1.5 bg-emerald-50 w-fit px-2 py-1 rounded">
                        <CheckCircle2 className="h-3.5 w-3.5" /> Ready for immediate booking settlement
                      </p>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Quick Stats Card */}
              <Card className="shadow-xs border-delta-hairline">
                <CardHeader className="p-5 pb-2 border-b border-delta-hairline bg-slate-50">
                  <CardTitle className="text-sm font-bold text-delta-navy uppercase tracking-wider">
                    Quick Actions
                  </CardTitle>
                  <CardDescription className="text-xs text-delta-ink-muted">
                    Deposit or withdraw funds instantly.
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-5 bg-white space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={recharging}
                      onClick={() => setAmountInput("100")}
                      className="h-14 border-delta-hairline text-sm font-bold text-delta-navy hover:border-delta-navy hover:bg-slate-50 transition-all flex flex-col items-center gap-1"
                    >
                      <Plus className="h-5 w-5 text-emerald-600" />
                      <span>Deposit</span>
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      disabled={withdrawing || (walletBalance !== null && walletBalance <= 0)}
                      onClick={() => setWithdrawAmount("50")}
                      className="h-14 border-delta-hairline text-sm font-bold text-delta-navy hover:border-delta-red hover:bg-rose-50 transition-all flex flex-col items-center gap-1"
                    >
                      <MinusCircle className="h-5 w-5 text-rose-600" />
                      <span>Withdraw</span>
                    </Button>
                  </div>
                  <p className="text-[10px] text-delta-ink-muted text-center">
                    Click a button to pre-fill amount, or enter custom below.
                  </p>
                </CardContent>
              </Card>
            </div>

            {/* Deposit & Withdraw Forms */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              {/* Recharge Card */}
              <Card className="shadow-xs border-delta-hairline">
                <CardHeader className="bg-emerald-600 p-5 pb-4 rounded-t-[6px]">
                  <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <Banknote className="h-4 w-4" />
                    Add Funds (Deposit)
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 bg-white space-y-4">
                  
                  {/* Preset amounts */}
                  <div className="grid grid-cols-3 gap-2">
                    {[50, 100, 250, 500, 1000, 2000].map((amt) => (
                      <Button
                        key={amt}
                        variant="outline"
                        type="button"
                        disabled={recharging}
                        onClick={() => handleAddFunds(amt)}
                        className="h-10 border-delta-hairline text-xs font-mono font-bold text-delta-navy hover:border-emerald-600 hover:bg-emerald-50 transition-all"
                      >
                        + ${amt}
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-delta-hairline">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-delta-ink-muted font-bold">$</span>
                      <Input
                        type="number"
                        placeholder="Custom amount"
                        disabled={recharging}
                        value={amountInput}
                        onChange={(e) => setAmountInput(e.target.value)}
                        className="pl-7 h-10 border-delta-hairline bg-slate-50 focus:bg-white text-sm font-bold rounded-[4px]"
                      />
                    </div>
                    <Button
                      disabled={recharging || !amountInput || isNaN(Number(amountInput)) || Number(amountInput) <= 0}
                      onClick={() => handleAddFunds(Number(amountInput))}
                      className="h-10 bg-emerald-600 hover:bg-emerald-700 text-white font-bold uppercase tracking-wider text-xs px-4 rounded-[4px]"
                    >
                      {recharging ? <Loader2 className="h-4 w-4 animate-spin" /> : "Deposit"}
                    </Button>
                  </div>

                  {rechargeSuccess && (
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-[4px] border border-emerald-200">
                      {rechargeSuccess}
                    </div>
                  )}
                  {rechargeError && (
                    <div className="text-xs font-bold text-rose-700 bg-rose-50 p-2.5 rounded-[4px] border border-rose-200">
                      {rechargeError}
                    </div>
                  )}

                </CardContent>
              </Card>

              {/* Withdraw Card */}
              <Card className="shadow-xs border-delta-hairline">
                <CardHeader className="bg-rose-600 p-5 pb-4 rounded-t-[6px]">
                  <CardTitle className="text-sm font-bold text-white uppercase tracking-wider flex items-center gap-2">
                    <ArrowUpRight className="h-4 w-4" />
                    Withdraw Funds
                  </CardTitle>
                </CardHeader>
                <CardContent className="p-5 bg-white space-y-4">
                  
                  {/* Preset amounts */}
                  <div className="grid grid-cols-3 gap-2">
                    {[25, 50, 100, 250, 500, 1000].map((amt) => (
                      <Button
                        key={amt}
                        variant="outline"
                        type="button"
                        disabled={withdrawing || (walletBalance !== null && walletBalance < amt)}
                        onClick={() => handleWithdraw(amt)}
                        className="h-10 border-delta-hairline text-xs font-mono font-bold text-delta-navy hover:border-rose-600 hover:bg-rose-50 transition-all"
                      >
                        - ${amt}
                      </Button>
                    ))}
                  </div>

                  <div className="flex items-center gap-2 pt-2 border-t border-delta-hairline">
                    <div className="relative flex-1">
                      <span className="absolute left-3 top-1/2 -translate-y-1/2 text-delta-ink-muted font-bold">$</span>
                      <Input
                        type="number"
                        placeholder="Custom amount"
                        disabled={withdrawing}
                        value={withdrawAmount}
                        onChange={(e) => setWithdrawAmount(e.target.value)}
                        className="pl-7 h-10 border-delta-hairline bg-slate-50 focus:bg-white text-sm font-bold rounded-[4px]"
                      />
                    </div>
                    <Button
                      disabled={withdrawing || !withdrawAmount || isNaN(Number(withdrawAmount)) || Number(withdrawAmount) <= 0 || (walletBalance !== null && walletBalance < Number(withdrawAmount))}
                      onClick={() => handleWithdraw(Number(withdrawAmount))}
                      className="h-10 bg-rose-600 hover:bg-rose-700 text-white font-bold uppercase tracking-wider text-xs px-4 rounded-[4px]"
                    >
                      {withdrawing ? <Loader2 className="h-4 w-4 animate-spin" /> : "Withdraw"}
                    </Button>
                  </div>

                  {walletBalance !== null && walletBalance === 0 && (
                    <p className="text-[11px] text-rose-600 font-medium text-center">
                      Insufficient balance for withdrawal.
                    </p>
                  )}

                  {withdrawSuccess && (
                    <div className="text-xs font-bold text-emerald-700 bg-emerald-50 p-2.5 rounded-[4px] border border-emerald-200">
                      {withdrawSuccess}
                    </div>
                  )}
                  {withdrawError && (
                    <div className="text-xs font-bold text-rose-700 bg-rose-50 p-2.5 rounded-[4px] border border-rose-200">
                      {withdrawError}
                    </div>
                  )}

                </CardContent>
              </Card>
            </div>

            {/* Information Notice */}
            <div className="bg-blue-50 border border-blue-200 p-4 rounded-[6px] flex items-start gap-3">
              <Info className="h-5 w-5 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-900 leading-snug">
                <strong className="block mb-1 font-bold">Secure Transactions</strong>
                Funds added to your SkyLedger Wallet are held in a secure double-entry ledger account specifically tied to your verified profile. Wallets offer instantaneous, zero-fee settlements for all flight reservations and optional seating upgrades.
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>
  )

  // Lucide icon helper
  function CheckCircle2(props: React.SVGProps<SVGSVGElement>) {
    return <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}><path d="M12 22c5.523 0 10-4.477 10-10S17.523 2 12 2 2 6.477 2 12s4.477 10 10 10z"/><path d="m9 12 2 2 4-4"/></svg>
  }
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
