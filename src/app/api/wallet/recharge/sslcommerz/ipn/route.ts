import { NextResponse } from "next/server"
import { getMySQLPool } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"

export async function POST(request: Request) {
  const pool = getMySQLPool()
  const connection = await pool.getConnection()

  try {
    const formData = await request.formData()
    const val_id = formData.get("val_id") as string
    const tran_id = formData.get("tran_id") as string
    const amount = formData.get("amount") as string

    if (!val_id || !tran_id) {
      connection.release()
      return NextResponse.json({ success: false, error: "Missing validation ID or transaction ID" }, { status: 400 })
    }

    // 1. Verify payment with SSLCommerz Validation API
    const storeId = process.env.SSLCOMMERZ_STORE_ID || "testbox"
    const storePasswd = process.env.SSLCOMMERZ_STORE_PASSWORD || "qwerty"
    const isSandbox = process.env.SSLCOMMERZ_IS_SANDBOX !== "false"

    const validationUrl = isSandbox
      ? "https://sandbox.sslcommerz.com/validator/api/validationserverAPI.php"
      : "https://securepay.sslcommerz.com/validator/api/validationserverAPI.php"

    const queryParams = new URLSearchParams({
      val_id,
      store_id: storeId,
      store_passwd: storePasswd,
      v: "1",
      format: "json",
    })

    const verifyRes = await fetch(`${validationUrl}?${queryParams.toString()}`)
    const verifyData = await verifyRes.json()

    if (verifyData.status === "VALID" || verifyData.status === "VALIDATED") {
      // 2. Query transaction, account, and user details in one join
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      const [rows] = await connection.execute<any[]>(
        `SELECT 
          t.id as transaction_id, t.status as transaction_status, t.amount as transaction_amount,
          a.id as account_id, a.balance as account_balance,
          u.id as user_id, u.first_name, u.last_name, u.email
        FROM transactions t
        JOIN accounts a ON t.account_id = a.id
        JOIN users u ON a.user_id = u.id
        WHERE t.reference = ?`,
        [tran_id]
      )

      if (!rows || rows.length === 0) {
        connection.release()
        return NextResponse.json({ success: false, error: "Transaction record not found in system" }, { status: 404 })
      }

      const txInfo = rows[0]

      if (txInfo.transaction_status === "completed") {
        // Already processed via success redirection, return 200 OK (idempotent)
        connection.release()
        return NextResponse.json({ success: true, message: "Transaction already processed successfully" })
      }

      if (txInfo.transaction_status === "failed") {
        connection.release()
        return NextResponse.json({ success: false, error: "Transaction already marked as failed" }, { status: 400 })
      }

      const verifiedAmount = Number(verifyData.amount || amount)

      // Start database transaction
      await connection.beginTransaction()

      // Update account balance
      await connection.execute(
        "UPDATE accounts SET balance = balance + ? WHERE id = ?",
        [verifiedAmount, txInfo.account_id]
      )

      // Update transaction status
      await connection.execute(
        "UPDATE transactions SET status = 'completed', description = 'Wallet Funds Added via SSLCommerz (IPN Verified)' WHERE id = ?",
        [txInfo.transaction_id]
      )

      await connection.commit()

      // Record MongoDB Audit Log
      await recordAuditLog({
        event: "Wallet Recharge Successful (IPN)",
        actor: `${txInfo.first_name} ${txInfo.last_name} (${txInfo.email})`,
        status: "success",
        metadata: {
          userId: txInfo.user_id,
          rechargeAmount: verifiedAmount,
          newBalance: Number(txInfo.account_balance) + verifiedAmount,
          tranId: tran_id,
          valId: val_id,
        },
      })

      connection.release()
      return NextResponse.json({ success: true, message: "IPN verified and credited successfully" })
    } else {
      // Payment validation failed via IPN
      await connection.beginTransaction()
      await connection.execute(
        "UPDATE transactions SET status = 'failed', description = 'Validation failed during IPN process' WHERE reference = ?",
        [tran_id]
      )
      await connection.commit()
      connection.release()

      return NextResponse.json({ success: false, error: `Validation failed: ${verifyData.status}` }, { status: 400 })
    }
  } catch (error) {
    await connection.rollback()
    connection.release()
    console.error("SSLCommerz IPN error:", error)
    return NextResponse.json({ success: false, error: (error as Error).message }, { status: 500 })
  }
}
