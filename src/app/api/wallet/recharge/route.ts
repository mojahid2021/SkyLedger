import { NextResponse } from "next/server"
import { getMySQLPool } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"

export async function POST(request: Request) {
  const pool = getMySQLPool()
  const connection = await pool.getConnection()

  try {
    const body = await request.json()
    const { userId, amount, paymentMethod } = body

    if (!userId || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      connection.release()
      return NextResponse.json({ success: false, error: "Invalid recharge amount or missing user ID" }, { status: 400 })
    }

    const rechargeAmount = Number(amount)

    // 1. Fetch user & account details
    const [userRows] = await connection.execute<any[]>(
      "SELECT first_name, last_name, email FROM users WHERE id = ?",
      [userId]
    )
    if (!userRows || userRows.length === 0) {
      connection.release()
      return NextResponse.json({ success: false, error: "User not found" }, { status: 404 })
    }
    const user = userRows[0]

    const [accountRows] = await connection.execute<any[]>(
      "SELECT id, balance FROM accounts WHERE user_id = ?",
      [userId]
    )
    if (!accountRows || accountRows.length === 0) {
      connection.release()
      return NextResponse.json({ success: false, error: "User wallet account not found" }, { status: 404 })
    }

    const account = accountRows[0]
    const today = new Date().toISOString().split("T")[0]
    const rechargeRef = `ADDFUND-${Math.floor(100000 + Math.random() * 900000)}`

    await connection.beginTransaction()

    // Update wallet balance
    await connection.execute(
      "UPDATE accounts SET balance = balance + ? WHERE id = ?",
      [rechargeAmount, account.id]
    )

    // Insert transaction credit entry
    await connection.execute(
      `INSERT INTO transactions 
        (reference, description, category, account_id, type, amount, status, transaction_date)
      VALUES (?, ?, ?, ?, 'credit', ?, 'completed', ?)`,
      [
        rechargeRef,
        `Wallet Funds Added via ${paymentMethod || "Credit Card"}`,
        "Wallet Deposit",
        account.id,
        rechargeAmount,
        today,
      ]
    )

    await connection.commit()

    // Record audit log to MongoDB
    await recordAuditLog({
      event: "Wallet Recharge Successful",
      actor: `${user.first_name} ${user.last_name} (${user.email})`,
      status: "success",
      metadata: {
        userId,
        rechargeAmount,
        newBalance: Number(account.balance) + rechargeAmount,
      },
    })

    connection.release()

    return NextResponse.json({
      success: true,
      message: `$${rechargeAmount.toFixed(2)} has been successfully added to your SkyLedger Wallet.`,
      data: {
        newBalance: Number(account.balance) + rechargeAmount,
        transactionRef: rechargeRef,
      },
    })
  } catch (error) {
    await connection.rollback()
    connection.release()
    console.error("Wallet recharge error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to recharge wallet: " + (error as Error).message },
      { status: 500 }
    )
  }
}
