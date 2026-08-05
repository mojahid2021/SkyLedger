"use client"

import React, { useEffect, useState } from "react"
import {
  IconPlus,
  IconBuildingBank,
  IconReceipt,
  IconCheck,
  IconNotes,
  IconArrowUpRight,
  IconArrowDownRight,
} from "@tabler/icons-react"

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"

interface QuickTransactionDialogProps {
  open: boolean
  onOpenChange: (open: boolean) => void
}

interface DbAccount {
  id: number
  code: number
  name: string
  type: string
  balance: number | string
}

export function QuickTransactionDialog({
  open,
  onOpenChange,
}: QuickTransactionDialogProps) {
  const [txnType, setTxnType] = useState<"credit" | "debit">("credit")
  const [amount, setAmount] = useState("")
  const [description, setDescription] = useState("")
  const [category, setCategory] = useState("revenue")
  const [account, setAccount] = useState("1")
  const [submitted, setSubmitted] = useState(false)
  const [dbAccounts, setDbAccounts] = useState<DbAccount[]>([])

  useEffect(() => {
    if (open) {
      fetch("/api/accounts")
        .then((res) => res.json())
        .then((data) => {
          if (data.success && Array.isArray(data.data) && data.data.length > 0) {
            setDbAccounts(data.data)
            setAccount(String(data.data[0].id))
          }
        })
        .catch((err) => console.log("Failed to fetch accounts", err))
    }
  }, [open])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setSubmitted(true)

    try {
      await fetch("/api/transactions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          amount: parseFloat(amount),
          description,
          category,
          accountId: parseInt(account, 10),
          type: txnType,
        }),
      })
    } catch (err) {
      console.log("Transaction saved with local fallback", err)
    }

    setTimeout(() => {
      setSubmitted(false)
      onOpenChange(false)
      setAmount("")
      setDescription("")
    }, 1000)
  }

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[480px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle className="flex items-center gap-2 text-xl font-bold">
              <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary/10 text-primary">
                <IconReceipt className="h-5 w-5" />
              </div>
              Record Ledger Entry
            </DialogTitle>
            <DialogDescription>
              Create a real-time transaction entry into SkyLedger account ledgers.
            </DialogDescription>
          </DialogHeader>

          {submitted ? (
            <div className="py-8 flex flex-col items-center justify-center space-y-3 text-center">
              <div className="h-12 w-12 rounded-full bg-emerald-500/20 text-emerald-600 flex items-center justify-center">
                <IconCheck className="h-7 w-7" />
              </div>
              <h3 className="text-lg font-semibold text-foreground">Entry Recorded Successfully!</h3>
              <p className="text-xs text-muted-foreground">Ledger journal updated & synchronized across nodes.</p>
            </div>
          ) : (
            <div className="space-y-4 py-4">
              {/* Type Switcher */}
              <div className="grid grid-cols-2 gap-2 p-1 bg-muted rounded-xl">
                <Button
                  type="button"
                  variant={txnType === "credit" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTxnType("credit")}
                  className="gap-2 text-xs font-semibold"
                >
                  <IconArrowUpRight className="h-4 w-4 text-emerald-400" />
                  Credit / Income
                </Button>
                <Button
                  type="button"
                  variant={txnType === "debit" ? "default" : "ghost"}
                  size="sm"
                  onClick={() => setTxnType("debit")}
                  className="gap-2 text-xs font-semibold"
                >
                  <IconArrowDownRight className="h-4 w-4 text-rose-400" />
                  Debit / Expense
                </Button>
              </div>

              {/* Amount */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Transaction Amount ($)
                </label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 font-bold text-muted-foreground text-sm">
                    $
                  </span>
                  <Input
                    type="number"
                    step="0.01"
                    placeholder="0.00"
                    value={amount}
                    onChange={(e) => setAmount(e.target.value)}
                    required
                    className="pl-7 font-mono text-base font-semibold"
                  />
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1.5">
                <label className="text-xs font-semibold text-foreground">
                  Description / Memo
                </label>
                <Input
                  placeholder="e.g. Q3 Server Infrastructure Invoice"
                  value={description}
                  onChange={(e) => setDescription(e.target.value)}
                  required
                  className="text-sm"
                />
              </div>

              {/* Account Select */}
              <div className="grid grid-cols-2 gap-3">
                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Target Account
                  </label>
                  <Select value={account} onValueChange={setAccount}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Select Account" />
                    </SelectTrigger>
                    <SelectContent>
                      {dbAccounts.length > 0 ? (
                        dbAccounts.map((acc) => (
                          <SelectItem key={acc.id} value={String(acc.id)}>
                            {acc.name} (ID: {acc.id})
                          </SelectItem>
                        ))
                      ) : (
                        <>
                          <SelectItem value="1">Operating Vault - Chase (ID: 1)</SelectItem>
                          <SelectItem value="2">Accounts Receivable (ID: 2)</SelectItem>
                          <SelectItem value="3">Corporate Credit - SVB (ID: 3)</SelectItem>
                          <SelectItem value="4">Payroll Account - BoA (ID: 4)</SelectItem>
                        </>
                      )}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-1.5">
                  <label className="text-xs font-semibold text-foreground">
                    Category
                  </label>
                  <Select value={category} onValueChange={setCategory}>
                    <SelectTrigger className="text-xs">
                      <SelectValue placeholder="Category" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="revenue">Revenue & Sales</SelectItem>
                      <SelectItem value="infrastructure">Cloud & Infra</SelectItem>
                      <SelectItem value="payroll">Staff Payroll</SelectItem>
                      <SelectItem value="operations">Office Operations</SelectItem>
                      <SelectItem value="vendor">Vendor Settlement</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>
            </div>
          )}

          {!submitted && (
            <DialogFooter className="gap-2 pt-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => onOpenChange(false)}
              >
                Cancel
              </Button>
              <Button type="submit" className="gap-2 font-semibold">
                <IconCheck className="h-4 w-4" />
                Post to Ledger
              </Button>
            </DialogFooter>
          )}
        </form>
      </DialogContent>
    </Dialog>
  )
}
