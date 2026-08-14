import { NextResponse } from "next/server"
import { getMySQLPool } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"

export async function POST(request: Request) {
  const pool = getMySQLPool()
  const connection = await pool.getConnection()

  try {
    const body = await request.json()
    const { userId, amount, description } = body

    if (!userId || !amount || isNaN(Number(amount)) || Number(amount) <= 0) {
      connection.release()
      return NextResponse.json({ success: false, error: "Invalid withdrawal amount or missing user ID" }, { status: 400 })
    }

    const withdrawalAmount = Number(amount)

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
    const currentBalance = Number(account.balance || 0)

    // Check sufficient balance
    if (currentBalance < withdrawalAmount) {
      connection.release()
      return NextResponse.json(
        { success: false, error: `Insufficient balance. Available: ৳${currentBalance.toFixed(2)}` },
        { status: 400 }
      )
    }

    const today = new Date().toISOString().split("T")[0]
    const withdrawRef = `WITHDRAW-${Math.floor(100000 + Math.random() * 900000)}`

    await connection.beginTransaction()

    // Update wallet balance (deduct)
    await connection.execute(
      "UPDATE accounts SET balance = balance - ? WHERE id = ?",
      [withdrawalAmount, account.id]
    )

    // Insert transaction debit entry
    await connection.execute(
      `INSERT INTO transactions 
        (reference, description, category, account_id, type, amount, status, transaction_date)
      VALUES (?, ?, ?, ?, 'debit', ?, 'completed', ?)`,
      [
        withdrawRef,
        description || "Wallet Funds Withdrawn",
        "Wallet Withdrawal",
        account.id,
        withdrawalAmount,
        today,
      ]
    )

    await connection.commit()

    // Record audit log to MongoDB
    await recordAuditLog({
      event: "Wallet Withdrawal Successful",
      actor: `${user.first_name} ${user.last_name} (${user.email})`,
      status: "success",
      metadata: {
        userId,
        withdrawalAmount,
        newBalance: currentBalance - withdrawalAmount,
      },
    })

    connection.release()

    return NextResponse.json({
      success: true,
      message: `$${withdrawalAmount.toFixed(2)} has been successfully withdrawn from your SkyLedger Wallet.`,
      data: {
        newBalance: currentBalance - withdrawalAmount,
        transactionRef: withdrawRef,
      },
    })
  } catch (error) {
    await connection.rollback()
    connection.release()
    console.error("Wallet withdrawal error:", error)
    return NextResponse.json(
      { success: false, error: "Failed to withdraw from wallet: " + (error as Error).message },
      { status: 500 }
    )
  }
}