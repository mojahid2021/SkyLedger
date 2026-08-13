import { NextResponse } from "next/server"
import { getMySQLPool } from "@/lib/db"
import { recordAuditLog } from "@/lib/mongodb"

export async function POST(request: Request) {
  const pool = getMySQLPool()
  const connection = await pool.getConnection()

  let tran_id = ""
  let amount = "0.00"

  try {
    const formData = await request.formData()
    const val_id = formData.get("val_id") as string
    tran_id = formData.get("tran_id") as string
    amount = formData.get("amount") as string

    if (!val_id || !tran_id) {
      connection.release()
      return renderRedirectHTML(request, "error", "Missing validation ID or transaction ID")
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
        return renderRedirectHTML(request, "error", "Transaction record not found in system")
      }

      const txInfo = rows[0]

      if (txInfo.transaction_status === "completed") {
        // Idempotency check: Already credited
        connection.release()
        return renderRedirectHTML(request, "success", amount, tran_id)
      }

      if (txInfo.transaction_status === "failed") {
        connection.release()
        return renderRedirectHTML(request, "error", "Transaction has already been marked as failed")
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
        "UPDATE transactions SET status = 'completed', description = 'Wallet Funds Added via SSLCommerz' WHERE id = ?",
        [txInfo.transaction_id]
      )

      await connection.commit()

      // Record MongoDB Audit Log
      await recordAuditLog({
        event: "Wallet Recharge Successful",
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
      return renderRedirectHTML(request, "success", verifiedAmount.toFixed(2), tran_id)
    } else {
      // Payment validation failed
      await connection.beginTransaction()
      await connection.execute(
        "UPDATE transactions SET status = 'failed', description = 'Validation failed with SSLCommerz' WHERE reference = ?",
        [tran_id]
      )
      await connection.commit()
      connection.release()

      return renderRedirectHTML(request, "error", `Payment validation failed: ${verifyData.status || "invalid transaction"}`)
    }
  } catch (error) {
    await connection.rollback()
    connection.release()
    console.error("SSLCommerz success callback error:", error)
    return renderRedirectHTML(request, "error", (error as Error).message)
  }
}

function renderRedirectHTML(request: Request, status: string, amountOrError: string, ref: string = "") {
  const host = request.headers.get("host") || "localhost:3000"
  const protocol = request.headers.get("x-forwarded-proto") || "http"
  const baseUrl = `${protocol}://${host}`

  let redirectUrl = ""
  if (status === "success") {
    redirectUrl = `${baseUrl}/user/wallet?status=success&amount=${amountOrError}&ref=${ref}`
  } else {
    redirectUrl = `${baseUrl}/user/wallet?status=error&error=${encodeURIComponent(amountOrError)}&ref=${ref}`
  }

  const html = `
    <html>
      <head>
        <meta http-equiv="refresh" content="0;url=${redirectUrl}" />
        <script>window.location.href = "${redirectUrl}"</script>
      </head>
      <body style="font-family: sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #f8fafc; color: #1e293b;">
        <div style="text-align: center; padding: 2rem; border-radius: 8px; background: white; box-shadow: 0 1px 3px rgba(0,0,0,0.1);">
          <div style="border: 3px solid #cbd5e1; border-top: 3px solid #0f172a; border-radius: 50%; width: 40px; height: 40px; animation: spin 1s linear infinite; margin: 0 auto 1rem auto;"></div>
          <p style="font-size: 14px; font-weight: 600;">Verifying transaction and redirecting back...</p>
        </div>
        <style>
          @keyframes spin {
            0% { transform: rotate(0deg); }
            100% { transform: rotate(360deg); }
          }
        </style>
      </body>
    </html>
  `

  return new NextResponse(html, {
    headers: { "Content-Type": "text/html" },
  })
}
